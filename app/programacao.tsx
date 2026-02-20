import React from "react";
import { ScrollView, View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, AlertCircle, Church, Music } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProgramacaoAtiva } from "@/services/programacaoService";
import { AppFooter } from "@/components/AppFooter";
import { DIAS_SEMANA } from "@/lib/constants";
import { useTheme } from "@/hooks/useTheme";

export default function ProgramacaoScreen() {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const iconMuted = isDark ? "#94a3b8" : "#64748b";

  const { data: programacao, isLoading } = useQuery({
    queryKey: ["programacao"],
    queryFn: getProgramacaoAtiva,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  const diasSemana = DIAS_SEMANA.map((dia) => ({
    dia: dia.nome,
    atividades: (programacao || [])
      .filter((p) => p.dia_semana === dia.valor)
      .map((p) => ({ titulo: p.titulo, horario: p.horario, local: p.local || "" })),
  }));

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background p-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View key={i} className="mb-3">
            <Skeleton width="100%" height={80} borderRadius={12} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary px-4 py-8 items-center">
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          Programação Semanal
        </Text>
        <Text className="text-lg text-white/80 text-center">
          Confira os horários dos nossos cultos e atividades
        </Text>
      </View>

      <View className="px-4 py-4">
        {diasSemana.map((dia) => (
          <Card key={dia.dia} className={`mb-3 ${dia.atividades.length > 0 ? "border-primary/30" : ""}`}>
            <CardContent>
              <Text className={`text-lg font-bold text-center mb-2 ${dia.atividades.length > 0 ? "text-primary" : "text-muted-foreground"}`}>
                {dia.dia}
              </Text>
              {dia.atividades.length > 0 && (
                <View className="w-12 h-1 bg-primary/50 rounded-full self-center mb-3" />
              )}
              {dia.atividades.length > 0 ? (
                dia.atividades.map((a, i) => (
                  <View key={i} className="bg-muted/50 rounded-lg p-3 mb-2">
                    <Text className="text-sm font-semibold text-foreground mb-1">
                      {a.titulo}
                    </Text>
                    <View className="flex-row items-center gap-1 mb-1">
                      <Clock size={12} color={iconMuted} />
                      <Text className="text-xs text-muted-foreground">{a.horario}</Text>
                    </View>
                    {a.local ? (
                      <View className="flex-row items-center gap-1">
                        <MapPin size={12} color={iconMuted} />
                        <Text className="text-xs text-muted-foreground">{a.local}</Text>
                      </View>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text className="text-xs text-muted-foreground text-center py-2">
                  Sem atividades programadas
                </Text>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Informacoes Importantes */}
        <View className="mt-4 mb-4">
          <Text className="text-2xl font-bold text-foreground text-center mb-4">
            Informações Importantes
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 items-center">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                <AlertCircle size={28} color={iconPrimary} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">
                Pontualidade
              </Text>
              <Text className="text-xs text-muted-foreground text-center mt-1">
                Chegue com antecedência
              </Text>
            </View>
            <View className="flex-1 items-center">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                <Church size={28} color={iconPrimary} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">
                Igreja Sede
              </Text>
              <Text className="text-xs text-muted-foreground text-center mt-1">
                Cultos na sede principal
              </Text>
            </View>
            <View className="flex-1 items-center">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                <Music size={28} color={iconPrimary} />
              </View>
              <Text className="text-sm font-semibold text-foreground text-center">
                Louvor
              </Text>
              <Text className="text-xs text-muted-foreground text-center mt-1">
                Momento de adoração
              </Text>
            </View>
          </View>
        </View>
      </View>

      <AppFooter />
    </ScrollView>
  );
}
