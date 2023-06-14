import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      dirs: [
        './composables/**',
      ],
      vueTemplate: true,
      cache: true,
    }),
    vue()
  ],
})
