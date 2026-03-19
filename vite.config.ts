import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/TapNow-PictureEdit/',
  server: {
    port: 3000,
    open: true
  }
})