import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  GearCombinationVisual,
  SpotMapMarkerVisual,
  TacticalBoardVisual,
} from "@/components/ui/AssistantFeatureVisuals";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

export default function AsistanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <View className="mb-2 flex-row items-center">
            <MaterialIcons
              name="location-searching"
              size={24}
              color={accentColor}
            />
            <Typography variant="h2" className="ml-2">
              Mera Önerisi
            </Typography>
          </View>

          <Typography variant="caption" className="mb-4">
            Hava, mevsim ve konum verilerini analiz ederek en verimli avlak
            noktalarını keşfet.
          </Typography>

          <Pressable
            className="h-40 flex-row overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-950"
            onPress={() => router.push("/assistant/spot-recommendation")}
            style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}
          >
            <View className="h-full flex-1">
              <SpotMapMarkerVisual accentColor={accentColor} isDark={isDark} />
            </View>
            <View className="h-full w-20 items-center justify-center bg-mera-primary dark:bg-mera-accent">
              <Typography
                variant="h2"
                className="text-3xl text-mera-neutral-100 dark:text-mera-neutral-200"
              >
                {">"}
              </Typography>
            </View>
          </Pressable>
        </View>

        <View className="mb-6">
          <View className="mb-2 flex-row items-center">
            <MaterialCommunityIcons name="hook" size={24} color={accentColor} />
            <Typography variant="h2" className="ml-2">
              Ekipman Tavsiyesi
            </Typography>
          </View>

          <Typography variant="caption" className="mb-4">
            Hedef balığına ve meranın koşullarına en uygun olta, makine ve yem
            kombinasyonunu oluştur.
          </Typography>

          <Pressable
            className="h-40 flex-row overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-950"
            onPress={() => router.push("/assistant/gear-recommendation")}
            style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}
          >
            <View className="h-full flex-1">
              <GearCombinationVisual
                accentColor={accentColor}
                isDark={isDark}
              />
            </View>
            <View className="h-full w-20 items-center justify-center bg-mera-primary dark:bg-mera-accent">
              <Typography
                variant="h2"
                className="text-3xl text-mera-neutral-100 dark:text-mera-neutral-200"
              >
                {">"}
              </Typography>
            </View>
          </Pressable>
        </View>

        <View>
          <View className="mb-2 flex-row items-center">
            <MaterialIcons
              name="tips-and-updates"
              size={24}
              color={accentColor}
            />
            <Typography variant="h2" className="ml-2">
              Teknik İpuçları
            </Typography>
          </View>

          <Typography variant="caption" className="mb-4">
            Günün en iyi avlanma saatlerini, etkili düğüm çeşitlerini ve ava
            özel profesyonel teknikleri öğren.
          </Typography>

          <Pressable
            className="h-40 flex-row overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-950"
            onPress={() => router.push("/assistant/technique-tips")}
            style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}
          >
            <View className="h-full flex-1">
              <TacticalBoardVisual accentColor={accentColor} isDark={isDark} />
            </View>
            <View className="h-full w-20 items-center justify-center bg-mera-primary dark:bg-mera-accent">
              <Typography
                variant="h2"
                className="text-3xl text-mera-neutral-100 dark:text-mera-neutral-200"
              >
                {">"}
              </Typography>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
