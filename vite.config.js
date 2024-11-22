import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
          if (id.includes("src/components")) {
            return "components";
          }
          if (id.includes("src/pages")) {
            return "pages";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, 
    sourcemap: true, 
  },
  optimizeDeps: {
    include: ["react", "react-dom"], 
  },
});
