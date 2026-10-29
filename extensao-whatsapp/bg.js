// Usa a aba do WhatsApp Web que já está aberta (ou abre uma, se não houver) e leva até a conversa com o texto pronto.
chrome.runtime.onMessage.addListener((m) => {
  const phone = (m.phone || '').replace(/\D/g, '')
  if (!phone) return
  const url = `https://web.whatsapp.com/send?phone=${phone}${m.text ? `&text=${encodeURIComponent(m.text)}` : ''}`
  chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (abas) => {
    const aba = abas && abas[0]
    if (aba) {
      chrome.tabs.update(aba.id, { url, active: true })
      chrome.windows.update(aba.windowId, { focused: true })
    } else {
      chrome.tabs.create({ url })
    }
  })
})
