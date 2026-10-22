import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { config } from "./src/config.ts";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: config.name,
        short_name: config.name,
        description: "Discover nature. Create observations.",
        theme_color: "#163e35",
        background_color: "#f7f5ed",
        display: "standalone",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,jpg,woff2,ttf}"] },
    }),
  ],
});
