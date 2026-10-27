import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/site.css'
import Home from './site/Home'
import Modelos from './site/Modelos'
import Briefing from './site/Briefing'
import { Termos, Privacidade } from './site/Legal'

// O painel só carrega para quem entra em /painel (deixa o site leve)
const Painel = lazy(() => import('./painel/Painel'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/m/:nicho" element={<Modelos />} />
        <Route path="/modelos/:nicho" element={<Modelos />} />
        <Route path="/modelos" element={<Navigate to="/m/geral" replace />} />
        <Route path="/briefing" element={<Briefing />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/painel/*" element={<Suspense fallback={<div className="p-carregando">Carregando…</div>}><Painel /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
