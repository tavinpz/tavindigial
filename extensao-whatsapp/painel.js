// Roda dentro do painel: avisa que a extensão está instalada e repassa os pedidos de "abrir conversa".
document.documentElement.dataset.tavinWa = '1'
window.addEventListener('message', (e) => {
  if (e.source !== window || !e.data || e.data.tipo !== 'tavin-wa') return
  chrome.runtime.sendMessage({ phone: String(e.data.phone || ''), text: String(e.data.text || '') })
})
