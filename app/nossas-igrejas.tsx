import React from "react";
import { FlatList, View, Text, Pressable } from "react-native";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getIgrejasAtivas } from "@/services/igrejaService";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";
import type { Igreja } from "@/types";

function IgrejaCard({ igreja }: { igreja: Igreja }) {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const openMaps = () => {
    if (igreja.latitude && igreja.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${igreja.latitude},${igreja.longitude}`
      );
    }
  };

  return (
    <Card className="mx-4 mb-4">
      {igreja.imagem_url && (
        <Image
          source={{ uri: igreja.imagem_url }}
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          contentFit="cover"
          cachePolicy="disk"
        />
      )}
      <CardContent>
        <Text className="text-xl font-bold text-foreground mb-1">
          {igreja.nome}
          {igreja.bairro ? ` - ${igreja.bairro}` : ""}
        </Text>
        <View className="h-0.5 bg-primary/30 my-3" />

        <View className="flex-row items-start gap-2 mb-2">
          <MapPin size={16} color={iconPrimary} />
          <View className="flex-1">
            <Text className="text-sm font-medium text-foreground">Endereço</Text>
            <Text className="text-sm text-muted-foreground">
              {igreja.endereco}
              {igreja.cidade ? `\n${igreja.cidade}${igreja.cep ? `, CEP ${igreja.cep}` : ""}` : ""}
            </Text>
          </View>
        </View>

        {(igreja.telefone || igreja.whatsapp) && (
          <View className="flex-row items-start gap-2 mb-2">
            <Phone size={16} color={iconPrimary} />
            <View>
              <Text className="text-sm font-medium text-foreground">Telefone</Text>
              <Text className="text-sm text-muted-foreground">
                {igreja.telefone || igreja.whatsapp}
              </Text>
            </View>
          </View>
        )}

        {igreja.horarios && (
          <View className="flex-row items-start gap-2 mb-2">
            <Clock size={16} color={iconPrimary} />
            <View>
              <Text className="text-sm font-medium text-foreground">Horários</Text>
              <Text className="text-sm text-muted-foreground">{igreja.horarios}</Text>
            </View>
          </View>
        )}

        {igreja.pastor && (
          <View className="mt-3 pt-3 border-t border-border">
            <Text className="text-sm font-medium text-foreground">
              Pastor(a): {igreja.pastor}
            </Text>
          </View>
        )}

        <Pressable
          className={`mt-4 flex-row items-center justify-center gap-2 py-3 rounded-lg ${
            igreja.latitude ? "bg-primary" : "bg-muted"
          }`}
          onPress={openMaps}
          disabled={!igreja.latitude}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <ExternalLink size={16} color={igreja.latitude ? "#ffffff" : "#94a3b8"} />
          <Text className={`text-sm font-medium ${igreja.latitude ? "text-white" : "text-muted-foreground"}`}>
            {igreja.latitude ? "Ver no Google Maps" : "Localização indisponível"}
          </Text>
        </Pressable>
      </CardContent>
    </Card>
  );
}

export default function NossasIgrejasScreen() {
  const { data: igrejas, isLoading } = useQuery({
    queryKey: ["igrejas"],
    queryFn: getIgrejasAtivas,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        {[1, 2, 3].map((i) => (
          <View key={i} className="mb-4">
            <Skeleton width="100%" height={180} borderRadius={12} />
            <View className="mt-3">
              <Skeleton width="60%" height={20} />
              <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={igrejas}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <IgrejaCard igreja={item} />}
      ListHeaderComponent={
        <View className="bg-primary px-4 py-8 items-center mb-4">
          <Text className="text-3xl font-bold text-white mb-2 text-center">
            Nossas Igrejas
          </Text>
          <Text className="text-lg text-white/80 text-center">
            Encontre a sede mais próxima de você
          </Text>
        </View>
      }
      ListFooterComponent={<AppFooter />}
      ListEmptyComponent={
        <View className="items-center py-20">
          <MapPin size={48} color="#94a3b8" />
          <Text className="text-muted-foreground mt-4">Nenhuma igreja encontrada</Text>
        </View>
      }
    />
  );
}
