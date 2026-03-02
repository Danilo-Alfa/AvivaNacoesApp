import { supabase } from '@/lib/supabase';
import type { Igreja } from '@/types';

export async function getIgrejasAtivas(): Promise<Igreja[]> {
  const { data, error } = await supabase
    .from('igrejas')
    .select('*')
    .eq('ativo', true)
    .order('pais', { ascending: true })
    .order('ordem', { ascending: true });

  if (error) throw error;
  return data || [];
}
