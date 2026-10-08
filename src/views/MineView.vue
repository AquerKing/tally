<template>
    <div class="page" ref="scrollEl">
        <!-- 下拉刷新 -->
        <div class="pull-spacer" :style="{ height: pullDistance + 'px' }">
            <div class="pull-hint" :class="`pull-hint--${pullState}`">
                <span class="pull-hint__spinner" v-if="pullState === 'refreshing'"></span>
                <span class="pull-hint__text">{{ pullText }}</span>
            </div>
        </div>

        <div class="page__inner">
            <!-- 顶栏：设置入口 -->
            <ViewTopBar text="PROFILE" variant="eyebrow" />

            <!-- 个人资料 -->
            <section
                class="profile interactive"
                tabindex="0"
                @click="onEditProfile"
                @keydown.enter.prevent="onEditProfile"
            >
                <div class="profile__avatar" :style="{ background: avatarBg }">
                    <span class="profile__avatar-text">{{ user.initial }}</span>
                </div>
                <div class="profile__main">
                    <h1 class="profile__name">{{ user.name }}</h1>
                    <p class="profile__bio">{{ user.bio }}</p>
                    <span class="profile__id">ID · {{ user.id }}</span>
                </div>
                <span class="profile__chevron">›</span>
            </section>

            <!-- 数据概览 -->
            <section class="stats">
                <div
                    v-for="(s, i) in stats"
                    :key="s.key"
                    class="stats__col interactive"
                    tabindex="0"
                    @click="onStatClick(s)"
                >
                    <span class="stats__value">{{ s.value }}</span>
                    <span class="stats__label">{{ s.label }}</span>
                    <span v-if="i < stats.length - 1" class="stats__divider" aria-hidden="true"></span>
                </div>
            </section>

            <!-- 快捷操作 -->
            <section class="page__section">
                <header class="section-header">
                    <h2 class="section-header__title">快捷操作</h2>
                </header>
                <div class="quick">
                    <button
                        v-for="q in quickActions"
                        :key="q.id"
                        class="quick__item interactive"
                        @click="onQuickAction(q)"
                    >
                        <span class="quick__icon" v-html="q.icon"></span>
                        <span class="quick__label">{{ q.label }}</span>
                    </button>
                </div>
            </section>
        </div>

        <!-- 返回顶部 -->
        <Transition name="fade">
            <button
                v-show="showBackTop"
                class="back-top interactive"
                aria-label="返回顶部"
                @click="scrollToTop"
            >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8 12V4M4.5 7.5L8 4l3.5 3.5"
                    />
                </svg>
            </button>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import ViewTopBar from "@/components/ViewTopBar.vue";
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

/* ---------- 类型 ---------- */
interface User {
    name: string
    bio: string
    id: string
    initial: string
}

interface StatItem {
    key: string
    label: string
    value: string
}

interface QuickAction {
    id: string
    label: string
    icon: string
}

/* ---------- 用户资料 ---------- */
const user: User = {
    name: '未命名用户',
    bio: '记录每一笔，看得见每一分。',
    id: 'u_8f3a92',
    initial: '账',
}

const avatarBg = computed(() => {
    const palettes = [
        'linear-gradient(135deg,#c8102e,#7a0a1c)',
        'linear-gradient(135deg,#1a4d8f,#0b2a55)',
        'linear-gradient(135deg,#2f6b4f,#1a3d2e)',
        'linear-gradient(135deg,#8a5a2b,#4d3018)',
    ]
    let hash = 0
    for (const ch of user.name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return palettes[hash % palettes.length]
})

function onEditProfile() {
    console.log('edit profile')
}

/* ---------- 数据概览 ---------- */
const stats: StatItem[] = [
    { key: 'days', label: '记账天数', value: '128' },
    { key: 'records', label: '总记录', value: '1,246' },
    { key: 'streak', label: '连续记账', value: '23' },
]

function onStatClick(s: StatItem) {
    console.log('stat', s.key)
}

/* ---------- 快捷操作 ---------- */
const quickActions: QuickAction[] = [
    {
        id: 'add',
        label: '记一笔',
        icon: `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M10 4v12M4 10h12"/></svg>`,
    },
    {
        id: 'categories',
        label: '分类管理',
        icon: `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M4 6h12M4 10h12M4 14h8"/></svg>`,
    },
    {
        id: 'export',
        label: '导出数据',
        icon: `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M10 3v9m0 0l-3-3m3 3l3-3M4 14v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2"/></svg>`,
    },
    {
        id: 'backup',
        label: '备份',
        icon: `<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M4 7a2 2 0 0 1 2-2h1l1-2h4l1 2h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"/><circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    },
]

function onQuickAction(q: QuickAction) {
    console.log('quick', q.id)
}

/* ---------- 滚动 / 下拉刷新 / 返回顶部 ---------- */
const scrollEl = ref<HTMLElement | null>(null)
const showBackTop = ref(false)

let ticking = false
function handleScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
        showBackTop.value = (scrollEl.value?.scrollTop ?? 0) > 400
        ticking = false
    })
}

function scrollToTop() {
    scrollEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const pullDistance = ref(0)
const pullState = ref<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle')
const pullText = computed(() => {
    switch (pullState.value) {
        case 'pulling':
            return '下拉刷新'
        case 'ready':
            return '松开刷新'
        case 'refreshing':
            return '刷新中…'
        default:
            return ''
    }
})

const PULL_THRESHOLD = 56
const PULL_MAX = 80
let startY = 0
let pulling = false

function handleTouchStart(e: TouchEvent) {
    if (pullState.value === 'refreshing') return
    const el = scrollEl.value
    if (!el || el.scrollTop > 0) return
    startY = e.touches[0].clientY
    pulling = true
}

function handleTouchMove(e: TouchEvent) {
    if (!pulling) return
    const el = scrollEl.value
    if (!el) return
    if (el.scrollTop > 0) {
        pulling = false
        pullDistance.value = 0
        pullState.value = 'idle'
        return
    }
    const dy = e.touches[0].clientY - startY
    if (dy > 0) {
        if (e.cancelable) e.preventDefault()
        const dist = Math.min(PULL_MAX, dy * 0.45)
        pullDistance.value = dist
        pullState.value = dist >= PULL_THRESHOLD ? 'ready' : 'pulling'
    }
}

function handleTouchEnd() {
    if (!pulling) return
    pulling = false
    if (pullState.value === 'ready') {
        void triggerRefresh()
    } else {
        pullDistance.value = 0
        pullState.value = 'idle'
    }
}

async function triggerRefresh() {
    pullState.value = 'refreshing'
    pullDistance.value = PULL_THRESHOLD
    try {
        await new Promise((r) => setTimeout(r, 800))
    } finally {
        pullDistance.value = 0
        pullState.value = 'idle'
    }
}

onMounted(() => {
    const el = scrollEl.value
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true })
})

onBeforeUnmount(() => {
    const el = scrollEl.value
    if (!el) return
    el.removeEventListener('scroll', handleScroll)
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
    el.removeEventListener('touchcancel', handleTouchEnd)
})
</script>

<style scoped>
.page {
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

    --_color-income: var(--color-income, #c8102e);
    --_color-expense: var(--color-expense, #1a4d8f);

    /* ---- 时长（与 HomeView 保持一致） ---- */
    --_duration-fast: var(--duration-fast, 0.14s);
    --_duration-base: var(--duration-base, 0.22s);
    --_duration-slow: var(--duration-slow, 0.3s);

    /* ---- 缓动（三档） ---- */
    --_easing-standard: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
    --_easing-bounce: var(--easing-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
    --_easing-soft: var(--easing-soft, cubic-bezier(0.4, 0, 0.2, 1));

    position: relative;
    height: 100vh;
    overflow-y: auto;
    overscroll-behavior: contain;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--_font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
}

.page__inner {
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
        transform var(--_duration-base) var(--_easing-standard),
        opacity var(--_duration-fast) var(--_easing-standard);
}

@media (hover: hover) and (pointer: fine) {
    .interactive:hover {
        background-color: var(--button-bg-color-hover);
    }
    .quick__item.interactive:hover {
        transform: translateY(-3px);
        border-color: var(--text-secondary);
        box-shadow: 0 4px 12px var(--shadow-color);
    }
    .back-top.interactive:hover {
        transform: translateY(-2px);
    }
}

.interactive:active {
    background-color: var(--button-bg-color-active);
}
.profile.interactive:active {
    transform: scale(0.995);
}
.quick__item.interactive:active {
    transform: scale(0.95);
}
.back-top.interactive:active {
    transform: scale(0.92);
}

/* ---------- 顶栏 ---------- */
.page__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--_space-md);
    padding: var(--_space-lg) 0 var(--_space-md);
}

.page__eyebrow {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.18em;
    color: var(--text-secondary);
}

.page__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    color: var(--icon-color);
    cursor: pointer;
    transition: background-color var(--_duration-fast) var(--_easing-standard);
}
.page__icon-button svg {
    transition: transform var(--_duration-slow) var(--_easing-bounce);
}
@media (hover: hover) {
    .page__icon-button:hover svg {
        transform: rotate(45deg) scale(1.05);
    }
}

/* ---------- 个人资料 ---------- */
.profile {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--_space-md);
    padding: var(--_space-lg) var(--_space-sm);
    margin: 0 calc(-1 * var(--_space-sm));
    border-bottom: 1px solid var(--border-color);
    border-radius: 8px;
}

.profile__avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: var(--_font-serif);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 8px var(--shadow-color);
    transition:
        transform var(--_duration-slow) var(--_easing-bounce),
        box-shadow var(--_duration-base) var(--_easing-standard);
}
@media (hover: hover) {
    .profile.interactive:hover .profile__avatar {
        transform: scale(1.06);
        box-shadow: 0 4px 16px var(--shadow-color);
    }
}

.profile__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.profile__name {
    margin: 0;
    font-family: var(--_font-serif);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--text-primary);
    line-height: 1.2;
}

.profile__bio {
    margin: 0;
    font-size: var(--_font-size-body);
    color: var(--text-secondary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.profile__id {
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
}

.profile__chevron {
    font-size: 20px;
    color: var(--text-secondary);
    opacity: 0.5;
    transition:
        transform var(--_duration-slow) var(--_easing-bounce),
        color var(--_duration-fast) var(--_easing-standard),
        opacity var(--_duration-base) var(--_easing-standard);
}
@media (hover: hover) {
    .profile.interactive:hover .profile__chevron {
        transform: translateX(4px);
        opacity: 1;
        color: var(--text-primary);
    }
}
.profile.interactive:active .profile__chevron {
    transform: translateX(6px);
}

/* ---------- 数据概览 ---------- */
.stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: var(--_space-lg) 0;
    border-bottom: 1px solid var(--border-color);
}

.stats__col {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--_space-sm) 0;
    border-radius: 6px;
}

.stats__value {
    font-family: var(--_font-serif);
    font-size: 24px;
    font-weight: 600;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    transition: transform var(--_duration-base) var(--_easing-bounce);
}
@media (hover: hover) {
    .stats__col.interactive:hover .stats__value {
        transform: scale(1.06);
    }
}
.stats__col.interactive:active .stats__value {
    transform: scale(0.96);
}

.stats__label {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.08em;
    color: var(--text-secondary);
}

.stats__divider {
    position: absolute;
    right: 0;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: var(--border-color);
    transition:
        top var(--_duration-base) var(--_easing-standard),
        bottom var(--_duration-base) var(--_easing-standard);
}
@media (hover: hover) {
    .stats__col.interactive:hover .stats__divider,
    .stats__col.interactive:active .stats__divider {
        top: 10%;
        bottom: 10%;
    }
}

/* ---------- Section ---------- */
.page__section {
    padding-top: var(--_space-2xl);
}
.section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--_space-md);
    padding-bottom: var(--_space-sm);
    border-bottom: 1px solid var(--border-color);
    margin-bottom: var(--_space-lg);
}
.section-header__title {
    margin: 0;
    font-size: var(--_font-size-title);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-primary);
}

/* ---------- 快捷操作 ---------- */
.quick {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--_space-sm);
}

.quick__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--_space-sm);
    padding: var(--_space-md) var(--_space-sm);
    border: 1px solid var(--border-color);
    background-color: var(--bg-elevated);
    border-radius: 10px;
    color: var(--text-primary);
    cursor: pointer;
    transition:
        background-color var(--_duration-fast) var(--_easing-standard),
        border-color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard),
        box-shadow var(--_duration-base) var(--_easing-standard);
    font: inherit;
}

.quick__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    transition:
        background-color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-slow) var(--_easing-bounce);
}
@media (hover: hover) {
    .quick__item.interactive:hover .quick__icon {
        transform: rotate(-8deg) scale(1.1);
        background-color: var(--button-bg-color-hover);
    }
}
.quick__item.interactive:active .quick__icon {
    transform: scale(0.9);
}

.quick__label {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    transition:
        color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard);
}
@media (hover: hover) {
    .quick__item.interactive:hover .quick__label {
        color: var(--text-primary);
        transform: translateY(-1px);
    }
}

/* ---------- 下拉刷新 ---------- */
.pull-spacer {
    position: relative;
    overflow: hidden;
    transition: height var(--_duration-slow) var(--_easing-standard);
}
.pull-hint {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 56px;
    font-size: var(--_font-size-caption);
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    transition:
        color var(--_duration-fast) var(--_easing-standard),
        opacity var(--_duration-base) var(--_easing-standard);
}
.pull-hint--ready {
    color: var(--text-primary);
}
.pull-hint__spinner {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
    border-top-color: var(--text-primary);
    animation: spin 0.8s linear infinite;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ---------- 返回顶部 ---------- */
.back-top {
    position: fixed;
    right: max(var(--_content-padding-x), 20px);
    bottom: 28px;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
    border-radius: 50%;
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    box-shadow: 0 2px 8px var(--shadow-color);
    cursor: pointer;
    transition:
        transform var(--_duration-base) var(--_easing-standard),
        background-color var(--_duration-fast) var(--_easing-standard),
        box-shadow var(--_duration-fast) var(--_easing-standard);
    z-index: 20;
}
.back-top svg {
    transition: transform var(--_duration-base) var(--_easing-bounce);
}
@media (hover: hover) {
    .back-top.interactive:hover svg {
        transform: translateY(-1.5px);
    }
}

/* 淡入 + 轻微上滑（与 HomeView 一致） */
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.18s var(--_easing-standard),
        transform 0.24s var(--_easing-standard);
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* ---------- 无障碍：尊重系统偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
    .page *,
    .page *::before,
    .page *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
    }
}
</style>