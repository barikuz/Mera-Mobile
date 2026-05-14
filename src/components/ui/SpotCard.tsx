/**
 * SpotCard — Av noktası kartı (En Yakın ve Popüler bölümleri için).
 * Üst kısımda renkli vurgu çizgisi, su tipi ikonu, mesafe rozeti
 * ve harita yönlendirmesi içerir. AnimatedPressable ile sarmalanır.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useColorScheme, View } from "react-native";

import AnimatedPressable from "./AnimatedPressable";
import StatusBadge from "./StatusBadge";
import Typography from "./Typography";

interface SpotCardProps {
  /** Nokta adı */
  name: string;
  /** Mesafe etiketi (örn. "4.2 km") */
  distanceLabel: string;
  /** Su tipi etiketi */
  waterType: string;
  /** Karta basıldığında */
  onPress: () => void;
}

const WATER_TYPE_ICON: Record<string, { name: string; color: string }> = {
  "Tuzlu Su": { name: "waves", color: "#0EA5E9" },
  "Tatli Su": { name: "water", color: "#10B981" },
  Akarsu: { name: "water-outline", color: "#6366F1" },
};

export default function SpotCard({
  name,
  distanceLabel,
  waterType,
  onPress,
}: SpotCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const waterIcon = WATER_TYPE_ICON[waterType] || {
    name: "water",
    color: "#0EA5E9",
  };

  return (
    <AnimatedPressable onPress={onPress} className="w-52">
      <View className="overflow-hidden rounded-2xl border border-mera-neutral-200 bg-white dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
        {/* Üst gradient vurgu çizgisi */}
        <LinearGradient
          colors={[waterIcon.color, `${waterIcon.color}40`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 3 }}
        />

        <View className="p-4">
          {/* Başlık satırı */}
          <View className="mb-2 flex-row items-center">
            <MaterialCommunityIcons
              name={waterIcon.name as any}
              size={18}
              color={waterIcon.color}
            />
            <Typography
              variant="body"
              className="ml-2 flex-1 font-inter-semibold text-sm"
              numberOfLines={1}
            >
              {name}
            </Typography>
          </View>

          {/* Su tipi rozeti */}
          <View className="mb-3">
            <StatusBadge
              label={waterType}
              bgClass="bg-mera-primary/8 dark:bg-mera-accent/25 rounded-lg"
              textClass="text-mera-primary dark:text-mera-accent"
              noMarginBottom
              noMarginLeft
            />
          </View>

          {/* Alt bilgi satırı */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name="location-outline"
                size={14}
                color={isDark ? "#64748B" : "#64748B"}
              />
              <Typography variant="caption" className="ml-1 text-xs">
                {distanceLabel}
              </Typography>
            </View>

            <View className="flex-row items-center">
              <Typography
                variant="caption"
                className="mr-1 text-xs text-mera-primary dark:text-mera-accent"
              >
                Haritada gör
              </Typography>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={isDark ? "#00ccb2" : "#192655"}
              />
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
