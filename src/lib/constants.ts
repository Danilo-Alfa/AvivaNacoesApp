export const YOUTUBE_VIDEO_ID = 'Nz-EPSwe5as';

export const CULTOS = [
  { dia: 0, nome: 'Domingo', horario: '19:00', horaNum: 19, minutoNum: 0, local: 'Igreja Sede e Online' },
  { dia: 1, nome: 'Segunda', horario: '19:30', horaNum: 19, minutoNum: 30, local: 'Igreja Sede e Online' },
  { dia: 2, nome: 'Terça', horario: '20:00', horaNum: 20, minutoNum: 0, local: 'Online' },
  { dia: 3, nome: 'Quarta', horario: '19:45', horaNum: 19, minutoNum: 45, local: 'Igreja Sede e Online' },
  { dia: 4, nome: 'Quinta', horario: '20:00', horaNum: 20, minutoNum: 0, local: 'Online' },
  { dia: 5, nome: 'Sexta', horario: '20:00', horaNum: 20, minutoNum: 0, local: 'Igreja Sede e Online' },
  { dia: 6, nome: 'Sábado', horario: '20:00', horaNum: 20, minutoNum: 0, local: 'Igreja Sede e Online' },
];

export const DIAS_SEMANA = [
  { valor: 0, nome: 'Domingo' },
  { valor: 1, nome: 'Segunda' },
  { valor: 2, nome: 'Terça' },
  { valor: 3, nome: 'Quarta' },
  { valor: 4, nome: 'Quinta' },
  { valor: 5, nome: 'Sexta' },
  { valor: 6, nome: 'Sábado' },
];

export const SOCIAL_NETWORKS = [
  {
    name: 'Facebook',
    url: 'https://web.facebook.com/igrejaevangelicaaviva/',
    handle: '@igrejaevangelicaaviva',
    description: 'Acompanhe nossas postagens diárias, eventos e transmissões ao vivo dos cultos.',
    color: '#1877F2',
    icon: 'facebook' as const,
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/igrejaavivanacoes/',
    handle: '@igrejaavivanacoes',
    description: 'Versículos inspiradores, stories dos eventos e momentos da nossa comunidade.',
    color: '#E4405F',
    icon: 'instagram' as const,
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@TvAvivaNacoes',
    handle: '@TvAvivaNacoes',
    description: 'Assista aos cultos completos, pregações, louvores e testemunhos.',
    color: '#FF0000',
    icon: 'youtube' as const,
  },
  {
    name: 'WebRádio',
    url: 'https://app.mobileradio.com.br/WebRadioAvivaNacoes',
    description: 'Ouça nossa programação 24 horas com louvores, pregações e conteúdo edificante.',
    color: '#7C3AED',
    icon: 'radio' as const,
  },
  {
    name: 'Associação Beneficente EL Roi',
    url: 'https://www.facebook.com/share/194jRRsrGp/',
    description: 'Conheça nossos projetos sociais e ações de amor ao próximo na comunidade.',
    color: '#EC4899',
    icon: 'heart' as const,
  },
  {
    name: 'Jornal Aviva News',
    url: 'https://portaldojoan.my.canva.site/',
    description: 'Notícias, artigos e conteúdo informativo sobre fé, família e sociedade.',
    color: '#3B82F6',
    icon: 'newspaper' as const,
  },
  {
    name: 'Aviva Jovens',
    url: 'https://www.instagram.com/_aviva.jovens',
    handle: '@_aviva.jovens',
    description: 'Ministério voltado para jovens com eventos, encontros e conteúdo relevante.',
    color: '#7C3AED',
    icon: 'users' as const,
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/show/6UxigeE1ZivVsJxRdVokSJ',
    description: 'Ouça nossas playlists, pregações e louvores na maior plataforma de streaming.',
    color: '#1DB954',
    icon: 'music' as const,
  },
];

export const CONTACT_INFO = {
  email: 'avivanacoescontato@gmail.com',
  address: 'Rua Lucas Padilha, 7 – Jd Esther',
  city: 'São Paulo - SP',
  cep: '05366-080',
  hours: 'Todo dia: 18h até 22h',
  coordinates: { lat: -23.574401, lng: -46.758482 },
};

export const getProximoCulto = () => {
  const agora = new Date();
  const diaAtual = agora.getDay();
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  const cultoHoje = CULTOS[diaAtual];
  if (
    horaAtual < cultoHoje.horaNum ||
    (horaAtual === cultoHoje.horaNum && minutoAtual < cultoHoje.minutoNum)
  ) {
    return { ...cultoHoje, nome: 'Hoje' };
  }

  const proximoDia = (diaAtual + 1) % 7;
  return CULTOS[proximoDia];
};

export const getNomeDiaSemana = (dia: number): string => {
  return DIAS_SEMANA.find((d) => d.valor === dia)?.nome || '';
};

export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
