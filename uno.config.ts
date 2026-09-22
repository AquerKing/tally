// uno.config.ts
import { defineConfig, presetUno } from "unocss";
import presetIcons from "@unocss/preset-icons";
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";
import fs from "fs";

const iconsDir = "./src/assets/icons";

const generateSafeList = () => {
    try {
        return fs
            .readdirSync(iconsDir)
            .filter((file) => file.endsWith(".svg"))
            .map((file) => `i-svg:${file.replace(".svg", "")}`);
    } catch (error) {
        console.error("Cannot read icon directory:", error);
        return [];
    }
};

export default defineConfig({
    presets: [
        presetUno(),
        presetIcons({
            extraProperties: {
                width: "1em",
                height: "1em",
                display: "inline-block",
            },
            collections: {
                "ant-design": () => import("@iconify-json/ant-design/icons.json").then(i => i.default),
                "bi": () => import("@iconify-json/bi/icons.json").then(i => i.default),
                svg: FileSystemIconLoader(iconsDir),
            },
        }),
    ],
    safelist: generateSafeList(),
});