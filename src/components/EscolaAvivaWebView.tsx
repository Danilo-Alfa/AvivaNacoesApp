import React, { useState, useRef, useCallback } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet, Platform, InteractionManager } from "react-native";
import { WebView } from "react-native-webview";
import { WifiOff, RefreshCw } from "lucide-react-native";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ESCOLA_URL =
  process.env.EXPO_PUBLIC_ESCOLA_AVIVA_URL || "https://escola-aviva-nacoes.vercel.app";

export default function EscolaAvivaWebView() {
  const { isDark } = useThemeForScreen();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [exiting, setExiting] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const bgColor = isDark ? "#0E131B" : "#FFFFFF";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const primaryColor = isDark ? "#3b82f6" : "#1e3a5f";

  const handleBack = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    InteractionManager.runAfterInteractions(() => {
      router.replace("/");
    });
  }, [router, exiting]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  const onLoadEnd = useCallback(() => setLoading(false), []);
  const onError = useCallback(() => setHasError(true), []);

  if (hasError) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
        <View style={[styles.backBar, { backgroundColor: primaryColor }]}>
          <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
            <Text style={styles.backText} numberOfLines={1}><Text style={styles.backArrow}>{"\u2039"}</Text>{"  Voltar ao App"}</Text>
          </Pressable>
        </View>
        <View style={styles.offlineContainer}>
          <View style={[styles.offlineIconBg, { backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(30,58,95,0.1)" }]}>
            <WifiOff size={48} color={primaryColor} />
          </View>
          <Text style={[styles.offlineTitle, { color: textColor }]}>
            Erro ao carregar
          </Text>
          <Text style={[styles.offlineMessage, { color: mutedColor }]}>
            A Escola Aviva precisa de conexão com a internet para funcionar. Verifique sua conexão e tente novamente.
          </Text>
          <Pressable
            onPress={handleRetry}
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
          >
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <View style={[styles.backBar, { backgroundColor: primaryColor }]}>
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backText} numberOfLines={1}><Text style={styles.backArrow}>{"\u2039"}</Text>{"  Voltar ao App"}</Text>
        </Pressable>
      </View>
      {(loading || exiting) && (
        <View style={[styles.loader, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      )}
      {!exiting && (
        <WebView
          ref={webViewRef}
          source={{ uri: ESCOLA_URL }}
          style={styles.webview}
          onLoadEnd={onLoadEnd}
          onError={onError}
          onHttpError={onError}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          allowsBackForwardNavigationGestures
          cacheEnabled
          cacheMode="LOAD_DEFAULT"
          mediaPlaybackRequiresUserAction
          allowsInlineMediaPlayback
          setSupportMultipleWindows={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          textZoom={100}
          originWhitelist={["https://*"]}
          renderToHardwareTextureAndroid
          {...(Platform.OS === "android" && {
            androidLayerType: "hardware",
            setBuiltInZoomControls: false,
            geolocationEnabled: false,
            mixedContentMode: "compatibility",
          })}
          {...(Platform.OS === "ios" && {
            contentInsetAdjustmentBehavior: "never",
            automaticallyAdjustContentInsets: false,
            decelerationRate: "normal",
            allowsLinkPreview: false,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBar: {
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backArrow: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 24,
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  offlineContainer: {
    flex: 1,
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
