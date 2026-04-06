import React, { useMemo, useCallback } from "react";
import {
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Images, ExternalLink } from "lucide-react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { getUltimasGalerias } from "@/services/galeriaService";
import { AppFooter } from "@/components/AppFooter";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";
import { useImagePrefetch } from "@/hooks/useImagePrefetch";
import type { Galeria } from "@/types";

// ── Skeleton Card ──

function GaleriaCardSkeleton({ c }: { c: Record<string, string> }) {
  return (
    <View
      style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}
    >
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={s.cardBody}>
        <Skeleton width="75%" height={22} borderRadius={8} />
        <Skeleton
          width="100%"
          height={14}
          borderRadius={6}
          style={{ marginTop: 8 }}
        />
        <Skeleton
          width={120}
          height={12}
          borderRadius={6}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}

// ── Memoized Gallery Card ──

const GaleriaCard = React.memo(function GaleriaCard({
  item,
  c,
}: {
  item: Galeria;
  c: Record<string, string>;
}) {
  const handlePress = useCallback(() => {
    Linking.openURL(item.url_album);
  }, [item.url_album]);

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => pressed && { opacity: 0.85 }}
      >
        <View
          style={[
            s.card,
            { backgroundColor: c.cardBg, borderColor: c.cardBorder },
          ]}
        >
          {/* Capa da Galeria */}
          <View style={s.imageContainer}>
            {item.capa_url ? (
              <Image
                source={{ uri: item.capa_url }}
                style={s.cardImage}
                contentFit="cover"
                cachePolicy="disk"
                recyclingKey={item.id}
              />
            ) : (
              <View
                style={[
                  s.cardImagePlaceholder,
                  { backgroundColor: c.primary },
                ]}
              >
                <Images size={48} color="#ffffff" />
              </View>
            )}

            {/* Overlay com ícone de link externo */}
            <View style={s.imageOverlay}>
              <ExternalLink size={24} color="#ffffff" />
            </View>
          </View>

          {/* Informações */}
          <View style={s.cardBody}>
            <Text
              style={[s.cardTitle, { color: c.foreground }]}
              numberOfLines={2}
            >
              {item.titulo}
            </Text>
            {item.descricao && (
              <Text
                style={[s.cardDescription, { color: c.muted }]}
                numberOfLines={2}
              >
                {item.descricao}
              </Text>
            )}
            <Text style={[s.cardDate, { color: c.muted }]}>
              {new Date(item.data + "T00:00:00").toLocaleDateString(
                "pt-BR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
});

// ── Main Screen ──

export default function GaleriasScreen() {
  const { isDark } = useThemeForScreen();
  const screenReady = useScreenReady();

  const c = useMemo(
    () => ({
      bg: isDark ? "#0E131B" : "#FFFFFF",
      foreground: isDark ? "#FAFAFA" : "#1D2530",
      muted: isDark ? "#9DA4AF" : "#627084",
      primary: isDark ? "#367EE2" : "#123E7D",
      cardBg: isDark ? "#171D26" : "#FFFFFF",
      cardBorder: isDark ? "#29313D" : "#E2E5E9",
      overlay: "rgba(0,0,0,0.20)",
    }),
    [isDark]
  );

  const { data: galerias, isLoading } = useQuery({
    queryKey: ["galerias"],
    queryFn: getUltimasGalerias,
    staleTime: 1000 * 60 * 60 * 2,
  });

  const galeriaImageUrls = useMemo(
    () => galerias?.map((g) => g.capa_url) ?? [],
    [galerias]
  );
  useImagePrefetch(galeriaImageUrls);

  const renderItem = useCallback(
    ({ item }: { item: Galeria }) => <GaleriaCard item={item} c={c} />,
    [c]
  );

  const keyExtractor = useCallback((item: Galeria) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View style={s.heroSection}>
        <Text style={[s.heroTitle, { color: c.primary }]}>
          Galerias de Fotos
        </Text>
        <Text style={[s.heroSubtitle, { color: c.muted }]}>
          Reviva os melhores momentos da nossa igreja
        </Text>
      </View>
    ),
    [c.primary, c.muted]
  );

  // ── Skeleton Loading ──

  if (!screenReady || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {/* Hero Skeleton */}
        <View style={s.heroSection}>
          <Skeleton width={200} height={48} borderRadius={8} />
          <View style={{ height: 16 }} />
          <Skeleton width={300} height={20} borderRadius={8} />
        </View>

        {/* Cards Skeleton */}
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <GaleriaCardSkeleton key={i} c={c} />
          ))}
        </View>
      </View>
    );
  }

  // ── Main Content ──

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: c.bg }}
      data={galerias}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      renderItem={renderItem}
      ListFooterComponent={<AppFooter />}
      ListEmptyComponent={
        <View style={s.emptyState}>
          <Images size={48} color={c.muted} />
          <Text style={[s.emptyText, { color: c.muted }]}>
            Nenhuma galeria disponível no momento
          </Text>
        </View>
      }
      maxToRenderPerBatch={5}
      windowSize={7}
      removeClippedSubviews
      initialNumToRender={4}
    />
  );
}

// ── Styles ──

const s = StyleSheet.create({
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 48,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 500,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  cardImagePlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
