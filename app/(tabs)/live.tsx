import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  AppState,
  Share,
  Linking,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Play, Radio, User, Users, Video } from "lucide-react-native";
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

interface Recording {
  name: string;
  mtime: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatRecordingDate(filename: string): string {
  const match = filename.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!match) return filename;
  const [, year, month, day, hour, min] = match;
  return `${day}/${month}/${year} às ${hour}:${min}`;
}

const STREAM_URL = process.env.EXPO_PUBLIC_STREAM_URL || "";
const SERVER_BASE_URL = STREAM_URL.replace(/\/live\/.*$/, "");

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
  const [nome, setNome] = useState(
    mmkvStorage.getItem("live_viewer_nome") || ""
  );
  const [email, setEmail] = useState(
    mmkvStorage.getItem("live_viewer_email") || ""
  );
  const [sessionId, setSessionId] = useState("");
  const [viewers, setViewers] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

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

  // Carregar gravações quando offline
  useEffect(() => {
    if (isLive || !SERVER_BASE_URL) return;
    setLoadingRecordings(true);
    fetch(`${SERVER_BASE_URL}/recordings/`)
      .then((res) => res.json())
      .then((files: { name: string; mtime: string; size: number }[]) => {
        const mp4s = files
          .filter((f) => f.name.endsWith(".mp4"))
          .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
        setRecordings(mp4s);
      })
      .catch(() => setRecordings([]))
      .finally(() => setLoadingRecordings(false));
  }, [isLive]);

  // Register anonymous viewer when live starts
  useEffect(() => {
    if (!isLive) return;
    const sid = gerarSessionId();
    setSessionId(sid);
    registrarViewer(sid, nome || undefined, email || undefined).catch(() => {});
  }, [isLive]);

  // Heartbeat
  useEffect(() => {
    if (!sessionId || !isLive) return;
    const interval = setInterval(() => atualizarHeartbeat(sessionId), 30000);
    return () => clearInterval(interval);
  }, [sessionId, isLive]);

  // Viewer count
  useEffect(() => {
    if (!isLive) return;
    const fetchViewers = async () => {
      const count = await contarViewersAtivos();
      setViewers(count);
    };
    fetchViewers();
    const interval = setInterval(fetchViewers, 15000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Cleanup on app background & re-register on foreground
  useEffect(() => {
    if (!sessionId || !isLive) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        sairDaLive(sessionId);
      } else if (state === "active") {
        registrarViewer(sessionId, nome || undefined, email || undefined).catch(() => {});
        atualizarHeartbeat(sessionId).catch(() => {});
      }
    });
    return () => {
      sub.remove();
      sairDaLive(sessionId);
    };
  }, [sessionId, isLive, nome, email]);

  const handleTrocarNome = useCallback(() => {
    Alert.alert("Trocar nome", "Deseja entrar com outro nome?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Trocar",
        onPress: () => {
          mmkvStorage.removeItem("live_viewer_nome");
          mmkvStorage.removeItem("live_viewer_email");
          setNome("");
          setEmail("");
        },
      },
    ]);
  }, []);

  const handleNomeSet = useCallback((newNome: string) => {
    setNome(newNome);
    mmkvStorage.setItem("live_viewer_nome", newNome);
    if (sessionId) {
      registrarViewer(sessionId, newNome, email || undefined).catch(() => {});
    }
  }, [sessionId, email]);

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

  // ─── Live ativa ───
  if (isLive) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {/* Player Card - fixo no topo */}
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
              {nome ? (
                <Pressable onPress={handleTrocarNome} style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <User size={12} color={c.muted} />
                  <Text style={{ fontSize: 12, color: c.muted, maxWidth: 100 }} numberOfLines={1}>{nome}</Text>
                  <LogOut size={11} color={c.muted} style={{ opacity: 0.5 }} />
                </Pressable>
              ) : null}
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

        {/* Chat - ocupa o espaço restante com FlatList próprio */}
        <View style={{ flex: 1, marginHorizontal: 16, marginTop: 16, marginBottom: 16 }}>
          <LiveChat
            sessionId={sessionId}
            nome={nome}
            email={email}
            isLive={isLive}
            onNomeSet={handleNomeSet}
            viewerCount={viewers}
          />
        </View>
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

      {/* Gravações anteriores */}
      {loadingRecordings ? (
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <ActivityIndicator size="small" color={c.muted} />
        </View>
      ) : recordings.length > 0 && (
        <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder, marginTop: 16 }]}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Video size={20} color={c.primary} />
              <Text style={[s.textXl, s.bold, { color: c.foreground }]}>
                Transmissões Anteriores
              </Text>
            </View>

            {/* Player da gravação selecionada */}
            {playingVideo && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ aspectRatio: 16 / 9, backgroundColor: "#000", borderRadius: 8, overflow: "hidden" }}>
                  <ExpoVideo
                    source={{ uri: `${SERVER_BASE_URL}/recordings/${playingVideo}` }}
                    style={{ flex: 1 }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                  />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <Text style={[s.textSm, { color: c.muted }]}>
                    {formatRecordingDate(playingVideo)}
                  </Text>
                  <Pressable onPress={() => setPlayingVideo(null)}>
                    <Text style={[s.textSm, { color: c.primary }]}>Fechar player</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Lista de gravações */}
            {recordings.map((rec) => (
              <Pressable
                key={rec.name}
                onPress={() => setPlayingVideo(rec.name)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: playingVideo === rec.name ? c.primary : c.border,
                  backgroundColor: playingVideo === rec.name ? c.primaryBg5 : "transparent",
                  marginBottom: 8,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: c.primaryBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Play size={16} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.textBase, s.medium, { color: c.foreground }]}>
                    {formatRecordingDate(rec.name)}
                  </Text>
                  <Text style={[s.textXs, { color: c.muted }]}>
                    {formatFileSize(rec.size)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

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
