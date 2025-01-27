// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
});
