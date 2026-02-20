import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import * as Linking from "expo-linking";
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
} from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import { AppFooter } from "@/components/AppFooter";

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

export default function RedesSociaisScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      {/* Hero */}
      <View className="bg-primary px-4 py-8 items-center">
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          Nossas Redes Sociais
        </Text>
        <Text className="text-sm text-white/80 text-center">
          Conecte-se conosco e faca parte da nossa comunidade digital
        </Text>
      </View>

      <View className="px-4 py-6">
        {SOCIAL_NETWORKS.map((network) => {
          const IconComponent = ICON_MAP[network.icon] || ExternalLink;
          return (
            <Pressable
              key={network.name}
              onPress={() => Linking.openURL(network.url)}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
              className="mb-3"
            >
              <Card>
                <CardContent>
                  <View className="flex-row items-start">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: network.color }}
                    >
                      <IconComponent size={22} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">
                        {network.name}
                      </Text>
                      {network.handle && (
                        <Text className="text-xs text-primary font-medium">
                          {network.handle}
                        </Text>
                      )}
                      <Text className="text-xs text-muted-foreground mt-1 leading-4">
                        {network.description}
                      </Text>
                      <View className="flex-row items-center mt-3">
                        <View className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-1">
                          <Text className="text-white text-xs font-medium">
                            Seguir
                          </Text>
                          <ExternalLink size={12} color="#ffffff" />
                        </View>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </Pressable>
          );
        })}
      </View>

      <AppFooter />
    </ScrollView>
  );
}
