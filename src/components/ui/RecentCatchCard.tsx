/**
 * RecentCatchCard — Son av kaydı kartı.
 * Sol tarafta balık ikonu alanı, sağda tür adı, tarih, ağırlık
 * ve konum bilgilerini gösteren premium tasarımlı kart.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useColorScheme, View } from "react-native";

import StatusBadge from "./StatusBadge";
import Typography from "./Typography";

interface RecentCatchCardProps {
  /** Balık türü */
  species: string;
  /** Ağırlık (kg) */
  weightKg: number;
  /** Tarih metni */
  date: string;
  /** Konum adı */
  location: string;
}

export default function RecentCatchCard({
  species,
  weightKg,
  date,
  location,
}: RecentCatchCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="overflow-hidden rounded-2xl border border-mera-neutral-200 bg-white dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
      <View className="flex-row">
        {/* Sol gradient vurgu alanı + balık ikonu */}
        <LinearGradient
          colors={isDark ? ["#00ccb2", "#0d4a4a"] : ["#192655", "#1a3a5c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ width: 80, alignItems: "center", justifyContent: "center" }}
        >
          <MaterialCommunityIcons name="fish" size={32} color="white" />
          <Typography
            variant="caption"
            className="mt-1 text-xs font-inter-semibold text-white/80"
          >
            Son Av
          </Typography>
        </LinearGradient>

        {/* Sağ bilgi alanı */}
        <View className="flex-1 p-4">
          {/* Tür adı */}
          <Typography variant="h2" className="mb-1 text-lg">
            {species}
          </Typography>

          {/* Tarih */}
          <View className="mb-3 flex-row items-center">
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Typography variant="caption" className="ml-1 text-xs">
              {date}
            </Typography>
          </View>

          {/* Rozetler */}
          <View className="flex-row flex-wrap items-center gap-2">
            <StatusBadge
              label={`${weightKg} kg`}
              bgClass="bg-mera-primary/10 dark:bg-mera-accent/15"
              textClass="text-mera-primary dark:text-mera-accent"
              noMarginBottom
              noMarginLeft
            />
            <View className="flex-row items-center justify-center rounded-full bg-mera-neutral-200 px-2.5 py-0.5 dark:bg-mera-neutral-900" style={{ alignSelf: "center" }}>
              <Ionicons name="location-outline" size={12} color="#64748B" />
              <Typography
                variant="caption"
                className="ml-1 text-xs font-inter-semibold text-mera-neutral-900 dark:text-white"
              >
                {location}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
