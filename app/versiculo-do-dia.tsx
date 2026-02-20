import React from "react";
import { ScrollView, View, Text, Pressable, Share } from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Share2 } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { versiculoService } from "@/services/versiculoService";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";
import type { Versiculo } from "@/types";

export default function VersiculoDoDiaScreen() {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const iconMuted = isDark ? "#94a3b8" : "#64748b";
  const { data: versiculoDoDia, isLoading: loadingDia } = useQuery({
    queryKey: ["versiculo-do-dia"],
    queryFn: () => versiculoService.getVersiculoDoDia(),
    staleTime: 1000 * 60 * 60,
  });

  const { data: anteriores, isLoading: loadingAnteriores } = useQuery({
    queryKey: ["versiculos-anteriores"],
    queryFn: () => versiculoService.getVersiculosAnteriores(6),
    staleTime: 1000 * 60 * 60,
  });

  const getTitulo = (v: Versiculo) => {
    if (v.titulo) return v.titulo;
    const d = new Date(v.data + "T00:00:00");
    return `Versiculo do dia ${d.getDate()} de ${d.toLocaleDateString("pt-BR", { month: "long" })}`;
  };

  const handleShare = async () => {
    if (!versiculoDoDia) return;
    try {
      await Share.share({
        title: versiculoDoDia.titulo || "Versiculo do Dia",
        message: `Confira o versiculo do dia! ${versiculoDoDia.url_post}`,
      });
    } catch {}
  };

  const isLoading = loadingDia || loadingAnteriores;

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background p-4">
        <Skeleton width="100%" height={300} borderRadius={12} />
        <View className="mt-4">
          <Skeleton width="80%" height={20} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary px-4 py-8 items-center">
        <View className="bg-white/20 px-4 py-2 rounded-full mb-4">
          <Text className="text-white text-xs font-medium">Palavra de Deus</Text>
        </View>
        <Text className="text-2xl font-bold text-white text-center mb-2">
          Versiculos Inspiradores
        </Text>
        <Text className="text-sm text-white/80 text-center">
          "A palavra de Deus e viva e eficaz"
        </Text>
      </View>

      <View className="px-4 py-6">
        {/* Versiculo do Dia */}
        {versiculoDoDia ? (
          <Card className="mb-6">
            <CardContent>
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
                  <BookOpen size={16} color={iconPrimary} />
                </View>
                <Text className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Versiculo do Dia
                </Text>
              </View>

              {versiculoDoDia.url_imagem && (
                <Image
                  source={{ uri: versiculoDoDia.url_imagem }}
                  style={{ width: "100%", height: 250 }}
                  contentFit="cover"
                  cachePolicy="disk"
                  className="rounded-xl mb-3"
                />
              )}

              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}>
                  {getTitulo(versiculoDoDia)}
                </Text>
                <Pressable
                  className="flex-row items-center gap-1 px-2 py-1"
                  onPress={handleShare}
                >
                  <Share2 size={14} color={iconMuted} />
                  <Text className="text-xs text-muted-foreground">Compartilhar</Text>
                </Pressable>
              </View>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="items-center py-8">
              <Text className="text-muted-foreground">Nenhum versiculo disponivel</Text>
            </CardContent>
          </Card>
        )}

        {/* Anteriores */}
        {anteriores && anteriores.length > 0 && (
          <>
            <Text className="text-xl font-bold text-foreground mb-4 text-center">
              Versiculos Anteriores
            </Text>
            {anteriores.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => v.url_post && Linking.openURL(v.url_post)}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
                className="mb-3"
              >
                <Card>
                  <CardContent>
                    <View className="flex-row items-center gap-2 mb-2">
                      <View className="w-6 h-6 bg-primary/10 rounded items-center justify-center">
                        <BookOpen size={12} color={iconPrimary} />
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        {new Date(v.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - Versiculo do Dia
                      </Text>
                    </View>
                    {v.url_imagem && (
                      <Image
                        source={{ uri: v.url_imagem }}
                        style={{ width: "100%", height: 180 }}
                        contentFit="cover"
                        cachePolicy="disk"
                        className="rounded-xl mb-2"
                      />
                    )}
                    <Pressable
                      className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center gap-2 self-start"
                      onPress={() => v.url_post && Linking.openURL(v.url_post)}
                    >
                      <Text className="text-white text-xs font-medium">Ver no Facebook</Text>
                    </Pressable>
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
