import { computed, onMounted, ref, watch } from "vue";

import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "app-theme-mode";

const themeMode = ref<ThemeMode>("system");
const systemTheme = ref<"light" | "dark">("light");

const resolvedTheme = computed<"light" | "dark">(() => {
    if (themeMode.value === "system") {
        return systemTheme.value;
    }
    return themeMode.value;
});

function applyThemeToDOM(theme: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", theme);
}

async function applyThemeToTauri(theme: "light" | "dark") {
    try {
        await setAppTheme(theme);
    } catch { }
}

function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode;
    localStorage.setItem(STORAGE_KEY, mode);
}

let initialized = false;

export function useTheme() {
    onMounted(async() => {
        if (initialized) {
            return;
        }
        initialized = true;

        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (saved === "light" || saved === "dark" || saved === "system") {
            themeMode.value = saved;
        }

        try {
            const win = getCurrentWindow();
            const currentTheme = await win.theme();
            if (currentTheme === "dark" || currentTheme === "light") {
                systemTheme.value = currentTheme;
            }
        }
        catch {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                systemTheme.value = "dark";
            }
        }

        try {
            const win = getCurrentWindow();
            await win.onThemeChanged(({ payload }) => {
                if (payload === "dark" || payload === "light") {
                    systemTheme.value = payload;
                }
            });
        }
        catch {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            mq.addEventListener("change", (e) => {
                systemTheme.value = e.matches ? "dark" : "light";
            });
        }

        applyThemeToDOM(resolvedTheme.value);
        await applyThemeToTauri(resolvedTheme.value);
    });

    watch(resolvedTheme, async (val) => {
        applyThemeToDOM(val);
        await applyThemeToTauri(val);
    });

    return {
        themeMode,
        resolvedTheme,
        systemTheme,
        setThemeMode,
    };
}