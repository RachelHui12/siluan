// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vant from 'vant';
import 'vant/lib/index.css';
import store from './store/index'
import axios from 'axios';
Vue.prototype.$axios=axios;
Vue.use(Vant);
Vue.use(ElementUI);
Vue.config.productionTip = false
import { Form } from 'vant';
import { Button } from 'vant';

Vue.use(Button);
Vue.use(Form);
import { NavBar } from 'vant';

Vue.use(NavBar);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
