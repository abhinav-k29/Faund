import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { config } from "./src/config.ts";
export default defineConfig(({ mode }) => ({
  define: { __WILSEE_SHOWCASE__: JSON.stringify(mode !== "research") },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: config.name,
        short_name: config.name,
        description: "Discover nature. Create observations.",
        theme_color: "#163e35",
        background_color: "#f7f5ed",
        display: "standalone",
        id: "/",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/brand/wilsee-original/icon192-0779ab04db.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/brand/wilsee-original/icon512-a5178a48f2.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/brand/wilsee-original/maskable-df2b3513af.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,png,jpg,woff2,ttf}"],
      },
    }),
  ],
}));
