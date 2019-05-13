import Vue from 'vue'
import { Button, Form, Input, Select, Radio, Checkbox,Modal } from 'ant-design-vue';
// import Button from "ant-design-vue/lib/button";
// import "ant-design-vue/dist/antd.css";
import App from './App.vue'
import './style.css'

Vue.component(Button.name, Button);
Vue.use(Form);
Vue.use(Input);
Vue.use(Select);
Vue.use(Radio);
Vue.use(Checkbox);
Vue.use(Modal);
new Vue({
  el: '#app',
  render: h => h(App)
})
