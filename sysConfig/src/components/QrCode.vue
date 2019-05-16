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
  import jsonp from 'jsonp';
  import store from 'store';
  import VueQrcode from '@chenfengyuan/vue-qrcode';
  function get_ddnsto_base() {
    if(window.location.hostname.indexOf("ngrokd.win") >= 0) {
        return "https://service.ngrokd.win:9443";
    } else {
        return "https://service.koolshare.cn";
    }
  }
  var DDNSTO_BASE = get_ddnsto_base();
  console.log(DDNSTO_BASE);
  
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
    //   this.alertQr
    debugger
    },
    data() {
      return {
        qrlink: "",
        visible: true,
        disable: true,
      }
    },
    methods: {
        handleOk() {

        },
      qr_refresh: function(retry) {
        var self = this;
            jsonp(DDNSTO_BASE + '/wechat/oauth/login/sso/', null, function (err, data) {
                // debugger
                  if (err) {
                    console.error(err.message);
                    self.disable = false;
                  } else {
                    if(data.status == "not_logined") {
                      self.qrlink = data.image;
                      var since_time = (new Date(Date.now())).getTime();
                      self.do_qr_listen(data.event_id, since_time);
                    } else {
                        console.log("login ok" + data.token);
                        store.set('token', data.token)
                        self.$emit('alertQr') // 隐藏二维码
                        function try_again() {
                            self.qr_refresh(true);
                        };
                        if (retry) {
                            // already retry, error
                            console.log("retry error");
                        } else {
                            setTimeout(try_again, 200);
                        }
                    }
                  }
                });
      },
      do_qr_listen: function(event_id2, since_time2) {
        var self = this;
        var param = {"listen_id": event_id2, "since_time": since_time2};
        //a polling implement to listen the event of scanning qr
        var listen_qr = function() {
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
                    setTimeout(listen_qr, 200);
                } else {
                    var event = response.data.events[response.data.events.length-1];
                    console.log("login ok: " + event.data);
                    self.qr_refresh(true);
                }
            }).catch(function (error) {
                setTimeout(listen_qr, 2000);
            });
        };
        listen_qr();
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