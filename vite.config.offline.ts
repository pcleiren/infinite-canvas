import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Browsers block `type="module"` on file:// — use a classic script tag instead. */
function offlineHtmlPlugin(): Plugin {
  return {
    name: "offline-html",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html
          .replace(
            /<script type="module" crossorigin src="(\.\/assets\/app\.js)"><\/script>/,
            '<script src="$1"></script>',
          )
          .replace(
            /<link rel="stylesheet" crossorigin href="(\.\/assets\/[^"]+)">/,
            '<link rel="stylesheet" href="$1">',
          );
      },
    },
  };
}

/** Build for opening index.html via file:// (double-click, USB, offline folder). */
export default defineConfig({
  base: "./",
  plugins: [
    offlineHtmlPlugin(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "."),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_OFFLINE_BUILD": JSON.stringify("true"),
  },
  build: {
    outDir: "dist-local",
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/app.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
