"""Lote 5 (3D real, com virada) da Tavin Digital para o painel (mesmo caminho do enviar.py)."""
import sys
import enviar as E

E.VIDEOS = [
    ('td-v21-dormia', 'tavin_21_enquanto_voce_dormia.mp4', 'Enquanto você dormia (3D)', (
        'Sábado, 02:47. Um cliente achou a página, escolheu o horário e marcou sozinho.\n\n'
        'E o dono? Tava dormindo. Acordou com a agenda cheia.\n\n'
        'Sua página atende, mostra e agenda 24 horas por dia. Chama no direct.\n\n'
        '#negocioslocais #agendamentoonline #criacaodesites #barbearia #empreendedorismo'), 2.6, ''),
    ('td-v22-luxo', 'tavin_22_anuncio_de_luxo.mp4', 'Anúncio de luxo (3D, virada)', (
        'Parece propaganda de perfume. É a pomada de uma barbearia de bairro.\n\n'
        'Vídeo em 3D e motion com cara de marca grande, para o seu produto aparecer como merece.\n\n'
        'Imagina o que dá pra fazer com a sua marca. Chama no direct.\n\n'
        '#motiondesign #animacao3d #videomarketing #barbearia #reels'), 6.9, ''),
    ('td-v23-loop', 'tavin_23_loop_do_bairro.mp4', 'Loop do bairro (3D)', (
        '37 barbearias no bairro. Por que o cliente escolheria a sua?\n\n'
        'Porque ela aparece e parece a melhor: Google, página e vídeos que fazem o cliente voltar.\n\n'
        'Assiste de novo e repara onde o vídeo termina. Chama no direct.\n\n'
        '#seolocal #googlemeunegocio #motiondesign #negocioslocais #barbearia'), 9.0, ''),
]

if __name__ == '__main__':
    E.push() if '--push' in sys.argv else E.preparar()
