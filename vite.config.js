import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Duas páginas de verdade: "/" (app) e "/catalogo/" (catálogo).
// Assim o link do catálogo abre em qualquer endereço (pages.dev, workers.dev, domínio próprio),
// mesmo onde o servidor não devolve o index.html para endereços que não existem.
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2019",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        catalogo: resolve(__dirname, "catalogo/index.html"),
      },
    },
  },
});
