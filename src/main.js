import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
 import jQuery from './plugins/jquery';
 import router from './router.js';


Vue.config.productionTip = false

new Vue({
  router: router,
  vuetify,
  jQuery,
  render: h => h(App)
}).$mount('#app')
