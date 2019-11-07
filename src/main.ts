import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import Tree from "@/plugins/tree/tree.vue"
import ContextMenuComponent from "@/components/ContextMenuComponent.vue"
import BootstrapVue from "bootstrap-vue"
import i18n from "./i18n"

import "./assets/sass4.3/bootstrap.scss"
// import "bootstrap-vue/dist/bootstrap-vue.css"
import "./assets/sass4.3/over-write.scss"
import "./assets/css/all.min.css"
import "../node_modules/jqueryui/jquery-ui.min.css"

Vue.config.productionTip = false

const contextMenu = {
  install: () => {
    Vue.component("ContextMenu", ContextMenuComponent)
  }
}

const tree = {
  install: () => {
    Vue.component("Tree", Tree)
  }
}

Vue.use(contextMenu)
Vue.use(tree)
Vue.use(BootstrapVue)

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount("#app")
