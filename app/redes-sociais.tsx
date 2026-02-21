import React from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import {
  Facebook,
  Instagram,
  Youtube,
  Radio,
  Heart,
  Newspaper,
  Users,
  Music,
  ExternalLink,
  MessageCircle,
} from "lucide-react-native";
import { AppFooter } from "@/components/AppFooter";
import { useTheme } from "@/hooks/useTheme";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  radio: Radio,
  heart: Heart,
  newspaper: Newspaper,
  users: Users,
  music: Music,
};

const SOCIAL_NETWORKS = [
  {
    name: "Facebook",
    url: "https://web.facebook.com/igrejaevangelicaaviva/",
    handle: "@igrejaevangelicaaviva",
    description:
      "Acompanhe nossas postagens diárias, eventos e transmissões ao vivo dos cultos.",
    followers: "Seguidores ativos",
    color: "#1877F2",
    icon: "facebook",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/igrejaavivanacoes/",
    handle: "@igrejaavivanacoes",
    description:
      "Versículos inspiradores, stories dos eventos e momentos da nossa comunidade.",
    followers: "Comunidade engajada",
    color: "#E4405F",
    icon: "instagram",
  },
  {
    name: "Canal Avivamento para as Nações",
    url: "https://www.youtube.com/@TvAvivaNacoes",
    handle: "@TvAvivaNacoes",
    description:
      "Assista aos cultos completos, pregações, louvores e testemunhos.",
    followers: "Inscritos no canal",
    color: "#FF0000",
    icon: "youtube",
  },
  {
    name: "WebRádio",
    url: "https://app.mobileradio.com.br/WebRadioAvivaNacoes",
    description:
      "Ouça nossa programação 24 horas com louvores, pregações e conteúdo edificante.",
    followers: "Ouvintes online",
    color: "#7C3AED",
    icon: "radio",
  },
  {
    name: "Associação Beneficente EL Roi",
    url: "https://www.facebook.com/share/194jRRsrGp/",
    description:
      "Conheça nossos projetos sociais e ações de amor ao próximo na comunidade.",
    followers: "Vidas impactadas",
    color: "#EC4899",
    icon: "heart",
  },
  {
    name: "Jornal Aviva News",
    url: "https://portaldojoan.my.canva.site/",
    description:
      "Notícias, artigos e conteúdo informativo sobre fé, família e sociedade.",
    followers: "Leitores",
    color: "#3B82F6",
    icon: "newspaper",
  },
  {
    name: "Aviva Jovens",
    url: "https://www.instagram.com/_aviva.jovens",
    handle: "@_aviva.jovens",
    description:
      "Ministério voltado para jovens com eventos, encontros e conteúdo relevante.",
    followers: "Jovens conectados",
    color: "#7C3AED",
    icon: "instagram",
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/show/6UxigeE1ZivVsJxRdVokSJ",
    description:
      "Ouça nossas playlists, pregações e louvores na maior plataforma de streaming.",
    followers: "Ouvintes mensais",
    color: "#1DB954",
    icon: "music",
  },
];

const WHAT_WE_POST = [
  {
    emoji: "📖",
    title: "Versículos Diários",
    description: "Palavras de fé e esperança para o seu dia",
  },
  {
    emoji: "🎥",
    title: "Transmissões Ao Vivo",
    description: "Cultos e eventos transmitidos em tempo real",
  },
  {
    emoji: "📅",
    title: "Eventos e Avisos",
    description: "Fique por dentro de tudo que acontece",
  },
];

export default function RedesSociaisScreen() {
  const { isDark } = useTheme();

  const c = {
    bg: isDark ? "#0E131B" : "#FFFFFF",
    foreground: isDark ? "#FAFAFA" : "#1D2530",
    muted: isDark ? "#9DA4AF" : "#627084",
    primary: isDark ? "#367EE2" : "#123E7D",
    cardBg: isDark ? "#171D26" : "#FFFFFF",
    cardBorder: isDark ? "#29313D" : "#E2E5E9",
    mutedBg: isDark ? "#252C37" : "#F3F5F6",
    badgeBg: isDark ? "rgba(54,126,226,0.08)" : "rgba(18,62,125,0.05)",
    badgeBorder: isDark ? "rgba(54,126,226,0.25)" : "rgba(18,62,125,0.2)",
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={["#1d4ed8", "#1e40af", "#3730a3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroContainer}
      >
        {/* Decorative circles */}
        <View style={[s.decorCircle, s.decorCircleLeft]} />
        <View style={[s.decorCircle, s.decorCircleRight]} />

        {/* Decorative icon row */}
        <View style={s.iconRow}>
          <View style={s.heroIconCircle}>
            <Heart size={18} color="rgba(255,255,255,0.8)" />
          </View>
          <View style={s.heroIconCircle}>
            <Users size={18} color="rgba(255,255,255,0.8)" />
          </View>
          <View style={s.heroIconCircle}>
            <MessageCircle size={18} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        <Text style={s.heroTitle}>Nossas Redes Sociais</Text>
        <Text style={s.heroSubtitle}>
          Conecte-se conosco e faça parte da nossa comunidade digital.
          {"\n"}Acompanhe conteúdos inspiradores, eventos e muito mais!
        </Text>

        {/* Decorative line */}
        <View style={s.heroLine} />
      </LinearGradient>

      {/* Social Networks Cards */}
      <View style={s.cardsContainer}>
        {SOCIAL_NETWORKS.map((network) => {
          const IconComponent = ICON_MAP[network.icon] || ExternalLink;
          return (
            <View
              key={network.name}
              style={[
                s.card,
                { backgroundColor: c.cardBg, borderColor: c.cardBorder },
              ]}
            >
              {/* Icon */}
              <View
                style={[s.networkIcon, { backgroundColor: network.color }]}
              >
                <IconComponent size={24} color="#ffffff" />
              </View>

              {/* Name */}
              <Text style={[s.networkName, { color: c.foreground }]}>
                {network.name}
              </Text>

              {/* Handle */}
              {network.handle && (
                <Text style={[s.networkHandle, { color: c.primary }]}>
                  {network.handle}
                </Text>
              )}

              {/* Description */}
              <Text style={[s.networkDescription, { color: c.muted }]}>
                {network.description}
              </Text>

              {/* Followers Badge */}
              <View
                style={[
                  s.followersBadge,
                  {
                    backgroundColor: c.badgeBg,
                    borderColor: c.badgeBorder,
                  },
                ]}
              >
                <View
                  style={[s.followersDot, { backgroundColor: c.primary }]}
                />
                <Text style={[s.followersText, { color: c.primary }]}>
                  {network.followers}
                </Text>
              </View>

              {/* Follow Button */}
              <Pressable
                onPress={() => Linking.openURL(network.url)}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <View
                  style={[
                    s.followButton,
                    { backgroundColor: c.primary },
                  ]}
                >
                  <Text style={s.followButtonText}>Seguir</Text>
                  <ExternalLink size={14} color="#ffffff" />
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* What We Post Section */}
      <View style={[s.whatWePostSection, { backgroundColor: c.mutedBg }]}>
        <Text style={[s.whatWePostTitle, { color: c.foreground }]}>
          O Que Você Encontra
        </Text>
        <View style={s.whatWePostGrid}>
          {WHAT_WE_POST.map((item) => (
            <View key={item.title} style={s.whatWePostItem}>
              <View
                style={[
                  s.whatWePostIconBox,
                  { backgroundColor: c.badgeBg },
                ]}
              >
                <Text style={s.whatWePostEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[s.whatWePostItemTitle, { color: c.foreground }]}>
                {item.title}
              </Text>
              <Text style={[s.whatWePostItemDesc, { color: c.muted }]}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <AppFooter />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // ── Hero ──
  heroContainer: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  decorCircleLeft: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(59,130,246,0.2)",
    left: -60,
    top: "30%",
  },
  decorCircleRight: {
    width: 260,
    height: 260,
    backgroundColor: "rgba(99,102,241,0.1)",
    right: -60,
    top: -60,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(191,219,254,0.8)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 340,
  },
  heroLine: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginTop: 24,
  },

  // ── Cards ──
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  networkIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  networkName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  networkHandle: {
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 8,
  },
  networkDescription: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 16,
  },
  followersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  followersDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  followersText: {
    fontSize: 16,
    fontWeight: "500",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  followButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },

  // ── What We Post ──
  whatWePostSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  whatWePostTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  whatWePostGrid: {
    gap: 28,
  },
  whatWePostItem: {
    alignItems: "center",
  },
  whatWePostIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  whatWePostEmoji: {
    fontSize: 26,
  },
  whatWePostItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  whatWePostItemDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
