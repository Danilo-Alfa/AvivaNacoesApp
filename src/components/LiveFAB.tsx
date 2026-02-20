import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Radio } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

export function LiveFAB() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={() => router.push("/live")}
      style={({ pressed }) => [
        styles.fab,
        isDark && styles.fabDark,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Radio size={24} color="#ffffff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabDark: {
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
  },
});
