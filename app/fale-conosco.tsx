import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Send,
} from "lucide-react-native";
import { salvarMensagemContato } from "@/services/contatoService";
import { CONTACT_INFO } from "@/lib/constants";
import Toast from "react-native-toast-message";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";

export default function FaleConoscoScreen() {
  const { isDark } = useTheme();

  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    cardBg: isDark ? "#171D26" : "#FFFFFF",
    cardBorder: isDark ? "#29313D" : "#E2E5E9",
    inputBg: isDark ? "#1E2636" : "#FFFFFF",
    inputBorder: isDark ? "#334155" : "#E2E5E9",
    inputText: isDark ? "#F1F5F9" : "#1E293B",
    placeholder: isDark ? "#64748b" : "#94a3b8",
    iconBg: isDark ? "rgba(54,126,226,0.12)" : "rgba(18,62,125,0.08)",
  };

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim() || !email.trim() || !assunto.trim() || !mensagem.trim()) {
      Toast.show({
        type: "error",
        text1: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    setEnviando(true);
    try {
      // Enviar email via EmailJS REST API
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID,
          template_id: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID,
          user_id: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY,
          template_params: {
            from_name: nome,
            from_email: email,
            phone: telefone || "Não informado",
            subject: assunto,
            message: mensagem,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar email");
      }

      // Salvar no Supabase
      await salvarMensagemContato(
        nome.trim(),
        email.trim(),
        telefone.trim() || null,
        assunto.trim(),
        mensagem.trim()
      );

      Toast.show({
        type: "success",
        text1: "Mensagem enviada com sucesso!",
        text2: "Entraremos em contato em breve.",
      });

      // Limpar formulário
      setNome("");
      setEmail("");
      setTelefone("");
      setAssunto("");
      setMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao enviar mensagem.",
        text2: "Tente novamente mais tarde.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero Section ── */}
        <View style={s.heroContainer}>
          <Text style={[s.heroTitle, { color: c.primary }]}>Fale Conosco</Text>
          <Text style={[s.heroSubtitle, { color: c.muted }]}>
            Estamos aqui para ouvir você. Entre em contato conosco!
          </Text>
        </View>

        <View style={s.contentContainer}>
          {/* ── Formulário ── */}
          <View
            style={[
              s.cardMedium,
              { backgroundColor: c.cardBg, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[s.cardTitle, { color: c.foreground }]}>
              Envie sua Mensagem
            </Text>

            {/* Nome */}
            <View style={s.fieldGroup}>
              <Text style={[s.label, { color: c.foreground }]}>
                Nome Completo *
              </Text>
              <TextInput
                style={[
                  s.input,
                  {
                    backgroundColor: c.inputBg,
                    borderColor: c.inputBorder,
                    color: c.inputText,
                  },
                ]}
                placeholder="Seu nome completo"
                placeholderTextColor={c.placeholder}
                value={nome}
                onChangeText={setNome}
                editable={!enviando}
              />
            </View>

            {/* Email + Telefone */}
            <View style={s.rowFields}>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.label, { color: c.foreground }]}>E-mail *</Text>
                <TextInput
                  style={[
                    s.input,
                    {
                      backgroundColor: c.inputBg,
                      borderColor: c.inputBorder,
                      color: c.inputText,
                    },
                  ]}
                  placeholder="seu@email.com"
                  placeholderTextColor={c.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!enviando}
                />
              </View>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.label, { color: c.foreground }]}>Telefone</Text>
                <TextInput
                  style={[
                    s.input,
                    {
                      backgroundColor: c.inputBg,
                      borderColor: c.inputBorder,
                      color: c.inputText,
                    },
                  ]}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={c.placeholder}
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                  editable={!enviando}
                />
              </View>
            </View>

            {/* Assunto */}
            <View style={s.fieldGroup}>
              <Text style={[s.label, { color: c.foreground }]}>Assunto *</Text>
              <TextInput
                style={[
                  s.input,
                  {
                    backgroundColor: c.inputBg,
                    borderColor: c.inputBorder,
                    color: c.inputText,
                  },
                ]}
                placeholder="Sobre o que você quer falar?"
                placeholderTextColor={c.placeholder}
                value={assunto}
                onChangeText={setAssunto}
                editable={!enviando}
              />
            </View>

            {/* Mensagem */}
            <View style={s.fieldGroup}>
              <Text style={[s.label, { color: c.foreground }]}>Mensagem *</Text>
              <TextInput
                style={[
                  s.textArea,
                  {
                    backgroundColor: c.inputBg,
                    borderColor: c.inputBorder,
                    color: c.inputText,
                  },
                ]}
                placeholder="Escreva sua mensagem aqui..."
                placeholderTextColor={c.placeholder}
                value={mensagem}
                onChangeText={setMensagem}
                multiline
                textAlignVertical="top"
                editable={!enviando}
              />
            </View>

            {/* Botão Enviar */}
            <Pressable
              onPress={handleSubmit}
              disabled={enviando}
              style={({ pressed }) => [
                pressed && { opacity: 0.8 },
                enviando && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? ["#367EE2", "#2563eb"]
                    : ["#1e3a5f", "#123E7D"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.submitButton}
              >
                {enviando ? (
                  <Text style={s.submitButtonText}>Enviando...</Text>
                ) : (
                  <>
                    <Send size={18} color="#ffffff" />
                    <Text style={s.submitButtonText}>Enviar Mensagem</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Text style={[s.requiredNote, { color: c.muted }]}>
              Campos marcados com * são obrigatórios
            </Text>
          </View>

          {/* ── Informações de Contato ── */}
          <View
            style={[
              s.cardSoft,
              { backgroundColor: c.cardBg, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[s.cardTitle, { color: c.foreground }]}>
              Informações de Contato
            </Text>

            {/* Telefone */}
            <Pressable
              style={s.contactRow}
              onPress={() => Linking.openURL("tel:+5500000000000")}
            >
              <View style={[s.iconBox, { backgroundColor: c.iconBg }]}>
                <Phone size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.contactLabel, { color: c.foreground }]}>
                  Telefone
                </Text>
                <Text style={[s.contactValue, { color: c.muted }]}>
                  (00) 0000-0000
                </Text>
                <Text style={[s.contactValue, { color: c.muted }]}>
                  (00) 00000-0000
                </Text>
              </View>
            </Pressable>

            {/* E-mail */}
            <Pressable
              style={s.contactRow}
              onPress={() =>
                Linking.openURL(`mailto:${CONTACT_INFO.email}`)
              }
            >
              <View style={[s.iconBox, { backgroundColor: c.iconBg }]}>
                <Mail size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.contactLabel, { color: c.foreground }]}>
                  E-mail
                </Text>
                <Text style={[s.contactValue, { color: c.primary }]}>
                  {CONTACT_INFO.email}
                </Text>
              </View>
            </Pressable>

            {/* Endereço */}
            <View style={s.contactRow}>
              <View style={[s.iconBox, { backgroundColor: c.iconBg }]}>
                <MapPin size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.contactLabel, { color: c.foreground }]}>
                  Endereço - Sede Central
                </Text>
                <Text style={[s.contactValue, { color: c.muted }]}>
                  {CONTACT_INFO.address}
                  {"\n"}
                  {CONTACT_INFO.city}
                  {"\n"}
                  CEP {CONTACT_INFO.cep}
                </Text>
              </View>
            </View>

            {/* Horário */}
            <View style={[s.contactRow, { marginBottom: 0 }]}>
              <View style={[s.iconBox, { backgroundColor: c.iconBg }]}>
                <Clock size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.contactLabel, { color: c.foreground }]}>
                  Horário de Atendimento
                </Text>
                <Text style={[s.contactValue, { color: c.muted }]}>
                  {CONTACT_INFO.hours}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Localização ── */}
          <View
            style={[
              s.cardSoft,
              { backgroundColor: c.cardBg, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[s.locationTitle, { color: c.foreground }]}>
              Nossa Localização
            </Text>
            <Text style={[s.locationDesc, { color: c.muted }]}>
              Clique no botão abaixo para ver a localização da nossa sede no
              Google Maps
            </Text>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${CONTACT_INFO.coordinates.lat},${CONTACT_INFO.coordinates.lng}`
                )
              }
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <View style={[s.mapsButton, { backgroundColor: c.primary }]}>
                <ExternalLink size={16} color="#ffffff" />
                <Text style={s.mapsButtonText}>Ver no Google Maps</Text>
              </View>
            </Pressable>
          </View>

          {/* ── Redes Sociais ── */}
          <LinearGradient
            colors={
              isDark
                ? ["#1e40af", "#1d4ed8", "#3730a3"]
                : ["#1e3a5f", "#123E7D", "#0f2b52"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.socialCard}
          >
            <Text style={s.socialTitle}>Siga-nos nas Redes Sociais</Text>
            <Text style={s.socialDescription}>
              Fique por dentro de tudo que acontece na nossa igreja
            </Text>
            <View style={s.socialButtonsRow}>
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    "https://web.facebook.com/igrejaevangelicaaviva/"
                  )
                }
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <View style={s.socialButton}>
                  <Text style={s.socialButtonText}>Facebook</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  Linking.openURL(
                    "https://www.instagram.com/igrejaavivanacoes/"
                  )
                }
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <View style={s.socialButton}>
                  <Text style={s.socialButtonText}>Instagram</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  Linking.openURL("https://www.youtube.com/@TvAvivaNacoes")
                }
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <View style={s.socialButton}>
                  <Text style={s.socialButtonText}>YouTube</Text>
                </View>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        <AppFooter />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  // ── Hero ──
  heroContainer: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 400,
  },

  // ── Content ──
  contentContainer: {
    paddingHorizontal: 16,
    gap: 24,
    paddingBottom: 16,
  },

  // ── Cards ──
  cardMedium: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardSoft: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  // ── Form ──
  fieldGroup: {
    marginBottom: 16,
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 140,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 4,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  requiredNote: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },

  // ── Contact Info ──
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Location ──
  locationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  locationDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  mapsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  mapsButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },

  // ── Social ──
  socialCard: {
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
  },
  socialTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  socialDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 20,
    textAlign: "center",
  },
  socialButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  socialButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
  },
  socialButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
