<template>
  <div class="app-view-container">
    <main class="app-view-container__main">
      <RouterView />
    </main>
    <BottomNavBar v-model:active-tab="activeTab" :tabs="tabs" v-bind:show-labels="showLabels"></BottomNavBar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import BottomNavBar, { NavTab } from "./components/BottomNavBar.vue";

const activeTab = ref<string>("home");
const showLabels = ref<boolean>(false);

const tabs: NavTab[] = [
  { name: "home", label: "Home", icon: "i-ant-design:home-outlined", activeIcon: "i-ant-design:home-filled" },
  { name: "mine", label: "Mine", icon: "i-bi:person", activeIcon: "i-bi:person-fill" },
];
</script>

<style scoped>
.app-view-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: hidden;
}

.app-view-container__main {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>