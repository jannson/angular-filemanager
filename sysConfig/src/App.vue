<template>
  <div id="app">
    <div>
      <div class="wrap flex justify-center">
        <div>
          <img src="./assets/bg.png" alt>
        </div>
        <div v-if="noLogin">

        </div>
        <div v-else class="form">
          <a-form :form="form" @submit="handleSubmit">
            <a-form-item label="登录服务：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
                <!-- <a-button type="primary" icon="wechat" @click="alertQr">微信授权</a-button> -->
              <a-button v-if="!config.firstInitial" type="primary" icon="wechat">微信已授权</a-button>
              <a-button v-else type="primary" icon="wechat" @click="alertQr">微信授权</a-button>
            </a-form-item>
            <a-form-item label="共享路径：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <!-- prefix="folder-open" -->
              <a-input
                disabled
                v-decorator="[
                        'sharePath',
                        {initialValue: config.sharePath},
                        {rules: [{ required: true, message: 'Please choose your sharePath!' }]}
                        ]"
              >
                <a-icon slot="suffix" type="folder-open" @click="renderTree" />
              </a-input>
            </a-form-item>
            <a-form-item label="免授权访问：" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
              <a-radio-group 
                @change="handleChangeMode"
                v-decorator="['loginMode',
                    {initialValue: config.loginMode},
                    {rules: [{ required: true, message: '请选择' }]}
                ]">
                <a-radio value="2">仅本机</a-radio>
                <a-radio value="1">仅局域网</a-radio>
                <a-radio value="0">全网</a-radio>
                    <div v-if="tipsVisible" class="c-C0 fs-10px tips"><span class="c-red">*</span> 任何用户访问到本页面，都将不需要登录就可以访问，非常不安全</div>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="modeVisible" label="内网网段：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-textarea
                placeholder="请输入网段"
                :rows="4"
                v-decorator="[
                        'loginLan',
                        {initialValue: config.loginLan},
                        {rules: [{ required: true, message: 'Please input your loginLan!' }]}
                        ]"
              />
            </a-form-item>
            <a-form-item label="使用协议：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-checkbox
                v-decorator="[
                        'tips',
                        {rules: [{ required: true, message: '请同意协议' }]}
                        ]"
              >
                <a>本人已阅读并同意该协议。</a>
              </a-checkbox>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
              <a-button type="primary" html-type="submit">配 置</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
      <div>
          <a-modal
            title="共享路径选择"
            v-model="treeVisible"
            @ok="handleTreeOk"
            >
                <div class="">
                    <a-directory-tree
                        v-if="treeVisible"
                        showLine
                        :loadData="onLoadData"
                        :treeData="treeList"
                        @select="chooseTreeNode"
                    >
                        <!-- :defaultExpandAll="true" -->
                        <!-- <a-tree-node title="parent 0" key="0-0">
                        <a-tree-node title="leaf 0-0" key="0-0-0" isLeaf />
                        <a-tree-node title="leaf 0-1" key="0-0-1" isLeaf />
                        </a-tree-node> -->
                    </a-directory-tree>
                </div>
            </a-modal>
      </div>
      <qrcode v-if="visible" :alertQr="alertQr"></qrcode>
    </div>
  </div>
</template>

<script>
import store from 'store';
import {message} from 'ant-design-vue';
import request, {baseURL} from "./request";
import QrCode from "./components/QrCode";
export default {
  name: "app",
  data() {
    return {
      config: {},
      noLogin: false,
      visible: false,
      tipsVisible: false,
      modeVisible: false,
      treeVisible: false,
      treeList: [], // 文件管理
      form: this.$form.createForm(this)
    };
  },
  created() {

    this.fetchLinkCfg();
  },
  components: {
    qrcode: QrCode
  },
  methods: {
    alertQr() {
      this.visible = !this.visible;
    },
    handleChangeMode(e) {
        const {value} = e.target
        this.modeVisible = value == 1
        this.tipsVisible = value == 0
    },
    chooseTreeNode(selectedKeys,e){
        const {title,path} = e.node.dataRef
        this.sharePath = path
    },
    handleTreeOk() {
        this.treeVisible = false
        this.form.setFieldsValue({
            sharePath: this.sharePath
        })
    },
    fetchTreeData(treeNode={},path="") {
        return request({
            url: "/api/listAllDir",
            data: {
                action:"list",
                path
            }
        }).then(res => {
            // const path = this.treeList.
            const result = res.result.map((item,index) => ({
                title: item.name,
                path: item.path,
                key: `${treeNode.eventKey}-${index}`
            }))
            return result
        });
    },
    getRouterInfo() {
        request({
            method: 'get',
            // baseURL,
            url: '/api/routerInfo',
        }).then(data => {
            if(data.result) {
                data = data.result;
            }
            let deviceList = []
            if (!data.routers) {
                var r = confirm('获取路信息失败请重试');
                if (r == true) {
                    this.getRouterInfo();
                } else {
                    alert('取消重试')
                }
            } else {
                var array = data.routers;
                for (var i = 0, len = array.length; i < len; i++) {
                    var o = {};
                    o.routerId = array[i].routerId;
                    o.name = array[i].name;
                    if (data.routerId == array[i].routerId) {
                        o.isCurrentDevice = true;
                    } else {
                        o.isCurrentDevice = false;
                    }
                    deviceList.push(o);
                }
                localStorage.setItem('deviceList', JSON.stringify(deviceList));
            }
        })
    },            
    renderTree() {
        this.fetchTreeData().then(result => {
            this.treeVisible = true
            this.treeList = result;
        })
    },
    onLoadData (treeNode) {
      return new Promise((resolve) => {
        if (treeNode.dataRef.children) {
          resolve()
          return
        }
        const {title,path} = treeNode.dataRef

        this.fetchTreeData(treeNode,path).then(data => {
            treeNode.dataRef.children = data
            this.treeList = [...this.treeList]
            resolve()
        })
        // setTimeout(() => {
        //   treeNode.dataRef.children = [
        //     { title: 'Child Node', key: `${treeNode.eventKey}-0` },
        //     { title: 'Child Node', key: `${treeNode.eventKey}-1` },
        //   ]
        //   this.treeData = [...this.treeData]
        //   resolve()
        // }, 1000)
      })
    },
    handleSubmit(e) {
        e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          const regex = /\r\n/g
            const {tips, ...rest} = values
            if (rest.loginLan) {
                rest.loginLan = rest.loginLan.replace(regex,',')
            }
            
          rest.loginMode = +rest.loginMode
          request({
                url: "/api/config",
                data: {
                    // username: 'd215133c-50ac-4442-af6f-e8ae22abfd1f',
                    username: store.get('token'),
                    ...rest,
                    upload: 0,
                    // firstInitial: false,
                }
            }).then(res => {
                message.success('配置成功')
                this.getRouterInfo().then(() => window.location = "/")
            });
        }
      });
    },
    fetchLinkCfg() {
      request({
        url: "/api/config",
        method: "get"
      }).then(res => {
          const tpl = {...res}
          const regex = /,/g
          const enterVal = tpl.loginLan.replace(regex,'\r\n')
          tpl.loginLan = enterVal
          tpl.loginMode = (tpl.loginMode).toString()
            this.config = tpl;
            this.modeVisible = res.loginMode == 1
            this.tipsVisible = res.loginMode == 0
      });
    }
  }
};
</script>

<style>
.flex {
  display: flex;
}
.justify-center {
  justify-content: center;
}
.wrap {
  border-radius: 0 4px 4px 0;
  border: 1px solid #e6e6e6;
  height: 508px;
  width: 747px;
  margin: 148px auto 0;
  box-shadow: 0px 6px 11px 0px rgba(30, 46, 61, 0.17);
}

img {
  padding: 0;
  width: 273px;
  height: 508px;
}
.form {
  width: 474px;
  height: 508px;
  background: #ffffff;
  padding: 30px;
  border-radius: 9px;
}

#login_container {
  width: 170px;
  height: 170px;
  overflow: hidden;
  background: #eeeeee;
  margin: 40px auto 10px auto;
}
.ant-form-explain {
  margin-left: 14px !important;
}
.tips {
    line-height: initial;
}
</style>
