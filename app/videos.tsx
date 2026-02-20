import React from "react";
import { ScrollView, View, Text, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useQuery } from "@tanstack/react-query";
import { Clock, Play } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { Skeleton } from "@/components/ui/Skeleton";
import { getVideoDestaque, getVideosRecentes, getPlaylistsAtivas } from "@/services/videoService";
import { AppFooter } from "@/components/AppFooter";
import { getYouTubeVideoId } from "@/lib/constants";
import { formatarDataRelativa } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export default function VideosScreen() {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const iconMuted = isDark ? "#94a3b8" : "#64748b";

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

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="bg-primary px-4 py-8 items-center">
          <Skeleton width={160} height={32} borderRadius={8} />
          <Skeleton width={240} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
        <View className="p-4">
          <Skeleton width="100%" height={200} borderRadius={12} />
          <View className="mt-4">
            <Skeleton width="60%" height={24} />
            <Skeleton width="100%" height={16} style={{ marginTop: 8 }} />
          </View>
          <View className="mt-6 flex-row flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="w-[48%]">
                <Skeleton width="100%" height={100} borderRadius={8} />
                <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary px-4 py-8 items-center">
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          Vídeos
        </Text>
        <Text className="text-lg text-white/80 text-center">
          Pregações, louvores e momentos especiais
        </Text>
      </View>

      <View className="px-4 py-4">
        {/* Video Destaque */}
        {videoDestaque && (() => {
          const videoId = getYouTubeVideoId(videoDestaque.url_video);
          return videoId ? (
            <Card className="mb-6">
              <CardContent className="p-0">
                <View className="rounded-t-xl overflow-hidden">
                  <YouTubePlayer videoId={videoId} height={width * 0.52} />
                </View>
                <View className="p-4">
                  <Text className="text-xl font-bold text-foreground mb-1">
                    {videoDestaque.titulo}
                  </Text>
                  {videoDestaque.descricao && (
                    <Text className="text-sm text-muted-foreground mb-2" numberOfLines={2}>
                      {videoDestaque.descricao}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-2">
                    {videoDestaque.duracao && (
                      <View className="flex-row items-center gap-1">
                        <Clock size={12} color={iconMuted} />
                        <Text className="text-xs text-muted-foreground">{videoDestaque.duracao}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </CardContent>
            </Card>
          ) : null;
        })()}

        {/* Videos Recentes */}
        {videosRecentes && videosRecentes.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-foreground mb-4">
              Vídeos Recentes
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {videosRecentes.map((video) => {
                const videoId = getYouTubeVideoId(video.url_video);
                const thumb = video.thumbnail_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);
                return (
                  <Pressable
                    key={video.id}
                    className="w-[48%]"
                    onPress={() => {
                      if (videoId) Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
                    }}
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                  >
                    <Card>
                      <CardContent className="p-0">
                        {thumb && (
                          <Image
                            source={{ uri: thumb }}
                            style={{ width: "100%", aspectRatio: 16 / 9 }}
                            contentFit="cover"
                            cachePolicy="disk"
                          />
                        )}
                        <View className="p-3">
                          <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                            {video.titulo}
                          </Text>
                          <Text className="text-xs text-muted-foreground mt-1">
                            {video.pregador || "Avivamento para as Nações"}
                          </Text>
                          {video.created_at && (
                            <Text className="text-xs text-muted-foreground mt-0.5">
                              {formatarDataRelativa(video.created_at)}
                            </Text>
                          )}
                        </View>
                      </CardContent>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Playlists */}
        {playlists && playlists.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-foreground mb-4">
              Séries e Playlists
            </Text>
            {playlists.map((playlist) => (
              <Pressable
                key={playlist.id}
                onPress={() => Linking.openURL(playlist.url_playlist)}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
                className="mb-3"
              >
                <Card>
                  <CardContent className="p-0">
                    <View className="flex-row">
                      <View className="w-24 bg-primary items-center justify-center p-4">
                        <Text className="text-3xl font-bold text-white">
                          {playlist.quantidade_videos}
                        </Text>
                        <Text className="text-xs text-white/80">vídeos</Text>
                      </View>
                      <View className="flex-1 p-4">
                        <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                          {playlist.nome}
                        </Text>
                        {playlist.descricao && (
                          <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>
                            {playlist.descricao}
                          </Text>
                        )}
                        <View className="flex-row items-center gap-1 mt-2">
                          <Text className="text-sm font-semibold text-primary">Ver Playlist</Text>
                          <Play size={14} color={iconPrimary} />
                        </View>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </>
        )}
      </View>

      <AppFooter />
    </ScrollView>
  );
}
