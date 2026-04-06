import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background items-center justify-center px-4">
      <Text className="text-6xl font-bold text-muted-foreground mb-4">404</Text>
      <Text className="text-xl font-bold text-foreground mb-2">
        Pagina nao encontrada
      </Text>
      <Text className="text-sm text-muted-foreground text-center mb-6">
        A pagina que voce procura nao existe.
      </Text>
      <Button title="Voltar ao Inicio" onPress={() => router.replace("/")} />
    </View>
  );
}
