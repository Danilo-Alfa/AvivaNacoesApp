import { supabase } from '@/lib/supabase';
import type { Evento } from '@/types';

export async function getEventosFuturos(): Promise<Evento[]> {
  const hoje = new Date().toISOString();
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .or(`data_inicio.gte.${hoje},data_fim.gte.${hoje}`)
    .order('data_inicio', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEventosDoMes(ano: number, mes: number): Promise<Evento[]> {
  const inicioMes = new Date(ano, mes, 1).toISOString();
  const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .or(`and(data_inicio.gte.${inicioMes},data_inicio.lte.${fimMes}),and(data_fim.gte.${inicioMes},data_fim.lte.${fimMes}),and(data_inicio.lte.${inicioMes},data_fim.gte.${fimMes})`)
    .order('data_inicio', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEventosDestaque(): Promise<Evento[]> {
  const hoje = new Date().toISOString();
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('destaque', true)
    .or(`data_inicio.gte.${hoje},data_fim.gte.${hoje}`)
    .order('data_inicio', { ascending: true })
    .limit(3);

  if (error) throw error;
  return data || [];
}
