import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cada build ganha uma versão. O painel compara com /versao.json e troca sozinho quando sai uma nova
// (o celular costuma segurar a versão antiga em cache).
const VERSAO = String(Date.now())

export default defineConfig({
  plugins: [
    react(),
    { name: 'versao', generateBundle() { this.emitFile({ type: 'asset', fileName: 'versao.json', source: JSON.stringify({ versao: VERSAO }) }) } },
  ],
  define: { __VERSAO__: JSON.stringify(VERSAO) },
})
