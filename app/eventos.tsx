import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Star, X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Image } from "expo-image";
import {
  getEventosFuturos,
  getEventosDestaque,
  getEventosDoMes,
} from "@/services/eventoService";
import { AppFooter } from "@/components/AppFooter";
import { formatarPeriodo, formatarHorario } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import type { Evento } from "@/types";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function extrairDataISO(dataStr: string) {
  const match = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      ano: parseInt(match[1]),
      mes: parseInt(match[2]) - 1,
      dia: parseInt(match[3]),
    };
  }
  const data = new Date(dataStr);
  return { ano: data.getFullYear(), mes: data.getMonth(), dia: data.getDate() };
}

interface EventoCardColors {
  foreground: string;
  muted: string;
  primary: string;
  cardBg: string;
  cardBorder: string;
  primaryLight: string;
}

function EventoCard({ evento, destaque = false, colors }: { evento: Evento; destaque?: boolean; colors: EventoCardColors }) {
  return (
    <View
      style={{
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        backgroundColor: colors.cardBg,
        overflow: "hidden",
      }}
    >
      {evento.imagem_url && (
        <Image
          source={{ uri: evento.imagem_url }}
          style={{ width: "100%", height: destaque ? 220 : 160 }}
          contentFit="cover"
          cachePolicy="disk"
        />
      )}
      <View style={{ padding: 16 }}>
        {destaque && (
          <View style={{ marginBottom: 8 }}>
            <Badge label="DESTAQUE" icon={<Star size={10} color="#ffffff" />} />
          </View>
        )}
        <Text style={{ fontSize: destaque ? 22 : 18, fontWeight: "700", color: colors.foreground, marginBottom: 4 }}>
          {evento.titulo}
        </Text>
        {evento.descricao && (
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12 }} numberOfLines={3}>
            {evento.descricao}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View style={{ width: 32, height: 32, backgroundColor: colors.primaryLight, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
            <Calendar size={16} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 14, color: colors.foreground }}>
            {formatarPeriodo(evento.data_inicio, evento.data_fim)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <View style={{ width: 32, height: 32, backgroundColor: colors.primaryLight, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
            <Clock size={16} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 14, color: colors.foreground }}>
            {formatarHorario(evento.data_inicio, evento.data_fim)}
          </Text>
        </View>
        {evento.local && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 32, height: 32, backgroundColor: colors.primaryLight, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
              <MapPin size={16} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 14, color: colors.foreground }}>{evento.local}</Text>
          </View>
        )}
        {evento.tipo && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <View style={{ width: 32, height: 32, backgroundColor: colors.primaryLight, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 14 }}>🏷️</Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.foreground }}>{evento.tipo}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CalendarioSkeleton({ cardBg, cardBorder }: { cardBg: string; cardBorder: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Skeleton width={150} height={28} borderRadius={8} />
        <Skeleton width={200} height={36} borderRadius={20} style={{ marginTop: 12 }} />
      </View>
      <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor: cardBorder, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cardBorder }}>
          {DIAS_SEMANA.map((_, i) => (
            <View key={i} style={{ flex: 1, paddingVertical: 12, alignItems: "center" }}>
              <Skeleton width={24} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
        <View style={{ padding: 8 }}>
          {[0, 1, 2, 3, 4].map((row) => (
            <View key={row} style={{ flexDirection: "row", marginBottom: 4 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                <View key={col} style={{ flex: 1, aspectRatio: 1, padding: 2 }}>
                  <Skeleton width="100%" height="100%" borderRadius={12} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function EventosScreen() {
  const { isDark } = useTheme();

  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    cardBg: isDark ? "#171D26" : "#FFFFFF",
    cardBorder: isDark ? "#29313D" : "#E2E5E9",
    mutedBg: isDark ? "#252C37" : "#F3F5F6",
    primaryLight: isDark ? "rgba(54,126,226,0.10)" : "rgba(18,62,125,0.10)",
    calHeaderBg: isDark ? "#1e1b4b" : "rgba(99,102,241,0.06)",
    calGridBg: isDark ? "#0f172a" : "#f9fafb",
    calCellBg: isDark ? "#1f2937" : "#ffffff",
    calCellBorder: isDark ? "#374151" : "#e5e7eb",
    calTodayBg: isDark ? "#312e81" : "rgba(99,102,241,0.08)",
    calTodayBorder: isDark ? "#818cf8" : "#818cf8",
    calDayText: isDark ? "#e5e7eb" : "#4b5563",
    calWeekdayText: isDark ? "#a5b4fc" : "#6366f1",
    modalBg: isDark ? "#111827" : "#ffffff",
    modalSecondary: isDark ? "#9ca3af" : "#6b7280",
    grabHandle: isDark ? "#4b5563" : "#d1d5db",
  };

  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const abrirModal = (dia: number) => {
    setDiaSelecionado(dia);
    setModalVisivel(true);
    slideAnim.setValue(SCREEN_HEIGHT);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 25,
      stiffness: 200,
    }).start();
  };

  const fecharModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisivel(false);
      setDiaSelecionado(null);
    });
  };

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

  const { data: eventosDoMes, isLoading: loadingMes } = useQuery({
    queryKey: ["eventos-mes", mesAtual.getFullYear(), mesAtual.getMonth()],
    queryFn: () => getEventosDoMes(mesAtual.getFullYear(), mesAtual.getMonth()),
    staleTime: 1000 * 60 * 30,
  });

  const isLoading = loadingFuturos || loadingDestaque;

  const gerarCalendario = useCallback(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    const dias: (number | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= ultimoDia; dia++) {
      dias.push(dia);
    }
    return dias;
  }, [mesAtual]);

  const getEventosDoDia = useCallback(
    (dia: number) => {
      if (!eventosDoMes) return [];
      const anoAlvo = mesAtual.getFullYear();
      const mesAlvo = mesAtual.getMonth();

      return eventosDoMes.filter((evento) => {
        const inicio = extrairDataISO(evento.data_inicio);
        const fim = evento.data_fim ? extrairDataISO(evento.data_fim) : inicio;

        const dataAlvo = new Date(anoAlvo, mesAlvo, dia);
        const dataInicio = new Date(inicio.ano, inicio.mes, inicio.dia);
        const dataFim = new Date(fim.ano, fim.mes, fim.dia);

        return dataAlvo >= dataInicio && dataAlvo <= dataFim;
      });
    },
    [eventosDoMes, mesAtual]
  );

  const mudarMes = (direcao: number) => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1));
    setDiaSelecionado(null);
  };

  const hoje = new Date();
  const isHoje = (dia: number) =>
    hoje.getDate() === dia &&
    hoje.getMonth() === mesAtual.getMonth() &&
    hoje.getFullYear() === mesAtual.getFullYear();

  const eventosDoDiaSelecionado = diaSelecionado ? getEventosDoDia(diaSelecionado) : [];

  const cardColors: EventoCardColors = {
    foreground: c.foreground,
    muted: c.muted,
    primary: c.primary,
    cardBg: c.cardBg,
    cardBorder: c.cardBorder,
    primaryLight: c.primaryLight,
  };

  if (isLoading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16 }}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Skeleton width={200} height={32} borderRadius={8} />
            <Skeleton width={260} height={16} borderRadius={8} style={{ marginTop: 8 }} />
          </View>
          <CalendarioSkeleton cardBg={c.cardBg} cardBorder={c.cardBorder} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ marginBottom: 16 }}>
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
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16 }}>
        {/* Hero */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: c.foreground, marginBottom: 8, textAlign: "center" }}>
            Eventos
          </Text>
          <Text style={{ fontSize: 16, color: c.muted, textAlign: "center" }}>
            Participe dos nossos próximos eventos e experiências transformadoras
          </Text>
        </View>
        {/* Eventos em Destaque */}
        {eventosDestaque && eventosDestaque.length > 0 && (
          <>
            <Text style={{ fontSize: 22, fontWeight: "700", color: c.foreground, marginBottom: 16 }}>
              Eventos em Destaque
            </Text>
            {eventosDestaque.map((e) => (
              <EventoCard key={e.id} evento={e} destaque colors={cardColors} />
            ))}
          </>
        )}

        {/* Calendário do Mês */}
        <View style={{ marginBottom: 24, marginTop: 8 }}>
          {/* Header do Calendário */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <View
                style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#6366f1" }}
              >
                <Calendar size={20} color="#ffffff" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: "700", color: "#6366f1" }}>
                Calendário
              </Text>
            </View>

            {/* Navegação do Mês */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 999,
                paddingHorizontal: 4,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: c.calCellBorder,
                backgroundColor: c.calCellBg,
              }}
            >
              <TouchableOpacity
                onPress={() => mudarMes(-1)}
                style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color={c.muted} />
              </TouchableOpacity>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: c.foreground,
                  minWidth: 140,
                  textAlign: "center",
                  textTransform: "capitalize",
                  paddingHorizontal: 8,
                }}
              >
                {mesAtual.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <TouchableOpacity
                onPress={() => mudarMes(1)}
                style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
                activeOpacity={0.7}
              >
                <ChevronRight size={20} color={c.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Grade do Calendário */}
          {loadingMes ? (
            <CalendarioSkeleton cardBg={c.cardBg} cardBorder={c.cardBorder} />
          ) : (
            <View
              style={{
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: c.calCellBorder,
                backgroundColor: c.cardBg,
              }}
            >
              {/* Dias da semana */}
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: c.calHeaderBg,
                  borderBottomWidth: 1,
                  borderBottomColor: c.calCellBorder,
                }}
              >
                {DIAS_SEMANA.map((dia) => (
                  <View key={dia} style={{ flex: 1, paddingVertical: 12, alignItems: "center" }}>
                    <Text style={{ fontSize: 12, fontWeight: "500", color: c.calWeekdayText }}>
                      {dia}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Dias do mês */}
              <View style={{ padding: 6, backgroundColor: c.calGridBg }}>
                {(() => {
                  const dias = gerarCalendario();
                  const semanas: (number | null)[][] = [];
                  for (let i = 0; i < dias.length; i += 7) {
                    semanas.push(dias.slice(i, i + 7));
                  }
                  const ultimaSemana = semanas[semanas.length - 1];
                  while (ultimaSemana.length < 7) {
                    ultimaSemana.push(null);
                  }

                  return semanas.map((semana, semanaIdx) => (
                    <View key={semanaIdx} style={{ flexDirection: "row", marginBottom: 3 }}>
                      {semana.map((dia, diaIdx) => {
                        if (!dia) {
                          return (
                            <View
                              key={`empty-${semanaIdx}-${diaIdx}`}
                              style={{ flex: 1, aspectRatio: 1, margin: 1.5, borderRadius: 12 }}
                            />
                          );
                        }

                        const eventosNoDia = getEventosDoDia(dia);
                        const temEvento = eventosNoDia.length > 0;
                        const eHoje = isHoje(dia);

                        return (
                          <TouchableOpacity
                            key={`dia-${dia}`}
                            style={{
                              flex: 1,
                              aspectRatio: 1,
                              margin: 1.5,
                              borderRadius: 12,
                              padding: 4,
                              borderWidth: eHoje ? 2 : 1,
                              borderColor: eHoje ? c.calTodayBorder : c.calCellBorder,
                              backgroundColor: eHoje ? c.calTodayBg : c.calCellBg,
                            }}
                            activeOpacity={temEvento ? 0.6 : 1}
                            onPress={() => temEvento && abrirModal(dia)}
                          >
                            <View style={{ alignItems: "flex-start" }}>
                              {eHoje ? (
                                <View
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 11,
                                    backgroundColor: "#6366f1",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700" }}>
                                    {dia}
                                  </Text>
                                </View>
                              ) : (
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "500",
                                    color: c.calDayText,
                                    paddingLeft: 2,
                                    paddingTop: 1,
                                  }}
                                >
                                  {dia}
                                </Text>
                              )}
                            </View>

                            {temEvento && (
                              <View
                                style={{
                                  flex: 1,
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                  paddingBottom: 3,
                                }}
                              >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                                  {eventosNoDia.slice(0, 3).map((evento, i) => (
                                    <View
                                      key={i}
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: evento.cor || "#6366f1",
                                      }}
                                    />
                                  ))}
                                  {eventosNoDia.length > 3 && (
                                    <Text
                                      style={{
                                        fontSize: 8,
                                        fontWeight: "600",
                                        color: "#6366f1",
                                        marginLeft: 1,
                                      }}
                                    >
                                      +{eventosNoDia.length - 3}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ));
                })()}
              </View>
            </View>
          )}
        </View>

        {/* Próximos Eventos */}
        {eventosFuturos && eventosFuturos.length > 0 && (
          <>
            <Text style={{ fontSize: 22, fontWeight: "700", color: c.foreground, marginBottom: 16, marginTop: 8 }}>
              Próximos Eventos
            </Text>
            {eventosFuturos.slice(0, 6).map((e) => (
              <EventoCard key={e.id} evento={e} colors={cardColors} />
            ))}
          </>
        )}

        {(!eventosFuturos || eventosFuturos.length === 0) &&
          (!eventosDestaque || eventosDestaque.length === 0) && (
            <View style={{ alignItems: "center", paddingVertical: 80 }}>
              <Calendar size={48} color={c.muted} />
              <Text style={{ color: c.muted, marginTop: 16, textAlign: "center" }}>
                Nenhum evento futuro agendado
              </Text>
            </View>
          )}
      </View>

      <AppFooter />

      {/* Modal de eventos do dia */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={fecharModal}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={fecharModal}
        >
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              backgroundColor: c.modalBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "80%",
              overflow: "hidden",
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Grab handle */}
              <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: c.grabHandle,
                  }}
                />
              </View>

              {/* Header do Modal */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#6366f1",
                  marginHorizontal: 12,
                  borderRadius: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Calendar size={20} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={{ fontWeight: "700", color: "#ffffff", fontSize: 18 }}>
                      {diaSelecionado} de{" "}
                      {mesAtual.toLocaleDateString("pt-BR", { month: "long" })}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                      {eventosDoDiaSelecionado.length}{" "}
                      {eventosDoDiaSelecionado.length === 1 ? "evento" : "eventos"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={fecharModal}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Lista de eventos */}
              <ScrollView
                style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {eventosDoDiaSelecionado.map((evento) => {
                  const cor = evento.cor || "#6366f1";
                  return (
                    <View
                      key={evento.id}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: cor,
                        backgroundColor: isDark ? cor + "25" : cor + "12",
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 16,
                          color: c.foreground,
                        }}
                      >
                        {evento.titulo}
                      </Text>
                      {evento.descricao && (
                        <Text
                          style={{
                            fontSize: 14,
                            color: c.modalSecondary,
                            marginTop: 4,
                          }}
                          numberOfLines={3}
                        >
                          {evento.descricao}
                        </Text>
                      )}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
                        <Clock size={14} color={c.modalSecondary} />
                        <Text style={{ fontSize: 13, color: c.modalSecondary }}>
                          {formatarHorario(evento.data_inicio, evento.data_fim)}
                        </Text>
                      </View>
                      {evento.local && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                          <MapPin size={14} color={c.modalSecondary} />
                          <Text style={{ fontSize: 13, color: c.modalSecondary }}>
                            {evento.local}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
