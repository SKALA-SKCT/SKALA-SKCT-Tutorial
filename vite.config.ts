import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

// The Cloudflare plugin reads wrangler.jsonc, builds the client into the
// static-assets directory, and bundles / runs the Worker (in workerd) during dev.
export default defineConfig({
  plugins: [react(), cloudflare()],
});
