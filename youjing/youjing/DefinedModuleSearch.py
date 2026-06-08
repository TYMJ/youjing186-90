#coding=utf-8
from any import *# 导入usermodel模块
from asyncio.log import logger
from sqlalchemy import or_,text
from sqlalchemy.sql import func
from .model import *

def set_module_search_condition(q, user, module, group, conditions):
    try:
        # 可以用and_放多个条件,比如 and_(Payments.PaymentType !='费用', Payments.PayID=='P2207003')
        # 也可以用多个filter放多个条件,比如 q.filter(Payments.PaymentType !=u'费用').filter(Payments.PayID=='P2207003')
        # 可以用or_放多个条件,比如 or_(Payments.PaymentType !='费用', Payments.PayID=='P2207003')
        # q = q.filter(or_(Payments.PaymentType !=u'费用', Payments.PayID=='P2207003'))
        # q = q.filter(Payments.PaymentType !='费用').filter(Payments.PayID=='P2207003')
        # q = q.filter(and_(Payments.PaymentType !='费用', Payments.PayID=='P2207003'))
        # if module=='客户资料':
        #     q = q.filter(text('wfgs="" or wfgs="杭州鼎新达天服饰有限公司"'))
        #     return q
        # if module=='厂商资料':
        #     q = q.filter(text('wfgs="" or wfgs="杭州鼎新达天服饰有限公司"'))
        #     return q
        if module=='公海客户':
            q = q.filter(text('khlx="公海客户"'))
            return q
        if module=='客户资料':
            q = q.filter(text('khlx<>"公海客户"'))
        return q
    except:
        logger.error(trace_error())

add_event(EVT_MODULE_BEFORE_SEARCH_CONDITION, set_module_search_condition, once = True, descriptions="设置虚拟模块查询记录过滤")