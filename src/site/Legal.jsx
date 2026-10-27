import { useEffect } from 'react'
import { CONFIG, brl } from '../config'
import { Header, Footer } from './Layout'

const ATUALIZADO = '27 de outubro de 2026'

function Pagina({ titulo, children }) {
  useEffect(() => { document.title = `${titulo} · Tavin Digital`; window.scrollTo(0, 0) }, [titulo])
  return (
    <>
      <Header />
      <main className="s-wrap s-legal">
        <h1>{titulo}</h1>
        <p>Atualizado em {ATUALIZADO}.</p>
        {children}
      </main>
      <Footer />
    </>
  )
}

const empresa = `${CONFIG.RAZAO_SOCIAL}${CONFIG.CNPJ ? `, CNPJ ${CONFIG.CNPJ}` : ''}`

export function Termos() {
  return (
    <Pagina titulo="Termos de serviço">
      <p>Estes termos valem para os sites e páginas de bio feitos pela {empresa} (“nós”) para o cliente que preencheu o formulário (“você”).</p>

      <h2>1. O que está incluso</h2>
      <p><strong>Site completo ({brl(CONFIG.PRECO_SITE)}):</strong> uma página responsiva com apresentação, serviços, fotos, avaliações, horários, mapa e botão de WhatsApp, a partir de um dos nossos modelos.</p>
      <p><strong>Página de bio ({brl(CONFIG.PRECO_BIO)}):</strong> uma página de links com a sua marca, para usar no Instagram.</p>
      <p>Não estão inclusos: loja virtual, área de login, sistemas sob medida, textos longos de blog ou páginas extras. Se você pedir algo fora do escopo, enviamos o orçamento antes de fazer.</p>

      <h2>2. Prazo</h2>
      <p>A prévia fica pronta em até {CONFIG.PRAZO_HORAS} horas úteis depois que recebemos o formulário, o logo e as fotos. O prazo conta a partir do recebimento de todo o material.</p>

      <h2>3. Pagamento e garantia</h2>
      <p>Você só paga se aprovar. Depois de ver a prévia, paga 50% para seguirmos. Os outros 50% são pagos quando o site estiver publicado. Se não aprovar a prévia, não paga nada.</p>
      <p>Pagamentos por Pix ou boleto, com cobrança emitida pela {CONFIG.RAZAO_SOCIAL}.</p>

      <h2>4. Ajustes</h2>
      <p>Antes da publicação, está inclusa uma rodada de ajustes sobre a prévia (textos, cores, fotos e ordem das seções). Com a hospedagem ativa, você tem direito a 1 ajuste simples por mês.</p>

      <h2>5. Hospedagem e domínio</h2>
      <p>A hospedagem custa {brl(CONFIG.HOSPEDAGEM_SITE)}/mês para o site e {brl(CONFIG.HOSPEDAGEM_BIO)}/mês para a página de bio, e inclui domínio, certificado de segurança e manutenção técnica. Não há fidelidade: você pode cancelar quando quiser, com aviso de 7 dias.</p>
      <p>Se cancelar, o site sai do ar ao fim do mês já pago. Se o domínio estiver registrado por nós, transferimos para você a pedido, sem custo além das taxas do órgão registrador.</p>
      <p>Mensalidade em atraso por mais de 15 dias pode levar à suspensão do site até a regularização.</p>

      <h2>6. Conteúdo</h2>
      <p>Você garante que tem direito de usar os textos, fotos, logos e marcas que nos envia, e é responsável pelas informações publicadas (preços, horários, serviços). Podemos usar imagens de banco gratuito quando você não tiver fotos.</p>
      <p>Só mostramos o seu site no nosso portfólio com a sua autorização.</p>

      <h2>7. Limites</h2>
      <p>Não garantimos posição no Google, no ChatGPT ou em qualquer buscador. Fazemos a estrutura certa para o seu negócio ser encontrado, mas o ranqueamento depende de fatores fora do nosso controle.</p>

      <h2>8. Contato</h2>
      <p>Dúvidas sobre estes termos: {CONFIG.EMAIL}{CONFIG.WHATSAPP_VENDAS ? ' ou pelo WhatsApp do site' : ''}.</p>
    </Pagina>
  )
}

export function Privacidade() {
  return (
    <Pagina titulo="Política de privacidade">
      <p>Esta política explica como a {empresa} trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>

      <h2>1. Dados que usamos</h2>
      <ul>
        <li><strong>Contato comercial público:</strong> nome do negócio, telefone, endereço e avaliações que a própria empresa publica no Google Maps. Usamos para oferecer nossos serviços a empresas, com base no legítimo interesse.</li>
        <li><strong>Formulário:</strong> os dados que você preenche para montarmos o seu site.</li>
        <li><strong>Acesso às páginas de modelos:</strong> registramos quando um link enviado por nós é aberto, para saber se a mensagem foi útil.</li>
      </ul>

      <h2>2. Para que usamos</h2>
      <p>Para entrar em contato sobre nossos serviços, produzir o seu site, cobrar e prestar suporte. Não vendemos nem compartilhamos dados com terceiros para publicidade.</p>

      <h2>3. Como parar de receber mensagens</h2>
      <p>Responda <strong>SAIR</strong> a qualquer mensagem nossa. Seu número entra numa lista de bloqueio e não recebe mais contato.</p>

      <h2>4. Seus direitos</h2>
      <p>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail {CONFIG.EMAIL}.</p>

      <h2>5. Armazenamento</h2>
      <p>Os dados ficam em servidores com acesso restrito e criptografia em trânsito. Guardamos apenas pelo tempo necessário para a prestação do serviço e obrigações legais.</p>
    </Pagina>
  )
}
