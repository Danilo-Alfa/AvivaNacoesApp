import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  AppState,
  Share,
  Linking,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Radio, User, Users } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import LiveChat from "@/components/LiveChat";
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
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";
import type { LiveConfig } from "@/types";

export default function LiveScreen() {
  const { isDark } = useThemeForScreen();
  const screenReady = useScreenReady();

  // Theme colors — same pattern as index.tsx
  const c = useMemo(() => ({
    bg: isDark ? "#0e1219" : "#ffffff",
    foreground: isDark ? "#f1f5f9" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    mutedBg: isDark ? "#1e293b" : "#f1f3f5",
    primary: isDark ? "#60a5fa" : "#1e3a5f",
    primaryBg: isDark ? "rgba(96,165,250,0.1)" : "rgba(30,58,95,0.1)",
    primaryBg5: isDark ? "rgba(96,165,250,0.05)" : "rgba(30,58,95,0.05)",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    cardBorder: isDark ? "#334155" : "#e2e8f0",
    border: isDark ? "#334155" : "#e2e8f0",
    destructive: "#ef4444",
  }), [isDark]);

  const { isOffline } = useNetworkStatus();
  const [isRegistered, setIsRegistered] = useState(false);
  const [nome, setNome] = useState(
    mmkvStorage.getItem("live_viewer_nome") || ""
  );
  const [email, setEmail] = useState(
    mmkvStorage.getItem("live_viewer_email") || ""
  );
  const [sessionId, setSessionId] = useState("");
  const [viewers, setViewers] = useState(0);

  const {
    data: config,
    isLoading,
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

  const handleRegistrar = useCallback(async () => {
    if (!nome.trim()) return;
    try {
      const newSessionId = gerarSessionId();
      setSessionId(newSessionId);
      await registrarViewer(
        newSessionId,
        nome.trim(),
        email.trim() || undefined
      );
      setIsRegistered(true);
      mmkvStorage.setItem("live_viewer_nome", nome.trim());
      if (email.trim())
        mmkvStorage.setItem("live_viewer_email", email.trim());
    } catch (error) {
      console.error("Erro ao registrar:", error);
    }
  }, [nome, email]);

  const handleCompartilharWhatsApp = useCallback(() => {
    const msg =
      "Assista a live da Igreja Avivamento para as Nações! https://avivamentoparasnacoes.com.br/live";
    Linking.openURL(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    );
  }, []);

  const handleCopiarLink = useCallback(async () => {
    try {
      await Share.share({
        message:
          "Assista a live da Igreja Avivamento para as Nações! https://avivamentoparasnacoes.com.br/live",
      });
    } catch (_) {
      // user cancelled
    }
  }, []);

  // ─── Sem conexão ───
  if (isOffline) {
    return (
      <View style={[s.flex1Center, { backgroundColor: c.bg }]}>
        <Radio size={64} color="#94a3b8" />
        <Text style={[s.textXl, s.bold, { color: c.foreground, marginTop: 16, textAlign: "center" }]}>
          Sem conexão
        </Text>
        <Text style={[s.textBase, { color: c.muted, marginTop: 8, textAlign: "center", paddingHorizontal: 16 }]}>
          Não é possível verificar a transmissão sem internet.
        </Text>
      </View>
    );
  }

  // ─── Carregando ───
  if (!screenReady || isLoading) {
    return (
      <View style={[s.flex1Center, { backgroundColor: c.bg }]}>
        <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder, marginHorizontal: 16, paddingVertical: 64 }]}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[s.textBase, { color: c.muted, marginTop: 16 }]}>
            Verificando transmissão...
          </Text>
        </View>
      </View>
    );
  }

  // ─── Formulário de registro (live ativa, usuário não registrado) ───
  if (isLive && !isRegistered) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
          <View style={{ padding: 16, paddingTop: 24, alignItems: "center" }}>
            {/* User icon */}
            <View style={[s.iconCircle, { backgroundColor: c.primaryBg }]}>
              <User size={32} color={c.primary} />
            </View>

            <Text style={[s.text3xl, s.bold, { color: c.foreground, marginBottom: 8 }]}>
              Bem-vindo(a) a Live!
            </Text>
            <Text style={[s.textBase, { color: c.muted, textAlign: "center", marginBottom: 24 }]}>
              Para assistir a transmissão, por favor informe seus dados
            </Text>

            {/* Nome */}
            <View style={{ width: "100%", marginBottom: 12 }}>
              <Text style={[s.textBase, s.medium, { color: c.foreground, marginBottom: 4 }]}>
                Nome *
              </Text>
              <TextInput
                style={[s.input, { borderColor: c.border, color: c.foreground, backgroundColor: c.bg }]}
                placeholder="Seu nome"
                placeholderTextColor={c.muted}
                value={nome}
                onChangeText={setNome}
                autoFocus
              />
            </View>

            {/* E-mail */}
            <View style={{ width: "100%", marginBottom: 4 }}>
              <Text style={[s.textBase, s.medium, { color: c.foreground, marginBottom: 4 }]}>
                E-mail (opcional)
              </Text>
              <TextInput
                style={[s.input, { borderColor: c.border, color: c.foreground, backgroundColor: c.bg }]}
                placeholder="seu@email.com"
                placeholderTextColor={c.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[s.textSm, { color: c.muted, marginTop: 4 }]}>
                Usado apenas para notificações futuras
              </Text>
            </View>

            {/* Botão */}
            <View style={{ width: "100%", marginTop: 16 }}>
              <Button
                title="Assistir Live"
                icon={<Radio size={18} color="#ffffff" />}
                onPress={handleRegistrar}
                className="w-full"
              />
            </View>

            {/* Live indicator */}
            <View style={[s.liveIndicator, { backgroundColor: c.primaryBg5 }]}>
              <Badge
                label="AO VIVO"
                variant="destructive"
                icon={<Radio size={12} color="#ffffff" />}
                style={
                  config?.cor_badge
                    ? { backgroundColor: config.cor_badge }
                    : undefined
                }
              />
              <Text
                style={[s.textBase, s.medium, { color: c.foreground, flex: 1 }]}
                numberOfLines={1}
              >
                {config?.titulo || "Transmissão ao Vivo"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ─── Live ativa + registrado ───
  if (isLive && isRegistered) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
          {/* Player Card */}
          <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder, marginHorizontal: 16, marginTop: 16 }]}>
            {/* Header */}
            <View style={{ padding: 16, paddingBottom: 12 }}>
              <Text style={[s.text2xl, s.bold, { color: c.foreground }]} numberOfLines={2}>
                {config?.titulo || "Transmissão ao Vivo - Avivamento para as Nações"}
              </Text>
              <Text style={[s.textSm, { color: c.muted, marginTop: 4 }]} numberOfLines={1}>
                {config?.descricao || "Assista aos cultos e eventos ao vivo"}
              </Text>

              {/* Badges */}
              <View style={s.badgeRow}>
                {config?.mostrar_contador_viewers && (
                  <Badge
                    label={`${viewers} assistindo`}
                    variant="secondary"
                    icon={<Users size={12} color={c.muted} />}
                  />
                )}
                <Badge
                  label={nome}
                  variant="outline"
                  icon={<User size={12} color={c.muted} />}
                />
                <Badge
                  label="AO VIVO"
                  variant="destructive"
                  icon={<Radio size={12} color="#ffffff" />}
                  style={
                    config?.cor_badge
                      ? { backgroundColor: config.cor_badge }
                      : undefined
                  }
                />
              </View>
            </View>

            {/* Player */}
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <View style={s.playerBox}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <Radio size={48} color="#ffffff" />
                  <Text style={{ color: "#ffffff", marginTop: 8, fontSize: 14 }}>
                    Transmissão em andamento
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>
                    Player HLS ativo
                  </Text>
                </View>
              </View>
            </View>

            {/* Alert */}
            <View style={[s.alertBox, { backgroundColor: c.mutedBg, marginHorizontal: 16, marginBottom: 16 }]}>
              <Radio size={16} color={c.primary} />
              <Text style={[s.textBase, { color: c.muted, flex: 1 }]}>
                Transmissão ao vivo ativa. Se houver problemas de reprodução,
                tente reabrir o app ou verificar sua conexão com a internet.
              </Text>
            </View>
          </View>

          {/* Chat */}
          <View style={{ marginHorizontal: 16, marginTop: 16, height: 500 }}>
            <LiveChat
              sessionId={sessionId}
              nome={nome}
              email={email}
              isLive={isLive}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Estado offline (sem live ativa) ───
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Main Card */}
      <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        {/* Header */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text style={[s.text3xl, s.bold, { color: c.foreground }]}>
            {config?.titulo || "Transmissão ao Vivo"}
          </Text>
          <Text style={[s.textBase, { color: c.muted, marginTop: 4 }]}>
            {config?.descricao || "Assista aos cultos e eventos do Avivamento para as Nações"}
          </Text>
        </View>

        {/* Offline content area */}
        <View style={{ padding: 16 }}>
          <View style={[s.offlineBox, { backgroundColor: c.mutedBg }]}>
            <Radio size={64} color="#94a3b8" />

            <Text style={[s.text2xl, s.semibold, { color: c.foreground, marginTop: 16, textAlign: "center" }]}>
              {config?.mensagem_offline?.split(".")[0] || "Nenhuma transmissão ao vivo no momento"}
            </Text>
            <Text style={[s.textBase, { color: c.muted, marginTop: 8, textAlign: "center", marginBottom: 24 }]}>
              {config?.mensagem_offline || "Fique atento aos nossos horários de culto e eventos especiais!"}
            </Text>

            {/* Próxima transmissão */}
            {config?.proxima_live_titulo && config?.proxima_live_data && (
              <View style={[s.nextLiveBox, { backgroundColor: c.primaryBg, borderColor: isDark ? "rgba(96,165,250,0.2)" : "rgba(30,58,95,0.2)" }]}>
                <Text style={[s.textBase, s.semibold, { color: c.primary, marginBottom: 8 }]}>
                  📅 Próxima Transmissão:
                </Text>
                <Text style={[s.textBase, s.semibold, { color: c.foreground }]}>
                  {config.proxima_live_titulo}
                </Text>
                <Text style={[s.textSm, { color: c.muted }]}>
                  {new Date(config.proxima_live_data).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                {config.proxima_live_descricao && (
                  <Text style={[s.textXs, { color: c.muted, marginTop: 4 }]}>
                    {config.proxima_live_descricao}
                  </Text>
                )}
              </View>
            )}

            {/* Horários dos cultos */}
            <View style={[s.scheduleBox, { backgroundColor: c.bg }]}>
              <Text style={[s.textBase, s.semibold, { color: c.foreground, marginBottom: 12 }]}>
                Horários dos Cultos:
              </Text>
              {[
                { dia: "Segunda (Noite)", hora: "Após live do Youtube" },
                { dia: "Quarta (Noite)", hora: "Após live do Youtube" },
                { dia: "Sexta (Noite)", hora: "Após live do Youtube" },
                { dia: "Sabado (Noite)", hora: "Após live do Youtube" },
              ].map((item) => (
                <View key={item.dia} style={s.scheduleRow}>
                  <Text style={[s.textBase, { color: c.muted }]}>{item.dia}:</Text>
                  <Text style={[s.textBase, s.medium, { color: c.foreground }]}>{item.hora}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Compartilhe */}
      <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder, marginTop: 16 }]}>
        <View style={{ padding: 16 }}>
          <Text style={[s.textXl, s.bold, { color: c.foreground, marginBottom: 8 }]}>
            Compartilhe
          </Text>
          <Text style={[s.textBase, { color: c.muted, marginBottom: 16 }]}>
            Convide seus amigos e familiares para assistirem conosco!
          </Text>
          <View style={s.shareRow}>
            <View style={{ flex: 1 }}>
              <Button
                title="WhatsApp"
                variant="primary"
                onPress={handleCompartilharWhatsApp}
                className="w-full"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Copiar Link"
                variant="outline"
                onPress={handleCopiarLink}
                className="w-full"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex1Center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  playerBox: {
    backgroundColor: "#000000",
    borderRadius: 8,
    overflow: "hidden",
    aspectRatio: 16 / 9,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    padding: 12,
  },
  offlineBox: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  nextLiveBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  scheduleBox: {
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shareRow: {
    flexDirection: "row",
    gap: 12,
  },
  // Typography
  text3xl: { fontSize: 30, lineHeight: 36 },
  text2xl: { fontSize: 24, lineHeight: 32 },
  textXl: { fontSize: 20, lineHeight: 28 },
  textBase: { fontSize: 16, lineHeight: 24 },
  textSm: { fontSize: 14, lineHeight: 20 },
  textXs: { fontSize: 12, lineHeight: 16 },
  bold: { fontWeight: "700" as const },
  semibold: { fontWeight: "600" as const },
  medium: { fontWeight: "500" as const },
});
