<template>
    <nav class="bottom-nav-bar">
        <RouterLink v-for="tab in tabs" :key="tab.name" :to="{ name: tab.name }" v-slot="{ navigate, isActive }" custom>
            <button :class="{ 'is-active': isActive }" @click="navigate">
                <div :class="isActive ? tab.activeIcon : tab.icon" class="bottom-nav-bar__icon" />
                <span :class="{ 'is-collapsed': !showLabels }" class="bottom-nav-bar__label">{{ tab.label }}</span>
            </button>
        </RouterLink>
    </nav>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

/**
 * 单个导航栏项目
 */
export interface NavTab {
    name: string,
    label: string,
    icon?: string,
    activeIcon?: string,
};

interface Props {
    tabs: NavTab[],
    showLabels: boolean,
}

const activeTabModel = defineModel<string>("active-tab", {
    type: String,
    default: "",
});

const props = withDefaults(defineProps<Props>(), {
    showLabels: true,
});

const emit = defineEmits<{
    change: [name: string]
}>();

const getIconClass = (tab: NavTab): string => {
    const isActive = activeTabModel.value === tab.name;
    if (isActive) {
        return tab.activeIcon ?? "";
    }
    return tab.icon ?? "";
}

const handleClick = (tab: NavTab): void => {
    if (activeTabModel.value === tab.name) {
        return;
    }
    activeTabModel.value = tab.name;
    emit("change", tab.name);
}
</script>

<style scoped>
.bottom-nav-bar {
    height: 64px;
    flex-shrink: 0;
    display: flex;
    background-color: var(--bg-primary);
    border-top: 1px solid var(--border-color);
}

.bottom-nav-bar__icon {
    color: var(--icon-color);

    width: 1.5rem;
    height: 1.5rem;

    transition: all 0.5s ease;
}

.bottom-nav-bar__label {
    color: var(--text-secondary);

    font-size: 0.75rem;
}

.bottom-nav-bar button {
    background-color: var(--bg-primary);
    border: none;

    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;

    align-items: center;
    justify-content: center;
    gap: 2px;
}

.bottom-nav-bar button+button {
    border-left: 1px solid var(--border-color);
}
</style>