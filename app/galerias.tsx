import React from "react";
import { FlatList, View, Text, Pressable } from "react-native";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Images, ExternalLink } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getUltimasGalerias } from "@/services/galeriaService";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";
import type { Galeria } from "@/types";

export default function GaleriasScreen() {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const { data: galerias, isLoading } = useQuery({
    queryKey: ["galerias"],
    queryFn: getUltimasGalerias,
    staleTime: 1000 * 60 * 60 * 2,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-primary px-4 py-8 items-center">
          <Skeleton width={160} height={32} borderRadius={8} />
          <Skeleton width={240} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
        <View className="p-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mb-4">
              <Skeleton width="100%" height={180} borderRadius={12} />
              <Skeleton width="60%" height={18} style={{ marginTop: 8 }} />
              <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={galerias}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 16 }}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      ListHeaderComponent={
        <>
          {/* Hero */}
          <View className="bg-primary px-4 py-8 items-center mb-4">
            <Text className="text-3xl font-bold text-white mb-2 text-center">
              Galerias de Fotos
            </Text>
            <Text className="text-lg text-white/80 text-center">
              Confira os melhores momentos da nossa igreja
            </Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          className="flex-1 mb-3"
          onPress={() => Linking.openURL(item.url_album)}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Card>
            <CardContent className="p-0">
              {item.capa_url ? (
                <Image
                  source={{ uri: item.capa_url }}
                  style={{ width: "100%", aspectRatio: 16 / 9 }}
                  contentFit="cover"
                  cachePolicy="disk"
                />
              ) : (
                <View className="bg-primary items-center justify-center" style={{ aspectRatio: 16 / 9 }}>
                  <Images size={32} color="#ffffff" />
                </View>
              )}
              <View className="p-3">
                <Text className="text-base font-bold text-foreground" numberOfLines={2}>
                  {item.titulo}
                </Text>
                {item.descricao && (
                  <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>
                    {item.descricao}
                  </Text>
                )}
                <Text className="text-xs text-muted-foreground mt-1">
                  {new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <View className="flex-row items-center gap-1 mt-2">
                  <ExternalLink size={12} color={iconPrimary} />
                  <Text className="text-xs font-medium text-primary">Ver Álbum</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Pressable>
      )}
      ListFooterComponent={<AppFooter />}
      ListEmptyComponent={
        <View className="items-center py-20">
          <Images size={48} color="#94a3b8" />
          <Text className="text-muted-foreground mt-4">Nenhuma galeria disponível</Text>
        </View>
      }
    />
  );
}
