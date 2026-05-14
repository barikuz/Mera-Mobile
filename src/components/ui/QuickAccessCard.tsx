/**
 * QuickAccessCard — Ana Sayfa'daki hızlı erişim kartları için 2x2 grid bileşeni.
 * Dikey düzen: ikon üst, başlık orta, açıklama alt.
 * AnimatedPressable ile spring fiziği basma efekti uygulanır.
 */
import React, { ReactNode } from "react";
import { Text, View } from "react-native";

import AnimatedPressable from "./AnimatedPressable";

interface QuickAccessCardProps {
  /** Kart başlığı (örn. "Harita") */
  title: string;
  /** Kısa açıklama metni */
  description: string;
  /** Üst kısımda gösterilecek ikon */
  icon: ReactNode;
  /** Karta tıklandığında çalışacak fonksiyon */
  onPress: () => void;
  /** İkon arka plan rengi (opsiyonel, her kart için farklı tint) */
  iconBgClass?: string;
}

export default function QuickAccessCard({
  title,
  description,
  icon,
  onPress,
  iconBgClass = "bg-mera-primary/10 dark:bg-mera-primary/90",
}: QuickAccessCardProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      className="flex-1 aspect-square rounded-2xl bg-white p-4 shadow-sm shadow-black/5 items-center justify-center dark:bg-mera-neutral-800 border border-mera-neutral-200/60 dark:border-mera-neutral-500/20"
    >
      {/* Ikon kutusu — merkezi, yuvarlak arka plan */}
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${iconBgClass}`}
      >
        {icon}
      </View>

      {/* Başlık */}
      <Text className="text-sm font-inter-semibold text-mera-neutral-900 dark:text-white text-center">
        {title}
      </Text>

      {/* Açıklama */}
      <Text
        className="text-[11px] font-inter text-mera-neutral-500 mt-1 text-center leading-4"
        numberOfLines={2}
      >
        {description}
      </Text>
    </AnimatedPressable>
  );
}
