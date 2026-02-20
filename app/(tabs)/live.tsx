import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  AppState,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Radio, User, Users } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  getLiveConfig,
  gerarSessionId,
  registrarViewer,
  atualizarHeartbeat,
  sairDaLive,
  contarViewersAtivos,
} from "@/services/liveService";
import { mmkvStorage } from "@/lib/storage";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";
import type { LiveConfig } from "@/types";

export default function LiveScreen() {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const iconMuted = isDark ? "#94a3b8" : "#64748b";
  const { isOffline } = useNetworkStatus();
  const [isRegistered, setIsRegistered] = useState(false);
  const [nome, setNome] = useState(mmkvStorage.getItem("live_viewer_nome") || "");
  const [email, setEmail] = useState(mmkvStorage.getItem("live_viewer_email") || "");
  const [sessionId, setSessionId] = useState("");
  const [viewers, setViewers] = useState(0);

  const {
    data: config,
    isLoading,
    refetch,
  } = useQuery<LiveConfig | null>({
    queryKey: ["live-config"],
    queryFn: getLiveConfig,
    refetchInterval: 10000,
    enabled: !isOffline,
  });

  const isLive = config?.ativa || false;

  // Heartbeat
  useEffect(() => {
    if (!isRegistered || !sessionId || !isLive) return;
    const interval = setInterval(() => atualizarHeartbeat(sessionId), 30000);
    return () => clearInterval(interval);
  }, [isRegistered, sessionId, isLive]);

  // Viewer count
  useEffect(() => {
    if (!isLive || !isRegistered) return;
    const fetchViewers = async () => {
      const count = await contarViewersAtivos();
      setViewers(count);
    };
    fetchViewers();
    const interval = setInterval(fetchViewers, 15000);
    return () => clearInterval(interval);
  }, [isLive, isRegistered]);

  // Cleanup on app background
  useEffect(() => {
    if (!isRegistered || !sessionId) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        sairDaLive(sessionId);
      }
    });
    return () => {
      sub.remove();
      sairDaLive(sessionId);
    };
  }, [isRegistered, sessionId]);

  const handleRegistrar = async () => {
    if (!nome.trim()) return;
    try {
      const newSessionId = gerarSessionId();
      setSessionId(newSessionId);
      await registrarViewer(newSessionId, nome.trim(), email.trim() || undefined);
      setIsRegistered(true);
      mmkvStorage.setItem("live_viewer_nome", nome.trim());
      if (email.trim()) mmkvStorage.setItem("live_viewer_email", email.trim());
    } catch (error) {
      console.error("Erro ao registrar:", error);
    }
  };

  if (isOffline) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <Radio size={64} color="#94a3b8" />
        <Text className="text-lg font-bold text-foreground mt-4 text-center">
          Sem conexao
        </Text>
        <Text className="text-sm text-muted-foreground text-center mt-2">
          Nao e possivel verificar a transmissao sem internet.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={iconPrimary} />
        <Text className="text-muted-foreground mt-4">
          Verificando transmissao...
        </Text>
      </View>
    );
  }

  // Registration form when live is active
  if (isLive && !isRegistered) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
        <Card className="max-w-md mx-auto w-full">
          <CardContent className="items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <User size={32} color={iconPrimary} />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-1">
              Bem-vindo(a) a Live!
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-6">
              Informe seus dados para assistir
            </Text>

            <View className="w-full mb-3">
              <Text className="text-sm font-medium text-foreground mb-1">Nome *</Text>
              <TextInput
                className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-background"
                placeholder="Seu nome"
                placeholderTextColor="#94a3b8"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View className="w-full mb-4">
              <Text className="text-sm font-medium text-foreground mb-1">
                E-mail (opcional)
              </Text>
              <TextInput
                className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-background"
                placeholder="seu@email.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button
              title="Assistir Live"
              icon={<Radio size={18} color="#ffffff" />}
              onPress={handleRegistrar}
              className="w-full"
            />

            <View className="flex-row items-center gap-2 mt-6 bg-primary/5 rounded-lg px-4 py-3 w-full">
              <Badge
                label="AO VIVO"
                variant="destructive"
                icon={<Radio size={12} color="#ffffff" />}
              />
              <Text className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
                {config?.titulo || "Transmissao ao Vivo"}
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    );
  }

  // Live active + registered
  if (isLive && isRegistered) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="px-4 pt-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Badge
              label="AO VIVO"
              variant="destructive"
              icon={<Radio size={12} color="#ffffff" />}
            />
            {config?.mostrar_contador_viewers && (
              <Badge
                label={`${viewers} assistindo`}
                variant="secondary"
                icon={<Users size={12} color={iconMuted} />}
              />
            )}
          </View>
          <Text className="text-xl font-bold text-foreground mb-1">
            {config?.titulo || "Transmissao ao Vivo"}
          </Text>
          <Text className="text-sm text-muted-foreground mb-4">
            {config?.descricao || "Assista aos cultos e eventos ao vivo"}
          </Text>
        </View>

        {/* Player placeholder - HLS player would go here */}
        <View className="mx-4 bg-black rounded-xl overflow-hidden" style={{ aspectRatio: 16 / 9 }}>
          <View className="flex-1 items-center justify-center">
            <Radio size={48} color="#ffffff" />
            <Text className="text-white mt-2 text-sm">Transmissao em andamento</Text>
            <Text className="text-white/60 text-xs mt-1">Player HLS ativo</Text>
          </View>
        </View>

        <View className="px-4 mt-4 mb-8">
          <Card>
            <CardContent>
              <View className="flex-row items-center gap-2">
                <Radio size={16} color={iconPrimary} />
                <Text className="text-sm text-muted-foreground flex-1">
                  Se houver problemas, tente reabrir o app.
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    );
  }

  // Offline state (no live)
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16 }}>
      <Card>
        <CardContent className="items-center py-8">
          <Radio size={64} color="#94a3b8" />
          <Text className="text-xl font-bold text-foreground mt-4 text-center">
            {config?.mensagem_offline?.split(".")[0] || "Nenhuma transmissao ao vivo"}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-2 mb-6">
            {config?.mensagem_offline || "Fique atento aos nossos horarios de culto!"}
          </Text>

          {config?.proxima_live_titulo && config?.proxima_live_data && (
            <View className="bg-primary/10 border border-primary/20 rounded-lg p-4 w-full mb-6">
              <Text className="font-semibold text-primary mb-1">
                Proxima Transmissao:
              </Text>
              <Text className="font-semibold text-foreground">
                {config.proxima_live_titulo}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {new Date(config.proxima_live_data).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}

          <View className="bg-muted rounded-lg p-4 w-full">
            <Text className="font-semibold text-foreground mb-2">
              Horarios dos Cultos:
            </Text>
            {[
              { dia: "Segunda (Noite)", hora: "Apos live do Youtube" },
              { dia: "Quarta (Noite)", hora: "Apos live do Youtube" },
              { dia: "Sexta (Noite)", hora: "Apos live do Youtube" },
              { dia: "Sabado (Noite)", hora: "Apos live do Youtube" },
            ].map((item) => (
              <View
                key={item.dia}
                className="flex-row justify-between py-1"
              >
                <Text className="text-sm text-muted-foreground">
                  {item.dia}:
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {item.hora}
                </Text>
              </View>
            ))}
          </View>
        </CardContent>
      </Card>

      <AppFooter />
    </ScrollView>
  );
}
