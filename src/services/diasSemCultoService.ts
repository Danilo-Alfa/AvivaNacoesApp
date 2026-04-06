import { supabase } from '@/lib/supabase';

export interface DiaSemCulto {
  id: string;
  data: string;
  motivo: string | null;
  created_at: string;
}

export async function getDiasSemCultoDoMes(
  ano: number,
  mes: number
): Promise<DiaSemCulto[]> {
  const inicioMes = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const fimMes = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('dias_sem_culto')
    .select('*')
    .gte('data', inicioMes)
    .lte('data', fimMes)
    .order('data', { ascending: true });

  if (error) throw error;
  return data || [];
}
