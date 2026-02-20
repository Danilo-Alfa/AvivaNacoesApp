import { supabase } from '@/lib/supabase';
import type { Versiculo } from '@/types';

export const versiculoService = {
  async getVersiculoDoDia(): Promise<Versiculo | null> {
    const { data, error } = await supabase
      .from('versiculos')
      .select('*')
      .eq('ativo', true)
      .order('data', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  },

  async getVersiculosAnteriores(limit: number = 6): Promise<Versiculo[]> {
    const { data, error } = await supabase
      .from('versiculos')
      .select('*')
      .eq('ativo', true)
      .order('data', { ascending: false })
      .range(1, limit);

    if (error) return [];
    return data || [];
  },
};
