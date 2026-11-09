import { lazy } from 'react'

// Demos com layout próprio. Cada uma carrega só quando é aberta.
export const DEMOS = {
  pet: lazy(() => import('./Pet')),
  hamburgueria: lazy(() => import('./Hamburgueria')),
  restaurante: lazy(() => import('./Restaurante')),
  nutricionista: lazy(() => import('./Nutricionista')),
  academia: lazy(() => import('./Academia')),
  nail: lazy(() => import('./Nail')),
  psicologa: lazy(() => import('./Psicologa')),
  tatuagem: lazy(() => import('./Tatuagem')),
}
