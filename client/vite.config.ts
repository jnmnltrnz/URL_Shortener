import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  base: '/URL_Shortener/', // Set this to your GitHub repository name
  server: {
    port: 3000,
    host: true,
  },
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensure output is directed to the 'dist' folder
  },
});
