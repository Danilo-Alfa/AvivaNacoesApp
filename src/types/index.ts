// =====================================================
// TYPES - Shared across the app
// =====================================================

export interface Versiculo {
  id: string;
  url_post: string;
  url_imagem: string | null;
  titulo: string | null;
  data: string;
  ativo: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  titulo: string;
  descricao: string | null;
  url_video: string;
  thumbnail_url: string | null;
  duracao: string | null;
  pregador: string | null;
  categoria: string | null;
  destaque: boolean;
  ordem: number;
  ativo: boolean;
  data_publicacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  nome: string;
  descricao: string | null;
  url_playlist: string;
  quantidade_videos: number;
  categoria: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Igreja {
  id: string;
  nome: string;
  pais: string | null;
  bairro: string | null;
  endereco: string;
  cidade: string | null;
  cep: string | null;
  telefone: string | null;
  whatsapp: string | null;
  horarios: string | null;
  pastor: string | null;
  latitude: number | null;
  longitude: number | null;
  imagem_url: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Programacao {
  id: string;
  titulo: string;
  dia_semana: number;
  horario: string;
  local: string | null;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  tipo: string | null;
  destaque: boolean;
  imagem_url: string | null;
  cor: string | null;
  created_at: string;
}

export interface Galeria {
  id: string;
  url_album: string;
  titulo: string;
  descricao: string | null;
  data: string;
  capa_url: string | null;
  created_at: string;
}

export interface Jornal {
  id: string;
  url_pdf: string;
  titulo: string | null;
  data: string;
  created_at: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  objetivo: string | null;
  publico_alvo: string | null;
  frequencia: string | null;
  como_participar: string | null;
  imagem_url: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MensagemContato {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export interface LiveConfig {
  id: string;
  ativa: boolean;
  url_stream: string | null;
  titulo: string;
  descricao: string | null;
  mensagem_offline: string;
  proxima_live_titulo: string | null;
  proxima_live_data: string | null;
  proxima_live_descricao: string | null;
  mostrar_contador_viewers: boolean;
  cor_badge: string;
  created_at: string;
  updated_at: string;
}

export interface LiveStatus {
  ativa: boolean;
  titulo: string | null;
  descricao: string | null;
  viewers: number;
  url_stream: string | null;
}

export interface LiveViewer {
  id: string;
  session_id: string;
  nome: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  entrou_em: string;
  ultima_atividade: string;
  assistindo: boolean;
}

export interface ChatMensagem {
  id: string;
  session_id: string;
  nome: string;
  email: string | null;
  mensagem: string;
  created_at: string;
}

export interface FotoCarousel {
  id: string;
  url_imagem: string;
  titulo: string | null;
  data_evento: string | null;
  link_url: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Push Notification Types
// =====================================================

export interface PushTokenRegistration {
  token: string;
  platform: 'ios' | 'android';
  device_name: string | null;
  app_version: string;
}

export interface PushTokenResponse {
  id: string;
  token: string;
  platform: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
