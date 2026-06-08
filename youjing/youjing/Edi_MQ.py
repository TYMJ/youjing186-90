"""
EDI MQ 发送工具
基于 rocketmq-python-client，参考 test_MQ_v5.py 实现

依赖:
  pip install rocketmq-python-client

前置:
  1. 本机已安装 RocketMQ 发行包（含 bin/mqproxy）
  2. 远端 Broker 磁盘未满，否则发送仍会失败

环境变量（可选，便于部署不改代码）:
  ROCKETMQ_NAMESRV      Name Server，默认 localhost:9876
  ROCKETMQ_HOME         RocketMQ 发行包目录（自动起 Proxy 时需要）
  ROCKETMQ_PROXY_PORT   本地 Proxy 端口，默认 8081
  ROCKETMQ_PROXY_HOST   本地 Proxy 地址，默认 127.0.0.1
  ROCKETMQ_TOPIC        发送 topic，默认 edi_topic
  ROCKETMQ_ENDPOINTS    已有 Proxy 时直接填（如 127.0.0.1:8081），跳过自动起 Proxy
"""

from any import *
import builtins
import json
import os
import signal
import socket
import subprocess
import sys
import time
import traceback
from rocketmq import ClientConfiguration, Credentials, Message, Producer

IS_WIN = sys.platform == "win32"

_RELEASE_DIR = "rocketmq-all-5.5.0-bin-release"


def _default_rocketmq_home():
    if IS_WIN:
        return os.path.join(config.data_upload_path, _RELEASE_DIR)
        # return os.path.join(r"C:\rocketmq", _RELEASE_DIR)
    if sys.platform == "darwin":
        return os.path.expanduser("~/Downloads/{}".format(_RELEASE_DIR))
    return os.path.join("/usr/whale/app", _RELEASE_DIR)


# ==================== 配置区（请按实际环境修改，或优先使用环境变量）====================
NAMESRV = os.environ.get("ROCKETMQ_NAMESRV", "192.168.3.240:9876")
ROCKETMQ_HOME = os.environ.get("ROCKETMQ_HOME", _default_rocketmq_home())
PROXY_HOST = os.environ.get("ROCKETMQ_PROXY_HOST", "127.0.0.1")
PROXY_PORT = int(os.environ.get("ROCKETMQ_PROXY_PORT", "8081"))
TOPIC = os.environ.get("ROCKETMQ_TOPIC", "edi_topic")
# 非空则连接已有 Proxy，不再自动启动 mqproxy
ENDPOINTS = os.environ.get("ROCKETMQ_ENDPOINTS", "")
# ==============================================================


def wait_for_port(host: str, port: int, timeout: float = 30.0, proc: subprocess.Popen | None = None) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc is not None and proc.poll() is not None:
            return False
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return True
        except OSError:
            time.sleep(0.5)
    return False


def _subprocess_env(home: str) -> dict:
    env = os.environ.copy()
    env["ROCKETMQ_HOME"] = home
    return env


def _proxy_config_path(home: str, port: int) -> str:
    """生成含 grpcServerPort 的 Proxy 配置（Python SDK 走 gRPC 端口，默认 8081）。"""
    base_conf = os.path.join(home, "conf", "rmq-proxy.json")
    conf = {"rocketMQClusterName": "DefaultCluster", "grpcServerPort": port}
    if os.path.isfile(base_conf):
        with builtins.open(base_conf, encoding="utf-8") as f:
            conf.update(json.load(f))
        conf["grpcServerPort"] = port
    runtime_conf = os.path.join(home, "conf", "rmq-proxy.runtime.json")
    with builtins.open(runtime_conf, "w", encoding="utf-8") as f:
        json.dump(conf, f, ensure_ascii=False)
    return runtime_conf


def _mqproxy_cmd(home, namesrv, proxy_conf):
    mqproxy = os.path.join(home, "bin", "mqproxy.cmd" if IS_WIN else "mqproxy")
    args = [mqproxy, "-n", namesrv, "-pc", proxy_conf]
    if IS_WIN:
        return ["cmd.exe", "/c", *args]
    return ["sh", mqproxy, "-n", namesrv, "-pc", proxy_conf]


def _read_log_tail(log_path: str, max_bytes: int = 4096) -> str:
    if not log_path or not os.path.isfile(log_path):
        return ""
    with builtins.open(log_path, "rb") as f:
        f.seek(0, os.SEEK_END)
        size = f.tell()
        f.seek(max(0, size - max_bytes))
        return f.read().decode("utf-8", errors="replace").strip()


def _proxy_start_error(home: str, proc: subprocess.Popen, log_path: str, host: str, port: int, timeout: bool) -> str:
    parts = []
    if timeout:
        parts.append("本地 Proxy 启动超时，{}:{} 未就绪".format(host, port))
    else:
        parts.append("本地 Proxy 进程已退出 (code={})".format(proc.returncode))
    if not os.environ.get("JAVA_HOME"):
        parts.append("未检测到 JAVA_HOME，mqproxy 需要 Java 17+")
    if not os.path.isfile(os.path.join(home, "bin", "runserver.cmd" if IS_WIN else "runserver.sh")):
        parts.append("ROCKETMQ_HOME 可能不正确: {}".format(home))
    log_tail = _read_log_tail(log_path)
    if log_tail:
        parts.append("mqproxy 日志:\n{}".format(log_tail))
    return "\n".join(parts)


def start_proxy(namesrv: str, home: str, host: str, port: int) -> subprocess.Popen:
    mqproxy = os.path.join(home, "bin", "mqproxy.cmd" if IS_WIN else "mqproxy")
    if not os.path.isfile(mqproxy):
        raise FileNotFoundError("未找到 mqproxy: {}，请设置 ROCKETMQ_HOME".format(mqproxy))

    proxy_conf = _proxy_config_path(home, port)
    log_path = os.path.join(home, "logs", "mqproxy.python.log")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    log_file = builtins.open(log_path, "w", encoding="utf-8")

    kwargs = {
        "env": _subprocess_env(home),
        "cwd": home,
        "stdout": log_file,
        "stderr": subprocess.STDOUT,
    }
    if IS_WIN:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["preexec_fn"] = os.setsid

    proc = subprocess.Popen(_mqproxy_cmd(home, namesrv, proxy_conf), **kwargs)
    ready = wait_for_port(host, port, timeout=30, proc=proc)
    if not ready:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        log_file.close()
        raise RuntimeError(_proxy_start_error(home, proc, log_path, host, port, timeout=proc.poll() is None))
    log_file.close()
    print("本地 Proxy 已启动: {}:{} -> {} (日志: {})".format(host, port, namesrv, log_path))
    return proc


def stop_proxy(proc: subprocess.Popen | None) -> None:
    if proc is None:
        return
    try:
        if IS_WIN:
            proc.terminate()
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc.wait(timeout=5)
        print("本地 Proxy 已关闭")
    except Exception:
        if IS_WIN:
            proc.kill()
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)


def send_edi_message(msg_data: dict, topic: str = TOPIC, endpoints: str = "") -> dict:
    """
    发送 EDI 消息到 MQ

    :param msg_data: 消息内容字典，会被序列化为 JSON
    :param topic: Topic 名称，默认 edi_topic
    :param endpoints: 直接指定 Proxy 地址（如 127.0.0.1:8081），非空则跳过自动起 Proxy
    :return: {"success": True/False, "message_id": "...", "error": "..."}
    """
    proxy = None
    producer = None
    try:
        # try:
        #     from rocketmq import ClientConfiguration, Credentials, Message, Producer
        # except ImportError:
        #     raise ImportError("请先安装 rocketmq-python-client: pip install rocketmq-python-client")

        ep = endpoints or ENDPOINTS
        if not ep:
            proxy = start_proxy(NAMESRV, ROCKETMQ_HOME, PROXY_HOST, PROXY_PORT)
            ep = "{}:{}".format(PROXY_HOST, PROXY_PORT)

        config = ClientConfiguration(endpoints=ep, credentials=Credentials("", ""), request_timeout=5)
        producer = Producer(config)
        producer.startup()

        msg = Message()
        msg.topic = topic
        msg.body = json.dumps(msg_data, ensure_ascii=False, default=str).encode("utf-8")
        msg.tag = "TagA"

        result = producer.send(msg)
        return {"success": True, "message_id": result.message_id, "error": None}
    except Exception as e:
        return {"success": False, "message_id": None, "error": str(e) + "\n" + traceback.format_exc()}
    finally:
        if producer is not None:
            producer.shutdown()
        stop_proxy(proxy)
