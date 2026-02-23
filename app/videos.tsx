import React, { useMemo, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import * as Linking from "expo-linking";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getVideoDestaque,
  getVideosRecentes,
  getPlaylistsAtivas,
} from "@/services/videoService";
import { AppFooter } from "@/components/AppFooter";
import { getYouTubeVideoId } from "@/lib/constants";
import { formatarDataRelativa } from "@/lib/utils";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";
import type { Video, Playlist } from "@/types";

// ── Memoized Sub-Components ──

const VideoCard = React.memo(function VideoCard({
  video,
  videoHeight,
  c,
}: {
  video: Video;
  videoHeight: number;
  c: Record<string, string>;
}) {
  const videoId = getYouTubeVideoId(video.url_video);
  if (!videoId) return null;
  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: c.cardBg,
          borderColor: c.cardBorder,
        },
      ]}
    >
      <YouTubePlayer videoId={videoId} height={videoHeight} />
      <View style={s.videoCardBody}>
        <Text
          style={[s.videoCardTitle, { color: c.foreground }]}
          numberOfLines={2}
        >
          {video.titulo}
        </Text>
        <View style={s.videoCardFooter}>
          <Text
            style={[
              s.videoCardMeta,
              { color: c.muted, flex: 1, marginRight: 8 },
            ]}
            numberOfLines={1}
          >
            {video.pregador || "Avivamento para as Nações"}
          </Text>
          {(video.data_publicacao || video.created_at) && (
            <Text
              style={[s.videoCardMeta, { color: c.muted }]}
            >
              {formatarDataRelativa(
                video.data_publicacao || video.created_at
              )}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});

const PlaylistCard = React.memo(function PlaylistCard({
  playlist,
  c,
}: {
  playlist: Playlist;
  c: Record<string, string>;
}) {
  const handlePress = useCallback(() => {
    Linking.openURL(playlist.url_playlist);
  }, [playlist.url_playlist]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        s.card,
        {
          backgroundColor: c.cardBg,
          borderColor: c.cardBorder,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flexDirection: "row" }}>
        <LinearGradient
          colors={["#1e3a5f", "#2d5a8e"]}
          style={s.playlistLeftBar}
        >
          <Text style={s.playlistCount}>
            {playlist.quantidade_videos}
          </Text>
          <Text style={s.playlistCountLabel}>
            vídeos
          </Text>
        </LinearGradient>
        <View style={s.playlistContent}>
          <Text
            style={[
              s.playlistTitle,
              { color: c.foreground },
            ]}
            numberOfLines={1}
          >
            {playlist.nome}
          </Text>
          {playlist.descricao && (
            <Text
              style={[
                s.playlistDesc,
                { color: c.muted },
              ]}
              numberOfLines={2}
            >
              {playlist.descricao}
            </Text>
          )}
          <View style={s.playlistCta}>
            <Text
              style={[
                s.playlistCtaText,
                { color: c.primary },
              ]}
            >
              Ver Playlist
            </Text>
            <Play size={12} color={c.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// ── Main Screen ──

export default function VideosScreen() {
  const { width } = useWindowDimensions();
  const { isDark } = useThemeForScreen();
  const screenReady = useScreenReady();
  const videoHeight = useMemo(() => Math.round((width - 32) * 9 / 16), [width]);

  const c = useMemo(
    () => ({
      bg: isDark ? "#0E131B" : "#FFFFFF",
      foreground: isDark ? "#FAFAFA" : "#1D2530",
      muted: isDark ? "#9DA4AF" : "#627084",
      primary: isDark ? "#367EE2" : "#123E7D",
      accent: "#f59e0b",
      cardBg: isDark ? "#171D26" : "#FFFFFF",
      cardBorder: isDark ? "#29313D" : "#E2E5E9",
      mutedBg: isDark ? "#252C37" : "#F3F5F6",
      primaryLight: isDark
        ? "rgba(54,126,226,0.10)"
        : "rgba(18,62,125,0.10)",
      white: "#FFFFFF",
    }),
    [isDark]
  );

  const { data: videoDestaque, isLoading: loadingDestaque } = useQuery({
    queryKey: ["video-destaque"],
    queryFn: getVideoDestaque,
    staleTime: 1000 * 60 * 60,
  });

  const { data: videosRecentes, isLoading: loadingRecentes } = useQuery({
    queryKey: ["videos-recentes"],
    queryFn: () => getVideosRecentes(9),
    staleTime: 1000 * 60 * 60,
  });

  const { data: playlists } = useQuery({
    queryKey: ["playlists"],
    queryFn: getPlaylistsAtivas,
    staleTime: 1000 * 60 * 60,
  });

  const isLoading = loadingDestaque || loadingRecentes;

  const formatarDataCompleta = useCallback((dataString: string) => {
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // ── Skeleton Loading ──

  if (!screenReady || isLoading) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.container}>
          {/* Hero Skeleton */}
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <Skeleton width={160} height={40} borderRadius={8} />
            <Skeleton
              width={280}
              height={16}
              borderRadius={8}
              style={{ marginTop: 12 }}
            />
          </View>

          {/* Featured Video Skeleton */}
          <View
            style={[
              s.card,
              {
                backgroundColor: c.cardBg,
                borderColor: c.cardBorder,
                marginBottom: 24,
              },
            ]}
          >
            <Skeleton width="100%" height={videoHeight} borderRadius={0} />
            <View style={{ padding: 12 }}>
              <Skeleton width="70%" height={20} borderRadius={6} />
              <Skeleton
                width={140}
                height={12}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>

          {/* Section Title Skeleton */}
          <Skeleton
            width={180}
            height={24}
            borderRadius={6}
            style={{ marginBottom: 16 }}
          />

          {/* Video Cards Skeleton */}
          <View style={{ gap: 12 }}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  s.card,
                  {
                    backgroundColor: c.cardBg,
                    borderColor: c.cardBorder,
                  },
                ]}
              >
                <Skeleton
                  width="100%"
                  height={videoHeight}
                  borderRadius={0}
                />
                <View style={{ padding: 12 }}>
                  <Skeleton width="80%" height={16} borderRadius={6} />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <Skeleton width={100} height={12} borderRadius={6} />
                    <Skeleton width={60} height={12} borderRadius={6} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Main Content ──

  const destaqueVideoId = videoDestaque ? getYouTubeVideoId(videoDestaque.url_video) : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
    >
      <View style={s.container}>
        {/* Hero Section */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Text style={[s.heroTitle, { color: c.primary }]}>Vídeos</Text>
          <Text style={[s.heroSubtitle, { color: c.muted }]}>
            Assista às mensagens, testemunhos e momentos especiais da nossa
            igreja
          </Text>
        </View>

        {/* Vídeo em Destaque */}
        {videoDestaque && destaqueVideoId && (
          <View
            style={[
              s.card,
              {
                backgroundColor: c.cardBg,
                borderColor: c.cardBorder,
                marginBottom: 32,
              },
            ]}
          >
            <YouTubePlayer videoId={destaqueVideoId} height={videoHeight} />
            <View style={s.featuredBody}>
              <Text
                style={[s.featuredTitle, { color: c.foreground }]}
              >
                {videoDestaque.titulo}
              </Text>
              {videoDestaque.data_publicacao && (
                <Text style={[s.metaText, { color: c.muted }]}>
                  {formatarDataCompleta(videoDestaque.data_publicacao)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Vídeos Recentes */}
        {videosRecentes && videosRecentes.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={[s.sectionTitle, { color: c.foreground }]}>
              Vídeos Recentes
            </Text>
            <View style={{ gap: 12 }}>
              {videosRecentes.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  videoHeight={videoHeight}
                  c={c}
                />
              ))}
            </View>
          </View>
        )}

        {/* Séries e Playlists */}
        {playlists && playlists.length > 0 && (
          <View>
            <Text style={[s.sectionTitle, { color: c.foreground }]}>
              Séries e Playlists
            </Text>
            <View style={{ gap: 12 }}>
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  c={c}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      <AppFooter />
    </ScrollView>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 48,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 340,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  // Cards
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Featured video
  featuredBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },

  // Video card (recent)
  videoCardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  videoCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  videoCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoCardMeta: {
    fontSize: 11,
  },

  // Playlists
  playlistLeftBar: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  playlistCount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  playlistCountLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  playlistContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  playlistDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  playlistCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  playlistCtaText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
