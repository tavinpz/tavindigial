import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
const h = path.resolve('.harness_video')
export default defineConfig({
  root: h, publicDir: path.resolve('public'), plugins: [react()],
  define: { 'import.meta.env.VITE_N8N_URL': JSON.stringify('https://n8n.mock'), 'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://sb.mock'), 'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('x') },
  resolve: { alias: [
    { find: /^\.{1,2}\/.*supabase(\.js)?$/, replacement: h + '/mocks.js' },
    { find: /^\.{1,2}\/.*AuthContext(\.jsx)?$/, replacement: h + '/authmock.jsx' },
    { find: /^\.{1,2}\/.*ThataInsightsWidget(\.jsx)?$/, replacement: h + '/vazio.jsx' },
  ] },
  server: { port: 5199, strictPort: true, fs: { allow: [path.resolve('.')] } },
})
