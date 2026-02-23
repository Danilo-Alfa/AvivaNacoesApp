import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import { useQuery } from "@tanstack/react-query";
import { FileText, ExternalLink } from "lucide-react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { getUltimosJornais } from "@/services/jornalService";
import { AppFooter } from "@/components/AppFooter";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Converte links do Canva/Issuu para formato embed
function converterParaEmbed(url: string): string {
  if (url.includes("canva.com/design/")) {
    const urlBase = url.split("?")[0];
    const urlView = urlBase.replace(/\/edit$/, "/view");
    return `${urlView}?embed`;
  }
  if (url.includes("issuu.com/") && !url.includes("/embed")) {
    return url.replace("issuu.com/", "issuu.com/embed/");
  }
  return url;
}

// Verifica se a URL é um PDF direto
function isPdfUrl(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

// ── Skeleton Loading ──

function JornalSkeleton({ c }: { c: Record<string, string> }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.heroBanner, { backgroundColor: c.bg }]}>
        <Skeleton width={SCREEN_WIDTH - 32} height={(SCREEN_WIDTH - 32) * 0.3} borderRadius={12} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={[
            s.featuredCard,
            { backgroundColor: c.cardBg, borderColor: c.cardBorder },
          ]}
        >
          <View style={[s.webviewWrapper, { backgroundColor: c.mutedBg }]}>
            <View style={[s.webviewContainer, { backgroundColor: c.mutedBg }]}>
              <Skeleton width="100%" height="100%" borderRadius={0} />
            </View>
          </View>
          <View style={s.featuredInfo}>
            <View style={{ flex: 1 }}>
              <Skeleton width="60%" height={22} borderRadius={8} />
              <Skeleton
                width="40%"
                height={14}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ── Memoized previous edition card ──

const EdicaoAnteriorCard = React.memo(function EdicaoAnteriorCard({
  jornal,
  c,
  onPress,
}: {
  jornal: { id: string; titulo: string | null; data: string; url_pdf: string };
  c: Record<string, string>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.8 }}
    >
      <View
        style={[
          s.listCard,
          {
            backgroundColor: c.cardBg,
            borderColor: c.cardBorder,
          },
        ]}
      >
        <View style={[s.listIcon, { backgroundColor: c.primary }]}>
          <FileText size={24} color="#fff" />
        </View>
        <View style={s.listInfo}>
          <Text
            style={[s.listTitle, { color: c.foreground }]}
            numberOfLines={1}
          >
            {jornal.titulo || "Jornal"}
          </Text>
          <Text style={[s.listDate, { color: c.muted }]}>
            {new Date(
              jornal.data + "T00:00:00"
            ).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <ExternalLink size={18} color={c.muted} />
      </View>
    </Pressable>
  );
});

// ── Tela Principal ──

export default function JornalScreen() {
  const { isDark } = useThemeForScreen();
  const [webviewCarregando, setWebviewCarregando] = useState(true);
  const [shouldLoadWebView, setShouldLoadWebView] = useState(false);

  const screenReady = useScreenReady();

  // Lazy load WebView: delay mounting until after initial render
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoadWebView(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const c = useMemo(
    () => ({
      bg: isDark ? "#0E131B" : "#FFFFFF",
      foreground: isDark ? "#FAFAFA" : "#1D2530",
      muted: isDark ? "#94a3b8" : "#64748b",
      mutedBg: isDark ? "#1e293b" : "#f1f3f5",
      primary: isDark ? "#3b82f6" : "#1e3a5f",
      primaryFg: "#ffffff",
      cardBg: isDark ? "#171D26" : "#FFFFFF",
      cardBorder: isDark ? "#29313D" : "#E2E5E9",
    }),
    [isDark]
  );

  const { data: jornais, isLoading } = useQuery({
    queryKey: ["jornais"],
    queryFn: getUltimosJornais,
    staleTime: 1000 * 60 * 60 * 24 * 3,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  const handleOpenJornal = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const handleWebViewLoaded = useCallback(() => {
    setWebviewCarregando(false);
  }, []);

  // ── Loading ──
  if (!screenReady || isLoading) {
    return <JornalSkeleton c={c} />;
  }

  // ── Empty State ──
  if (!jornais || jornais.length === 0) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>
        <View style={[s.heroBanner, { backgroundColor: c.bg }]}>
          <Image
            source={
              isDark
                ? require("../assets/logos/joan-dark.png")
                : require("../assets/logos/joan-light.jpeg")
            }
            style={s.heroLogo}
            contentFit="contain"
          />
        </View>
        <View style={s.emptyState}>
          <FileText size={48} color={c.muted} />
          <Text style={[s.emptyText, { color: c.muted }]}>
            Nenhum jornal disponível no momento
          </Text>
        </View>
      </ScrollView>
    );
  }

  const maisRecente = jornais[0];
  const anteriores = jornais.slice(1);
  const embedUrl = converterParaEmbed(maisRecente.url_pdf);
  const ehPdf = isPdfUrl(maisRecente.url_pdf);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
    >
      {/* ── Hero Banner com Logo JOAN ── */}
      <View style={[s.heroBanner, { backgroundColor: c.bg }]}>
        <Image
          source={
            isDark
              ? require("../assets/logos/joan-dark.png")
              : require("../assets/logos/joan-light.jpeg")
          }
          style={s.heroLogo}
          contentFit="contain"
        />
      </View>

      {/* ── Jornal em Destaque (WebView embed) ── */}
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={[
            s.featuredCard,
            { backgroundColor: c.cardBg, borderColor: c.cardBorder },
          ]}
        >
          {/* Área de Visualização */}
          <View style={[s.webviewWrapper, { backgroundColor: c.mutedBg }]}>
            <View style={[s.webviewContainer, { backgroundColor: c.bg }]}>
              {(webviewCarregando || !shouldLoadWebView) && (
                <View
                  style={[
                    s.webviewLoading,
                    { backgroundColor: c.mutedBg },
                  ]}
                >
                  <FileText size={40} color={c.muted} />
                  <Text style={[s.webviewLoadingText, { color: c.muted }]}>
                    Carregando jornal...
                  </Text>
                </View>
              )}
              {shouldLoadWebView && (
                <WebView
                  source={{ uri: embedUrl }}
                  style={{
                    flex: 1,
                    opacity: webviewCarregando ? 0 : 1,
                  }}
                  allowsFullScreenVideo
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  nestedScrollEnabled
                  scalesPageToFit={ehPdf}
                  onLoadEnd={handleWebViewLoaded}
                  startInLoadingState={false}
                  originWhitelist={["*"]}
                  mixedContentMode="compatibility"
                  allowsBackForwardNavigationGestures={false}
                  cacheEnabled
                  cacheMode="LOAD_CACHE_ELSE_NETWORK"
                />
              )}
            </View>
          </View>

          {/* Controles */}
          <View
            style={[
              s.featuredInfo,
              { borderTopColor: c.cardBorder },
            ]}
          >
            <View style={s.featuredTextArea}>
              <Text style={[s.featuredTitle, { color: c.foreground }]}>
                {maisRecente.titulo || "Última Edição"}
              </Text>
              <Text style={[s.featuredDate, { color: c.muted }]}>
                {new Date(
                  maisRecente.data + "T00:00:00"
                ).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                s.featuredButton,
                { backgroundColor: c.primary },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => handleOpenJornal(maisRecente.url_pdf)}
            >
              <ExternalLink size={16} color={c.primaryFg} />
              <Text style={[s.featuredButtonText, { color: c.primaryFg }]}>
                Ver em Tela Cheia
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Edições Anteriores ── */}
      {anteriores.length > 0 && (
        <View style={s.anterioresSection}>
          <Text style={[s.sectionTitle, { color: c.foreground }]}>
            Edições Anteriores
          </Text>
          {anteriores.map((jornal) => (
            <EdicaoAnteriorCard
              key={jornal.id}
              jornal={jornal}
              c={c}
              onPress={() => handleOpenJornal(jornal.url_pdf)}
            />
          ))}
        </View>
      )}

      <AppFooter />
    </ScrollView>
  );
}

// ── Styles ──

const WEBVIEW_HEIGHT = (SCREEN_WIDTH - 32) * (16 / 9);

const s = StyleSheet.create({
  // Hero Banner
  heroBanner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroLogo: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 0.3,
  },

  // Featured Card
  featuredCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  webviewWrapper: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  webviewContainer: {
    width: "100%",
    height: WEBVIEW_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderRadius: 12,
  },
  webviewLoadingText: {
    fontSize: 13,
    marginTop: 8,
  },
  featuredInfo: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  featuredTextArea: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  featuredDate: {
    fontSize: 13,
    marginTop: 2,
  },
  featuredButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  featuredButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Edições Anteriores
  anterioresSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  listDate: {
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
