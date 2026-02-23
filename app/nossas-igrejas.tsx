import React, { useMemo, useState } from "react";
import { FlatList, View, Text, Pressable, Modal, StyleSheet } from "react-native";
import * as Linking from "expo-linking";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock, ExternalLink, Maximize2, X } from "lucide-react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { getIgrejasAtivas } from "@/services/igrejaService";
import { AppFooter } from "@/components/AppFooter";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useScreenReady } from "@/hooks/useScreenReady";
import { resolveIgrejaImage } from "@/utils/igrejaImages";
import type { Igreja } from "@/types";

/* ── Skeleton matching web design ── */

function IgrejaCardSkeleton({ c }: { c: Record<string, string> }) {
  return (
    <View
      style={[
        s.cardWrapper,
        { backgroundColor: c.cardBg, borderColor: c.cardBorder },
      ]}
    >
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={{ padding: 24, gap: 16 }}>
        <Skeleton width="75%" height={24} borderRadius={6} />
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Skeleton width={20} height={20} borderRadius={4} />
            <View style={{ flex: 1, gap: 4 }}>
              <Skeleton width={80} height={16} borderRadius={4} />
              <Skeleton width="100%" height={12} borderRadius={4} />
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Skeleton width={20} height={20} borderRadius={4} />
            <View style={{ flex: 1, gap: 4 }}>
              <Skeleton width={80} height={16} borderRadius={4} />
              <Skeleton width={128} height={12} borderRadius={4} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ── Church card matching web layout ── */

function IgrejaCard({
  igreja,
  c,
  isDark,
  onImagePress,
}: {
  igreja: Igreja;
  c: Record<string, string>;
  isDark: boolean;
  onImagePress: (source: ImageSource) => void;
}) {
  const openMaps = () => {
    if (igreja.latitude != null && igreja.longitude != null) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${igreja.latitude},${igreja.longitude}`
      );
    }
  };

  const imageSource = resolveIgrejaImage(igreja.imagem_url);

  return (
    <View
      style={[
        s.cardWrapper,
        { backgroundColor: c.cardBg, borderColor: c.cardBorder },
      ]}
    >
      {/* Imagem da Igreja */}
      {imageSource ? (
        <Pressable onPress={() => onImagePress(imageSource)}>
          <Image
            source={imageSource}
            style={s.cardImage}
            contentFit="cover"
            cachePolicy="disk"
          />
          <View style={s.maximizeButton}>
            <Maximize2 size={20} color="#ffffff" />
          </View>
        </Pressable>
      ) : (
        <LinearGradient
          colors={
            isDark
              ? ["hsl(215, 75%, 25%)", "hsl(215, 65%, 35%)"]
              : ["hsl(215, 75%, 28%)", "hsl(215, 65%, 45%)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.cardImagePlaceholder}
        >
          <Text style={s.placeholderText}>{igreja.nome}</Text>
        </LinearGradient>
      )}

      {/* Informações */}
      <View style={s.infoContainer}>
        <Text style={[s.churchName, { color: c.foreground }]}>
          {igreja.nome}
          {igreja.bairro ? ` - ${igreja.bairro}` : ""}
        </Text>

        <View style={[s.divider, { backgroundColor: c.divider }]} />

        <View style={s.infoRows}>
          {/* Endereço */}
          <View style={s.infoRow}>
            <MapPin size={20} color={c.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[s.infoLabel, { color: c.foreground }]}>Endereço</Text>
              <Text style={[s.infoValue, { color: c.muted }]}>
                {igreja.endereco}
                {igreja.cidade
                  ? `\n${igreja.cidade}${igreja.cep ? `, CEP ${igreja.cep}` : ""}`
                  : ""}
              </Text>
            </View>
          </View>

          {/* Telefone */}
          {(igreja.telefone || igreja.whatsapp) && (
            <View style={s.infoRow}>
              <Phone size={20} color={c.primary} style={{ marginTop: 2 }} />
              <View>
                <Text style={[s.infoLabel, { color: c.foreground }]}>Telefone</Text>
                <Text style={[s.infoValue, { color: c.muted }]}>
                  {igreja.telefone || igreja.whatsapp}
                </Text>
              </View>
            </View>
          )}

          {/* Horários */}
          {igreja.horarios && (
            <View style={s.infoRow}>
              <Clock size={20} color={c.primary} style={{ marginTop: 2 }} />
              <View>
                <Text style={[s.infoLabel, { color: c.foreground }]}>Horários</Text>
                <Text style={[s.infoValue, { color: c.muted }]}>{igreja.horarios}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Pastor */}
        {igreja.pastor && (
          <View style={[s.pastorSection, { borderTopColor: c.cardBorder }]}>
            <Text style={[s.infoLabel, { color: c.foreground, marginBottom: 8 }]}>
              Pastor(a) Responsável:
            </Text>
            <Text style={[s.infoValue, { color: c.muted }]}>{igreja.pastor}</Text>
          </View>
        )}

        {/* Botão Google Maps */}
        {igreja.latitude != null && igreja.longitude != null ? (
          <Pressable onPress={openMaps} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
            <View
              style={[
                s.mapsButton,
                { backgroundColor: isDark ? "#367EE2" : "#123E7D" },
              ]}
            >
              <ExternalLink size={16} color="#ffffff" />
              <Text style={s.mapsButtonText}>Ver no Google Maps</Text>
            </View>
          </Pressable>
        ) : (
          <View
            style={[s.mapsButton, { backgroundColor: isDark ? "#252C37" : "#F3F5F6" }]}
          >
            <Text style={[s.mapsButtonTextDisabled, { color: c.muted }]}>
              Localização indisponível
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ── Fullscreen image modal (matching web) ── */

function ImageModal({
  visible,
  source,
  onClose,
}: {
  visible: boolean;
  source: ImageSource;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.modalCloseButton} onPress={onClose}>
          <X size={24} color="#ffffff" />
        </Pressable>
        <Image
          source={source}
          style={s.modalImage}
          contentFit="contain"
          cachePolicy="disk"
        />
      </Pressable>
    </Modal>
  );
}

/* ── Main Screen ── */

export default function NossasIgrejasScreen() {
  const { isDark } = useThemeForScreen();
  const screenReady = useScreenReady();
  const [imagemFullscreen, setImagemFullscreen] = useState<ImageSource | null>(null);

  const c = useMemo(() => ({
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    cardBg: isDark ? "#171D26" : "#FFFFFF",
    cardBorder: isDark ? "#29313D" : "#E2E5E9",
    divider: isDark ? "rgba(54,126,226,0.3)" : "rgba(18,62,125,0.3)",
  }), [isDark]);

  const { data: igrejas, isLoading } = useQuery({
    queryKey: ["igrejas"],
    queryFn: getIgrejasAtivas,
    staleTime: 1000 * 60 * 60 * 24,
  });

  if (!screenReady || isLoading) {
    return (
      <View style={[s.container, { backgroundColor: c.bg }]}>
        {/* Hero */}
        <View style={s.heroSection}>
          <Skeleton width="60%" height={36} borderRadius={8} />
          <Skeleton
            width="80%"
            height={18}
            borderRadius={6}
            style={{ marginTop: 16 }}
          />
        </View>
        {/* Skeleton cards */}
        <View style={{ paddingHorizontal: 16, gap: 24 }}>
          <IgrejaCardSkeleton c={c} />
          <IgrejaCardSkeleton c={c} />
          <IgrejaCardSkeleton c={c} />
        </View>
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ paddingBottom: 0 }}
        data={igrejas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <IgrejaCard
              igreja={item}
              c={c}
              isDark={isDark}
              onImagePress={(source) => setImagemFullscreen(source)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={s.heroSection}>
            <Text style={[s.heroTitle, { color: c.primary }]}>Nossas Igrejas</Text>
            <Text style={[s.heroSubtitle, { color: c.muted }]}>
              Encontre a sede mais próxima de você e venha nos visitar
            </Text>
          </View>
        }
        ListFooterComponent={<AppFooter />}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <MapPin size={48} color={c.muted} />
            <Text style={[s.emptyText, { color: c.muted }]}>
              Nenhuma igreja encontrada
            </Text>
          </View>
        }
      />

      {/* Modal fullscreen da imagem */}
      {imagemFullscreen && (
        <ImageModal
          visible={!!imagemFullscreen}
          source={imagemFullscreen}
          onClose={() => setImagemFullscreen(null)}
        />
      )}
    </>
  );
}

/* ── Styles ── */

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },

  /* Hero */
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

  /* Card */
  cardWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  placeholderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  maximizeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },

  /* Info */
  infoContainer: {
    padding: 24,
    gap: 0,
  },
  churchName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  divider: {
    height: 2,
    width: "100%",
    marginVertical: 16,
    borderRadius: 1,
  },
  infoRows: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 20,
  },

  /* Pastor */
  pastorSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },

  /* Maps button */
  mapsButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  mapsButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  mapsButtonTextDisabled: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* Empty */
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCloseButton: {
    position: "absolute",
    top: 48,
    right: 16,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    zIndex: 10,
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
});
