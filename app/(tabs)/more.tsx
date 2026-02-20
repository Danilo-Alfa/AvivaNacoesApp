import React from "react";
import { ScrollView, View, Text, Pressable, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  MessageCircle,
  Moon,
  Info,
  Trash2,
  ChevronRight,
  ExternalLink,
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { AppFooter } from "@/components/AppFooter";
import { queryClient } from "@/lib/queryClient";
import { clearAllStorage } from "@/lib/storage";
import Toast from "react-native-toast-message";

export default function MoreScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const iconPrimary = isDark ? "#60a5fa" : "#1e3a5f";

  const handleClearCache = () => {
    Alert.alert(
      "Limpar Cache",
      "Isso vai apagar todos os dados salvos offline. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            queryClient.clear();
            clearAllStorage();
            Toast.show({
              type: "success",
              text1: "Cache limpo com sucesso",
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-8">
        {/* Fale Conosco */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
          Contato
        </Text>
        <Card className="mb-6">
          <Pressable
            onPress={() => router.push("/fale-conosco")}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <CardContent className="flex-row items-center">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                <MessageCircle size={20} color={iconPrimary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Fale Conosco
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Entre em contato com a igreja
                </Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </CardContent>
          </Pressable>
        </Card>

        {/* Preferencias */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
          Preferencias
        </Text>
        <Card className="mb-6">
          <CardContent className="flex-row items-center">
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
              <Moon size={20} color={iconPrimary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                Modo Escuro
              </Text>
              <Text className="text-xs text-muted-foreground">
                {isDark ? "Ativado" : "Desativado"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: isDark ? "#334155" : "#e2e8f0", true: iconPrimary }}
              thumbColor="#ffffff"
            />
          </CardContent>
        </Card>

        {/* Dados */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
          Dados
        </Text>
        <Card className="mb-6">
          <Pressable onPress={handleClearCache} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <CardContent className="flex-row items-center">
              <View className="w-10 h-10 bg-destructive/10 rounded-full items-center justify-center mr-3">
                <Trash2 size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Limpar Cache
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Apagar dados salvos offline
                </Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </CardContent>
          </Pressable>
        </Card>

        {/* Sobre */}
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-1">
          Sobre
        </Text>
        <Card>
          <CardContent>
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                <Info size={20} color={iconPrimary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Avivamento para as Nacoes
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Versao {appVersion}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-muted-foreground leading-4">
              Igreja Evangelica Avivamento para as Nacoes. Uma comunidade de fe
              comprometida em levar o amor de Cristo a todas as pessoas.
            </Text>
          </CardContent>
        </Card>
      </View>

      <AppFooter />
    </ScrollView>
  );
}
