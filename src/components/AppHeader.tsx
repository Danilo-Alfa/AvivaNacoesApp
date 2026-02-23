import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Menu } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

interface AppHeaderProps {
  onMenuPress: () => void;
  scrolled?: boolean;
}

export const AppHeader = React.memo(function AppHeader({ onMenuPress, scrolled = false }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  // Dark-mode adaptive colors (from web CSS: sites/igreja/src/index.css)
  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    primary: isDark ? "#367EE2" : "#123E7D",
    muted: isDark ? "#9DA4AF" : "#627084",
    border: isDark ? "#29313D" : "#E2E5E9",
    titleColor: isDark ? "#60a5fa" : "#123E7D", // web: text-primary dark:text-blue-400
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: c.bg, borderBottomColor: c.border },
        scrolled && {
          shadowColor: isDark ? "#000000" : c.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 20,
          elevation: 6,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Logo + Brand — web: flex items-center gap-3 */}
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/images/logo-nova.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <View style={styles.textContainer}>
            {/* web: text-[10px] font-medium text-muted-foreground uppercase tracking-wider */}
            <Text style={[styles.subtitle, { color: c.muted }]}>
              Igreja Evangélica
            </Text>
            {/* web: text-md font-bold text-primary dark:text-blue-400 */}
            <Text style={[styles.title, { color: c.titleColor }]} numberOfLines={1}>
              Avivamento para as Nações
            </Text>
          </View>
        </View>

        {/* Hamburger Menu — web: w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 */}
        <Pressable onPress={onMenuPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <View style={[styles.menuButton, { backgroundColor: c.primary, shadowColor: c.primary }]}>
            <Menu size={20} color="#ffffff" />
          </View>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 64,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  /* web: w-12 h-12 md:w-14 md:h-14 */
  logo: {
    width: 48,
    height: 48,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  /* web: text-[10px] font-medium uppercase tracking-wider */
  subtitle: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  /* web: text-md font-bold */
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: -1,
    textAlign: "center",
  },
  /* web: w-12 h-12 rounded-xl shadow-lg shadow-primary/30 */
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
