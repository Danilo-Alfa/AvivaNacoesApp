import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Share,
  StyleSheet,
  Animated,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import {
  BookOpen,
  Share2,
  X,
  Maximize2,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { versiculoService } from "@/services/versiculoService";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";
import type { Versiculo } from "@/types";

// ── Floating Circle (animated) ──

function FloatingCircle({
  size,
  color,
  style,
  duration,
  distance,
}: {
  size: number;
  color: string;
  style?: any;
  duration: number;
  distance: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distance],
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
}

// ── Decorative Quote SVG ──

function QuoteMark({ size = 48, color = "rgba(0,0,0,0.08)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </Svg>
  );
}

// ── Facebook Icon SVG ──

function FacebookIcon({ size = 16, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </Svg>
  );
}

// ── Instagram Icon SVG ──

function InstagramIcon({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </Svg>
  );
}

// ── Wave SVG ──

function WaveSvg({ color }: { color: string }) {
  return (
    <View style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
      <Svg width="100%" height={60} viewBox="0 0 1440 120" preserveAspectRatio="none">
        <Path
          d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

// ── Main Screen ──

export default function VersiculoDoDiaScreen() {
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const [imagemTelaCheia, setImagemTelaCheia] = useState<string | null>(null);

  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    cardBg: isDark ? "#171D26" : "#FFFFFF",
    cardBorder: isDark ? "#29313D" : "#E2E5E9",
    mutedBg: isDark ? "#252C37" : "#F3F5F6",
    primaryLight: isDark ? "rgba(54,126,226,0.10)" : "rgba(18,62,125,0.10)",
  };

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
    return `Versículo do dia ${d.getDate()} de ${d.toLocaleDateString("pt-BR", { month: "long" })}`;
  };

  const handleShare = async () => {
    if (!versiculoDoDia) return;
    try {
      await Share.share({
        title: versiculoDoDia.titulo || "Versículo do Dia",
        message: `Confira o versículo do dia! ${versiculoDoDia.url_post}`,
      });
    } catch {}
  };

  const isLoading = loadingDia || loadingAnteriores;

  // ── Skeleton Loading ──

  if (isLoading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
        {/* Hero Skeleton */}
        <LinearGradient
          colors={["#1a3a6b", "#2a4a8b", "#3a5aab"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroSection}
        >
          <View style={{ alignItems: "center" }}>
            <View style={[s.skeletonPill, { width: 120 }]} />
            <View style={[s.skeletonBlock, { width: 280, height: 36, marginTop: 16 }]} />
            <View style={[s.skeletonBlock, { width: width * 0.85, height: 18, marginTop: 16 }]} />
          </View>
          <WaveSvg color={c.bg} />
        </LinearGradient>

        {/* Featured Card Skeleton */}
        <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
          <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <View style={{ padding: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Skeleton width={32} height={32} borderRadius={8} />
                <Skeleton width={120} height={14} borderRadius={4} />
              </View>
              <Skeleton width="100%" height={250} borderRadius={12} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                <Skeleton width="60%" height={14} borderRadius={4} />
                <Skeleton width={90} height={14} borderRadius={4} />
              </View>
            </View>
          </View>
        </View>

        {/* Previous Section Skeleton */}
        <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
          <Skeleton width={220} height={28} borderRadius={6} style={{ alignSelf: "center", marginBottom: 24 }} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder, marginBottom: 16 }]}>
              <View style={{ padding: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Skeleton width={32} height={32} borderRadius={8} />
                  <Skeleton width={160} height={14} borderRadius={4} />
                </View>
                <Skeleton width="100%" height={200} borderRadius={12} />
                <View style={{ marginTop: 16 }}>
                  <Skeleton width={130} height={36} borderRadius={8} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // ── Main Content ──

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      {/* ═══════════════════════════════════════════
          Hero Section com gradiente e onda
         ═══════════════════════════════════════════ */}
      <LinearGradient
        colors={["#1a3a6b", "#2a4a8b", "#3a5aab"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroSection}
      >
        {/* Ícones decorativos */}
        <View style={{ position: "absolute", top: 24, left: 20, opacity: 0.2 }}>
          <BookOpen size={48} color="#ffffff" />
        </View>
        <View style={{ position: "absolute", top: 24, right: 20, opacity: 0.2 }}>
          <Sparkles size={36} color="#ffffff" />
        </View>

        {/* Bolinhas decorativas animadas */}
        <FloatingCircle
          size={140}
          color="rgba(255,255,255,0.10)"
          style={{ left: -50, top: "30%" }}
          duration={6000}
          distance={8}
        />
        <FloatingCircle
          size={180}
          color="rgba(255,255,255,0.05)"
          style={{ right: -70, top: "20%" }}
          duration={8000}
          distance={6}
        />
        <FloatingCircle
          size={90}
          color="rgba(255,255,255,0.10)"
          style={{ right: "25%", bottom: "25%" }}
          duration={7000}
          distance={5}
        />
        <FloatingCircle
          size={60}
          color="rgba(255,255,255,0.05)"
          style={{ left: "30%", top: "22%" }}
          duration={5000}
          distance={6}
        />

        {/* Conteúdo do Hero */}
        <View style={{ alignItems: "center", zIndex: 10, paddingVertical: 48, paddingHorizontal: 16 }}>
          {/* Badge */}
          <View style={s.heroBadge}>
            <Sparkles size={14} color="#ffffff" />
            <Text style={s.heroBadgeText}>Palavra de Deus</Text>
          </View>

          {/* Título */}
          <Text style={s.heroTitle}>Versículos Inspiradores</Text>

          {/* Citação */}
          <Text style={s.heroSubtitle}>
            "A palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes."
          </Text>
        </View>

        {/* Onda SVG */}
        <WaveSvg color={c.bg} />
      </LinearGradient>

      {/* ═══════════════════════════════════════════
          Versículo Destaque
         ═══════════════════════════════════════════ */}
      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16 }}>
        {versiculoDoDia ? (
          <View style={[s.featuredCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            {/* Aspas decorativas */}
            <View style={{ position: "absolute", top: 22, right: 24, zIndex: 1 }}>
              <QuoteMark
                size={48}
                color={isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.06)"}
              />
            </View>

            <View style={{ padding: 24, zIndex: 10 }}>
              {/* Badge */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <View style={[s.iconBadgeLg, { backgroundColor: c.primaryLight }]}>
                  <BookOpen size={20} color={c.primary} />
                </View>
                <Text style={[s.badgeLabel, { color: c.muted }]}>VERSÍCULO DO DIA</Text>
              </View>

              {/* Imagem do Versículo */}
              {versiculoDoDia.url_imagem ? (
                <Pressable onPress={() => setImagemTelaCheia(versiculoDoDia.url_imagem)}>
                  <View style={s.imageContainer}>
                    <Image
                      source={{ uri: versiculoDoDia.url_imagem }}
                      style={{ width: "100%", aspectRatio: 1 }}
                      contentFit="cover"
                      cachePolicy="disk"
                      transition={300}
                    />
                    {/* Botão Expandir */}
                    <Pressable
                      style={s.expandButton}
                      onPress={() => setImagemTelaCheia(versiculoDoDia.url_imagem)}
                    >
                      <Maximize2 size={18} color="#ffffff" />
                    </Pressable>
                  </View>
                </Pressable>
              ) : (
                <Text style={[s.fallbackTitle, { color: c.foreground }]}>
                  {getTitulo(versiculoDoDia)}
                </Text>
              )}

              {/* Referência + Compartilhar */}
              <View style={s.footerRow}>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => versiculoDoDia.url_post && Linking.openURL(versiculoDoDia.url_post)}
                >
                  <Text style={[s.refText, { color: c.muted }]} numberOfLines={1}>
                    — {getTitulo(versiculoDoDia)}
                  </Text>
                </Pressable>
                <Pressable style={s.shareButton} onPress={handleShare}>
                  <Share2 size={18} color={c.muted} />
                  <Text style={[s.shareText, { color: c.muted }]}>Compartilhar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder, padding: 48, alignItems: "center" }]}>
            <Text style={{ color: c.muted, fontSize: 14 }}>
              Nenhum versículo disponível no momento.
            </Text>
          </View>
        )}
      </View>

      {/* ═══════════════════════════════════════════
          Versículos Anteriores
         ═══════════════════════════════════════════ */}
      {anteriores && anteriores.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={[s.sectionTitle, { color: c.foreground }]}>
            Versículos Anteriores
          </Text>

          {anteriores.map((v) => (
            <Pressable
              key={v.id}
              onPress={() =>
                v.url_imagem
                  ? setImagemTelaCheia(v.url_imagem)
                  : v.url_post && Linking.openURL(v.url_post)
              }
              style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ translateY: -2 }] }]}
            >
              <View style={[s.anteriorCard, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                {/* Aspas decorativas */}
                <View style={{ position: "absolute", top: 23, right: 24, zIndex: 1 }}>
                  <QuoteMark
                    size={40}
                    color={isDark ? "rgba(96,165,250,0.25)" : "rgba(18,62,125,0.08)"}
                  />
                </View>

                <View style={{ padding: 24, zIndex: 10 }}>
                  {/* Badge com Data */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <View style={[s.iconBadgeLg, { backgroundColor: c.primaryLight }]}>
                      <BookOpen size={18} color={c.primary} />
                    </View>
                    <Text style={[s.badgeLabelSm, { color: c.muted }]}>
                      {new Date(v.data + "T00:00:00").toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      - Versículo do Dia
                    </Text>
                  </View>

                  {/* Imagem */}
                  {v.url_imagem && (
                    <Pressable
                      onPress={() => setImagemTelaCheia(v.url_imagem)}
                      style={s.anteriorImageContainer}
                    >
                      <Image
                        source={{ uri: v.url_imagem }}
                        style={{ width: "100%", aspectRatio: 1 }}
                        contentFit="cover"
                        cachePolicy="disk"
                        transition={200}
                      />
                      <View style={s.expandButton}>
                        <Maximize2 size={16} color="#ffffff" />
                      </View>
                    </Pressable>
                  )}

                  {/* Botão Facebook */}
                  <Pressable
                    style={s.facebookButton}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      v.url_post && Linking.openURL(v.url_post);
                    }}
                  >
                    <FacebookIcon size={14} color="#ffffff" />
                    <Text style={s.facebookButtonText}>Ver no Facebook</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* ═══════════════════════════════════════════
          CTA Section - Receba o Versículo Diariamente
         ═══════════════════════════════════════════ */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <LinearGradient
          colors={["#2a5a9b", "#1a3a6b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.ctaCard}
        >
          <Text style={s.ctaTitle}>Receba o Versículo Diariamente</Text>
          <Text style={s.ctaDescription}>
            Siga-nos nas redes sociais para receber uma palavra de Deus todos os dias em seu feed.
          </Text>

          <View style={{ gap: 12, width: "100%" }}>
            {/* Botão Facebook */}
            <Pressable
              onPress={() => Linking.openURL("https://www.facebook.com/igrejaevangelicaaviva/")}
              style={({ pressed }) => pressed && { opacity: 0.9 }}
            >
              <View style={s.ctaButtonPrimary}>
                <FacebookIcon size={18} color="#2563eb" />
                <Text style={s.ctaButtonPrimaryText}>Seguir no Facebook</Text>
                <ArrowRight size={16} color="#64748b" />
              </View>
            </Pressable>

            {/* Botão Instagram */}
            <Pressable
              onPress={() => Linking.openURL("https://www.instagram.com/igrejaavivanacoes/")}
              style={({ pressed }) => pressed && { opacity: 0.9 }}
            >
              <View style={s.ctaButtonSecondary}>
                <InstagramIcon size={18} color="#ffffff" />
                <Text style={s.ctaButtonSecondaryText}>Seguir no Instagram</Text>
                <ArrowRight size={16} color="#ffffff" />
              </View>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {/* ═══════════════════════════════════════════
          Sobre a Bíblia
         ═══════════════════════════════════════════ */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}>
        <Text style={[s.bibliaTitle, { color: c.foreground }]}>A Palavra de Deus</Text>
        <Text style={[s.bibliaText, { color: c.muted }]}>
          A Bíblia Sagrada é a palavra viva de Deus, uma fonte inesgotável de sabedoria, conforto e
          direção para nossas vidas. Cada versículo carrega o poder transformador do Espírito Santo.
        </Text>
        <Text style={[s.bibliaText, { color: c.muted, marginBottom: 0 }]}>
          Medite diariamente na Palavra e permita que ela renove sua mente e fortaleça sua fé.
        </Text>
      </View>

      <AppFooter />

      {/* ═══════════════════════════════════════════
          Modal Tela Cheia
         ═══════════════════════════════════════════ */}
      <Modal
        visible={!!imagemTelaCheia}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImagemTelaCheia(null)}
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setImagemTelaCheia(null)}
        >
          {/* Botão Fechar */}
          <Pressable
            style={s.modalCloseButton}
            onPress={() => setImagemTelaCheia(null)}
          >
            <X size={28} color="#ffffff" />
          </Pressable>

          {/* Imagem com moldura */}
          {imagemTelaCheia && (
            <Pressable onPress={(e) => e.stopPropagation?.()}>
              <View style={s.modalFrame}>
                {/* Cantos decorativos */}
                <View style={[s.modalCorner, s.modalCornerTL]} />
                <View style={[s.modalCorner, s.modalCornerTR]} />
                <View style={[s.modalCorner, s.modalCornerBL]} />
                <View style={[s.modalCorner, s.modalCornerBR]} />

                <View style={s.modalImageWrapper}>
                  <Image
                    source={{ uri: imagemTelaCheia }}
                    style={{ width: width - 48, aspectRatio: 1 }}
                    contentFit="contain"
                    cachePolicy="disk"
                  />
                </View>
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  // Hero
  heroSection: {
    position: "relative",
    overflow: "hidden",
    paddingBottom: 40,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.20)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 340,
    paddingHorizontal: 16,
  },

  // Skeleton placeholders (for hero)
  skeletonPill: {
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  skeletonBlock: {
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.20)",
  },

  // Cards
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  anteriorCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Icon Badge
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeLg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  badgeLabelSm: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // Image
  imageContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  expandButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.60)",
    padding: 8,
    borderRadius: 8,
  },

  // Fallback title when no image
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  // Footer row
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  refText: {
    fontSize: 14,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  shareText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Section title
  sectionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },

  // Anterior image
  anteriorImageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative" as const,
  },

  // Facebook button
  facebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  facebookButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },

  // CTA Section
  ctaCard: {
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.80)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButtonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaButtonPrimaryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  ctaButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaButtonSecondaryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Sobre a Bíblia
  bibliaTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  bibliaText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCloseButton: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalFrame: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 10,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  modalCorner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "rgba(30,58,95,0.5)",
  },
  modalCornerTL: {
    top: -4,
    left: -4,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  modalCornerTR: {
    top: -4,
    right: -4,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  modalCornerBL: {
    bottom: -4,
    left: -4,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  modalCornerBR: {
    bottom: -4,
    right: -4,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  modalImageWrapper: {
    borderRadius: 10,
    overflow: "hidden",
  },
});
