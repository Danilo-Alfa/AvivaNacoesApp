import { api } from '@/lib/api';
import type { MensagemContato } from '@/types';

export async function salvarMensagemContato(
  nome: string,
  email: string,
  telefone: string | null,
  assunto: string,
  mensagem: string
): Promise<MensagemContato> {
  return api.post<MensagemContato>('/contato', {
    nome,
    email,
    telefone,
    assunto,
    mensagem,
  });
}
