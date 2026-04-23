import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  GearCombinationVisual,
  SpotMapMarkerVisual,
  TacticalBoardVisual,
} from "@/components/ui/AssistantFeatureVisuals";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SectionHeader from "@/components/ui/SectionHeader";
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
          <SectionHeader
            icon={
              <MaterialIcons
                name="location-searching"
                size={24}
                color={accentColor}
              />
            }
            title="Mera Önerisi"
            subtitle="Hava, mevsim ve konum verilerini analiz ederek en verimli avlak noktalarını keşfet."
          />

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
          <SectionHeader
            icon={<MaterialCommunityIcons name="hook" size={24} color={accentColor} />}
            title="Ekipman Tavsiyesi"
            subtitle="Hedef balığına ve meranın koşullarına en uygun olta, makine ve yem kombinasyonunu oluştur."
          />

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
          <SectionHeader
            icon={
              <MaterialIcons
                name="tips-and-updates"
                size={24}
                color={accentColor}
              />
            }
            title="Teknik İpuçları"
            subtitle="Günün en iyi avlanma saatlerini, etkili düğüm çeşitlerini ve ava özel profesyonel teknikleri öğren."
          />

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
