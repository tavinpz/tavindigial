"""Lote 2 da Tavin Digital para o painel (mesmo caminho do enviar.py)."""
import sys
import enviar as E

IA = 'Narração com voz sintética: ao postar pelo app, ative o rótulo "Informações de IA".'
E.VIDEOS = [
    ('td-v05-direct', 'tavin_05_direct_sem_resposta.mp4', 'Direct sem resposta (com voz)', (
        'Cada "quanto custa?" sem resposta é um cliente indo para o concorrente.\n\n'
        'Com uma página, ele vê serviços, preços e horários antes de te chamar, e chega no WhatsApp pronto para marcar.\n\n'
        'Pede a prévia grátis da sua no direct.\n\n#negocioslocais #atendimento #whatsappbusiness #criacaodesites #empreendedorismo'), 1.2, IA),
    ('td-v06-concorrente', 'tavin_06_concorrente_parece_melhor.mp4', 'Concorrente parece melhor', (
        'Seu concorrente pode ser pior que você. Mas se no Google ele parece melhor, é ele que recebe a mensagem.\n\n'
        'A gente arruma a sua vitrine: site, Google, avaliações e Instagram.\n\n'
        'Começa pela prévia grátis. Chama no direct.\n\n#googlemeunegocio #negocioslocais #marketinglocal #avaliacoes #presencadigital'), 1.2, ''),
    ('td-v07-24h', 'tavin_07_no_ar_em_24h.mp4', 'No ar em 24 horas', (
        'Do zero ao ar em 24 horas. Sem reunião longa, sem briefing gigante.\n\n'
        'Você manda o nome, recebe a prévia no WhatsApp, pede os ajustes e a página entra no ar com o seu domínio.\n\n'
        'Quer a sua amanhã? Chama no direct.\n\n#criacaodesites #linkdabio #negocioslocais #empreendedorismo #sitesprofissionais'), 2.0, ''),
    ('td-v08-motion', 'tavin_08_motion_para_sua_marca.mp4', 'Motion para a sua marca', (
        'Esse vídeo foi animado pela Tavin Digital.\n\n'
        'Vinhetas, anúncios, explicações animadas e apresentação de site e app, com a identidade da sua marca.\n\n'
        'Chama no direct e conta o que você quer mostrar.\n\n#motiondesign #motiongraphics #videomarketing #edicaodevideo #reels'), 2.4, ''),
    ('td-v09-post', 'tavin_09_post_bonito_nao_vende.mp4', 'Post bonito não vende (com voz)', (
        'Post bonito não paga boleto. O que vende é o post que explica o que você faz, para quem é e como marcar.\n\n'
        'Carrosséis, artes e Reels com a sua marca, todo mês. Você aprova e a gente programa.\n\n'
        'Pede um exemplo no direct.\n\n#designgrafico #socialmedia #carrossel #instagramparanegocios #marketingdigital'), 1.4, IA),
    ('td-v10-google', 'tavin_10_google_sem_avaliacoes.mp4', 'Google sem avaliações (com voz)', (
        'Nota 4,1 e 9 avaliações: o cliente nem clica.\n\n'
        'A gente deixa o seu perfil do Google completo e automatiza o pedido de avaliação depois de cada atendimento.\n\n'
        'Chama no direct e arruma o seu Google com a gente.\n\n#googlemeunegocio #avaliacoes #seolocal #negocioslocais #marketinglocal'), 1.2, IA),
]

if __name__ == '__main__':
    E.push() if '--push' in sys.argv else E.preparar()
