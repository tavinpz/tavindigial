import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/site.css'
import Home from './site/Home'
import Modelos from './site/Modelos'
import Previa from './site/Previa'
import Briefing from './site/Briefing'
import Servicos from './site/Servicos'
import { Termos, Privacidade } from './site/Legal'

// página aberta dentro do celular da prévia: sem barra de rolagem aparecendo
if (new URLSearchParams(window.location.search).get('e') === '1') document.documentElement.style.scrollbarWidth = 'none'

// O painel só carrega para quem entra em /painel (deixa o site leve)
const Painel = lazy(() => import('./painel/Painel'))
const BioDemo = lazy(() => import('./site/BioDemo'))
const SiteDemo = lazy(() => import('./site/SiteDemo'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/m/:nicho" element={<Modelos />} />
        <Route path="/p/:codigo" element={<Previa />} />
        <Route path="/modelos/:nicho" element={<Modelos />} />
        <Route path="/modelos" element={<Navigate to="/m/geral" replace />} />
        <Route path="/demo/:id" element={<Suspense fallback={null}><BioDemo /></Suspense>} />
        <Route path="/site/:id" element={<Suspense fallback={null}><SiteDemo /></Suspense>} />
        <Route path="/briefing" element={<Briefing />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/painel/*" element={<Suspense fallback={<div className="p-carregando">Carregando…</div>}><Painel /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
