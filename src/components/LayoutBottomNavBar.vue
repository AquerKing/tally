<template>
    <nav class="bottom-nav-bar">
        <RouterLink
            v-for="tab in tabs"
            :key="tab.name"
            :to="{ name: tab.name }"
            v-slot="{ navigate, isActive }"
            custom
        >
            <button
                type="button"
                class="bottom-nav-bar__button interactive"
                :class="{ 'is-active': isActive }"
                :aria-current="isActive ? 'page' : undefined"
                @click="handleClick(tab, navigate)"
            >
                <!-- 顶部激活指示条 -->
                <span class="bottom-nav-bar__indicator" aria-hidden="true"></span>

                <!-- 图标：按 tab.name 硬编码 SVG，激活时交叉淡入淡出 -->
                <span class="bottom-nav-bar__icon" aria-hidden="true">
                    <!-- 首页 -->
                    <template v-if="tab.name === 'home'">
                        <svg
                            class="bottom-nav-bar__icon-layer"
                            :class="{ 'is-visible': !isActive }"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M3.5 10.5 12 3.5l8.5 7" />
                            <path d="M5.5 9.5V21h13V9.5" />
                        </svg>
                        <svg
                            class="bottom-nav-bar__icon-layer"
                            :class="{ 'is-visible': isActive }"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M11.36 2.77a1 1 0 0 1 1.28 0l8 6.67c.23.19.36.47.36.77V20a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-9.79c0-.3.13-.58.36-.77l8-6.67Z"
                            />
                        </svg>
                    </template>

                    <!-- 我的 -->
                    <template v-else-if="tab.name === 'mine'">
                        <svg
                            class="bottom-nav-bar__icon-layer"
                            :class="{ 'is-visible': !isActive }"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                        </svg>
                        <svg
                            class="bottom-nav-bar__icon-layer"
                            :class="{ 'is-visible': isActive }"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path
                                d="M12 14c-4.4 0-8 2.7-8 6 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-3.3-3.6-6-8-6Z"
                            />
                        </svg>
                    </template>
                </span>

                <!-- 标签 -->
                <span
                    class="bottom-nav-bar__label"
                    :class="{ 'is-collapsed': !showLabels }"
                >
                    {{ tab.label }}
                </span>
            </button>
        </RouterLink>
    </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

/**
 * 单个导航栏项目。
 *
 * 图标不再由外部传入，改为在模板中按 `name` 硬编码。
 * 新增 tab 时，在模板里补一段 `<template v-else-if="tab.name === 'xxx'">…</template>` 即可。
 */
export interface NavTab {
    name: string
    label: string
}

interface Props {
    tabs: NavTab[]
    showLabels?: boolean
}

withDefaults(defineProps<Props>(), {
    showLabels: true,
})

const activeTabModel = defineModel<string>('active-tab', {
    type: String,
    default: '',
})

const emit = defineEmits<{
    change: [name: string]
}>()

function handleClick(tab: NavTab, navigate: () => void): void {
    if (activeTabModel.value !== tab.name) {
        activeTabModel.value = tab.name
        emit('change', tab.name)
    }
    navigate()
}
</script>

<style scoped>
/* -------------------------------------------------------------
 * 局部变量兜底（与 HomeView / MineView / ViewTopBar 保持一致）
 * ------------------------------------------------------------- */
.bottom-nav-bar {
    --_font-sans: var(
        --font-family-sans,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        'PingFang SC',
        'Hiragino Sans GB',
        'Microsoft YaHei',
        sans-serif
    );

    --_duration-fast: var(--duration-fast, 0.14s);
    --_duration-base: var(--duration-base, 0.22s);
    --_duration-slow: var(--duration-slow, 0.3s);

    --_easing-standard: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
    --_easing-bounce: var(--easing-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));

    display: flex;
    height: 64px;
    flex-shrink: 0;
    background-color: var(--bg-primary);
    border-top: 1px solid var(--border-color);
    font-family: var(--_font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
}

/* ---------- 按钮 ---------- */
.bottom-nav-bar__button {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0;
    border: 0;
    background-color: transparent;
    color: var(--text-secondary);
    font: inherit;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
    transition:
        color var(--_duration-base) var(--_easing-standard),
        background-color var(--_duration-fast) var(--_easing-standard);
}

/* 相邻按钮间的 1px 分隔线（绝对定位，不参与布局） */
.bottom-nav-bar__button + .bottom-nav-bar__button::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: var(--border-color);
    opacity: 0.7;
    pointer-events: none;
}

/* ---------- 激活指示条 ---------- */
.bottom-nav-bar__indicator {
    position: absolute;
    top: 0;
    left: 50%;
    width: 22px;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background-color: var(--text-primary);
    transform: translateX(-50%) scaleX(0);
    transform-origin: center;
    opacity: 0;
    transition:
        transform var(--_duration-slow) var(--_easing-bounce),
        opacity var(--_duration-base) var(--_easing-standard);
    will-change: transform, opacity;
}

.bottom-nav-bar__button.is-active .bottom-nav-bar__indicator {
    transform: translateX(-50%) scaleX(1);
    opacity: 1;
}

/* ---------- 图标容器 ---------- */
.bottom-nav-bar__icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--icon-color);
    transition:
        color var(--_duration-base) var(--_easing-standard),
        transform var(--_duration-slow) var(--_easing-bounce);
    will-change: transform;
}

.bottom-nav-bar__button.is-active .bottom-nav-bar__icon {
    color: var(--text-primary);
    transform: translateY(-1px) scale(1.08);
}

/* ---------- 图标层（两层叠放，交叉淡入淡出） ---------- */
.bottom-nav-bar__icon-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity var(--_duration-base) var(--_easing-standard);
}

.bottom-nav-bar__icon-layer.is-visible {
    opacity: 1;
}

/* ---------- 标签 ---------- */
.bottom-nav-bar__label {
    font-size: 0.72rem;
    line-height: 1;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    white-space: nowrap;
    transition:
        color var(--_duration-base) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard);
}

.bottom-nav-bar__button.is-active .bottom-nav-bar__label {
    color: var(--text-primary);
    font-weight: 600;
}

.bottom-nav-bar__label.is-collapsed {
    display: none;
}

/* ---------- 交互反馈 ---------- */
@media (hover: hover) and (pointer: fine) {
    .bottom-nav-bar__button.interactive:hover {
        background-color: var(--button-bg-color-hover);
    }
    .bottom-nav-bar__button.interactive:hover .bottom-nav-bar__icon {
        transform: translateY(-2px);
    }
    .bottom-nav-bar__button.interactive:hover .bottom-nav-bar__label {
        color: var(--text-primary);
    }
}

.bottom-nav-bar__button.interactive:active {
    background-color: var(--button-bg-color-active);
}

.bottom-nav-bar__button.interactive:active .bottom-nav-bar__icon {
    transform: scale(0.86);
    transition-duration: var(--_duration-fast);
}

/* ---------- 无障碍：尊重系统偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
    .bottom-nav-bar *,
    .bottom-nav-bar *::before,
    .bottom-nav-bar *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
    }
}
</style>