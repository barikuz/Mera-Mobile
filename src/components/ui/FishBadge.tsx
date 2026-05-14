/**
 * FishBadge — Balık türü rozeti.
 * Sıralama numarası ve balık ikonu ile stilize edilmiş pill şeklinde rozet.
 * "En çok tutulan balıklar" bölümünde kullanılır.
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useColorScheme, View } from "react-native";

import Typography from "./Typography";

interface FishBadgeProps {
  /** Balık türü adı */
  name: string;
  /** Sıralama numarası (1'den başlar) */
  rank: number;
}

export default function FishBadge({ name, rank }: FishBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // İlk 3 sıra için altın/gümüş/bronz vurgusu
  const isTop3 = rank <= 3;
  const rankColors = ["#F59E0B", "#94A3B8", "#CD7F32"];
  const rankColor = isTop3
    ? rankColors[rank - 1]
    : isDark
      ? "#64748B"
      : "#94A3B8";

  return (
    <View
      className={`flex-row items-center rounded-full px-3 py-1.5 mt-1 mr-1 ${
        isTop3
          ? "border border-mera-primary/10 bg-white dark:border-mera-accent/15 dark:bg-mera-neutral-800"
          : "bg-mera-neutral-200 dark:bg-mera-neutral-950"
      }`}
    >
      {/* Sıralama numarası */}
      <View
        className="mr-1.5 h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: `${rankColor}20` }}
      >
        <Typography
          variant="caption"
          className="text-[10px] font-inter-bold"
          style={{ color: rankColor }}
        >
          {rank}
        </Typography>
      </View>

      {/* Balık ikonu */}
      <MaterialCommunityIcons
        name="fish"
        size={14}
        color={isDark ? "#00ccb2" : "#192655"}
        style={{ marginRight: 4 }}
      />

      {/* Tür adı */}
      <Typography
        variant="caption"
        className="text-xs font-inter-semibold text-mera-neutral-900 dark:text-white"
      >
        {name}
      </Typography>
    </View>
  );
}
