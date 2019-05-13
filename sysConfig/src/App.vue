<template>
  <div id="app">
    <div>
      <div class="wrap flex justify-center">
        <div>
          <img src="./assets/bg.png" alt>
        </div>
        <div class="form">
          <a-form :form="form" @submit="handleSubmit">
            <a-form-item label="登录服务：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
                <a-button type="primary" icon="wechat" @click="alertQr">微信授权</a-button>
                <!-- <a-icon type="wechat" /> -->
            </a-form-item>
            <a-form-item label="共享路径：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <!-- prefix="folder-open" -->
              <a-input
                v-decorator="[
                        'note',
                        {rules: [{ required: true, message: 'Please input your note!' }]}
                        ]"
              />
            </a-form-item>
            <a-form-item label="免授权访问：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-radio-group v-decorator="['radio-group']">
                <a-radio value="a">
                仅本机
                </a-radio>
                <a-radio value="b">
                仅局域网
                </a-radio>
                <a-radio value="c">
                全网
                </a-radio>
            </a-radio-group>
            </a-form-item>
            <a-form-item label="内网网段：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-textarea
                placeholder="请输入网段" :rows="4"
                v-decorator="[
                        'note',
                        {rules: [{ required: true, message: 'Please input your note!' }]}
                        ]"
              />
            </a-form-item>
            <a-form-item label="使用协议：" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
              <a-checkbox >
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
      </div>
      <qrcode v-if="visible" :alertQr="alertQr"></qrcode>
    </div>
  </div>
</template>

<script>
// import leftBg from './assets/bg.png';
import QrCode from './components/QrCode';
export default {
  name: "app",
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this),
    };
  },
  components: {
      qrcode: QrCode
  },
  methods: {
      alertQr() {
          this.visible = !this.visible
      },
      handleSubmit() {

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
</style>
