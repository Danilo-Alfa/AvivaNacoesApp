import "../global.css";
import React, { useEffect, useLayoutEffect, useState, useMemo } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persistOptions } from "@/lib/queryClient";
import { OfflineBanner } from "@/components/OfflineBanner";
import { initStorage, mmkvStorage } from "@/lib/storage";
import { setupOnlineManager } from "@/lib/onlineManager";
import { setupNotificationHandler } from "@/services/notificationService";
import { DrawerMenu } from "@/components/DrawerMenu";
import { LiveFAB } from "@/components/LiveFAB";
import { AppHeader } from "@/components/AppHeader";
import { DrawerProvider, useDrawer } from "@/contexts/DrawerContext";
import Toast from "react-native-toast-message";
import { useNotifications } from "@/hooks/useNotifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Setup React Query online manager with NetInfo (runs once at module scope)
setupOnlineManager();

// Setup notification handler (runs once at module scope)
setupNotificationHandler();

function AppContent() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { drawerOpen, openDrawer, closeDrawer } = useDrawer();

  // Initialize push notifications (register token, listeners)
  useNotifications();

  // useLayoutEffect runs BEFORE paint — eliminates the light→dark flash
  useLayoutEffect(() => {
    const saved = mmkvStorage.getItem("theme_mode");
    if (saved === "dark" || saved === "light") {
      setColorScheme(saved);
    }
  }, []);

  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#0e1219" : "#ffffff";

  const rootStyle = useMemo(() => ({ flex: 1, backgroundColor: bgColor } as const), [bgColor]);
  const contentStyle = useMemo(() => ({ backgroundColor: bgColor }), [bgColor]);

  return (
    <View style={rootStyle}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Global header — same on every page, just like the web */}
      <AppHeader onMenuPress={openDrawer} />

      <OfflineBanner />

      {/* All screens render below the header with NO native header */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle,
          animation: "slide_from_right",
          animationDuration: 150,
        }}
      >
        <Stack.Screen name="(tabs)" />
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

      <View pointerEvents="box-none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
        <LiveFAB hidden={drawerOpen} />
      </View>
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
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <DrawerProvider>
            <AppContent />
          </DrawerProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
