// Narração de cada vídeo: [quadro de início, quadro limite, texto, voz?, legenda?]
//   voz: 'n' narradora (padrão) · 't' a Thata falando na cena · 'p' paciente na cena
//   legenda: false = não aparece na legenda cinética (falas da cena já aparecem na tela)
// O produzir3.py gera a voz (Kokoro, local e gratuito) e passa os tempos reais para o vídeo via props.narra.
export type Fala = [number, number, string, ('n' | 't' | 'p')?, boolean?];
export const NARRA: Record<string, Fala[]> = {
  Q1: [
    [12, 66, 'Sete da manhã. Choveu forte.'],
    [70, 238, 'E as mensagens começam a cair, uma atrás da outra. Seis desmarcações antes das oito.'],
    [262, 402, 'A Thata responde cada paciente e remarca na hora. Ninguém da equipe para.'],
    [406, 484, 'No fim, a semana segue cheia.'],
    [498, 592, 'Chove lá fora. A agenda segue cheia.'],
  ],
  Q2: [
    [6, 44, 'Aceita convênio?'],
    [48, 196, 'A mesma pergunta chega de vários jeitos, todo dia. Trinta e oito vezes só neste mês.'],
    [262, 370, 'A Thata responde cada uma, do jeito certo, na hora.'],
    [398, 484, 'E já puxa o paciente para a agenda.'],
    [498, 592, 'Pergunta repetida? Resposta na hora.'],
  ],
  Q3: [
    [10, 66, 'Limpeza feita. Volte em seis meses.'],
    [74, 212, 'O tempo passa. Maio, junho, julho... e chega outubro.'],
    [218, 298, 'E ninguém lembrou.'],
    [304, 404, 'A Thata passa pela base inteira e manda a mensagem certa para cada paciente.'],
    [408, 484, 'Quem tinha sumido volta para a agenda.'],
    [498, 592, 'Ela lembra. O paciente volta.'],
  ],
  Q4: [
    [10, 62, 'Mão na luva. Paciente na cadeira.'],
    [66, 190, 'E o telefone toca. De novo. Mais uma ligação perdida.'],
    [252, 332, 'Clínica, boa tarde! Sou a Thata, assistente virtual.', 't', false],
    [334, 374, 'Queria marcar uma avaliação.', 'p', false],
    [376, 418, 'Quarta às nove, pode ser?', 't', false],
    [420, 438, 'Pode!', 'p', false],
    [450, 486, 'Você não tira a luva.'],
    [498, 592, 'Você segue no paciente. A Thata atende o telefone.'],
  ],
  R1: [
    [8, 70, 'Segunda, oito da manhã. A tela da recepção já está assim.'],
    [74, 196, 'Ligar pra um, confirmar outro, mandar orçamento. Recado em cima de recado.'],
    [214, 400, 'A Thata resolve um por um: liga, responde, confirma e marca.'],
    [410, 486, 'Nenhum recado fica pra depois.'],
    [498, 592, 'Menos recado na tela. Mais paciente na cadeira.'],
  ],
  R2: [
    [8, 64, 'Chegou paciente no balcão.'],
    [70, 206, 'Mas o telefone toca, o WhatsApp não para, e quem está na sua frente fica esperando.'],
    [214, 396, 'A Thata assume o telefone e as mensagens. Você volta a olhar para quem chegou.'],
    [404, 486, 'Atenda quem está na sua frente.'],
    [498, 592, 'Atenção no balcão. O resto, a Thata atende.'],
  ],
  R3: [
    [6, 98, 'Seis e quarenta da tarde. Falta confirmar os doze de amanhã.'],
    [112, 252, 'A Thata manda a mensagem para cada um, e as respostas vão chegando.'],
    [258, 404, 'Quem pediu outro horário já sai remarcado. Quem não respondeu recebe um lembrete.'],
    [410, 486, 'Pode ir pra casa. Amanhã já está confirmado.'],
    [498, 592, 'Agenda confirmada. Recepção em paz.'],
  ],
};
