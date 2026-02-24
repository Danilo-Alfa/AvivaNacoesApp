import { supabase } from '@/lib/supabase';
import type { FotoCarousel } from '@/types';

export const carouselService = {
  async getFotosAtivas(): Promise<FotoCarousel[]> {
    const { data, error } = await supabase
      .from('fotos_carousel')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) return [];
    return data || [];
  },
};
