// Supabase de mentira para gravar as telas com dados ficticios (window.__DB / __RPC / __FN)
const db = () => window.__DB || {}
function filtra(rows, fs) {
  return rows.filter((r) => fs.every(([op, c, v]) => {
    if (!(c in r)) return true
    if (op === 'eq') return String(r[c]) === String(v)
    if (op === 'in') return (v || []).map(String).includes(String(r[c]))
    return true
  }))
}
function q(t) {
  const st = { fs: [], single: false, maybe: false, head: false, count: false, lim: null, mut: null, payload: null }
  const run = () => {
    let rows = typeof db()[t] === 'function' ? db()[t]() : (db()[t] || [])
    if (st.mut === 'insert' || st.mut === 'upsert') rows = [].concat(st.payload).map((x, i) => ({ id: 'novo' + i, ...x }))
    else if (st.mut === 'update') rows = filtra(rows, st.fs).map((r) => ({ ...r, ...st.payload }))
    else if (st.mut === 'delete') rows = []
    else rows = filtra(rows, st.fs)
    if (st.lim) rows = rows.slice(0, st.lim)
    const count = rows.length
    if (st.single || st.maybe) return { data: rows[0] || null, error: null, count }
    return { data: st.head ? null : rows, error: null, count }
  }
  const proxy = new Proxy({}, {
    get: (o, k) => {
      if (k === 'then') { const p = Promise.resolve(run()); return p.then.bind(p) }
      if (k === 'single') return () => { st.single = true; return proxy }
      if (k === 'maybeSingle') return () => { st.maybe = true; return proxy }
      if (k === 'select') return (_c, opt) => { if (opt?.head) st.head = true; return proxy }
      if (k === 'eq') return (c, v) => { st.fs.push(['eq', c, v]); return proxy }
      if (k === 'in') return (c, v) => { st.fs.push(['in', c, v]); return proxy }
      if (k === 'limit') return (n) => { st.lim = n; return proxy }
      if (k === 'insert' || k === 'upsert' || k === 'update') return (p) => { st.mut = k; st.payload = p; return proxy }
      if (k === 'delete') return () => { st.mut = 'delete'; return proxy }
      return () => proxy
    },
  })
  return proxy
}
const resolve = (mapa, nome, args) => {
  const v = (mapa || {})[nome]
  if (v === undefined) { (window.__faltou ||= new Set()).add(nome); return null }
  return typeof v === 'function' ? v(args) : v
}
const sessao = { access_token: 'x', user: { id: 'u1', email: 'carla@clinicaaurora.com.br' } }
export const supabase = {
  from: (t) => q(t),
  rpc: (n, a) => Promise.resolve({ data: resolve(window.__RPC, n, a), error: null }),
  functions: { invoke: (n, o) => Promise.resolve({ data: resolve(window.__FN, n, o?.body) ?? { ok: true }, error: null }) },
  channel: () => { const c = { on() { return c }, subscribe() { return c }, unsubscribe() {} }; return c },
  removeChannel() {}, removeAllChannels() {},
  auth: {
    getSession: () => Promise.resolve({ data: { session: sessao } }),
    getUser: () => Promise.resolve({ data: { user: sessao.user } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: () => Promise.resolve(), refreshSession: () => Promise.resolve({ data: { session: sessao } }),
  },
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }), upload: () => Promise.resolve({ data: {}, error: null }), createSignedUrl: () => Promise.resolve({ data: { signedUrl: '' } }) }) },
}
export default supabase
