"""Lote 3 ("leve") da Tavin Digital para o painel (mesmo caminho do enviar.py)."""
import sys
import enviar as E

IA = 'Narração com voz sintética: ao postar pelo app, ative o rótulo "Informações de IA".'
E.VIDEOS = [
    ('td-v11-agenda', 'tavin_11_do_google_ao_horario.mp4', 'Do Google ao horário marcado', (
        'Sábado, 9h12. Alguém procura uma barbearia perto e escolhe em 3 segundos.\n\n'
        'Quem tem perfil completo, página com serviços e agenda pelo WhatsApp recebe o horário marcado.\n\n'
        'A gente monta esse caminho para o seu negócio. Chama no direct.\n\n'
        '#negocioslocais #googlemeunegocio #agendamentoonline #criacaodesites #marketinglocal'), 2.4, ''),
    ('td-v12-caminho', 'tavin_12_caminho_do_cliente.mp4', 'O caminho do cliente (com voz)', (
        'Seu cliente faz um caminho: post, link da bio, página e WhatsApp. Se uma etapa falha, ele some no meio.\n\n'
        'A gente monta o caminho inteiro: artes, página, Google e atendimento, tudo conectado.\n\n'
        'Chama no direct que eu te mostro como fica o seu.\n\nNarração gerada por IA.\n\n'
        '#marketingdigital #linkdabio #instagramparanegocios #negocioslocais #presencadigital'), 1.8, IA),
    ('td-v13-antes-depois', 'tavin_13_antes_e_depois_da_bio.mp4', 'Antes e depois da bio (com voz)', (
        'Quatro botões, nenhuma foto, nenhum preço: o link da bio de sempre não explica o que você faz.\n\n'
        'A mesma bio, feita para vender: serviços com preço, avaliações do Google e agenda no WhatsApp.\n\n'
        'A prévia da sua é grátis. Chama no direct.\n\nNarração gerada por IA.\n\n'
        '#linkdabio #bioinstagram #criacaodesites #negocioslocais #empreendedorismo'), 1.6, IA),
    ('td-v14-motion', 'tavin_14_motion_para_sua_marca.mp4', 'Motion para a sua marca (esferas)', (
        'Esse vídeo foi animado pela Tavin Digital.\n\n'
        'Vinhetas, anúncios, explicativos, lançamentos e Reels animados, com a identidade da sua marca.\n\n'
        'Chama no direct e conta o que você quer mostrar.\n\n'
        '#motiondesign #motiongraphics #animacao #videomarketing #reels'), 4.2, ''),
    ('td-v15-perto', 'tavin_15_perto_de_mim.mp4', 'Perto de mim: Google e IA', (
        'Quando alguém procura perto de você, quem aparece primeiro leva o cliente.\n\n'
        'A gente deixa o seu perfil do Google completo, cuida das avaliações e prepara o seu negócio para ser encontrado também nas buscas com IA.\n\n'
        'Chama no direct.\n\n'
        '#seolocal #googlemeunegocio #avaliacoes #negocioslocais #seoparaia'), 7.0, ''),
]

if __name__ == '__main__':
    E.push() if '--push' in sys.argv else E.preparar()
