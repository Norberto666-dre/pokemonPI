import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      includeAssets: ["icon-192.png", "icon-512.png", "icon-maskable-512.png"],
      manifest: {
        id: "/",
        name: "PokéGuía · Guía Pokémon completa",
        short_name: "PokéGuía",
        description:
          "Guía Pokémon completa: Pokédex, tipos, evoluciones, movimientos, objetos y cartas.",
        lang: "es",
        start_url: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#faf6ef",
        theme_color: "#faf6ef",
        categories: ["education", "entertainment"],
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
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "pokeapi",
              expiration: { maxEntries: 900, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "sprites",
              expiration: { maxEntries: 1400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/play\.pokemonshowdown\.com\/data\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "showdown",
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(api\.tcgdex\.net|assets\.tcgdex\.net)\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "tcgdex",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/ },
            { name: "query", test: /[\\/]node_modules[\\/]@tanstack[\\/]/ },
            { name: "motion", test: /[\\/]node_modules[\\/]framer-motion[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
