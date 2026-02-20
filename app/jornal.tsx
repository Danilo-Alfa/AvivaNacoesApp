import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import * as Linking from "expo-linking";
import { useQuery } from "@tanstack/react-query";
import { FileText, ExternalLink } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getUltimosJornais } from "@/services/jornalService";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";

export default function JornalScreen() {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const { data: jornais, isLoading } = useQuery({
    queryKey: ["jornais"],
    queryFn: getUltimosJornais,
    staleTime: 1000 * 60 * 60 * 24,
  });

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="bg-primary px-4 py-8 items-center">
          <Skeleton width={200} height={32} borderRadius={8} />
          <Skeleton width={260} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
        <View className="px-4 py-4">
          <Skeleton width="100%" height={200} borderRadius={12} />
          <Skeleton width="60%" height={22} style={{ marginTop: 12 }} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    );
  }

  if (!jornais || jornais.length === 0) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="bg-primary px-4 py-8 items-center">
          <Text className="text-3xl font-bold text-white mb-2 text-center">
            Jornal Aviva News
          </Text>
          <Text className="text-lg text-white/80 text-center">
            Fique por dentro das novidades da igreja
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-4 py-20">
          <FileText size={48} color="#94a3b8" />
          <Text className="text-muted-foreground mt-4">Nenhum jornal disponível</Text>
        </View>
      </ScrollView>
    );
  }

  const maisRecente = jornais[0];
  const anteriores = jornais.slice(1);

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary px-4 py-8 items-center">
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          Jornal Aviva News
        </Text>
        <Text className="text-lg text-white/80 text-center">
          Fique por dentro das novidades da igreja
        </Text>
      </View>

      <View className="px-4 py-4">
        {/* Mais Recente */}
        <Card className="mb-6">
          <CardContent>
            <View className="items-center py-4 mb-4 bg-muted rounded-lg">
              <FileText size={48} color={iconPrimary} />
              <Text className="text-sm text-muted-foreground mt-2">Última Edição</Text>
            </View>
            <Text className="text-xl font-bold text-foreground mb-1">
              {maisRecente.titulo || "Última Edição"}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4">
              {new Date(maisRecente.data + "T00:00:00").toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Pressable
              className="bg-primary rounded-lg flex-row items-center justify-center gap-2 py-3"
              onPress={() => Linking.openURL(maisRecente.url_pdf)}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <ExternalLink size={16} color="#ffffff" />
              <Text className="text-white font-medium text-sm">Abrir Jornal</Text>
            </Pressable>
          </CardContent>
        </Card>

        {/* Anteriores */}
        {anteriores.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-foreground mb-4">
              Edições Anteriores
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {anteriores.map((jornal) => (
                <Pressable
                  key={jornal.id}
                  className="w-[48%]"
                  onPress={() => Linking.openURL(jornal.url_pdf)}
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Card>
                    <CardContent className="items-center">
                      <View className="bg-muted rounded-lg p-4 mb-2 w-full items-center">
                        <FileText size={32} color={iconPrimary} />
                      </View>
                      <Text className="text-sm font-semibold text-foreground text-center" numberOfLines={2}>
                        {jornal.titulo || "Jornal"}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        {new Date(jornal.data + "T00:00:00").toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      <AppFooter />
    </ScrollView>
  );
}
