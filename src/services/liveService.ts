import { api } from '@/lib/api';
import { mmkvStorage } from '@/lib/storage';
import type { LiveConfig, LiveStatus, LiveViewer } from '@/types';
import { Platform } from 'react-native';

export async function getLiveConfig(): Promise<LiveConfig | null> {
  try {
    return await api.get<LiveConfig>('/live/config');
  } catch {
    return null;
  }
}

export async function getLiveStatus(): Promise<LiveStatus> {
  return api.get<LiveStatus>('/live/status');
}

export function gerarSessionId(): string {
  const existing = mmkvStorage.getItem('live_session_id');
  if (existing) return existing;

  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  mmkvStorage.setItem('live_session_id', newId);
  return newId;
}

export async function registrarViewer(
  sessionId: string,
  nome?: string,
  email?: string
): Promise<LiveViewer> {
  return api.post<LiveViewer>('/viewers/registrar', {
    session_id: sessionId,
    nome: nome || null,
    email: email || null,
    user_agent: `AvivaNacoesApp/${Platform.OS}`,
  });
}

export async function atualizarHeartbeat(sessionId: string): Promise<void> {
  try {
    await api.post('/viewers/heartbeat', { session_id: sessionId });
  } catch {
    // Silent fail
  }
}

export async function sairDaLive(sessionId: string): Promise<void> {
  try {
    await api.post('/viewers/sair', { session_id: sessionId });
  } catch {
    // Silent fail
  }
}

export async function contarViewersAtivos(): Promise<number> {
  try {
    const response = await api.get<{ viewers: number }>('/viewers/contagem');
    return response.viewers;
  } catch {
    return 0;
  }
}
