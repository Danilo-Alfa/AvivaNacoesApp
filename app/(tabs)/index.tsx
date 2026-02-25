import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Users,
  Calendar,
  Heart,
  BookOpen,
  Church,
} from "lucide-react-native";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { LazySection } from "@/components/LazySection";
import { Skeleton } from "@/components/ui/Skeleton";
import { AppFooter } from "@/components/AppFooter";
import { versiculoService } from "@/services/versiculoService";
import { carouselService } from "@/services/carouselService";
import { YOUTUBE_VIDEO_ID, getProximoCulto } from "@/lib/constants";
import type { Versiculo } from "@/types";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";
import { useImagePrefetch } from "@/hooks/useImagePrefetch";

const MINISTRY_LOGOS = [
  { nome: "Infantil", logo: require("../../assets/logos/resgatando.png") },
  { nome: "Jovens", logo: require("../../assets/logos/avivajovens.png") },
  { nome: "TV Aviva", logo: require("../../assets/logos/tvaviva.png") },
  { nome: "Web Rádio", logo: require("../../assets/logos/webradio.png") },
  { nome: "JOAN", logo: require("../../assets/logos/joan.png") },
  { nome: "ABER", logo: require("../../assets/logos/ABER.png") },
];

const EXPLORE_ITEMS = [
  { icon: Users, title: "Quem somos", desc: "Venha nos conhecer", route: "/quem-somos" as const },
  { icon: Calendar, title: "Eventos", desc: "Participe dos nossos eventos", route: "/eventos" as const },
  { icon: Church, title: "Nossas Igrejas", desc: "Encontre a sede mais próxima", route: "/nossas-igrejas" as const },
  { icon: Heart, title: "Projetos", desc: "Conheça nossos projetos sociais", route: "/projetos" as const },
];

const BULLET_ITEMS = [
  "Cultos dinâmicos e relevantes",
  "Ministérios para todas as idades",
  "Projetos sociais que impactam vidas",
  "Comunidade acolhedora e familiar",
];

// ── Memoized Sub-Components ──

const CultoCard = React.memo(function CultoCard({
  proximoCulto,
  c,
}: {
  proximoCulto: { nome: string; horario: string; local: string };
  c: Record<string, string>;
}) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
      <View style={[styles.cultoCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
        <View style={styles.cultoColumn}>
          <Text style={[styles.cultoLabel, { color: c.muted }]}>Próximo Culto</Text>
          <Text style={[styles.cultoValue, { color: c.foreground }]}>{proximoCulto.nome}</Text>
        </View>
        <View style={[styles.cultoColumn, styles.cultoDivider, { borderColor: c.cardBorder }]}>
          <Text style={[styles.cultoLabel, { color: c.muted }]}>Horário</Text>
          <Text style={[styles.cultoValue, { color: c.foreground }]}>{proximoCulto.horario}</Text>
        </View>
        <View style={styles.cultoColumn}>
          <Text style={[styles.cultoLabel, { color: c.muted }]}>Local</Text>
          <Text style={[styles.cultoValue, { color: c.foreground }]}>
            {proximoCulto.local}
          </Text>
        </View>
      </View>
    </View>
  );
});

const ExploreCard = React.memo(function ExploreCard({
  item,
  cardWidth,
  c,
  onPress,
}: {
  item: (typeof EXPLORE_ITEMS)[number];
  cardWidth: number;
  c: Record<string, string>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.exploreCard, { width: cardWidth, backgroundColor: c.cardBg, borderColor: c.softBorder }]}
    >
      <View style={[styles.exploreIconBg, { backgroundColor: c.iconBg }]}>
        <item.icon size={24} color={c.primary} />
      </View>
      <Text style={[styles.exploreTitle, { color: c.foreground }]}>{item.title}</Text>
      <Text style={[styles.exploreDesc, { color: c.muted }]}>{item.desc}</Text>
    </Pressable>
  );
});

const MinistryItem = React.memo(function MinistryItem({
  item,
  logoWidth,
  c,
  onPress,
}: {
  item: (typeof MINISTRY_LOGOS)[number];
  logoWidth: number;
  c: Record<string, string>;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.ministerioItem, { width: logoWidth }]}>
      <View style={[styles.ministerioLogoBg, { backgroundColor: c.mutedBg }]}>
        <Image
          source={item.logo}
          style={{ width: 40, height: 40 }}
          contentFit="contain"
        />
      </View>
      <Text style={[styles.ministerioName, { color: c.muted }]}>{item.nome}</Text>
    </Pressable>
  );
});

// ── Main Screen ──

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isDark } = useThemeForScreen();
  const screenReady = useScreenReady();
  const [proximoCulto, setProximoCulto] = useState(getProximoCulto());
  const [versiculoAspect, setVersiculoAspect] = useState(4 / 5);

  const { data: versiculoDoDia, isLoading: loadingVersiculo } = useQuery({
    queryKey: ["versiculo-do-dia"],
    queryFn: () => versiculoService.getVersiculoDoDia(),
    staleTime: 1000 * 60 * 60,
  });

  const { data: carouselPhotos } = useQuery({
    queryKey: ["carousel-fotos"],
    queryFn: () => carouselService.getFotosAtivas(),
    staleTime: 1000 * 60 * 60,
  });

  useImagePrefetch(useMemo(() => [versiculoDoDia?.url_imagem], [versiculoDoDia]));

  const carouselImageUrls = useMemo(
    () => carouselPhotos?.map((f) => f.url_imagem) ?? [],
    [carouselPhotos]
  );
  useImagePrefetch(carouselImageUrls);

  useEffect(() => {
    const interval = setInterval(() => {
      setProximoCulto(getProximoCulto());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTituloVersiculo = useCallback((versiculo: Versiculo) => {
    if (versiculo.titulo) return versiculo.titulo;
    const dataObj = new Date(versiculo.data + "T00:00:00");
    const dia = dataObj.getDate();
    const mes = dataObj.toLocaleDateString("pt-BR", { month: "long" });
    return `Versículo do dia ${dia} de ${mes}`;
  }, []);

  const [scrollY, setScrollY] = useState(0);
  const { height: screenHeight } = useWindowDimensions();

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollY(e.nativeEvent.contentOffset.y);
    },
    []
  );

  const cardWidth = useMemo(() => (width - 48) / 2, [width]);
  const logoWidth = useMemo(() => (width - 80) / 3, [width]);
  const videoHeight = useMemo(() => (width - 32) * 9 / 16, [width]);

  const c = useMemo(
    () => ({
      bg: isDark ? "#0E131B" : "#FFFFFF",
      foreground: isDark ? "#FAFAFA" : "#1D2530",
      muted: isDark ? "#9DA4AF" : "#627084",
      primary: isDark ? "#367EE2" : "#123E7D",
      cardBg: isDark ? "#171D26" : "#FFFFFF",
      cardBorder: isDark ? "#29313D" : "#E2E5E9",
      softBorder: isDark ? "#29313D" : "#E2E5E9",
      mutedBg: isDark ? "#252C37" : "#F3F5F6",
      iconBg: isDark ? "rgba(54,126,226,0.10)" : "rgba(18,62,125,0.10)",
      sectionBg: isDark ? "rgba(37,44,55,0.3)" : "rgba(243,245,246,0.3)",
      outlineBg: isDark ? "#0E131B" : "#FFFFFF",
      outlineBorder: isDark ? "#29313D" : "#E2E5E9",
    }),
    [isDark]
  );

  const navigateTo = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  const handleVersiculoImageLoad = useCallback(
    (e: { source: { width: number; height: number } }) => {
      const { width: w, height: h } = e.source;
      if (w && h) setVersiculoAspect(w / h);
    },
    []
  );

  if (!screenReady) {
    return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      onScroll={handleScroll}
      scrollEventThrottle={100}
    >
        {/* Hero Banner */}
        <Image
          source={require("../../assets/images/hero-bg.png")}
          style={{ width: "100%", aspectRatio: 1.8 }}
          contentFit="cover"
          contentPosition="center"
        />

        {/* Navigation Buttons */}
        <View style={styles.buttonsRow}>
          <Pressable
            onPress={() => navigateTo("/quem-somos")}
            style={[styles.outlineButton, { backgroundColor: c.outlineBg, borderColor: c.outlineBorder }]}
          >
            <Text style={[styles.outlineButtonText, { color: c.foreground }]}>Nossa História</Text>
          </Pressable>
          <Pressable
            onPress={() => navigateTo("/programacao")}
            style={[styles.filledButton, { backgroundColor: c.primary }]}
          >
            <Text style={styles.filledButtonText}>Programação</Text>
          </Pressable>
        </View>

        {/* Proximo Culto */}
        <CultoCard proximoCulto={proximoCulto} c={c} />

        {/* Sobre Nos */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 48 }}>
          <Text style={[styles.sectionHeading, { color: c.foreground }]}>
            Uma Igreja que Transforma Vidas
          </Text>
          <Text style={[styles.sectionText, { color: c.muted }]}>
            Somos uma comunidade de fé comprometida em levar o amor de Cristo a
            todas as pessoas. Através da palavra, do louvor e da comunhão,
            buscamos fazer a diferença na vida de cada pessoa.
          </Text>
          <View style={{ marginBottom: 24 }}>
            {BULLET_ITEMS.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={[styles.bulletText, { color: c.muted }]}>{item}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => navigateTo("/quem-somos")}
            style={[styles.saibaMaisButton, { backgroundColor: c.primary }]}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            <Text style={styles.saibaMaisText}>Saiba Mais</Text>
            <ArrowRight size={20} color="#ffffff" />
          </Pressable>

          {/* YouTube Video */}
          <LazySection
            scrollY={scrollY}
            viewportHeight={screenHeight}
            threshold={500}
            estimatedHeight={videoHeight}
            placeholder={
              <View style={[styles.videoContainer, { backgroundColor: '#000' }]}>
                <Skeleton width="100%" height={videoHeight} borderRadius={0} />
              </View>
            }
          >
            <View style={styles.videoContainer}>
              <YouTubePlayer videoId={YOUTUBE_VIDEO_ID} height={videoHeight} />
            </View>
          </LazySection>
        </View>

        {/* Explore Nossa Igreja */}
        <View style={[styles.exploreSection, { backgroundColor: c.sectionBg }]}>
          <Text style={[styles.sectionHeading, { color: c.foreground, textAlign: "center", marginBottom: 32 }]}>
            Explore Nossa Igreja
          </Text>
          <View style={styles.exploreGrid}>
            {EXPLORE_ITEMS.map((item) => (
              <ExploreCard
                key={item.title}
                item={item}
                cardWidth={cardWidth}
                c={c}
                onPress={() => navigateTo(item.route)}
              />
            ))}
          </View>
        </View>

        {/* Carrossel de Fotos */}
        {carouselPhotos && carouselPhotos.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 48 }}>
            <Text style={[styles.sectionHeading, { color: c.foreground, textAlign: "center", marginBottom: 24 }]}>
              Trabalhos da Semana
            </Text>
            <PhotoCarousel photos={carouselPhotos} colors={c} />
          </View>
        )}

        {/* Ministerios */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 48 }}>
          <Text style={[styles.sectionHeading, { color: c.foreground, textAlign: "center", marginBottom: 12 }]}>
            Nossos Ministérios e Grupos
          </Text>
          <Text style={[styles.ministeriosSubtitle, { color: c.muted }]}>
            Conheça os projetos que fazem parte da nossa missão
          </Text>
          <View style={styles.ministeriosGrid}>
            {MINISTRY_LOGOS.map((item) => (
              <MinistryItem
                key={item.nome}
                item={item}
                logoWidth={logoWidth}
                c={c}
                onPress={() => navigateTo("/quem-somos")}
              />
            ))}
          </View>
          <Pressable
            onPress={() => navigateTo("/quem-somos")}
            style={styles.conhecaTodosRow}
          >
            <Text style={[styles.conhecaTodosText, { color: c.primary }]}>Conheça todos</Text>
            <ArrowRight size={16} color={c.primary} />
          </Pressable>
        </View>

        {/* Versiculo do Dia */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 48 }}>
          <View style={styles.versiculoHeaderRow}>
            <BookOpen size={20} color={c.primary} />
            <Text style={[styles.versiculoHeading, { color: c.foreground }]}>Versículo do Dia</Text>
          </View>

          {loadingVersiculo ? (
            <View style={[styles.cardContainer, { backgroundColor: c.cardBg, borderColor: c.softBorder }]}>
              <Skeleton width="100%" height={250} borderRadius={0} />
              <View style={{ padding: 16, alignItems: "center" }}>
                <Skeleton width={200} height={20} />
              </View>
            </View>
          ) : versiculoDoDia ? (
            versiculoDoDia.url_imagem ? (
              <Pressable
                onPress={() => navigateTo("/versiculo-do-dia")}
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                <View style={[styles.cardContainer, { backgroundColor: c.cardBg, borderColor: c.softBorder }]}>
                  <Image
                    source={{ uri: versiculoDoDia.url_imagem }}
                    style={{ width: "100%", aspectRatio: versiculoAspect }}
                    contentFit="cover"
                    cachePolicy="disk"
                    onLoad={handleVersiculoImageLoad}
                  />
                  <View style={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" }}>
                    <Text style={[styles.versiculoTitulo, { color: c.primary }]}>
                      {getTituloVersiculo(versiculoDoDia)}
                    </Text>
                    <Text style={[styles.versiculoSubtext, { color: c.muted }]}>
                      Clique para ver mais versículos
                    </Text>
                  </View>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => navigateTo("/versiculo-do-dia")}
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                <View style={[styles.cardContainer, { backgroundColor: c.primary, borderColor: c.primary }]}>
                  <View style={{ padding: 32, alignItems: "center" }}>
                    <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 }}>
                      {getTituloVersiculo(versiculoDoDia)}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.9)", textAlign: "center", marginBottom: 24, fontSize: 20 }}>
                      Venha conferir a mensagem do dia
                    </Text>
                    <View style={[styles.versiculoFallbackBtn, { backgroundColor: c.bg }]}>
                      <Text style={{ color: c.foreground, fontWeight: "600", fontSize: 20 }}>
                        Ver Mensagem Completa
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )
          ) : (
            <View style={[styles.cardContainer, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <View style={{ padding: 48, alignItems: "center" }}>
                <Text style={{ color: "#ffffff", textAlign: "center", marginBottom: 24, fontSize: 22 }}>
                  Em breve teremos uma nova mensagem para você!
                </Text>
                <Pressable
                  onPress={() => navigateTo("/versiculo-do-dia")}
                  style={[styles.versiculoFallbackBtn, { backgroundColor: c.bg }]}
                >
                  <Text style={{ color: c.foreground, fontWeight: "600", fontSize: 20 }}>
                    Ver Versículos Anteriores
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 48 }}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Faça Parte da Nossa Família</Text>
            <Text style={styles.ctaSubtitle}>
              Venha nos visitar e experimente uma comunidade que te acolhe com
              amor e verdade
            </Text>
            <Pressable
              onPress={() => navigateTo("/fale-conosco")}
              style={[styles.ctaButton, { backgroundColor: c.bg }]}
            >
              <Text style={[styles.ctaButtonText, { color: c.foreground }]}>Entre em Contato</Text>
            </Pressable>
          </View>
        </View>

        <AppFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* Buttons */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  outlineButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  outlineButtonText: {
    fontWeight: "600",
    fontSize: 18,
  },
  filledButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  filledButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
  },

  /* Proximo Culto */
  cultoCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cultoColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  cultoDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  cultoLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  cultoValue: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  /* Section Headings */
  sectionHeading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 16,
  },

  /* Bullet Items */
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d97706",
    marginRight: 12,
  },
  bulletText: {
    fontSize: 20,
  },

  /* Saiba Mais button */
  saibaMaisButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 8,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  saibaMaisText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 20,
  },

  /* Video */
  videoContainer: {
    marginTop: 32,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  /* Explore Section */
  exploreSection: {
    paddingHorizontal: 16,
    paddingVertical: 48,
  },

  /* Explore Grid */
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  exploreCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  exploreTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  exploreDesc: {
    fontSize: 16,
    textAlign: "center",
  },

  /* Ministerios */
  ministeriosSubtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
  },
  ministeriosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  ministerioItem: {
    alignItems: "center",
    marginBottom: 8,
  },
  ministerioLogoBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  ministerioName: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  conhecaTodosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    gap: 8,
  },
  conhecaTodosText: {
    fontSize: 18,
    fontWeight: "500",
  },

  /* Versiculo */
  versiculoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  versiculoHeading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  versiculoTitulo: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  versiculoSubtext: {
    fontSize: 18,
  },
  versiculoFallbackBtn: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },

  /* CTA */
  ctaCard: {
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 20,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 26,
  },
  ctaButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ctaButtonText: {
    fontWeight: "600",
    fontSize: 18,
  },
});
