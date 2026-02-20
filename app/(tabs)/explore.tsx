import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Church,
  MapPin,
  CalendarDays,
  FolderHeart,
  Calendar,
  Images,
  Video,
  Newspaper,
  BookOpen,
  Share2,
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { AppFooter } from "@/components/AppFooter";

const SECTIONS = [
  {
    title: "Quem Somos",
    description: "Nossa historia e missao",
    icon: Church,
    route: "/quem-somos" as const,
    color: "#1e3a5f",
  },
  {
    title: "Nossas Igrejas",
    description: "Encontre a sede mais proxima",
    icon: MapPin,
    route: "/nossas-igrejas" as const,
    color: "#059669",
  },
  {
    title: "Programacao",
    description: "Agenda semanal",
    icon: CalendarDays,
    route: "/programacao" as const,
    color: "#7c3aed",
  },
  {
    title: "Projetos",
    description: "Iniciativas sociais",
    icon: FolderHeart,
    route: "/projetos" as const,
    color: "#dc2626",
  },
  {
    title: "Eventos",
    description: "Proximos eventos",
    icon: Calendar,
    route: "/eventos" as const,
    color: "#d97706",
  },
  {
    title: "Galerias",
    description: "Fotos e momentos",
    icon: Images,
    route: "/galerias" as const,
    color: "#0891b2",
  },
  {
    title: "Videos",
    description: "Pregacoes e louvores",
    icon: Video,
    route: "/videos" as const,
    color: "#e11d48",
  },
  {
    title: "Jornal",
    description: "Jornal Aviva News",
    icon: Newspaper,
    route: "/jornal" as const,
    color: "#2563eb",
  },
  {
    title: "Versiculo do Dia",
    description: "Palavra de Deus",
    icon: BookOpen,
    route: "/versiculo-do-dia" as const,
    color: "#4f46e5",
  },
  {
    title: "Redes Sociais",
    description: "Siga-nos online",
    icon: Share2,
    route: "/redes-sociais" as const,
    color: "#0d9488",
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground mb-1">
          Explorar
        </Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Descubra tudo sobre nossa igreja
        </Text>
      </View>

      <View className="px-4 pb-8 flex-row flex-wrap gap-3">
        {SECTIONS.map((section) => (
          <Pressable
            key={section.title}
            className="w-[48%]"
            onPress={() => router.push(section.route)}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Card className="mb-0">
              <CardContent className="items-center py-5">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: section.color + "15" }}
                >
                  <section.icon size={24} color={section.color} />
                </View>
                <Text className="text-sm font-bold text-foreground mb-1 text-center">
                  {section.title}
                </Text>
                <Text className="text-xs text-muted-foreground text-center">
                  {section.description}
                </Text>
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>

      <AppFooter />
    </ScrollView>
  );
}
