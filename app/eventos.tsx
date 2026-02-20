import React from "react";
import { ScrollView, View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Star } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Image } from "expo-image";
import { getEventosFuturos, getEventosDestaque } from "@/services/eventoService";
import { AppFooter } from "@/components/AppFooter";
import { formatarPeriodo, formatarHorario } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import type { Evento } from "@/types";

function EventoCard({ evento, destaque = false }: { evento: Evento; destaque?: boolean }) {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  return (
    <Card className="mb-4">
      {evento.imagem_url && (
        <Image
          source={{ uri: evento.imagem_url }}
          style={{ width: "100%", height: destaque ? 220 : 160 }}
          contentFit="cover"
          cachePolicy="disk"
        />
      )}
      <CardContent>
        {destaque && (
          <View className="mb-2">
            <Badge label="DESTAQUE" icon={<Star size={10} color="#ffffff" />} />
          </View>
        )}
        <Text className={`${destaque ? "text-2xl" : "text-xl"} font-bold text-foreground mb-1`}>
          {evento.titulo}
        </Text>
        {evento.descricao && (
          <Text className="text-sm text-muted-foreground mb-3" numberOfLines={3}>
            {evento.descricao}
          </Text>
        )}
        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
            <Calendar size={16} color={iconPrimary} />
          </View>
          <Text className="text-sm text-foreground">
            {formatarPeriodo(evento.data_inicio, evento.data_fim)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
            <Clock size={16} color={iconPrimary} />
          </View>
          <Text className="text-sm text-foreground">
            {formatarHorario(evento.data_inicio, evento.data_fim)}
          </Text>
        </View>
        {evento.local && (
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-primary/10 rounded-lg items-center justify-center">
              <MapPin size={16} color={iconPrimary} />
            </View>
            <Text className="text-sm text-foreground">{evento.local}</Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

export default function EventosScreen() {
  const { data: eventosFuturos, isLoading: loadingFuturos } = useQuery({
    queryKey: ["eventos-futuros"],
    queryFn: getEventosFuturos,
    staleTime: 1000 * 60 * 60,
  });

  const { data: eventosDestaque, isLoading: loadingDestaque } = useQuery({
    queryKey: ["eventos-destaque"],
    queryFn: getEventosDestaque,
    staleTime: 1000 * 60 * 60,
  });

  const isLoading = loadingFuturos || loadingDestaque;

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="bg-primary px-4 py-8 items-center">
          <Skeleton width={200} height={32} borderRadius={8} />
          <Skeleton width={260} height={16} borderRadius={8} style={{ marginTop: 8 }} />
        </View>
        <View className="px-4 py-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mb-4">
              <Skeleton width="100%" height={160} borderRadius={12} />
              <Skeleton width="70%" height={20} style={{ marginTop: 12 }} />
              <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
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
          Eventos
        </Text>
        <Text className="text-lg text-white/80 text-center">
          Fique por dentro dos nossos próximos eventos
        </Text>
      </View>

      <View className="px-4 py-4">
        {eventosDestaque && eventosDestaque.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-foreground mb-4">
              Eventos em Destaque
            </Text>
            {eventosDestaque.map((e) => (
              <EventoCard key={e.id} evento={e} destaque />
            ))}
          </>
        )}

        {eventosFuturos && eventosFuturos.length > 0 && (
          <>
            <Text className="text-2xl font-bold text-foreground mb-4 mt-2">
              Próximos Eventos
            </Text>
            {eventosFuturos.slice(0, 6).map((e) => (
              <EventoCard key={e.id} evento={e} />
            ))}
          </>
        )}

        {(!eventosFuturos || eventosFuturos.length === 0) &&
          (!eventosDestaque || eventosDestaque.length === 0) && (
            <View className="items-center py-20">
              <Calendar size={48} color="#94a3b8" />
              <Text className="text-muted-foreground mt-4 text-center">
                Nenhum evento futuro agendado
              </Text>
            </View>
          )}
      </View>

      <AppFooter />
    </ScrollView>
  );
}
