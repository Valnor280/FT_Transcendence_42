import { createApp } from 'vue'
//import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import $socket from './plugin/socket'
import Toast, { PluginOptions } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
import VueCookies from 'vue-cookies'
import $axios from './plugin/axios'
import { AUTH_LOGOUT } from './store/auth';

const options: PluginOptions = {
	transition: "Vue-Toastification__bounce",
	maxToasts: 20,
	newestOnTop: true,
	pauseOnFocusLoss: false,
};

const app = createApp(App).use(store).use(router).use(Toast, options).use(VueCookies)

router.isReady().then(() => {
    app.mount('#app')
})

const token = localStorage.getItem('user-token')
console.log(token);
if (token) {
$axios.defaults.headers.common['Authorization'] = 'bearer ' + token;
$socket.io.opts.extraHeaders = {'Authorization': token};
}
