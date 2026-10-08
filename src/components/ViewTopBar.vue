<template>
    <header class="view-top-bar">
        <!-- 左侧 -->
        <slot name="left">
            <span v-if="text" class="view-top-bar__text"
                :class="{ 'view-top-bar__text--eyebrow': variant === 'eyebrow' }">
                {{ text }}
            </span>
        </slot>

        <!-- 右侧 -->
        <slot name="right">
            <RouterLink v-if="showSettings" :to="settingsTo"
                class="borderless-button view-top-bar__icon-button interactive" aria-label="设置">
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                    <path fill="currentColor"
                        d="M8 5.5A2.5 2.5 0 1 0 8 10.5A2.5 2.5 0 0 0 8 5.5Zm0 1.2a1.3 1.3 0 1 1 0 2.6a1.3 1.3 0 0 1 0-2.6Z" />
                    <path fill="currentColor"
                        d="m13.6 9.1l1-.6a.5.5 0 0 0 .2-.6l-1-1.8a.5.5 0 0 0-.6-.2l-1 .4a4.6 4.6 0 0 0-1-.6l-.2-1.1a.5.5 0 0 0-.5-.4H8.5a.5.5 0 0 0-.5.4l-.2 1.1c-.35.14-.68.34-1 .6l-1-.4a.5.5 0 0 0-.6.2l-1 1.8a.5.5 0 0 0 .2.6l1 .6a4.7 4.7 0 0 0 0 1.1l-1 .6a.5.5 0 0 0-.2.6l1 1.8c.12.2.36.28.57.2l1-.4c.3.26.64.46 1 .6l.2 1.1c.04.23.24.4.47.4h2a.5.5 0 0 0 .5-.4l.2-1.1c.35-.14.68-.34 1-.6l1 .4c.21.08.45 0 .57-.2l1-1.8a.5.5 0 0 0-.2-.6l-1-.6a4.7 4.7 0 0 0 0-1.1Z"
                        opacity="0.85" />
                </svg>
            </RouterLink>
        </slot>
    </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
    /** 左侧文本；不传则左侧留空（可由 left slot 覆盖） */
    text?: string
    /**
     * 左侧文本样式：
     * - plain：普通 caption（如日期）
     * - eyebrow：字距放大的小标（如 “PROFILE”）
     */
    variant?: 'plain' | 'eyebrow'
    /** 是否显示右侧设置按钮 */
    showSettings?: boolean
    /** 设置按钮跳转路径 */
    settingsTo?: string
}

withDefaults(defineProps<Props>(), {
    text: '',
    variant: 'plain',
    showSettings: true,
    settingsTo: '/page/settings',
})
</script>

<style scoped>
/* -------------------------------------------------------------
 * 局部变量兜底（与其他 View 保持一致）
 * ------------------------------------------------------------- */
.view-top-bar {
    --_font-sans: var(--font-family-sans,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            'PingFang SC',
            'Hiragino Sans GB',
            'Microsoft YaHei',
            sans-serif);

    --_space-sm: var(--space-sm, 8px);
    --_space-md: var(--space-md, 16px);
    --_space-lg: var(--space-lg, 24px);

    --_font-size-caption: var(--font-size-caption, 12px);

    --_duration-fast: var(--duration-fast, 0.14s);
    --_duration-base: var(--duration-base, 0.22s);
    --_duration-slow: var(--duration-slow, 0.3s);

    --_easing-standard: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
    --_easing-bounce: var(--easing-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--_space-md);
    padding: var(--_space-lg) 0 var(--_space-md);
    font-family: var(--_font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
}

/* ---------- 左侧文本 ---------- */
.view-top-bar__text {
    font-size: var(--_font-size-caption);
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    transition: color var(--_duration-fast) var(--_easing-standard);
}

.view-top-bar__text--eyebrow {
    letter-spacing: 0.18em;
}

/* ---------- 右侧图标按钮 ---------- */
.view-top-bar__icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    color: var(--icon-color);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition:
        background-color var(--_duration-fast) var(--_easing-standard),
        color var(--_duration-fast) var(--_easing-standard),
        transform var(--_duration-fast) var(--_easing-standard);
}

.view-top-bar__icon-button svg {
    transition: transform var(--_duration-slow) var(--_easing-bounce);
}

@media (hover: hover) and (pointer: fine) {
    .view-top-bar__icon-button:hover {
        background-color: var(--button-bg-color-hover);
        color: var(--text-primary);
    }

    .view-top-bar__icon-button:hover svg {
        transform: rotate(45deg) scale(1.05);
    }
}

.view-top-bar__icon-button:active {
    background-color: var(--button-bg-color-active);
    transform: scale(0.94);
}

/* ---------- 无障碍：尊重系统偏好 ---------- */
@media (prefers-reduced-motion: reduce) {

    .view-top-bar *,
    .view-top-bar *::before,
    .view-top-bar *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
    }
}
</style>