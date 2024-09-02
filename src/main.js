import { createApp } from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App.vue";
import "bootstrap-icons/font/bootstrap-icons.css";

createApp(App).use(VueAxios, axios).mount("#app");
