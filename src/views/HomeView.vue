<template>
    <div class="page" ref="scrollEl">
        <!-- 下拉刷新占位 -->
        <div class="pull-spacer" :style="{ height: pullDistance + 'px' }">
            <div class="pull-hint" :class="`pull-hint--${pullState}`">
                <span class="pull-hint__spinner" v-if="pullState === 'refreshing'"></span>
                <span class="pull-hint__text">{{ pullText }}</span>
            </div>
        </div>

        <div class="page__inner">
            <!-- 顶栏：日期 + 设置入口 -->
            <ViewTopBar :text="today" variant="plain" />

            <!-- 总资产（点击切换隐私） -->
            <section
                class="hero interactive"
                role="button"
                tabindex="0"
                :aria-pressed="privacy"
                @click="togglePrivacy"
                @keydown.enter.prevent="togglePrivacy"
                @keydown.space.prevent="togglePrivacy"
            >
                <span class="hero__label">
                    {{ period }}总资产
                    <span class="hero__eye" :class="{ 'hero__eye--hidden': privacy }">
                        {{ privacy ? '显示' : '隐藏' }}
                    </span>
                </span>

                <!-- 金额切换：隐私模式进出场 -->
                <Transition name="amount" mode="out-in">
                    <div
                        class="hero__amount"
                        :class="{ 'hero__amount--masked': privacy }"
                        :key="privacy ? 'masked' : 'value'"
                    >
                        {{ privacy ? '••••••' : formatMoney(balance) }}
                    </div>
                </Transition>

                <div class="hero__meta">
                    <span
                        class="trend-badge"
                        :class="balanceTrend >= 0 ? 'trend-badge--up' : 'trend-badge--down'"
                    >
                        {{ balanceTrend >= 0 ? '▲' : '▼' }}
                        {{ Math.abs(balanceTrend).toFixed(1) }}%
                    </span>
                    <span class="hero__meta-label">较上月</span>
                </div>
            </section>

            <!-- 本月收入 / 支出 -->
            <section class="flow">
                <div class="flow__col interactive" tabindex="0">
                    <span class="flow__label">收入</span>
                    <span class="flow__amount flow__amount--income">
                        +{{ formatMoney(income) }}
                    </span>
                    <span
                        class="trend-badge trend-badge--sm"
                        :class="incomeTrend >= 0 ? 'trend-badge--up' : 'trend-badge--down'"
                    >
                        {{ incomeTrend >= 0 ? '▲' : '▼' }}
                        {{ Math.abs(incomeTrend).toFixed(1) }}%
                    </span>
                </div>
                <div class="flow__divider" aria-hidden="true"></div>
                <div class="flow__col interactive" tabindex="0">
                    <span class="flow__label">支出</span>
                    <span class="flow__amount flow__amount--expense">
                        -{{ formatMoney(expense) }}
                    </span>
                    <span
                        class="trend-badge trend-badge--sm"
                        :class="expenseTrend >= 0 ? 'trend-badge--up' : 'trend-badge--down'"
                    >
                        {{ expenseTrend >= 0 ? '▲' : '▼' }}
                        {{ Math.abs(expenseTrend).toFixed(1) }}%
                    </span>
                </div>
            </section>

            <!-- 近七日收支 -->
            <section class="page__section">
                <header class="section-header">
                    <h2 class="section-header__title">近七日收支</h2>
                    <span class="section-header__caption">单位：元</span>
                </header>

                <!-- 详情读数条 -->
                <div class="weekly__readout" :class="{ 'weekly__readout--active': !!activeDay }">
                    <template v-if="activeDay">
                        <span class="weekly__readout-day">{{ activeDay.label }} · {{ activeDay.date.slice(5) }}</span>
                        <span class="weekly__readout-item weekly__readout-item--income">
                            收入 <b>{{ formatMoney(activeDay.income) }}</b>
                        </span>
                        <span class="weekly__readout-item weekly__readout-item--expense">
                            支出 <b>{{ formatMoney(activeDay.expense) }}</b>
                        </span>
                    </template>
                    <template v-else>
                        <span class="weekly__readout-hint">悬停或点击查看每日详情</span>
                    </template>
                </div>

                <div class="weekly" @pointerleave="onWeeklyLeave">
                    <div
                        v-for="day in week"
                        :key="day.date"
                        class="weekly__item interactive"
                        :class="{
                            'weekly__item--active':
                                activeDay && activeDay.date === day.date,
                        }"
                        @pointerenter="onDayEnter(day, $event)"
                        @pointerleave="onDayLeave(day, $event)"
                        @click="onDayClick(day)"
                    >
                        <div class="weekly__bars">
                            <div
                                class="weekly__bar weekly__bar--income"
                                :style="{ height: barHeight(day.income) + '%' }"
                            ></div>
                            <div
                                class="weekly__bar weekly__bar--expense"
                                :style="{ height: barHeight(day.expense) + '%' }"
                            ></div>
                        </div>
                        <span class="weekly__label">{{ day.label }}</span>
                    </div>
                </div>
            </section>

            <!-- 支出分类 -->
            <section class="page__section">
                <header class="section-header">
                    <h2 class="section-header__title">支出分类</h2>
                    <span class="section-header__caption">共 {{ categories.length }} 类</span>
                </header>
                <ul class="categories">
                    <li
                        v-for="cat in categories"
                        :key="cat.id"
                        class="categories__item interactive"
                        :class="{
                            'categories__item--expanded':
                                expandedCategory === cat.id,
                        }"
                        @click="toggleCategory(cat.id)"
                    >
                        <div class="categories__row">
                            <span class="categories__name">{{ cat.name }}</span>
                            <span class="categories__amount">
                                {{ formatMoney(cat.amount) }}
                                <span class="categories__chevron">›</span>
                            </span>
                        </div>
                        <div class="categories__bar">
                            <div
                                class="categories__bar-fill"
                                :style="{ width: cat.percent + '%' }"
                            ></div>
                        </div>
                        <Transition name="expand">
                            <div
                                v-if="expandedCategory === cat.id"
                                class="categories__detail"
                            >
                                <span>共 {{ cat.count }} 笔</span>
                                <span class="categories__detail-sep">·</span>
                                <span>平均 {{ formatMoney(cat.avg) }}</span>
                            </div>
                        </Transition>
                    </li>
                </ul>
            </section>

            <!-- 最近记录 -->
            <section class="page__section">
                <header class="section-header">
                    <h2 class="section-header__title">最近记录</h2>
                    <RouterLink class="page__link" to="">全部</RouterLink>
                </header>
                <ul class="records">
                    <li
                        v-for="tx in transactions"
                        :key="tx.id"
                        class="records__item interactive"
                        tabindex="0"
                        @click="onTxClick(tx)"
                        @keydown.enter.prevent="onTxClick(tx)"
                    >
                        <div class="records__main">
                            <span class="records__title">{{ tx.title }}</span>
                            <span class="records__meta">
                                {{ tx.category }} · {{ tx.time }}
                            </span>
                        </div>
                        <span
                            class="records__amount"
                            :class="
                                tx.type === 'income'
                                    ? 'records__amount--income'
                                    : 'records__amount--expense'
                            "
                        >
                            {{ tx.type === 'income' ? '+' : '-' }}{{ formatMoney(tx.amount) }}
                        </span>
                    </li>
                </ul>
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
/* 脚本部分完全不变，直接沿用原文件 */
import ViewTopBar from "@/components/ViewTopBar.vue";
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface DailyFlow {
    label: string
    date: string
    income: number
    expense: number
}

interface CategoryItem {
    id: string
    name: string
    amount: number
    percent: number
    count: number
    avg: number
}

interface Transaction {
    id: string
    title: string
    category: string
    amount: number
    type: 'income' | 'expense'
    time: string
}

const today = computed(() =>
    new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
)

const balance = 12864.5
const balanceTrend = 3.2
const period = '本月'

const income = 8200
const expense = 4620.5
const incomeTrend = 5.6
const expenseTrend = -2.1

const privacy = ref(false)
function togglePrivacy() {
    privacy.value = !privacy.value
}

const week: DailyFlow[] = [
    { label: '一', date: '2026-10-02', income: 0, expense: 45.5 },
    { label: '二', date: '2026-10-03', income: 0, expense: 32 },
    { label: '三', date: '2026-10-04', income: 120, expense: 128 },
    { label: '四', date: '2026-10-05', income: 0, expense: 24.8 },
    { label: '五', date: '2026-10-06', income: 80, expense: 68 },
    { label: '六', date: '2026-10-07', income: 0, expense: 210 },
    { label: '日', date: '2026-10-08', income: 1500, expense: 95 },
]

const weekMax = computed(() =>
    Math.max(1, ...week.map((d) => Math.max(d.income, d.expense)))
)

function barHeight(value: number): number {
    return (value / weekMax.value) * 100
}

const hoverDay = ref<DailyFlow | null>(null)
const selectedDay = ref<DailyFlow | null>(null)
const activeDay = computed(() => hoverDay.value ?? selectedDay.value)

function onDayEnter(day: DailyFlow, e: PointerEvent) {
    if (e.pointerType === 'mouse') hoverDay.value = day
}
function onDayLeave(day: DailyFlow, e: PointerEvent) {
    if (e.pointerType === 'mouse' && hoverDay.value?.date === day.date) {
        hoverDay.value = null
    }
}
function onDayClick(day: DailyFlow) {
    selectedDay.value = selectedDay.value?.date === day.date ? null : day
    hoverDay.value = null
}
function onWeeklyLeave() {
    hoverDay.value = null
}

const categories: CategoryItem[] = [
    { id: 'food', name: '餐饮', amount: 1280, percent: 27.8, count: 24, avg: 53.3 },
    { id: 'housing', name: '居住', amount: 1500, percent: 32.6, count: 3, avg: 500 },
    { id: 'shopping', name: '购物', amount: 890, percent: 19.3, count: 7, avg: 127.1 },
    { id: 'traffic', name: '交通', amount: 620, percent: 13.5, count: 18, avg: 34.4 },
    { id: 'other', name: '其他', amount: 330.5, percent: 7.2, count: 5, avg: 66.1 },
]

const expandedCategory = ref<string | null>(null)
function toggleCategory(id: string) {
    expandedCategory.value = expandedCategory.value === id ? null : id
}

const transactions: Transaction[] = [
    { id: 't1', title: '星巴克', category: '餐饮', amount: 35, type: 'expense', time: '今天 14:30' },
    { id: 't2', title: '工资入账', category: '收入', amount: 8200, type: 'income', time: '今天 09:00' },
    { id: 't3', title: '地铁', category: '交通', amount: 4, type: 'expense', time: '昨天 18:22' },
    { id: 't4', title: '超市采购', category: '购物', amount: 128.5, type: 'expense', time: '昨天 20:15' },
    { id: 't5', title: '房租', category: '居住', amount: 1500, type: 'expense', time: '10-01 10:00' },
    { id: 't6', title: '外卖', category: '餐饮', amount: 32, type: 'expense', time: '09-30 12:40' },
]

function onTxClick(tx: Transaction) {
    console.log('open transaction', tx.id)
}

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

function formatMoney(value: number): string {
    return value.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}
</script>

<style scoped>
/* -------------------------------------------------------------
 * 局部变量（含默认值，未定义也不会崩）
 * ------------------------------------------------------------- */
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
    --_font-size-display: var(--font-size-display, 40px);

    --_color-income: var(--color-income, #c8102e);
    --_color-expense: var(--color-expense, #1a4d8f);

    /* ---- 时长 ---- */
    --_duration-fast: var(--duration-fast, 0.14s);
    --_duration-base: var(--duration-base, 0.22s);
    --_duration-slow: var(--duration-slow, 0.3s);

    /* ---- 缓动 ---- */
    /* 快出慢入：状态切换主曲线，不拖尾 */
    --_easing-standard: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
    /* 轻微过冲：图标/chevron 这类装饰反馈 */
    --_easing-bounce: var(--easing-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
    /* 对称平滑：展开/收起 */
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
    will-change: transform;
}

/* 仅在真正支持 hover 的设备上启用 hover 效果 */
@media (hover: hover) and (pointer: fine) {
    .interactive:hover {
        background-color: var(--button-bg-color-hover);
    }
    .weekly__item.interactive:hover {
        background-color: var(--button-bg-color-hover);
    }
    .categories__item.interactive:hover {
        background-color: var(--button-bg-color-hover);
    }
    .hero.interactive:hover .hero__eye {
        opacity: 1;
    }
    .back-top.interactive:hover {
        transform: translateY(-2px);
        background-color: var(--button-bg-color-hover);
    }
    .page__icon-button:hover {
        background-color: var(--button-bg-color-hover);
    }
    .page__icon-button:hover svg {
        transform: rotate(45deg) scale(1.05);
    }
}

/* 触摸 / 按下反馈 */
.interactive:active {
    background-color: var(--button-bg-color-active);
}
.hero.interactive:active,
.flow__col.interactive:active {
    transform: scale(0.995);
}
.weekly__item.interactive:active {
    transform: scale(0.96);
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

.page__date {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.08em;
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

.page__link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: var(--_font-size-caption);
    letter-spacing: 0.04em;
    padding: 4px 6px;
    border-radius: 4px;
    transition:
        color var(--_duration-fast) var(--_easing-standard),
        background-color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard);
}
@media (hover: hover) {
    .page__link:hover {
        color: var(--text-primary);
        background-color: var(--button-bg-color-hover);
        transform: translateX(2px);
    }
}

/* ---------- Hero ---------- */
.hero {
    padding: var(--_space-xl) 0 var(--_space-lg);
    border-bottom: 1px solid var(--border-color);
    border-radius: 6px;
}

.hero__label {
    display: flex;
    align-items: center;
    gap: var(--_space-sm);
    font-size: var(--_font-size-caption);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: var(--_space-sm);
}

.hero__eye {
    font-size: 10px;
    letter-spacing: 0.08em;
    padding: 1px 6px;
    border-radius: 3px;
    background-color: var(--button-bg-color-hover);
    color: var(--text-secondary);
    opacity: 0;
    transform: scale(0.88);
    transform-origin: left center;
    transition:
        opacity var(--_duration-base) var(--_easing-standard),
        transform var(--_duration-slow) var(--_easing-bounce);
}
.hero__eye--hidden {
    opacity: 1;
    transform: scale(1);
}

.hero__amount {
    font-family: var(--_font-serif);
    font-size: var(--_font-size-display);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
    transition: letter-spacing var(--_duration-base) var(--_easing-standard);
}
.hero__amount::before {
    content: '¥';
    font-size: 0.5em;
    font-weight: 500;
    margin-right: 4px;
    vertical-align: 0.35em;
    color: var(--text-secondary);
}
.hero__amount--masked {
    letter-spacing: 0.08em;
}

/* 金额进出场：隐私切换时新数字从下方滑入 */
.amount-enter-active,
.amount-leave-active {
    transition:
        opacity 0.16s var(--_easing-standard),
        transform 0.22s var(--_easing-standard);
}
.amount-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.amount-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.hero__meta {
    display: flex;
    align-items: center;
    gap: var(--_space-sm);
    margin-top: var(--_space-sm);
}
.hero__meta-label {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
}

/* ---------- 收支 ---------- */
.flow {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    gap: var(--_space-lg);
    padding: var(--_space-lg) 0;
    border-bottom: 1px solid var(--border-color);
}

.flow__col {
    display: flex;
    flex-direction: column;
    gap: var(--_space-xs);
    padding: var(--_space-sm);
    margin: calc(-1 * var(--_space-sm));
    border-radius: 6px;
}

.flow__divider {
    background: var(--border-color);
    width: 1px;
    align-self: stretch;
}

.flow__label {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.flow__amount {
    font-family: var(--_font-serif);
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    transition: transform var(--_duration-base) var(--_easing-standard);
}
.flow__col.interactive:active .flow__amount {
    transform: scale(0.985);
}
.flow__amount--income {
    color: var(--_color-income);
}
.flow__amount--expense {
    color: var(--_color-expense);
}

/* ---------- 趋势徽章 ---------- */
.trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--_font-size-caption);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    transition: transform var(--_duration-base) var(--_easing-bounce);
}
.trend-badge--sm {
    font-size: 11px;
    opacity: 0.85;
}
.trend-badge--up {
    color: var(--_color-income);
}
.trend-badge--down {
    color: var(--_color-expense);
}
@media (hover: hover) {
    .hero.interactive:hover .trend-badge {
        transform: translateX(2px);
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
.section-header__caption {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
}

/* ---------- 近七日 ---------- */
.weekly__readout {
    display: flex;
    align-items: baseline;
    gap: var(--_space-md);
    min-height: 22px;
    margin-bottom: var(--_space-md);
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
    transition: color var(--_duration-fast) var(--_easing-standard);
}
.weekly__readout--active {
    color: var(--text-primary);
}
.weekly__readout-day {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
}
.weekly__readout-item {
    animation: readoutIn 0.24s var(--_easing-standard) both;
}
.weekly__readout-item b {
    font-family: var(--_font-serif);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
}
.weekly__readout-item--income b {
    color: var(--_color-income);
}
.weekly__readout-item--expense b {
    color: var(--_color-expense);
}
.weekly__readout-hint {
    opacity: 0.6;
    animation: readoutIn 0.24s var(--_easing-standard) both;
}
@keyframes readoutIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.weekly {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--_space-sm);
}

.weekly__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--_space-sm);
    padding: var(--_space-sm) 0;
    border-radius: 6px;
}
.weekly__item--active {
    background-color: var(--button-bg-color-hover);
}

.weekly__bars {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    height: 64px;
    width: 100%;
}

.weekly__bar {
    width: 6px;
    min-height: 2px;
    border-radius: 1px;
    transform-origin: bottom;
    /* 入场：从底部长出来；状态变化平滑 */
    animation: barGrow 0.42s var(--_easing-standard) backwards;
    transition:
        height var(--_duration-slow) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard),
        background-color var(--_duration-fast) var(--_easing-standard);
}
@keyframes barGrow {
    from {
        transform: scaleY(0);
        opacity: 0.4;
    }
    to {
        transform: scaleY(1);
        opacity: 1;
    }
}
.weekly__bar--income {
    background-color: var(--_color-income);
}
.weekly__bar--expense {
    background-color: var(--_color-expense);
}
.weekly__item--active .weekly__bar {
    transform: scaleX(1.5) scaleY(1.04);
}

.weekly__label {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
    transition:
        color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard);
}
.weekly__item--active .weekly__label {
    color: var(--text-primary);
    font-weight: 600;
    transform: translateY(-1px);
}

/* ---------- 支出分类 ---------- */
.categories {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.categories__item {
    display: flex;
    flex-direction: column;
    gap: var(--_space-xs);
    padding: var(--_space-sm) var(--_space-sm);
    margin: 0 calc(-1 * var(--_space-sm));
    border-radius: 6px;
}
.categories__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--_space-md);
}
.categories__name {
    font-size: var(--_font-size-body);
    color: var(--text-primary);
}
.categories__amount {
    font-family: var(--_font-serif);
    font-size: var(--_font-size-body);
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.categories__chevron {
    display: inline-block;
    font-size: 14px;
    color: var(--text-secondary);
    transition:
        transform var(--_duration-slow) var(--_easing-bounce),
        color var(--_duration-fast) var(--_easing-standard);
}
.categories__item--expanded .categories__chevron {
    transform: rotate(90deg);
    color: var(--text-primary);
}
.categories__bar {
    height: 3px;
    background-color: var(--border-color);
    border-radius: 2px;
    overflow: hidden;
}
.categories__bar-fill {
    height: 100%;
    background-color: var(--_color-expense);
    border-radius: inherit;
    transition: width var(--_duration-slow) var(--_easing-standard);
}
.categories__detail {
    display: flex;
    align-items: center;
    gap: var(--_space-sm);
    padding-top: 6px;
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
    overflow: hidden;
}
.categories__detail-sep {
    opacity: 0.5;
}

/* 展开动画：淡入 + 轻微下滑 + 轻微缩放（不影响正文排布） */
.expand-enter-active {
    transition:
        opacity 0.2s var(--_easing-standard),
        transform 0.24s var(--_easing-standard);
}
.expand-leave-active {
    transition:
        opacity 0.14s var(--_easing-standard),
        transform 0.18s var(--_easing-standard);
}
.expand-enter-from {
    opacity: 0;
    transform: translateY(-6px) scaleY(0.9);
}
.expand-leave-to {
    opacity: 0;
    transform: translateY(-4px) scaleY(0.96);
}

/* ---------- 记录 ---------- */
.records {
    list-style: none;
    padding: 0;
    margin: 0;
}
.records__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--_space-md);
    padding: var(--_space-md) var(--_space-sm);
    margin: 0 calc(-1 * var(--_space-sm));
    border-radius: 6px;
    border-bottom: 1px solid var(--border-color);
    outline: none;
    /* 用 transform 替代 padding 抖动，避免逐帧重排 */
    transition:
        background-color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-base) var(--_easing-standard);
}
.records__item:last-child {
    border-bottom: 0;
}
.records__item:focus-visible {
    outline: 2px solid var(--_color-expense);
    outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
    .records__item.interactive:hover {
        transform: translateX(4px);
    }
}
.records__item.interactive:active {
    transform: translateX(2px) scale(0.995);
}

.records__main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}
.records__title {
    font-size: var(--_font-size-body);
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.records__meta {
    font-size: var(--_font-size-caption);
    color: var(--text-secondary);
    letter-spacing: 0.02em;
}
.records__amount {
    font-family: var(--_font-serif);
    font-size: var(--_font-size-title);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    transition: transform var(--_duration-base) var(--_easing-standard);
}
.records__item.interactive:active .records__amount {
    transform: scale(0.96);
}
.records__amount--income {
    color: var(--_color-income);
}
.records__amount--expense {
    color: var(--_color-expense);
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

/* 淡入 + 轻微上滑 */
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