import React, { Suspense, lazy } from "react";
import { View, ActivityIndicator } from "react-native";
import { useThemeForScreen } from "@/hooks/useThemeForScreen";

// Lazy-load the WebView component so the ~90% of users who never open this
// screen pay zero cost (no WebView JS bundle loaded at startup).
const EscolaAvivaWebView = lazy(
  () => import("@/components/EscolaAvivaWebView")
);

export default function EscolaAvivaScreen() {
  const { isDark } = useThemeForScreen();
  const bgColor = isDark ? "#0E131B" : "#FFFFFF";

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: bgColor }}>
          <ActivityIndicator size="large" color={isDark ? "#367EE2" : "#1e3a5f"} />
        </View>
      }
    >
      <EscolaAvivaWebView />
    </Suspense>
  );
}
