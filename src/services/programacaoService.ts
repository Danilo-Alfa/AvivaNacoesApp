import { supabase } from '@/lib/supabase';
import type { Programacao } from '@/types';

export async function getProgramacaoAtiva(): Promise<Programacao[]> {
  const { data, error } = await supabase
    .from('programacao')
    .select('*')
    .eq('ativo', true)
    .order('dia_semana', { ascending: true })
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data || [];
}
