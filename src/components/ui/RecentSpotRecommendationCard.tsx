/**
 * RecentSpotRecommendationCard — Yapay zeka mera önerisi kartı.
 * Sparkle ikonu, AI rozeti, nokta adı ve yönlendirme butonuyla
 * normal kartlardan görsel olarak ayrışır.
 */
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useColorScheme, View } from "react-native";

import AnimatedPressable from "./AnimatedPressable";
import Typography from "./Typography";

interface RecentSpotRecommendationCardProps {
  /** Önerilen nokta adı */
  spotName: string;
  /** Öneri notu */
  note: string;
  /** Karta basıldığında */
  onPress: () => void;
}

export default function RecentSpotRecommendationCard({
  spotName,
  note,
  onPress,
}: RecentSpotRecommendationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <AnimatedPressable onPress={onPress}>
      <View className="overflow-hidden rounded-2xl border border-mera-accent/20 dark:border-mera-accent/30">
        <LinearGradient
          colors={
            isDark
              ? ["rgba(0,204,178,0.08)", "rgba(0,204,178,0.02)"]
              : ["rgba(25,38,85,0.06)", "rgba(25,38,85,0.01)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16 }}
        >
          {/* Üst satır: AI rozeti */}
          <View className="mb-3 flex-row items-center">
            <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-mera-accent/15">
              <MaterialIcons
                name="auto-awesome"
                size={16}
                color={isDark ? "#00ccb2" : "#192655"}
              />
            </View>
            <View className="rounded-full bg-mera-accent/10 px-2.5 py-0.5">
              <Typography
                variant="caption"
                className="text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
              >
                Mera
              </Typography>
            </View>
          </View>

          {/* İçerik */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Typography variant="body" className="mb-1 font-inter-semibold">
                {spotName}
              </Typography>
              <Typography variant="caption" className="text-xs">
                {note}
              </Typography>
            </View>

            {/* Yönlendirme butonu */}
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark
                  ? "rgba(0,204,178,0.15)"
                  : "rgba(25,38,85,0.08)",
              }}
            >
              <Ionicons
                name="navigate"
                size={20}
                color={isDark ? "#00ccb2" : "#192655"}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
}
