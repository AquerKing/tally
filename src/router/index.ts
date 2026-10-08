import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import MineView from "@/views/MineView.vue";
import SettingsPage from "@/pages/SettingsPage.vue";
import Layout from "@/layouts/Layout.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            component: Layout,
            children: [
                { path: "", redirect: "/home" },
                { path: "home", name: "home", component: HomeView },
                { path: "mine", name: "mine", component: MineView },
            ],
        },
        { path: "/page/settings", name: "settings", component: SettingsPage }
    ],
});

export default router;