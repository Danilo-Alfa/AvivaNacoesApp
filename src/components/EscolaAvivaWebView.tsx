import React, { useState, useRef } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { WifiOff, RefreshCw } from "lucide-react-native";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const ESCOLA_URL =
  process.env.EXPO_PUBLIC_ESCOLA_AVIVA_URL || "https://escola.avivanacoes.com";

export default function EscolaAvivaWebView() {
  const { isDark } = useThemeForScreen();
  const { isOffline } = useNetworkStatus();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const bgColor = isDark ? "#0E131B" : "#FFFFFF";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const primaryColor = isDark ? "#3b82f6" : "#1e3a5f";

  const handleRetry = () => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  if (isOffline || hasError) {
    return (
      <View style={[styles.container, styles.offlineContainer, { backgroundColor: bgColor }]}>
        <View style={[styles.offlineIconBg, { backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(30,58,95,0.1)" }]}>
          <WifiOff size={48} color={primaryColor} />
        </View>
        <Text style={[styles.offlineTitle, { color: textColor }]}>
          {isOffline ? "Sem conexão com a internet" : "Erro ao carregar"}
        </Text>
        <Text style={[styles.offlineMessage, { color: mutedColor }]}>
          A Escola Aviva precisa de conexão com a internet para funcionar. Verifique sua conexão e tente novamente.
        </Text>
        {!isOffline && (
          <Pressable
            onPress={handleRetry}
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
          >
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {loading && (
        <View style={[styles.loader, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: ESCOLA_URL }}
        style={{ flex: 1, backgroundColor: bgColor }}
        onLoadEnd={() => setLoading(false)}
        onError={() => setHasError(true)}
        onHttpError={() => setHasError(true)}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  offlineContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  offlineIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  offlineTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  offlineMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
