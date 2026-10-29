// Leva a aba do WhatsApp Web que já está aberta até a conversa, com o texto pronto, SEM recarregar.
// Se o WhatsApp Web ainda não carregou ou mudou por dentro, cai no jeito antigo (abre o link /send na mesma aba).

// Roda dentro do WhatsApp Web (mundo da página). Não envia nada: só abre a conversa e escreve o texto na caixa.
async function abrirConversa(phone, text) {
  try {
    if (typeof window.require !== 'function') return 'sem-modulos'
    const q = window.require('WAWebQueryExistsJob')
    const F = window.require('WAWebFindChatAction')
    const Cmd = window.require('WAWebCmd').Cmd
    const res = await q.queryPhoneExists('+' + phone)
    if (!res || !res.wid) return 'nao-tem-whatsapp'
    const achado = await F.findOrCreateLatestChat(res.wid)
    const chat = achado && (achado.chat || achado)
    if (!chat) return 'sem-chat'
    await Cmd.openChatBottom({ chat })
    if (text) {
      await new Promise((r) => setTimeout(r, 350))
      window.require('WAWebComposeBoxActions').ComposeBoxActions.setTextContent(chat, text)
    }
    return 'ok'
  } catch (e) {
    return 'erro: ' + (e && e.message)
  }
}

chrome.runtime.onMessage.addListener((m, sender) => {
  const phone = String(m.phone || '').replace(/\D/g, '')
  if (!phone) return
  const url = `https://web.whatsapp.com/send?phone=${phone}${m.text ? `&text=${encodeURIComponent(m.text)}` : ''}`
  const avisarPainel = (resultado) => { if (sender.tab) chrome.tabs.sendMessage(sender.tab.id, { tipo: 'tavin-wa-resultado', resultado, phone }).catch(() => {}) }
  chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (abas) => {
    const aba = abas && abas[0]
    if (!aba) { chrome.tabs.create({ url }); avisarPainel('aba-nova'); return }
    const focar = () => { chrome.tabs.update(aba.id, { active: true }); chrome.windows.update(aba.windowId, { focused: true }) }
    chrome.scripting.executeScript({ target: { tabId: aba.id }, world: 'MAIN', func: abrirConversa, args: [phone, m.text || ''] })
      .then((r) => {
        const resultado = r && r[0] && r[0].result
        avisarPainel(resultado)
        if (resultado === 'nao-tem-whatsapp') return // fica no painel e avisa
        if (resultado !== 'ok') chrome.tabs.update(aba.id, { url })
        focar()
      })
      .catch(() => { chrome.tabs.update(aba.id, { url }); focar(); avisarPainel('recarregou') })
  })
})
