import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { OfflineBanner } from "@/components/OfflineBanner";
import { initStorage, mmkvStorage } from "@/lib/storage";
import { DrawerMenu } from "@/components/DrawerMenu";
import { LiveFAB } from "@/components/LiveFAB";
import { AppHeader } from "@/components/AppHeader";
import { DrawerProvider, useDrawer } from "@/contexts/DrawerContext";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AppContent() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { drawerOpen, openDrawer, closeDrawer } = useDrawer();

  useEffect(() => {
    const saved = mmkvStorage.getItem("theme_mode");
    if (saved === "dark" || saved === "light") {
      setColorScheme(saved);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#0e1219" : "#ffffff" }}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Global header — same on every page, just like the web */}
      <AppHeader onMenuPress={openDrawer} />

      <OfflineBanner />

      {/* All screens render below the header with NO native header */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#0e1219" : "#ffffff",
          },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
        <Stack.Screen name="quem-somos" />
        <Stack.Screen name="nossas-igrejas" />
        <Stack.Screen name="programacao" />
        <Stack.Screen name="eventos" />
        <Stack.Screen name="videos" />
        <Stack.Screen name="galerias" />
        <Stack.Screen name="projetos" />
        <Stack.Screen name="versiculo-do-dia" />
        <Stack.Screen name="jornal" />
        <Stack.Screen name="redes-sociais" />
        <Stack.Screen name="fale-conosco" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <LiveFAB />
      <DrawerMenu visible={drawerOpen} onClose={closeDrawer} />
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    initStorage().then(() => setStorageReady(true));
  }, []);

  if (!storageReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1e3a5f" }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <DrawerProvider>
            <AppContent />
          </DrawerProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
