import { supabase } from '@/lib/supabase';
import type { Video, Playlist } from '@/types';

export async function getVideosAtivos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('data_publicacao', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVideoDestaque(): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .eq('destaque', true)
    .order('ordem', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getVideosRecentes(limite: number = 9): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .eq('destaque', false)
    .order('data_publicacao', { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data || [];
}

export async function getPlaylistsAtivas(): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data || [];
}
