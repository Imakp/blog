// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: [
        "@tiptap/react",
        "@tiptap/starter-kit",
        "@tiptap/extension-code-block",
        "@tiptap/extension-image",
        "@tiptap/extension-youtube",
        "@tiptap/extension-text-align",
        "@tiptap/extension-heading",
        "@tiptap/extension-bullet-list",
        "@tiptap/extension-ordered-list",
        "@tiptap/extension-table",
        "@tiptap/extension-mention",
        "@tiptap/extension-collaboration",
        "@tiptap/extension-highlight",
        "tiptap-markdown",
        "yjs",
        "react-icons/fi",
        "react-icons/md",
        "@tiptap/extension-link",
      ],
    },
  };
});
