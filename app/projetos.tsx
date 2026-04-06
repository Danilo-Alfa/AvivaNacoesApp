import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProjetosAtivos } from "@/services/projetoService";
import { AppFooter } from "@/components/AppFooter";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";
import type { Projeto } from "@/types";

// ── Local images map (fallback for offline / faster loading) ──

const localImages: Record<string, any> = {
  arrecadacao: require("../assets/projetos/arrecadacao.jpeg"),
  bazar: require("../assets/projetos/bazar.jpeg"),
  cantina: require("../assets/projetos/cantina.jpeg"),
  festival: require("../assets/projetos/festival.jpeg"),
  inscricoes: require("../assets/projetos/inscricoes.jpeg"),
  "levitas mulheres": require("../assets/projetos/levitas-mulheres.jpeg"),
  levitas: require("../assets/projetos/levitas.jpeg"),
  midia: require("../assets/projetos/midia.jpeg"),
  ornamentacao: require("../assets/projetos/ornamentacao.jpeg"),
  professores: require("../assets/projetos/professores.jpeg"),
  "retiro espiritual": require("../assets/projetos/retiro-espiritual.jpeg"),
  som: require("../assets/projetos/som.jpeg"),
  "viagem missionaria": require("../assets/projetos/viagem-missionaria.jpeg"),
};

/** Try to find a local image matching the projeto's imagem_url filename */
function getImageSource(projeto: Projeto) {
  if (projeto.imagem_url) {
    // Extract filename without extension from URL
    const filename = projeto.imagem_url
      .split("/")
      .pop()
      ?.replace(/\.\w+$/, "")
      ?.toLowerCase();

    if (filename && localImages[filename]) {
      return localImages[filename];
    }

    // Fallback: use remote URL
    return { uri: projeto.imagem_url };
  }
  return null;
}

// ── Skeleton Card ──

function ProjetoCardSkeleton({
  index,
  c,
}: {
  index: number;
  c: Record<string, string>;
}) {
  return (
    <View
      style={[
        s.card,
        { backgroundColor: c.cardBg, borderColor: c.cardBorder },
      ]}
    >
      <Skeleton width="100%" height={220} borderRadius={0} />
      <View style={s.cardBody}>
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton
          width="75%"
          height={28}
          borderRadius={8}
          style={{ marginTop: 12 }}
        />
        <Skeleton
          width="100%"
          height={14}
          borderRadius={6}
          style={{ marginTop: 12 }}
        />
        <Skeleton
          width="85%"
          height={14}
          borderRadius={6}
          style={{ marginTop: 6 }}
        />
        <Skeleton
          width="65%"
          height={14}
          borderRadius={6}
          style={{ marginTop: 6 }}
        />
        <View style={{ marginTop: 16, gap: 8 }}>
          <Skeleton width="60%" height={12} borderRadius={6} />
          <Skeleton width="50%" height={12} borderRadius={6} />
          <Skeleton width="45%" height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

// ── Projeto Card ──

function ProjetoCard({
  projeto,
  c,
}: {
  projeto: Projeto;
  c: Record<string, string>;
}) {
  const imageSource = getImageSource(projeto);

  return (
    <View
      style={[
        s.card,
        { backgroundColor: c.cardBg, borderColor: c.cardBorder },
      ]}
    >
      {/* Image */}
      {imageSource ? (
        <Image
          source={imageSource}
          style={s.cardImage}
          contentFit="cover"
          cachePolicy="disk"
          transition={300}
        />
      ) : (
        <View style={[s.cardImagePlaceholder, { backgroundColor: c.primaryLight }]}>
          <Text style={[s.placeholderText, { color: c.primary }]}>
            {projeto.nome}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={s.cardBody}>
        {projeto.categoria && (
          <View
            style={[
              s.categoryBadge,
              { backgroundColor: c.primaryLight },
            ]}
          >
            <Text style={[s.categoryText, { color: c.primary }]}>
              {projeto.categoria}
            </Text>
          </View>
        )}

        <Text style={[s.cardTitle, { color: c.foreground }]}>
          {projeto.nome}
        </Text>

        {projeto.descricao && (
          <Text style={[s.cardDescription, { color: c.muted }]}>
            {projeto.descricao}
          </Text>
        )}

        {/* Bullet points */}
        <View style={s.bulletList}>
          {projeto.objetivo && (
            <View style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: c.accent }]} />
              <Text style={[s.bulletText, { color: c.foreground }]}>
                {projeto.objetivo}
              </Text>
            </View>
          )}
          {projeto.publico_alvo && (
            <View style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: c.accent }]} />
              <Text style={[s.bulletText, { color: c.foreground }]}>
                Público: {projeto.publico_alvo}
              </Text>
            </View>
          )}
          {projeto.frequencia && (
            <View style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: c.accent }]} />
              <Text style={[s.bulletText, { color: c.foreground }]}>
                {projeto.frequencia}
              </Text>
            </View>
          )}
          {projeto.como_participar && (
            <View style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: c.accent }]} />
              <Text style={[s.bulletText, { color: c.foreground }]}>
                {projeto.como_participar}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ──

export default function ProjetosScreen() {
  const { isDark } = useThemeForScreen();
  const screenReady = useScreenReady();

  const c = useMemo(() => ({
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
  }), [isDark]);

  const { data: projetos, isLoading } = useQuery({
    queryKey: ["projetos"],
    queryFn: getProjetosAtivos,
    staleTime: 1000 * 60 * 60 * 12,
  });

  // ── Skeleton Loading ──

  if (!screenReady || isLoading) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 48 }}>
          {/* Hero Skeleton */}
          <View style={{ alignItems: "center", marginBottom: 64 }}>
            <Skeleton width={200} height={48} borderRadius={8} />
            <View style={{ height: 16 }} />
            <Skeleton width={300} height={20} borderRadius={8} />
          </View>

          {/* Cards Skeleton */}
          <View style={{ gap: 24 }}>
            {[0, 1, 2].map((i) => (
              <ProjetoCardSkeleton key={i} index={i} c={c} />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Main Content ──

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 48 }}>
        {/* Hero Section */}
        <View style={{ alignItems: "center", marginBottom: 64 }}>
          <Text style={[s.heroTitle, { color: c.primary }]}>Projetos</Text>
          <Text style={[s.heroSubtitle, { color: c.muted }]}>
            Conheça os projetos sociais e iniciativas que transformam vidas
          </Text>
        </View>

        {/* Project Cards */}
        <View style={{ gap: 24 }}>
          {projetos?.map((projeto) => (
            <ProjetoCard key={projeto.id} projeto={projeto} c={c} />
          ))}
        </View>

        {/* Empty state */}
        {projetos?.length === 0 && (
          <View style={[s.emptyState, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={[s.emptyTitle, { color: c.foreground }]}>
              Nenhum projeto disponível
            </Text>
            <Text style={[s.emptyDesc, { color: c.muted }]}>
              Em breve novos projetos serão adicionados.
            </Text>
          </View>
        )}
      </View>

      <AppFooter />
    </ScrollView>
  );
}

// ── Styles ──

const s = StyleSheet.create({
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
  cardImage: {
    width: "100%",
    height: 220,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "600",
  },
  cardBody: {
    padding: 24,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 48,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
