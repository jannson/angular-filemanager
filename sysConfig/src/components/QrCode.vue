<template>
  <div>
    <a-modal
      title="扫码登录"
      v-model="visible"
      :footer="null"
      @cancel="alertQr"
    >
        <div class="center">

            <qrcode v-if="qrlink" :value="qrlink" :options="{ size: 330 }"></qrcode>
        </div>
        <a-button v-if="!disable" @click="qr_refresh()">超时刷新</a-button>
    </a-modal>
  </div>
</template>
<script>
  import axios from 'axios';
  import qs from 'qs';
  import jsonp from 'jsonp';
  import store from 'store';
  import VueQrcode from '@chenfengyuan/vue-qrcode';
    import request, {baseURL} from "../request";

    import { message } from 'ant-design-vue'

  function get_ddnsto_base() {
    if(window.location.hostname.indexOf("ngrokd.win") >= 0) {
        return "https://service.ngrokd.win:9443";
    } else {
        return "https://service.koolshare.cn";
    }
  }
  var DDNSTO_BASE = get_ddnsto_base();
  
  export default {
    name: 'WeixinLogin',
    components: {
      qrcode: VueQrcode,
    },
    props: {
        alertQr: Function
    },
    created: function () {
      this.qr_refresh();
    },
    data() {
      return {
        qrlink: "",
        visible: true,
        disable: true,
      }
    },
    methods: {
        login() {
            return request({
                url: "/api/loginByToken",
                data: {
                    token: store.get('token'),
                }
            })
        },
      qr_refresh: function(retry) {
        var self = this;
            jsonp(DDNSTO_BASE + '/wechat/oauth/login/sso/', null, function (err, data) {
                  if (err) {
                    console.error(err.message);
                    self.disable = false;
                  } else {
                    if(data.status == "not_logined") {
                      self.qrlink = data.image;
                      var since_time = (new Date(Date.now())).getTime();
                      self.do_qr_listen(data.event_id, since_time);
                    } else { // 已登录过 https://service.koolshare.cn 
                        const {nologin} = qs.parse(window.location.search,{ ignoreQueryPrefix: true })
                        store.set('token', data.token)
                        if (nologin) { // 登录页面而来
                            // 登录ddnsto
                            self.login().then(() => {
                                message.success('授权成功', () => {
                                    self.$emit('alertQr1') // 隐藏二维码
                                    window.location = '/'
                                })
                            })
                            return
                        }
                        // console.log('我是jsonp '+DDNSTO_BASE + '/wechat/oauth/login/sso/',data.status)
                        self.$emit('alertQr1') // 隐藏二维码
                    }
                  }
            });
      },
      listen_qr(param) {
            var self = this;
              var listen_id = param.listen_id;
            var since_time = param.since_time;
            if(!since_time || !listen_id || self.qrlink === "") {
                return;
            }
            var now = (new Date(Date.now())).getTime();
            if((now-since_time) > 120*1000) {
                self.disable = false;
                return;
            }
            var timeout = 30;
            var optional_since = "&since_time=" + since_time;
            var pollUrl = DDNSTO_BASE + "/longpoll/events?timeout=" + timeout + "&category=weixinoauth-" + listen_id + optional_since;
            //use CORS
            axios.get(pollUrl).then(function (response) {
                if(response.data.timeout) {
                    setTimeout(()=> self.listen_qr(param), 200);
                } else {
                    var event = response.data.events[response.data.events.length-1];
                    console.log("login ok: " + event.data);
                    const {nologin} = qs.parse(window.location.search,{ ignoreQueryPrefix: true })
                    if (nologin) { // 登录页面而来
                        self.login().then(() => {
                            message.success('授权成功', () => {
                                self.$emit('alertQr1') // 隐藏二维码
                                window.location = '/'
                            })
                        })
                    } else {
                        self.qr_refresh(true);
                    }
                }
            }).catch(function (error) {
                console.log('错误')
                
                setTimeout(()=> self.listen_qr(param), 2000);
            });
      },
      do_qr_listen: function(event_id2, since_time2) {
        var param = {"listen_id": event_id2, "since_time": since_time2};
        //a polling implement to listen the event of scanning qr
        this.listen_qr(param);
      }
    }
  }
</script>

<style scoped>
  .l-btn {
    padding-bottom: 1rem;
    text-align: center;
  }
  .welcome-body {
    margin-top: 2rem;
  }
.panel {
    max-width: 330px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}
</style>