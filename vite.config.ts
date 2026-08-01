import { defineConfig } from "vite"

import react from "@vitejs/plugin-react"

import tailwindcss from "@tailwindcss/vite"

import path from "path"

export default defineConfig({

  optimizeDeps: {
    exclude: [
      "@open-spaced-repetition/binding"
    ]
  },

  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },

  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {

    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
