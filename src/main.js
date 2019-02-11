import Vue from 'vue'
import App from './App.vue'
//import router from './router'
import TreeView from 'vue-json-tree-view'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

Vue.config.productionTip = false

Vue.use(TreeView)

export const serverBus = new Vue()

new Vue({
  render: h => h(App),
  //router,
}).$mount('#app')
