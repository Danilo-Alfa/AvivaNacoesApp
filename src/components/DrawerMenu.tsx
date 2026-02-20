import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  Home,
  Users,
  Church,
  CalendarDays,
  Radio,
  FolderHeart,
  Images,
  Calendar,
  Video,
  BookOpen,
  Newspaper,
  Heart,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { getLiveStatus } from "@/services/liveService";

const DRAWER_WIDTH = 320;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    title: "Navegação Principal",
    items: [
      { icon: Home, title: "Home", route: "/", color: "#3b82f6" },
      { icon: Users, title: "Quem Somos", route: "/quem-somos", color: "#6366f1" },
      { icon: Church, title: "Nossas Igrejas", route: "/nossas-igrejas", color: "#8b5cf6" },
      { icon: CalendarDays, title: "Programação", route: "/programacao", color: "#ec4899" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { icon: Radio, title: "Live", route: "/live", color: "#ef4444", isLiveItem: true },
      { icon: FolderHeart, title: "Projetos", route: "/projetos", color: "#f97316" },
      { icon: Images, title: "Fotos", route: "/galerias", color: "#f59e0b" },
      { icon: Calendar, title: "Eventos", route: "/eventos", color: "#eab308", hasNewBadge: true },
      { icon: Video, title: "Vídeos", route: "/videos", color: "#84cc16" },
    ],
  },
  {
    title: "Devocional",
    items: [
      { icon: BookOpen, title: "Versículo do Dia", route: "/versiculo-do-dia", color: "#10b981" },
      { icon: Newspaper, title: "Jornal", route: "/jornal", color: "#14b8a6" },
    ],
  },
  {
    title: "Contato",
    items: [
      { icon: Heart, title: "Redes Sociais", route: "/redes-sociais", color: "#f43f5e" },
      { icon: MessageSquare, title: "Fale Conosco", route: "/fale-conosco", color: "#06b6d4" },
    ],
  },
];

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();

  // Dark-mode adaptive colors (from web CSS: sites/igreja/src/index.css)
  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    border: isDark ? "#29313D" : "#E2E5E9",
    secondary30: isDark ? "rgba(37,44,55,0.3)" : "rgba(240,242,244,0.3)",
    pressedBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    activeBg: isDark ? "rgba(54,126,226,0.2)" : "rgba(18,62,125,0.1)",
    activeText: isDark ? "#60a5fa" : "#123E7D",
    themeIconBg: isDark ? "rgba(54,126,226,0.2)" : "#fef3c7",
  };

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  useEffect(() => {
    const checkLive = async () => {
      try {
        const status = await getLiveStatus();
        setIsLiveActive(status.ativa);
      } catch {
        setIsLiveActive(false);
      }
    };
    checkLive();
    const interval = setInterval(checkLive, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 300 }),
      ]).start();
    } else if (isRendered) {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 250, useNativeDriver: true }),
      ]).start(() => setIsRendered(false));
    }
  }, [visible]);

  // Auto-close drawer when the route actually changes.
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname && visible) {
      onClose();
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  const isRouteActive = (route: string) => {
    if (route === "/") return pathname === "/" || pathname === "/(tabs)" || pathname === "/(tabs)/index";
    return pathname === route || pathname.startsWith(route + "/");
  };

  const navigateTo = (route: string) => {
    if (isRouteActive(route)) {
      onClose();
      return;
    }
    router.navigate(route as any);
  };

  if (!isRendered) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropAnim }]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View
        style={[styles.drawer, { paddingTop: insets.top, backgroundColor: c.bg, transform: [{ translateX: slideAnim }] }]}
      >
        {/* Header — web: bg-gradient-to-br from-[#1a3352] via-[#1e3a5f] to-[#2d5a8a] pt-8 pb-20 px-6 */}
        <View style={styles.drawerHeader}>
          {/* Close button — web: w-12 h-12 rounded-full bg-white/15 border-white/20 */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#ffffff" />
          </Pressable>

          {/* Logo + brand — web: flex items-center gap-4 mb-4 */}
          <View style={styles.headerBrand}>
            <Image
              source={require("../../assets/images/logoheader.png")}
              style={styles.headerLogo}
              contentFit="contain"
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.headerTitle}>
                Avivamento{"\n"}para as Nações
              </Text>
              <Text style={styles.headerSubtitle}>Menu de Navegação</Text>
            </View>
          </View>

          {/* Welcome text — web: text-white/70 text-sm leading-relaxed */}
          <Text style={styles.headerWelcome}>
            Bem-vindo! Explore nosso conteúdo e conecte-se conosco.
          </Text>

          {/* Curve transition — web: SVG viewBox="0 0 380 50" */}
          <View style={[styles.curveTransition, { backgroundColor: c.bg }]} />
        </View>

        {/* Menu Content — web: px-4 py-2 */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}
        >
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              {/* Section title — web: text-[11px] font-bold uppercase tracking-wider mb-2.5 px-2 */}
              <Text style={[styles.sectionTitle, { color: c.muted }]}>{section.title}</Text>

              {section.items.map((item) => {
                const isLiveItem = "isLiveItem" in item && item.isLiveItem;
                const hasNewBadge = "hasNewBadge" in item && item.hasNewBadge;
                const isActive = isRouteActive(item.route);

                return (
                  <RectButton
                    key={item.title}
                    onPress={() => navigateTo(item.route)}
                    rippleColor={c.pressedBg}
                    underlayColor={c.pressedBg}
                    style={[
                      styles.menuItem,
                      isActive && { backgroundColor: c.activeBg },
                    ]}
                  >
                    {/* Icon — web: w-10 h-10 rounded-xl shadow-md */}
                    <View style={[styles.menuItemIcon, { backgroundColor: item.color }]}>
                      <item.icon size={20} color="#ffffff" />
                    </View>

                    {/* Name — web: font-medium, active: text-primary dark:text-blue-400 */}
                    <Text style={[
                      styles.menuItemText,
                      { color: isActive ? c.activeText : c.foreground },
                    ]}>
                      {item.title}
                    </Text>

                    {/* Live badge — web: text-[10px] font-bold bg-red-500 rounded-full */}
                    {isLiveItem && isLiveActive && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveBadgeText}>AO VIVO</Text>
                      </View>
                    )}

                    {/* New badge — web: text-[10px] font-bold bg-accent rounded-full */}
                    {hasNewBadge && (
                      <View style={styles.novoBadge}>
                        <Text style={styles.novoBadgeText}>NOVO</Text>
                      </View>
                    )}

                    {/* Active dot — web: w-2 h-2 rounded-full bg-primary dark:bg-blue-400 */}
                    {isActive && (
                      <View style={[styles.activeDot, { backgroundColor: c.activeText }]} />
                    )}
                  </RectButton>
                );
              })}
            </View>
          ))}

          {/* CTA Card — web: from-amber-50 border-amber-200/50, dark: from-amber-900/20 border-amber-700/30 */}
          <View style={[styles.ctaCard, isDark && styles.ctaCardDark]}>
            <View style={styles.ctaIconContainer}>
              <Heart size={24} color="#ffffff" fill="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              {/* web: text-lg text-amber-900 dark:text-amber-200 */}
              <Text style={[styles.ctaTitle, isDark && { color: "#fde68a" }]}>Faça parte da família!</Text>
              {/* web: text-sm text-amber-700 dark:text-amber-300/80 */}
              <Text style={[styles.ctaSubtitle, isDark && { color: "rgba(252,211,77,0.8)" }]}>
                Venha nos visitar e experimentar o amor de Deus.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer — web: border-t border-border/50 px-6 py-4 bg-secondary/30 */}
        <View style={[styles.themeFooter, {
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopColor: c.border,
          backgroundColor: c.secondary30,
        }]}>
          <View style={styles.themeRow}>
            {/* web: w-9 h-9 rounded-xl, dark: bg-primary/20, light: bg-amber-100 */}
            <View style={[styles.themeIconBg, { backgroundColor: c.themeIconBg }]}>
              {isDark ? <Moon size={20} color="#60a5fa" /> : <Sun size={20} color="#d97706" />}
            </View>
            <Text style={[styles.themeText, { color: c.foreground }]}>{isDark ? "Modo Escuro" : "Modo Claro"}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#E2E5E9", true: c.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },

  /* Header — web: bg-gradient from-[#1a3352] via-[#1e3a5f] to-[#2d5a8a] pt-8 pb-20 px-6 */
  drawerHeader: {
    backgroundColor: "#1e3a5f",
    paddingTop: 32,
    paddingBottom: 64,
    paddingHorizontal: 24,
    position: "relative",
    overflow: "visible",
  },
  /* web: absolute top-4 right-4 w-12 h-12 rounded-full bg-white/15 border-white/20 */
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  /* web: flex items-center gap-4 mb-4 */
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  /* web: w-16 h-16 rounded-2xl */
  headerLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  /* web: text-2xl (24px) font-bold → +4 = 28 */
  headerTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 28,
    lineHeight: 34,
  },
  /* web: text-white/60 text-sm (14px) font-medium → +4 = 18 */
  headerSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 2,
  },
  /* web: text-white/70 text-sm (14px) leading-relaxed → +4 = 18 */
  headerWelcome: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    lineHeight: 28,
  },
  /* web: SVG curve viewBox="0 0 380 50" at -bottom-1 */
  curveTransition: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  /* Sections — web: mb-5 (20px) */
  section: {
    marginBottom: 20,
  },
  /* web: text-[11px] font-bold uppercase tracking-wider mb-2.5 px-2 → +4 = 15 */
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  /* web: flex items-center gap-3 px-3 py-3 rounded-xl */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  /* web: w-10 h-10 rounded-xl shadow-md */
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  /* web: flex-1 font-medium (default 16px) → +4 = 20 */
  menuItemText: {
    fontSize: 20,
    fontWeight: "500",
    flex: 1,
  },

  /* Active dot — web: w-2 h-2 rounded-full */
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* Live badge — web: px-2 py-1 text-[10px] bg-red-500 rounded-full gap-1.5 */
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  /* web: text-[10px] → +4 = 14 */
  liveBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  /* web: px-2 py-1 text-[10px] bg-accent rounded-full */
  novoBadge: {
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  /* web: text-[10px] → +4 = 14 */
  novoBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },

  /* CTA Card — web: rounded-2xl p-5 border border-amber-200/50 */
  ctaCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(253,230,138,0.5)",
    gap: 16,
  },
  /* web: dark: from-amber-900/20 border-amber-700/30 */
  ctaCardDark: {
    backgroundColor: "rgba(120,53,15,0.2)",
    borderColor: "rgba(180,83,9,0.3)",
  },
  /* web: w-12 h-12 rounded-xl bg-accent shadow-lg shadow-accent/30 */
  ctaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  /* web: font-bold text-lg (18px) text-amber-900 → +4 = 22 */
  ctaTitle: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#78350f",
  },
  /* web: text-sm (14px) text-amber-700 leading-relaxed → +4 = 18 */
  ctaSubtitle: {
    fontSize: 18,
    color: "#b45309",
    marginTop: 4,
    lineHeight: 28,
  },

  /* Theme Footer — web: border-t border-border/50 px-6 py-4 bg-secondary/30 */
  themeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  /* web: w-9 h-9 rounded-xl */
  themeIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  /* web: text-sm (14px) font-medium → +4 = 18 */
  themeText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
