import { supabase } from '@/lib/supabase';
import type { Galeria } from '@/types';

export async function getUltimasGalerias(): Promise<Galeria[]> {
  const { data, error } = await supabase
    .from('galerias')
    .select('*')
    .order('data', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}
