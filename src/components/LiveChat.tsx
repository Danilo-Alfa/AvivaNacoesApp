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
  StyleSheet,
} from "react-native";
import { MessageCircle, Send, Users } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { chatClient } from "@/services/chatService";
import { useTheme } from "@/hooks/useTheme";
import type { ChatMensagem } from "@/types";

interface LiveChatProps {
  sessionId: string;
  nome: string;
  email?: string;
  isLive: boolean;
}

function LiveChatInner({
  sessionId,
  nome,
  email,
  isLive,
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
  const [usersOnline, setUsersOnline] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [digitando, setDigitando] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const digitandoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!isLive || !sessionId || !nome) return;

    setIsConnecting(true);

    const handleMensagem = (msg: ChatMensagem) => {
      setMensagens((prev) => [...prev, msg]);
    };
    const handleMensagensAnteriores = (msgs: ChatMensagem[]) => {
      setMensagens(filtrarMensagensDeHoje(msgs));
    };
    const handleUsersOnline = (count: number) => {
      setUsersOnline(count);
    };
    const handleUsuarioDigitando = (data: { nome: string }) => {
      if (data.nome !== nome) {
        setDigitando((prev) =>
          prev.includes(data.nome) ? prev : [...prev, data.nome]
        );
      }
    };
    const handleUsuarioParouDigitar = (data: { nome: string }) => {
      setDigitando((prev) => prev.filter((n) => n !== data.nome));
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
    chatClient.on("users_online", handleUsersOnline);
    chatClient.on("usuario_digitando", handleUsuarioDigitando);
    chatClient.on("usuario_parou_digitar", handleUsuarioParouDigitar);
    chatClient.on("mensagem_deletada", handleMensagemDeletada);
    chatClient.on("chat_limpo", handleChatLimpo);
    chatClient.on("desconectado", handleDesconectado);

    chatClient.connect(sessionId, nome, email);

    const checkConnection = setTimeout(() => {
      setIsConnected(chatClient.isConnected());
      setIsConnecting(false);
    }, 2000);

    return () => {
      clearTimeout(checkConnection);
      if (digitandoTimeoutRef.current) {
        clearTimeout(digitandoTimeoutRef.current);
      }
      chatClient.off("conectado", handleConectado);
      chatClient.off("mensagem", handleMensagem);
      chatClient.off("mensagens_anteriores", handleMensagensAnteriores);
      chatClient.off("users_online", handleUsersOnline);
      chatClient.off("usuario_digitando", handleUsuarioDigitando);
      chatClient.off("usuario_parou_digitar", handleUsuarioParouDigitar);
      chatClient.off("mensagem_deletada", handleMensagemDeletada);
      chatClient.off("chat_limpo", handleChatLimpo);
      chatClient.off("desconectado", handleDesconectado);
      chatClient.disconnect();
    };
  }, [isLive, sessionId, nome, email, filtrarMensagensDeHoje]);

  const handleEnviar = () => {
    if (!novaMensagem.trim() || !isConnected) return;
    chatClient.enviarMensagem(novaMensagem.trim());
    setNovaMensagem("");
    chatClient.parouDigitar();
  };

  const handleInputChange = (text: string) => {
    setNovaMensagem(text);
    chatClient.digitando();
    if (digitandoTimeoutRef.current) {
      clearTimeout(digitandoTimeoutRef.current);
    }
    digitandoTimeoutRef.current = setTimeout(() => {
      chatClient.parouDigitar();
    }, 2000);
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
        <Badge
          label={`${usersOnline}`}
          variant="secondary"
          icon={<Users size={12} color={cl.muted} />}
        />
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
          ListFooterComponent={
            digitando.length > 0 ? (
              <Text style={{ fontSize: 12, color: cl.muted, fontStyle: "italic", marginTop: 4 }}>
                {digitando.length === 1
                  ? `${digitando[0]} está digitando...`
                  : `${digitando.slice(0, 2).join(", ")}${
                      digitando.length > 2 ? ` e mais ${digitando.length - 2}` : ""
                    } estão digitando...`}
              </Text>
            ) : null
          }
          onContentSizeChange={scrollToBottom}
        />

        {/* Input */}
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
