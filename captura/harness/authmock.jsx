export const formatMinutos = (s) => `${Math.floor((s || 0) / 60)}:${String((s || 0) % 60).padStart(2, '0')}`
const rec = new Proxy({}, { get: () => ({ liberado: true, ilimitado: true, limite: null, usado: 0, nome: '' }) })
const auth = {
  tenantId: 't1', userId: 'u1', nome: 'Carla Mendes', email: 'carla@clinicaaurora.com.br', planoTipo: 'thata', fotoUrl: '',
  minutosDisponiveis: 600, minutosUsados: 120, segundosUsados: 7200, segundosAudioWpp: 0, telefone: '11900000000',
  empresa: 'Clínica Aurora', cnpj: '', endereco: '', papel: 'dono', membroId: null, paginas: null, agendas: null, instancias: null,
  numeroLinhas: 2, entitlements: { plano: 'thata', recursos: rec, minutos_voz: 600 }, ready: true, refreshAuth: async () => {},
}
export function AuthProvider({ children }) { return children }
export function useAuth() { return auth }
export default { AuthProvider, useAuth }
