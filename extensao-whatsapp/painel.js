// Roda dentro do painel: avisa que a extensão está instalada, repassa os pedidos de "abrir conversa"
// e devolve o resultado (ex.: número sem WhatsApp) para o painel mostrar.
document.documentElement.dataset.tavinWa = '1.1'
window.addEventListener('message', (e) => {
  if (e.source !== window || !e.data || e.data.tipo !== 'tavin-wa') return
  chrome.runtime.sendMessage({ phone: String(e.data.phone || ''), text: String(e.data.text || '') })
})
chrome.runtime.onMessage.addListener((m) => {
  if (m && m.tipo === 'tavin-wa-resultado') window.postMessage(m, window.location.origin)
})
