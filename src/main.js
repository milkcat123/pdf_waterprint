import { createApp } from "vue";
// import axios from "axios";
// import VueAxios from "vue-axios";
import App from "./App.vue";
import "@/assets/css/reset.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";

const app = createApp(App);
app.component("Loading", Loading);
app.mount("#app");
