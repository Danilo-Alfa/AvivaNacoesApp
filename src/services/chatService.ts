import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';
import type { ChatMensagem } from '@/types';

type ChatEventHandler<T = unknown> = (data: T) => void;

class ChatClient {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<ChatEventHandler>> = new Map();
  private sessionId: string = '';
  private nome: string = '';
  private email: string = '';

  connect(sessionId: string, nome: string, email?: string): void {
    if (this.socket?.connected) return;

    // Clean up old disconnected socket before creating a new one
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.sessionId = sessionId;
    this.nome = nome;
    this.email = email || '';

    this.socket = io(`${API_BASE_URL}/chat`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.socket?.emit('join', {
        sessionId: this.sessionId,
        nome: this.nome,
        email: this.email,
      });
      this.emit('conectado', {});
    });

    this.socket.on('disconnect', () => {
      this.emit('desconectado', {});
    });

    this.socket.on('mensagem', (data: ChatMensagem) => this.emit('mensagem', data));
    this.socket.on('mensagens_anteriores', (data: ChatMensagem[]) => this.emit('mensagens_anteriores', data));
    this.socket.on('users_online', (count: number) => this.emit('users_online', count));
    this.socket.on('user_joined', (data: { nome: string; timestamp: string }) => this.emit('user_joined', data));
    this.socket.on('user_left', (data: { nome: string; timestamp: string }) => this.emit('user_left', data));
    this.socket.on('usuario_digitando', (data: { nome: string }) => this.emit('usuario_digitando', data));
    this.socket.on('usuario_parou_digitar', (data: { nome: string }) => this.emit('usuario_parou_digitar', data));
    this.socket.on('erro', (data: { message: string }) => this.emit('erro', data));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  enviarMensagem(mensagem: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('nova_mensagem', { mensagem });
  }

  digitando(): void {
    this.socket?.emit('digitando');
  }

  parouDigitar(): void {
    this.socket?.emit('parou_digitar');
  }

  on<T = unknown>(event: string, handler: ChatEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as ChatEventHandler);
  }

  off<T = unknown>(event: string, handler: ChatEventHandler<T>): void {
    this.eventHandlers.get(event)?.delete(handler as ChatEventHandler);
  }

  private emit(event: string, data: unknown): void {
    this.eventHandlers.get(event)?.forEach((handler) => handler(data));
  }
}

export const chatClient = new ChatClient();
