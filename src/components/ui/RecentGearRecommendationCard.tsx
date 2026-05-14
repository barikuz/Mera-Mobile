/**
 * RecentGearRecommendationCard — Ekipman tavsiyesi kartı.
 * Sol tarafta renkli vurgu çizgisi, ekipman tipi ikonu,
 * isim ve not bilgisi içerir. Yatay kaydırma listesinde kullanılır.
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import StatusBadge from "./StatusBadge";
import Typography from "./Typography";

interface RecentGearRecommendationCardProps {
  /** Ekipman tipi etiketi (Olta, Makine, Yem) */
  type: string;
  /** Ekipman adı */
  name: string;
  /** Tavsiye notu */
  note: string;
}

const GEAR_CONFIG: Record<
  string,
  { icon: string; color: string; bgColor: string }
> = {
  Olta: { icon: "slash-forward", color: "#0EA5E9", bgColor: "#0EA5E910" },
  Makine: { icon: "cog", color: "#8B5CF6", bgColor: "#8B5CF610" },
  Yem: { icon: "hook", color: "#F59E0B", bgColor: "#F59E0B10" },
};

export default function RecentGearRecommendationCard({
  type,
  name,
  note,
}: RecentGearRecommendationCardProps) {
  const config = GEAR_CONFIG[type] || {
    icon: "fishing",
    color: "#0EA5E9",
    bgColor: "#0EA5E910",
  };

  return (
    <View className="w-44 overflow-hidden rounded-2xl border border-mera-neutral-200 bg-white dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
      <View className="flex-row">
        {/* Sol vurgu çizgisi */}
        <View
          style={{ width: 3, backgroundColor: config.color }}
          className="rounded-l-2xl"
        />

        <View className="flex-1 p-3">
          {/* Tip rozeti ve ikon */}
          <View className="mb-2 flex-row items-center">
            <View
              className="mr-2 h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <MaterialCommunityIcons
                name={config.icon as any}
                size={16}
                color={config.color}
              />
            </View>
            <StatusBadge
              label={type}
              bgClass="bg-mera-primary/8 dark:bg-mera-accent/12"
              textClass="text-mera-primary dark:text-mera-accent"
              noMarginBottom
              noMarginLeft
            />
          </View>

          {/* Ekipman adı */}
          <Typography
            variant="body"
            className="mb-1 text-sm font-inter-semibold"
            numberOfLines={1}
          >
            {name}
          </Typography>

          {/* Not */}
          <Typography variant="caption" className="text-xs" numberOfLines={2}>
            {note}
          </Typography>
        </View>
      </View>
    </View>
  );
}
