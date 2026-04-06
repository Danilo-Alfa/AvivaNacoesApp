import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  AppState,
  StyleSheet,
} from "react-native";
import { MessageCircle, Send, User, Users } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { chatClient } from "@/services/chatService";
import { useTheme } from "@/hooks/useTheme";
import { censurarTexto, contemProfanidade } from "@/lib/profanityFilter";
import type { ChatMensagem } from "@/types";

const PALAVRAS_PROIBIDAS = [
  "puta", "puto", "viado", "buceta", "pau", "piroca", "cu", "merda",
  "filho da puta", "fdp", "vadia", "vagabunda", "vagabundo", "corno",
  "caralho", "porra", "foda", "foder", "desgraça", "lixo",
  "nazi", "nazista", "racista", "negro", "nigga",
  "shit", "fuck", "ass", "bitch", "damn",
];

function validarNome(nome: string): string | null {
  const n = nome.trim();
  if (n.length < 2) return "Nome deve ter pelo menos 2 caracteres.";
  if (n.length > 50) return "Nome muito longo.";
  if (/^[\d\s\W]+$/.test(n)) return "Nome deve conter letras.";
  const lower = n.toLowerCase();
  for (const palavra of PALAVRAS_PROIBIDAS) {
    if (lower.includes(palavra)) return "Nome não permitido.";
  }
  return null;
}

interface LiveChatProps {
  sessionId: string;
  nome: string;
  email?: string;
  isLive: boolean;
  onNomeSet?: (nome: string) => void;
  viewerCount?: number;
}

function LiveChatInner({
  sessionId,
  nome,
  email,
  isLive,
  onNomeSet,
  viewerCount,
}: LiveChatProps) {
  const { isDark } = useTheme();

  const cl = {
    bg: isDark ? "#0e1219" : "#ffffff",
    foreground: isDark ? "#f1f5f9" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    mutedBg: isDark ? "#1e293b" : "#f1f3f5",
    primary: isDark ? "#60a5fa" : "#1e3a5f",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    border: isDark ? "#334155" : "#e2e8f0",
    destructive: "#ef4444",
    destructiveBg: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.1)",
  };

  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [nomeInput, setNomeInput] = useState("");
  const [nomeError, setNomeError] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const filtrarMensagensDeHoje = useCallback((msgs: ChatMensagem[]) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return msgs.filter((msg) => new Date(msg.created_at) >= hoje);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && mensagens.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mensagens.length]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, scrollToBottom]);

  useEffect(() => {
    if (!isLive || !sessionId) return;

    setIsConnecting(true);

    const handleMensagem = (msg: ChatMensagem) => {
      setMensagens((prev) => [...prev, msg]);
    };
    const handleMensagensAnteriores = (msgs: ChatMensagem[]) => {
      setMensagens(filtrarMensagensDeHoje(msgs));
    };
    const handleMensagemDeletada = (data: { mensagemId: string }) => {
      setMensagens((prev) => prev.filter((m) => m.id !== data.mensagemId));
    };
    const handleChatLimpo = () => {
      setMensagens([]);
    };
    const handleConectado = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDesconectado = () => {
      setIsConnected(false);
    };

    chatClient.on("conectado", handleConectado);
    chatClient.on("mensagem", handleMensagem);
    chatClient.on("mensagens_anteriores", handleMensagensAnteriores);
    chatClient.on("mensagem_deletada", handleMensagemDeletada);
    chatClient.on("chat_limpo", handleChatLimpo);
    chatClient.on("desconectado", handleDesconectado);

    chatClient.connect(sessionId, nome, email);

    const checkConnection = setTimeout(() => {
      setIsConnected(chatClient.isConnected());
      setIsConnecting(false);
    }, 2000);

    // Reconnect when app returns from background
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && !chatClient.isConnected()) {
        setIsConnecting(true);
        chatClient.connect(sessionId, nome, email);
      }
    });

    return () => {
      clearTimeout(checkConnection);
      appStateSub.remove();
      chatClient.off("conectado", handleConectado);
      chatClient.off("mensagem", handleMensagem);
      chatClient.off("mensagens_anteriores", handleMensagensAnteriores);
      chatClient.off("mensagem_deletada", handleMensagemDeletada);
      chatClient.off("chat_limpo", handleChatLimpo);
      chatClient.off("desconectado", handleDesconectado);
      chatClient.disconnect();
    };
  }, [isLive, sessionId, nome, email, filtrarMensagensDeHoje]);

  const handleNomeSubmit = useCallback(() => {
    const erro = validarNome(nomeInput);
    if (erro) {
      setNomeError(erro);
      return;
    }
    setNomeError("");
    onNomeSet?.(nomeInput.trim());
  }, [nomeInput, onNomeSet]);

  const handleEnviar = () => {
    const texto = novaMensagem.trim();
    if (!texto || !isConnected) return;

    if (contemProfanidade(texto)) {
      chatClient.enviarMensagem(censurarTexto(texto));
    } else {
      chatClient.enviarMensagem(texto);
    }
    setNovaMensagem("");
  };

  const handleInputChange = (text: string) => {
    setNovaMensagem(text);
  };

  const formatarHora = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isLive) return null;

  const renderMensagem = useCallback(({ item: msg }: { item: ChatMensagem }) => {
    const isOwn = msg.session_id === sessionId;

    return (
      <View style={{ marginBottom: 12, alignItems: isOwn ? "flex-end" : "flex-start" }}>
        <View
          style={{
            maxWidth: "80%",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isOwn ? cl.primary : cl.mutedBg,
          }}
        >
          {!isOwn && (
            <Text style={{ fontSize: 12, fontWeight: "600", color: cl.foreground, opacity: 0.8, marginBottom: 2 }}>
              {msg.nome}
            </Text>
          )}
          <Text style={{ fontSize: 14, color: isOwn ? "#ffffff" : cl.foreground }}>
            {msg.mensagem}
          </Text>
          <Text style={{ fontSize: 10, marginTop: 2, color: isOwn ? "rgba(255,255,255,0.7)" : cl.muted }}>
            {formatarHora(msg.created_at)}
          </Text>
        </View>
      </View>
    );
  }, [sessionId, cl]);

  const canSend = novaMensagem.trim() && isConnected;

  return (
    <View style={[st.container, { backgroundColor: cl.cardBg, borderColor: cl.border }]}>
      {/* Header */}
      <View style={[st.header, { borderBottomColor: cl.border }]}>
        <View style={st.headerLeft}>
          <MessageCircle size={18} color={cl.primary} />
          <Text style={[st.headerTitle, { color: cl.foreground }]}>
            Chat ao Vivo
          </Text>
        </View>
        {viewerCount !== undefined && (
          <Badge
            label={`${viewerCount}`}
            variant="secondary"
            icon={<Users size={12} color={cl.muted} />}
          />
        )}
      </View>

      {/* Connection status */}
      {isConnecting && (
        <View style={[st.statusBar, { backgroundColor: cl.mutedBg }]}>
          <ActivityIndicator size="small" color={cl.primary} />
          <Text style={{ fontSize: 14, color: cl.muted }}>Conectando ao chat...</Text>
        </View>
      )}

      {!isConnecting && !isConnected && (
        <View style={[st.statusBar, { backgroundColor: cl.destructiveBg }]}>
          <Text style={{ fontSize: 14, color: cl.destructive, textAlign: "center" }}>
            Não foi possível conectar ao chat. Reabra o app.
          </Text>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={mensagens}
          renderItem={renderMensagem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 32 }}>
              <Text style={{ fontSize: 14, color: cl.muted, textAlign: "center" }}>
                Seja o primeiro a enviar uma mensagem!
              </Text>
            </View>
          }
          onContentSizeChange={scrollToBottom}
        />

        {/* Input */}
        {nome ? (
          <View style={[st.inputRow, { borderTopColor: cl.border }]}>
            <TextInput
              style={[st.input, { backgroundColor: cl.bg, borderColor: cl.border, color: cl.foreground }]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={cl.muted}
              value={novaMensagem}
              onChangeText={handleInputChange}
              maxLength={500}
              editable={isConnected}
              onSubmitEditing={handleEnviar}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleEnviar}
              disabled={!canSend}
              style={[
                st.sendButton,
                { backgroundColor: canSend ? cl.primary : cl.mutedBg, opacity: canSend ? 1 : 0.5 },
              ]}
            >
              <Send size={18} color={canSend ? "#ffffff" : cl.muted} />
            </Pressable>
          </View>
        ) : (
          <View style={{ borderTopWidth: 1, borderTopColor: cl.border }}>
            <View style={{ backgroundColor: cl.mutedBg, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <User size={14} color={cl.primary} />
              <Text style={{ fontSize: 13, color: cl.foreground, flex: 1 }}>
                Para enviar mensagens, informe seu nome:
              </Text>
            </View>
            {nomeError ? (
              <Text style={{ fontSize: 12, color: cl.destructive, paddingHorizontal: 12, paddingTop: 6 }}>
                {nomeError}
              </Text>
            ) : null}
            <View style={[st.inputRow, { borderTopWidth: 0 }]}>
              <TextInput
                style={[st.input, { backgroundColor: cl.bg, borderColor: cl.border, color: cl.foreground }]}
                placeholder="Digite seu nome..."
                placeholderTextColor={cl.muted}
                value={nomeInput}
                onChangeText={(t) => { setNomeInput(t); setNomeError(""); }}
                maxLength={50}
                onSubmitEditing={handleNomeSubmit}
                returnKeyType="done"
              />
              <Pressable
                onPress={handleNomeSubmit}
                disabled={!nomeInput.trim()}
                style={[
                  st.sendButton,
                  { backgroundColor: nomeInput.trim() ? cl.primary : cl.mutedBg, opacity: nomeInput.trim() ? 1 : 0.5 },
                ]}
              >
                <Send size={18} color={nomeInput.trim() ? "#ffffff" : cl.muted} />
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const LiveChat = React.memo(LiveChatInner);
export default LiveChat;

const st = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
