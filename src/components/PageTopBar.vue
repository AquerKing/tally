<template>
    <header class="page-top-bar-root">
        <nav class="page-top-bar">
            <div class="page-top-bar__inner">
                <!-- 返回按钮 -->
                <button
                    class="borderless-button page-top-bar__back interactive"
                    type="button"
                    aria-label="返回"
                    @click="handleBack"
                >
                    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 5l-5 5 5 5"
                        />
                    </svg>
                </button>

                <!-- 页面标题 -->
                <h1 class="page-top-bar__title">{{ title }}</h1>

                <!-- 占位，保证标题居中 -->
                <span class="page-top-bar__spacer" aria-hidden="true"></span>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
    /** 页面标题 */
    title?: string
    /** 返回时若没有历史记录，回退到该路由名；默认首页 */
    fallbackTo?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: '设置',
    fallbackTo: 'home',
})

const router = useRouter()

function handleBack() {
    // 有历史记录时走 back，直入页面时退回 fallback
    if (window.history.length > 1) {
        router.back()
    } else {
        router.push({ name: props.fallbackTo })
    }
}
</script>

<style scoped>
/* -------------------------------------------------------------
 * 局部变量兜底（与其他 View 保持一致）
 * ------------------------------------------------------------- */
.page-top-bar-root {
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

    --_space-xs: var(--space-xs, 4px);
    --_space-sm: var(--space-sm, 8px);
    --_space-md: var(--space-md, 16px);

    --_content-max-width: var(--content-max-width, 640px);
    --_content-padding-x: var(--content-padding-x, 20px);

    --_font-size-title: var(--font-size-title, 16px);

    --_duration-fast: var(--duration-fast, 0.15s);
    --_duration-base: var(--duration-base, 0.25s);
    --_easing-standard: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));

    display: block;
    flex-shrink: 0;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--_font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
}

/* ---------- 顶栏主体 ---------- */
.page-top-bar {
    display: flex;
    align-items: center;
    height: 52px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-primary);
}

/* 内容对齐到与视图正文同一 max-width */
.page-top-bar__inner {
    display: grid;
    grid-template-columns: 32px 1fr 32px;
    align-items: center;
    gap: var(--_space-sm);
    width: 100%;
    max-width: var(--_content-max-width);
    margin: 0 auto;
    padding: 0 var(--_content-padding-x);
    box-sizing: border-box;
}

/* ---------- 返回按钮 ---------- */
.page-top-bar__back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    color: var(--icon-color);
    cursor: pointer;
    transition:
        background-color var(--_duration-fast) var(--_easing-standard),
        color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-fast) var(--_easing-standard);
}

.page-top-bar__back svg {
    transition: transform var(--_duration-base) var(--_easing-standard);
}

@media (hover: hover) and (pointer: fine) {
    .page-top-bar__back.interactive:hover {
        background-color: var(--button-bg-color-hover);
        color: var(--text-primary);
    }
    .page-top-bar__back.interactive:hover svg {
        transform: translateX(-1.5px);
    }
}

.page-top-bar__back.interactive:active {
    background-color: var(--button-bg-color-active);
    transform: scale(0.94);
}

/* ---------- 标题 ---------- */
.page-top-bar__title {
    margin: 0;
    font-family: var(--_font-sans);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1;
    color: var(--text-primary);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 占位：与返回按钮等宽，保证标题真正居中 */
.page-top-bar__spacer {
    display: block;
    width: 30px;
    height: 30px;
}
</style>