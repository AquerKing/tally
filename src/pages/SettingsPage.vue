<template>
    <div class="page-root">
        <PageTopBar />

        <div class="settings-page__inner">
            <!-- 通用设置 -->
            <section class="settings-section">
                <header class="settings-section__header">
                    <h2 class="settings-section__title">通用</h2>
                </header>
                <ul class="settings">
                    <li
                        v-for="item in settings"
                        :key="item.id"
                        class="settings__item interactive"
                        tabindex="0"
                        @click="onSettingClick(item)"
                        @keydown.enter.prevent="onSettingClick(item)"
                    >
                        <span class="settings__icon" v-html="item.icon"></span>
                        <div class="settings__main">
                            <span class="settings__title">{{ item.title }}</span>
                            <span v-if="item.desc" class="settings__desc">{{ item.desc }}</span>
                        </div>
                        <span
                            v-if="item.value"
                            class="settings__value"
                            :class="{ 'settings__value--muted': item.muted }"
                        >
                            {{ item.value }}
                        </span>
                        <span class="settings__chevron">›</span>
                    </li>
                </ul>
            </section>

            <!-- 外观 -->
            <section class="settings-section">
                <header class="settings-section__header">
                    <h2 class="settings-section__title">外观</h2>
                    <span class="settings-section__caption">即时生效</span>
                </header>
                <div class="theme-switch" role="radiogroup" aria-label="主题">
                    <button
                        v-for="t in themes"
                        :key="t.value"
                        class="theme-switch__item interactive"
                        :class="{ 'theme-switch__item--active': theme === t.value }"
                        role="radio"
                        :aria-checked="theme === t.value"
                        @click="setTheme(t.value)"
                    >
                        <span class="theme-switch__preview" :data-preview="t.value"></span>
                        <span class="theme-switch__label">{{ t.label }}</span>
                    </button>
                </div>
            </section>

            <!-- 页脚 -->
            <footer class="settings-page__footer">
                <span>版本 {{ version }}</span>
                <span class="settings-page__footer-sep">·</span>
                <button
                    class="settings-page__footer-link interactive"
                    @click="onAbout"
                >
                    关于
                </button>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageTopBar from '@/components/PageTopBar.vue'

/* ---------- 类型 ---------- */
interface SettingItem {
    id: string
    title: string
    desc?: string
    value?: string
    muted?: boolean
    icon: string
}

type ThemeValue = 'light' | 'dark' | 'system'

/* ---------- 设置项 ---------- */
const settings: SettingItem[] = [
    {
        id: 'currency',
        title: '默认货币',
        icon: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" d="M10 4v12M6.5 7h5.2a2.3 2.3 0 0 1 0 4.6H6.5m0 0h5.5"/></svg>`,
        value: 'CNY ¥',
    },
    {
        id: 'startDay',
        title: '每月起始日',
        desc: '影响月度统计口径',
        icon: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><rect x="3.5" y="5" width="13" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 8.5h13M7 3.5v3M13 3.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
        value: '每月 1 日',
    },
    {
        id: 'notify',
        title: '记账提醒',
        icon: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M6 8a4 4 0 0 1 8 0v3l1.2 2H4.8L6 11V8Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 15.5a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
        value: '每天 21:00',
    },
    {
        id: 'security',
        title: '隐私与安全',
        desc: '指纹 / 面容解锁',
        icon: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 3l5.5 2v4.2c0 3.4-2.3 6.3-5.5 7.3-3.2-1-5.5-3.9-5.5-7.3V5L10 3Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7.6 10l1.7 1.7L12.6 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        value: '已开启',
    },
    {
        id: 'clear',
        title: '清除本地缓存',
        desc: '仅删除本地索引，不影响云端数据',
        muted: true,
        icon: `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 6h12M6 6l.8 9a1.6 1.6 0 0 0 1.6 1.4h3.2A1.6 1.6 0 0 0 13.2 15L14 6M8.5 6V4.4A1 1 0 0 1 9.5 3.4h1A1 1 0 0 1 11.5 4.4V6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
]

function onSettingClick(item: SettingItem) {
    // TODO: 按 item.id 分发到具体设置页
    console.log('setting', item.id)
}

/* ---------- 主题 ---------- */
const themes: { value: ThemeValue; label: string }[] = [
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
    { value: 'system', label: '跟随系统' },
]

const theme = ref<ThemeValue>(readTheme())

function readTheme(): ThemeValue {
    const saved = localStorage.getItem('app-theme') as ThemeValue | null
    return saved ?? 'system'
}

function setTheme(value: ThemeValue) {
    theme.value = value
    localStorage.setItem('app-theme', value)
    applyTheme(value)
}

function applyTheme(value: ThemeValue) {
    const root = document.documentElement
    const resolved: 'light' | 'dark' =
        value === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : value
    root.dataset.theme = resolved
}

/* ---------- 页脚 ---------- */
const version = '0.1.0'

function onAbout() {
    console.log('open about')
}

/* ---------- 生命周期 ---------- */
onMounted(() => {
    // 直接进入 /page/settings 时也要把主题写回 root
    applyTheme(theme.value)
})
</script>

<style scoped>
/* ---------- 页面容器 ---------- */
.page-root {
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
    --_font-serif: var(
        --font-family-serif,
        Georgia,
        'Times New Roman',
        'Songti SC',
        'STSong',
        serif
    );

    --_space-xs: var(--space-xs, 4px);
    --_space-sm: var(--space-sm, 8px);
    --_space-md: var(--space-md, 16px);
    --_space-lg: var(--space-lg, 24px);
    --_space-xl: var(--space-xl, 32px);
    --_space-2xl: var(--space-2xl, 40px);
    --_space-3xl: var(--space-3xl, 64px);

    --_content-max-width: var(--content-max-width, 640px);
    --_content-padding-x: var(--content-padding-x, 20px);

    --_font-size-caption: var(--font-size-caption, 12px);
    --_font-size-body: var(--font-size-body, 14px);
    --_font-size-title: var(--font-size-title, 16px);

    --_color-danger: var(--color-danger, #c8102e);

    --_duration-fast: var(--duration-fast, 0.15s);
    --_duration-base: var(--duration-base, 0.25s);
    --_easing-standard: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));

    min-height: 100vh;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--_font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
}

.settings-page__inner {
    max-width: var(--_content-max-width);
    margin: 0 auto;
    padding: 0 var(--_content-padding-x) var(--_space-3xl);
}

/* ---------- 通用交互反馈 ---------- */
.interactive {
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition:
        background-color var(--_duration-fast) var(--_easing-standard),
        color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-fast) var(--_easing-standard),
        opacity var(--_duration-fast) var(--_easing-standard);
}

@media (hover: hover) and (pointer: fine) {
    .interactive:hover {
        background-color: var(--button-bg-color-hover);
    }
    .settings__item.interactive:hover {
        padding-left: var(--_space-md);
        padding-right: var(--_space-md);
    }
    .theme-switch__item.interactive:hover {
        border-color: var(--text-secondary);
    }
    .settings-page__footer-link.interactive:hover {
        color: var(--text-primary);
    }
}

.interactive:active {
    background-color: var(--button-bg-color-active);
}
.theme-switch__item.interactive:active {
    transform: scale(0.97);
}

/* ---------- 设置 Section ---------- */
.settings-section {
    padding-top: var(--_space-2xl);
}

.settings-section__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--_space-md);
    padding-bottom: var(--_space-sm);
    border-bottom: 1px solid var(--border-color);
    margin-bottom: var(--_space-lg);
}

.settings-section__title {
    margin: 0;
    font-size: var(--_font-size-title);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-primary);
}

.settings-section__caption {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
}

/* ---------- 设置列表 ---------- */
.settings {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
}

.settings__item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: var(--_space-md);
    padding: var(--_space-md) var(--_space-sm);
    margin: 0 calc(-1 * var(--_space-sm));
    border-bottom: 1px solid var(--border-color);
    border-radius: 6px;
    outline: none;
}
.settings__item:last-child {
    border-bottom: 0;
}
.settings__item:focus-visible {
    outline: 2px solid var(--_color-danger);
    outline-offset: 2px;
}

.settings__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    flex-shrink: 0;
}

.settings__main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.settings__title {
    font-size: var(--_font-size-body);
    color: var(--text-primary);
}

.settings__desc {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
    letter-spacing: 0.02em;
}

.settings__value {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    white-space: nowrap;
}
.settings__value--muted {
    color: var(--_color-danger);
    opacity: 0.85;
}

.settings__chevron {
    font-size: 18px;
    color: var(--text-secondary);
    opacity: 0.5;
    transition: transform var(--_duration-base) var(--_easing-standard);
}
@media (hover: hover) {
    .settings__item.interactive:hover .settings__chevron {
        transform: translateX(2px);
        opacity: 1;
    }
}

/* ---------- 主题切换 ---------- */
.theme-switch {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--_space-sm);
}

.theme-switch__item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--_space-sm);
    padding: var(--_space-sm);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background-color: var(--bg-elevated);
    color: var(--text-secondary);
    cursor: pointer;
    font: inherit;
    transition:
        border-color var(--_duration-fast) var(--_easing-standard),
        color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard);
}
.theme-switch__item--active {
    border-color: var(--text-primary);
    color: var(--text-primary);
}

.theme-switch__preview {
    display: block;
    height: 44px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
}
.theme-switch__preview::before,
.theme-switch__preview::after {
    content: '';
    position: absolute;
    border-radius: 2px;
}
.theme-switch__preview::before {
    left: 8px;
    right: 24px;
    top: 10px;
    height: 6px;
}
.theme-switch__preview::after {
    left: 8px;
    right: 12px;
    bottom: 12px;
    height: 6px;
}

.theme-switch__preview[data-preview='light'] {
    background: #ffffff;
}
.theme-switch__preview[data-preview='light']::before {
    background: #1a1a1a;
}
.theme-switch__preview[data-preview='light']::after {
    background: #c8102e;
}

.theme-switch__preview[data-preview='dark'] {
    background: #1e1e1e;
}
.theme-switch__preview[data-preview='dark']::before {
    background: #e8e8e8;
}
.theme-switch__preview[data-preview='dark']::after {
    background: #c8102e;
}

.theme-switch__preview[data-preview='system'] {
    background: linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #1e1e1e 50%, #1e1e1e 100%);
}
.theme-switch__preview[data-preview='system']::before {
    background: linear-gradient(135deg, #1a1a1a 0%, #1a1a1a 50%, #e8e8e8 50%, #e8e8e8 100%);
}
.theme-switch__preview[data-preview='system']::after {
    background: #c8102e;
}

.theme-switch__label {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.04em;
    text-align: center;
}

/* ---------- 页脚 ---------- */
.settings-page__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--_space-sm);
    padding-top: var(--_space-3xl);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
}

.settings-page__footer-sep {
    opacity: 0.5;
}

.settings-page__footer-link {
    background: transparent;
    border: 0;
    padding: 2px 6px;
    border-radius: 4px;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    cursor: pointer;
}
</style>