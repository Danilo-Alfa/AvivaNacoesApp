import { supabase } from '@/lib/supabase';
import type { Jornal } from '@/types';

export async function getUltimosJornais(): Promise<Jornal[]> {
  const { data, error } = await supabase
    .from('jornais')
    .select('*')
    .order('data', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data || [];
}
