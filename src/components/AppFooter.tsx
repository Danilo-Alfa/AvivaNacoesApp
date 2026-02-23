import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/hooks/useTheme";

export const AppFooter = React.memo(function AppFooter() {
  const { isDark } = useTheme();

  const bgColor = isDark ? "rgba(30,41,59,0.3)" : "rgba(241,245,249,0.3)";
  const borderTopColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const copyrightBorderColor = isDark ? "#334155" : "#e2e8f0";

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderTopColor }]}>
      <View style={styles.content}>
        {/* Logo + Church Name + Description */}
        <View style={styles.brandSection}>
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/logoheader.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={[styles.brandName, { color: textColor }]}>
              Avivamento para as Nações
            </Text>
          </View>
          <Text style={[styles.description, { color: mutedColor }]}>
            Levando esperança e transformação através da palavra de Deus.
          </Text>
        </View>

        {/* Social section */}
        <View style={styles.socialSection}>
          <Text style={[styles.socialTitle, { color: textColor }]}>
            Redes Sociais
          </Text>
          <Text style={[styles.socialText, { color: mutedColor }]}>
            Siga-nos nas redes sociais para ficar por dentro de tudo!
          </Text>
        </View>
      </View>

      {/* Copyright */}
      <View style={[styles.copyrightContainer, { borderTopColor: copyrightBorderColor }]}>
        <Text style={[styles.copyrightText, { color: mutedColor }]}>
          © 2026 Avivamento para as Nações. Todos os direitos reservados.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    borderTopWidth: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 24,
  },
  brandSection: {},
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  socialSection: {},
  socialTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  socialText: {
    fontSize: 14,
    lineHeight: 20,
  },
  copyrightContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  copyrightText: {
    fontSize: 14,
    textAlign: "center",
  },
});
