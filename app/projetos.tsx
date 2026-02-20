import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProjetosAtivos } from "@/services/projetoService";
import { AppFooter } from "@/components/AppFooter";
import type { Projeto } from "@/types";

export default function ProjetosScreen() {
  const { data: projetos, isLoading } = useQuery({
    queryKey: ["projetos"],
    queryFn: getProjetosAtivos,
    staleTime: 1000 * 60 * 60 * 12,
  });

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="bg-primary px-4 py-8 items-center">
          <Skeleton width={180} height={32} borderRadius={8} />
          <Skeleton width={250} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
        <View className="px-4 py-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mb-6">
              <Skeleton width="100%" height={200} borderRadius={12} />
              <Skeleton width="40%" height={16} style={{ marginTop: 12 }} />
              <Skeleton width="70%" height={22} style={{ marginTop: 8 }} />
              <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary px-4 py-8 items-center">
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          Nossos Projetos
        </Text>
        <Text className="text-lg text-white/80 text-center">
          Conheça as iniciativas que transformam vidas
        </Text>
      </View>

      <View className="px-4 py-4">
        {projetos?.map((projeto) => (
          <Card key={projeto.id} className="mb-6">
            {projeto.imagem_url && (
              <Image
                source={{ uri: projeto.imagem_url }}
                style={{ width: "100%", height: 200 }}
                contentFit="cover"
                cachePolicy="disk"
              />
            )}
            <CardContent>
              {projeto.categoria && (
                <View className="bg-primary/10 rounded-full px-3 py-1 self-start mb-2">
                  <Text className="text-xs font-medium text-primary">{projeto.categoria}</Text>
                </View>
              )}
              <Text className="text-xl font-bold text-foreground mb-2">
                {projeto.nome}
              </Text>
              {projeto.descricao && (
                <Text className="text-sm text-muted-foreground mb-3 leading-5">
                  {projeto.descricao}
                </Text>
              )}
              {projeto.objetivo && (
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-2 h-2 bg-accent rounded-full" />
                  <Text className="text-sm font-medium text-foreground">{projeto.objetivo}</Text>
                </View>
              )}
              {projeto.publico_alvo && (
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="w-2 h-2 bg-accent rounded-full" />
                  <Text className="text-sm font-medium text-foreground">Público: {projeto.publico_alvo}</Text>
                </View>
              )}
              {projeto.frequencia && (
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 bg-accent rounded-full" />
                  <Text className="text-sm font-medium text-foreground">{projeto.frequencia}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        ))}
      </View>

      <AppFooter />
    </ScrollView>
  );
}
