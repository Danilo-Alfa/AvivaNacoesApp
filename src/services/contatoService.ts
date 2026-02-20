import { supabase } from '@/lib/supabase';
import type { MensagemContato } from '@/types';

export async function salvarMensagemContato(
  nome: string,
  email: string,
  telefone: string | null,
  assunto: string,
  mensagem: string
): Promise<MensagemContato> {
  const { data, error } = await supabase
    .from('mensagens_contato')
    .insert([{ nome, email, telefone, assunto, mensagem }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
