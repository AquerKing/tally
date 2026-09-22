import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import MineView from "@/views/MineView.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", redirect: "/home" },
        { path: "/home", name: "home", component: HomeView },
        { path: "/mine", name: "mine", component: MineView },
    ],
});

export default router;