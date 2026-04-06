import { supabase } from '@/lib/supabase';
import type { Projeto } from '@/types';

export async function getProjetosAtivos(): Promise<Projeto[]> {
  const { data, error } = await supabase
    .from('projetos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data || [];
}
