import { defineConfig } from "astro/config";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

const BACKEND_DEV_PORT = process.env.WHOMBAT_BACKEND_DEV_PORT || 8000;
const FRONTEND_DEV_PORT = process.env.WHOMBAT_FRONTEND_DEV_PORT || 3000;

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  vite: {
    server: {
      port: FRONTEND_DEV_PORT,
      proxy: {
        "/api": `http://localhost:${BACKEND_DEV_PORT}/`,
        "/auth": `http://localhost:${BACKEND_DEV_PORT}/`,
      },
    },
  },
});
