import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProgramacaoAtiva } from "@/services/programacaoService";
import { AppFooter } from "@/components/AppFooter";
import { DIAS_SEMANA } from "@/lib/constants";
import { useTheme } from "@/hooks/useTheme";

export default function ProgramacaoScreen() {
  const { isDark } = useTheme();

  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    accent: "#f59e0b",
    cardBg: isDark ? "#171D26" : "#FFFFFF",
    cardBorder: isDark ? "#29313D" : "#E2E5E9",
    mutedBg: isDark ? "#252C37" : "#F3F5F6",
    primaryLight: isDark ? "rgba(54,126,226,0.10)" : "rgba(18,62,125,0.10)",
    accentLight: isDark ? "rgba(245,158,11,0.10)" : "rgba(245,158,11,0.10)",
    primaryBorder: isDark ? "rgba(54,126,226,0.20)" : "rgba(18,62,125,0.20)",
  };

  const { data: programacao, isLoading } = useQuery({
    queryKey: ["programacao"],
    queryFn: getProgramacaoAtiva,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const diasSemana = DIAS_SEMANA.map((dia) => ({
    dia: dia.nome,
    atividades: (programacao || [])
      .filter((p) => p.dia_semana === dia.valor)
      .map((p) => ({ titulo: p.titulo, horario: p.horario, local: p.local || "" })),
  }));

  // ── Skeleton Loading ──

  if (isLoading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 48 }}>
          {/* Hero Skeleton */}
          <View style={{ alignItems: "center", marginBottom: 64 }}>
            <Skeleton width={224} height={48} borderRadius={8} />
            <View style={{ height: 16 }} />
            <Skeleton width={320} height={20} borderRadius={8} />
          </View>

          {/* Cards Skeleton */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={[s.cardSoft, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <Skeleton width={80} height={24} borderRadius={8} />
                </View>
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: c.mutedBg, borderRadius: 12, padding: 12, gap: 8 }}>
                    <Skeleton width="75%" height={16} borderRadius={8} />
                    <Skeleton width="50%" height={12} borderRadius={8} />
                    <Skeleton width="66%" height={12} borderRadius={8} />
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Info Section Skeleton */}
          <View style={{ marginTop: 64 }}>
            <View style={[s.cardMedium, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Skeleton width={256} height={32} borderRadius={8} />
              </View>
              <View style={{ gap: 24 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={{ alignItems: "center" }}>
                    <Skeleton width={64} height={64} borderRadius={32} />
                    <View style={{ height: 16 }} />
                    <Skeleton width={96} height={20} borderRadius={8} />
                    <View style={{ height: 8 }} />
                    <Skeleton width={160} height={16} borderRadius={8} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // ── Main Content ──

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 48, paddingBottom: 48 }}>
        {/* Hero Section */}
        <View style={{ alignItems: "center", marginBottom: 64 }}>
          <Text style={[s.heroTitle, { color: c.primary }]}>Programação</Text>
          <Text style={[s.heroSubtitle, { color: c.muted }]}>
            Confira nossa programação semanal e participe das nossas atividades
          </Text>
        </View>

        {/* Calendário Semanal */}
        <View style={{ gap: 12 }}>
          {diasSemana.map((dia) => (
            <View
              key={dia.dia}
              style={[
                s.cardSoft,
                {
                  backgroundColor: c.cardBg,
                  borderColor: dia.atividades.length > 0 ? c.primaryBorder : c.cardBorder,
                },
              ]}
            >
              {/* Dia da semana */}
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text
                  style={[
                    s.diaTitle,
                    { color: dia.atividades.length > 0 ? c.primary : c.muted },
                  ]}
                >
                  {dia.dia}
                </Text>
                {dia.atividades.length > 0 && (
                  <View style={[s.accentBar, { backgroundColor: c.primary }]} />
                )}
              </View>

              {/* Atividades */}
              <View style={{ gap: 12 }}>
                {dia.atividades.length > 0 ? (
                  dia.atividades.map((a, i) => (
                    <View key={i} style={[s.atividadeBox, { backgroundColor: c.mutedBg }]}>
                      <Text style={[s.atividadeTitulo, { color: c.foreground }]}>
                        {a.titulo}
                      </Text>
                      <View style={{ gap: 4 }}>
                        <View style={s.infoRow}>
                          <Clock size={12} color={c.muted} />
                          <Text style={[s.infoText, { color: c.muted }]}>{a.horario}</Text>
                        </View>
                        <View style={s.infoRow}>
                          <MapPin size={12} color={c.muted} />
                          <Text style={[s.infoText, { color: c.muted }]}>{a.local}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[s.semAtividades, { color: c.muted }]}>
                    {"Sem atividades\nprogramadas"}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Informações Importantes */}
        <View style={{ marginTop: 64 }}>
          <View style={[s.cardMedium, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
            <Text style={[s.infoSectionTitle, { color: c.foreground }]}>
              Informações Importantes
            </Text>

            <View style={{ gap: 24 }}>
              {/* Pontualidade */}
              <View style={{ alignItems: "center" }}>
                <View style={[s.infoCircle, { backgroundColor: c.primaryLight }]}>
                  <Clock size={32} color={c.primary} />
                </View>
                <Text style={[s.infoCardTitle, { color: c.foreground }]}>Pontualidade</Text>
                <Text style={[s.infoCardDesc, { color: c.muted }]}>
                  Chegue alguns minutos antes para aproveitar melhor o culto
                </Text>
              </View>

              {/* Igreja Sede */}
              <View style={{ alignItems: "center" }}>
                <View style={[s.infoCircle, { backgroundColor: c.accentLight }]}>
                  <MapPin size={32} color={c.accent} />
                </View>
                <Text style={[s.infoCardTitle, { color: c.foreground }]}>Igreja Sede</Text>
                <Text style={[s.infoCardDesc, { color: c.muted }]}>
                  Confira os horários específicos da igreja Sede
                </Text>
              </View>

              {/* Louvor */}
              <View style={{ alignItems: "center" }}>
                <View style={[s.infoCircle, { backgroundColor: c.primaryLight }]}>
                  <Text style={{ fontSize: 28 }}>🎵</Text>
                </View>
                <Text style={[s.infoCardTitle, { color: c.foreground }]}>Louvor</Text>
                <Text style={[s.infoCardDesc, { color: c.muted }]}>
                  Momentos especiais de adoração em todos os cultos
                </Text>
              </View>
            </View>
          </View>
        </View>
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
  cardSoft: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMedium: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  diaTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  accentBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  atividadeBox: {
    borderRadius: 12,
    padding: 12,
  },
  atividadeTitulo: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
  },
  semAtividades: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 16,
    lineHeight: 18,
  },
  infoSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  infoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoCardDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
