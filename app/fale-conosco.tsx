import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Linking from "expo-linking";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { salvarMensagemContato } from "@/services/contatoService";
import { CONTACT_INFO } from "@/lib/constants";
import Toast from "react-native-toast-message";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";

export default function FaleConoscoScreen() {
  const { isDark } = useTheme();
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim() || !email.trim() || !assunto.trim() || !mensagem.trim()) {
      Toast.show({ type: "error", text1: "Preencha todos os campos obrigatorios" });
      return;
    }

    setEnviando(true);
    try {
      // Send via EmailJS REST API
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID,
          template_id: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID,
          user_id: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY,
          template_params: {
            from_name: nome,
            from_email: email,
            phone: telefone || "Nao informado",
            subject: assunto,
            message: mensagem,
          },
        }),
      });

      await salvarMensagemContato(nome.trim(), email.trim(), telefone.trim() || null, assunto.trim(), mensagem.trim());

      Toast.show({ type: "success", text1: "Mensagem enviada com sucesso!" });
      setNome(""); setEmail(""); setTelefone(""); setAssunto(""); setMensagem("");
    } catch (error) {
      Toast.show({ type: "error", text1: "Erro ao enviar mensagem" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView className="flex-1 bg-background">
        <View className="px-4 py-4">
          {/* Form */}
          <Card className="mb-6">
            <CardContent>
              <Text className="text-lg font-bold text-foreground mb-4">
                Envie sua Mensagem
              </Text>

              <View className="mb-3">
                <Text className="text-xs font-medium text-foreground mb-1">Nome *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground"
                  placeholder="Seu nome completo"
                  placeholderTextColor="#94a3b8"
                  value={nome}
                  onChangeText={setNome}
                  editable={!enviando}
                />
              </View>

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-foreground mb-1">E-mail *</Text>
                  <TextInput
                    className="border border-border rounded-lg px-4 py-3 text-base text-foreground"
                    placeholder="seu@email.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!enviando}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-foreground mb-1">Telefone</Text>
                  <TextInput
                    className="border border-border rounded-lg px-4 py-3 text-base text-foreground"
                    placeholder="(00) 00000-0000"
                    placeholderTextColor="#94a3b8"
                    value={telefone}
                    onChangeText={setTelefone}
                    keyboardType="phone-pad"
                    editable={!enviando}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-xs font-medium text-foreground mb-1">Assunto *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground"
                  placeholder="Sobre o que quer falar?"
                  placeholderTextColor="#94a3b8"
                  value={assunto}
                  onChangeText={setAssunto}
                  editable={!enviando}
                />
              </View>

              <View className="mb-4">
                <Text className="text-xs font-medium text-foreground mb-1">Mensagem *</Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-base text-foreground min-h-[120px]"
                  placeholder="Escreva sua mensagem aqui..."
                  placeholderTextColor="#94a3b8"
                  value={mensagem}
                  onChangeText={setMensagem}
                  multiline
                  textAlignVertical="top"
                  editable={!enviando}
                />
              </View>

              <Button title={enviando ? "Enviando..." : "Enviar Mensagem"} onPress={handleSubmit} loading={enviando} disabled={enviando} />
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="mb-6">
            <CardContent>
              <Text className="text-lg font-bold text-foreground mb-4">
                Informacoes de Contato
              </Text>

              <Pressable
                className="flex-row items-start gap-3 mb-4"
                onPress={() => Linking.openURL(`mailto:${CONTACT_INFO.email}`)}
              >
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center">
                  <Mail size={18} color={iconPrimary} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">E-mail</Text>
                  <Text className="text-xs text-primary">{CONTACT_INFO.email}</Text>
                </View>
              </Pressable>

              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center">
                  <MapPin size={18} color={iconPrimary} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">Endereco</Text>
                  <Text className="text-xs text-muted-foreground">
                    {CONTACT_INFO.address}{"\n"}{CONTACT_INFO.city}{"\n"}CEP {CONTACT_INFO.cep}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center">
                  <Clock size={18} color={iconPrimary} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">Horario</Text>
                  <Text className="text-xs text-muted-foreground">{CONTACT_INFO.hours}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Maps */}
          <Card className="mb-6">
            <CardContent>
              <Text className="text-base font-bold text-foreground mb-2">Localizacao</Text>
              <Pressable
                className="bg-primary rounded-lg flex-row items-center justify-center gap-2 py-3"
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${CONTACT_INFO.coordinates.lat},${CONTACT_INFO.coordinates.lng}`)}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <ExternalLink size={16} color="#ffffff" />
                <Text className="text-white font-medium text-sm">Ver no Google Maps</Text>
              </Pressable>
            </CardContent>
          </Card>
        </View>

        <AppFooter />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
