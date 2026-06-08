/*
 * @Author: Grays
 * @Date: 2023-06-20 13:23:35
 * @LastEditors: Grays
 * @LastEditTime: 2023-07-19 09:56:56
 * @Description:
 */
var component_key = 'scan_item'
_.app.component(component_key, {
  template: /*html*/ `
  	<div style="padding:16px;height:74px">
      <van-button type="primary" block @click="do_click">查询样品</van-button>
	  <van-field ref="codeText" v-model="code" :placeholder="_l('请扫码')" @keyup.enter="do_load_data(code)" autofocus
			style="margin-top:4px; border:var(--van-button-border-width) solid var(--van-button-primary-border-color);border-radius:5px"
		/>
    </div>
    <div style="line-height:32px;height:32px;text-align: center;font-size:16px">
      {{ code }}
    </div>
	<template v-if="loaded">
		<van-tabs v-model:active="activeName" style="margin-top:5px;">
			<van-tab title="主要信息" name="a">
				<div style="padding:8px;" v-if="get_src.length>0">
					<van-image
						@click="showPreview"
						width="100%"
						height="10rem"
						fit="contain"
						:src="src"
					/>
					<div style="margin-top: 10px; color:red;text-align: center;" v-if="get_src.length>1">
						<span>产品有多图,点击图片左滑可查看其他图</span>
					</div>
				</div>
				<van-cell-group inset v-for="item in main" >
					<van-field v-if="String(item.value).length>=35" :model-value="item.value" :label="_l(item.caption)" type="textarea" autosize disabled/>
					<van-field v-if="String(item.value).length<35" :model-value="item.value" :label="_l(item.caption)" type="text" disabled/>
				</van-cell-group>
			</van-tab>
			<van-tab title="辅助信息" name="b" v-if="memo.length>0">
				<van-cell-group inset v-for="item in memo" >
					<van-field v-if="String(item.value).length>=35" :model-value="item.value" :label="_l(item.caption)" type="textarea" autosize disabled/>
					<van-field v-if="String(item.value).length<35" :model-value="item.value" :label="_l(item.caption)" type="text" disabled/>
				</van-cell-group>
			</van-tab>
			<div style="margin-top: 10px;padding:11px;display:flex;">
				<van-button style="margin:0px 5px;" type="warning" block @click="do_click">继续扫码</van-button>
			</div>
		</van-tabs>
		<van-image-preview v-model:show="show" :images="get_src" @change="onChange">
			<template slot="index">{{ index }}</template>
		</van-image-preview>
	</template>
  `,
  props: ['tab_id', 'params'],
  data() {
    return {
      src_list:[],
      src: '',
      show: false,
      index: 0,
      code: '',
      main: [],
      memo: [],
      loaded: false,
    }
  },
  expose: ['do_destroy'],
  methods: {
    do_destroy() {
      // console.warn(`${component_key}销毁`)
    },
    do_click() {
      this.call_app({ cmd: 'scan', zoom: 0.8 })
    },
    showPreview() {
      // _.m.showNotify('aaaaa')
      this.show = true
    },
    onChange(index) {
      this.index = index
      // console.log(`当前展示的图片索引为：${index}`);
    },
    on_barcode_scan(code) {
      this.code = code
      this.do_load_data(this.code)
    },
    call_app(cmd) {
      // console.log(window.flutter_inappwebview)
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview
          .callHandler('call_app', cmd)
          .then((res) => {
            // console.log(res)
          })
          .catch((res) => {
            // console.error(res)
          })
      }
    },
    do_load_data(code) {
      _.http
        .post('/api/scan/item', { barcode: code, kind: '样品查询' })
        .then((res) => {
          this.main = res.data['基本信息']
          if (res.data['辅助信息']) {
            this.memo = res.data['辅助信息']
          } else {
            this.memo = []
          }
          console.log('res.data', res.data)
          this.src_list.push(res.data.yytp)
          this.loaded = true
        })
        .catch((res) => {
          _.m.showNotify(res.msg)
        })
    },
  },
  computed: {
    get_src: function () {
      // let src_list = []
      // for (let src of this.src_list) {
      //   src_list.push(`/api/image/get?file=${src}`)
      // }
			console.log('this.src_list.length',this.src_list.length)
      if (this.src_list.length > 0) {
        this.src = `/api/image/get?file=${this.src_list[0]}&width=200&height=200`
      }
			
      return this.src_list
    },
  },
  mounted() {
    document.title = '样品查询'
    window.on_barcode_scan = this.on_barcode_scan
    window.addEventListener(
      'flutterInAppWebViewPlatformReady',
      function (event) {
        // console.log(flutterInAppWebViewPlatformReady)
      }
    )
    this.call_app({ cmd: 'scan', zoom: 0.8 })
  },
})
