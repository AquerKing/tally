<template>
  <div class="app-view-container">
    <!-- 桌面端：左侧栏 -->
    <aside v-if="!isMobile" class="app-view-container__sidebar">
      <div class="app-view-container__brand">记账</div>
      <nav class="side-nav">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="{ name: tab.name }"
          custom
          v-slot="{ navigate, isActive }"
        >
          <button
            :class="{ 'is-active': isActive }"
            class="side-nav__item"
            :aria-current="isActive ? 'page' : undefined"
            @click="onNavClick(tab, navigate)"
          >
            <span class="side-nav__label">{{ tab.label }}</span>
          </button>
        </RouterLink>
      </nav>
    </aside>

    <!-- 主区 + 移动端底部栏 -->
    <div class="app-view-container__body">
      <main class="app-view-container__main">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </main>

      <LayoutBottomNavBar
        v-if="isMobile"
        v-model:active-tab="activeTab"
        :tabs="tabs"
        :show-labels="true"
        @change="activeTab = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import LayoutBottomNavBar, { type NavTab } from '@components/LayoutBottomNavBar.vue'

/** 断点：小于该宽度视为移动端 */
const MOBILE_BREAKPOINT = 768

const route = useRoute()
const activeTab = ref<string>((route.name as string) ?? 'home')
const isMobile = ref(false)

/* ---------- 响应式断点监听 ---------- */
let mql: MediaQueryList | null = null

function syncIsMobile(e: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = e.matches
}

onMounted(() => {
  mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  syncIsMobile(mql)
  mql.addEventListener('change', syncIsMobile)
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', syncIsMobile)
})

/* ---------- 导航 ---------- */
const tabs: NavTab[] = [
  {
    name: 'home',
    label: '首页',
  },
  {
    name: 'mine',
    label: '我的',
  },
]

function onNavClick(tab: NavTab, navigate: () => void) {
  activeTab.value = tab.name
  navigate()
}
</script>

<style scoped>
/* ---------- 根容器 ---------- */
.app-view-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* ---------- 桌面端侧栏 ---------- */
.app-view-container__sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  overflow-y: auto;
}

.app-view-container__brand {
  font-family: var(
    --font-family-serif,
    Georgia,
    'Times New Roman',
    'Songti SC',
    serif
  );
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--text-primary);
  padding: 0 12px 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 12px;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.side-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .side-nav__item:hover {
    background-color: var(--button-bg-color-hover);
    color: var(--text-primary);
  }
}

.side-nav__item:active {
  background-color: var(--button-bg-color-active);
}

.side-nav__item.is-active {
  background-color: var(--button-bg-color-hover);
  color: var(--text-primary);
  font-weight: 600;
}

.side-nav__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.side-nav__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- 主区 ---------- */
.app-view-container__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.app-view-container__main {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  overscroll-behavior: contain;
}

/* ---------- 修正子页面的双层滚动 ----------
 * HomeView / MineView 里 .page 用了 height: 100vh + overflow-y: auto，
 * 和这里的 main 冲突。下面把它们拉回到"由外层统一滚动"，
 * 子页面只需负责内容布局。
 * 如果你更想让每个 View 自己管理滚动，把这段删掉即可。
 */
.app-view-container__main :deep(.page) {
  height: auto;
  min-height: 100%;
  overflow-y: visible;
  overscroll-behavior: auto;
}
</style>