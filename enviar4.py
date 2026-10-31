"""Lote 4 ("keynote") da Tavin Digital para o painel (mesmo caminho do enviar.py)."""
import sys
import enviar as E

E.VIDEOS = [
    ('td-v16-bento', 'tavin_16_tudo_que_sua_marca_precisa.mp4', 'Tudo que a sua marca precisa (bento)', (
        'Site, Google, Reels, artes e SEO para IAs. Um time só, uma conversa só.\n\n'
        'Você não precisa contratar cinco pessoas diferentes para a sua marca aparecer bem.\n\n'
        'Chama no direct e conta o que você precisa.\n\n'
        '#marketingdigital #criacaodesites #socialmedia #negocioslocais #motiondesign'), 4.0, ''),
    ('td-v17-celular', 'tavin_17_o_celular_nao_para.mp4', 'O celular não para', (
        'Novo agendamento. Nova avaliação. Mensagem no WhatsApp.\n\n'
        'Quando a página, o Google e o atendimento estão no lugar, o cliente chega sozinho.\n\n'
        'A gente monta isso para o seu negócio. Chama no direct.\n\n'
        '#negocioslocais #agendamentoonline #googlemeunegocio #whatsappbusiness #presencadigital'), 5.5, ''),
    ('td-v18-24h', 'tavin_18_pronta_em_24h.mp4', 'Pronta em 24h (tipografia)', (
        'Você manda o nome. A gente faz o resto: design, textos, fotos, serviços, agenda, WhatsApp, domínio e Google.\n\n'
        'Sua página no ar em 24 horas, e você vê a prévia grátis antes.\n\n'
        'Chama no direct.\n\n'
        '#criacaodesites #linkdabio #paginadevendas #negocioslocais #empreendedorismo'), 7.3, ''),
    ('td-v19-detalhe', 'tavin_19_cada_detalhe.mp4', 'Cada detalhe (celular 3D)', (
        'Cada detalhe da página pensado para virar cliente: sua marca, prova social, serviços claros e um botão que agenda.\n\n'
        'Um toque e o horário está marcado.\n\n'
        'Peça a prévia grátis da sua no direct.\n\n'
        '#webdesign #uxdesign #criacaodesites #linkdabio #negocioslocais'), 7.0, ''),
    ('td-v20-identidade', 'tavin_20_identidade_visual.mp4', 'Identidade visual (líquido)', (
        'Logo, cores, tipografia e aplicações: a identidade da sua marca, pronta para post, story e cartão.\n\n'
        'Esse vídeo também foi animado pela Tavin Digital.\n\n'
        'Chama no direct e conta sobre o seu negócio.\n\n'
        '#identidadevisual #branding #designgrafico #logotipo #motiondesign'), 4.4, ''),
]

if __name__ == '__main__':
    E.push() if '--push' in sys.argv else E.preparar()
