/**
 * QuickAccessCard — Ana Sayfa'daki hızlı erişim kartları için 2x2 grid bileşeni.
 * Dikey düzen: ikon üst, başlık orta, açıklama alt.
 * NavCard'dan farkı: Grid içinde eşit boyutlu kare kartlar için optimize edilmiş.
 */
import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickAccessCardProps {
  /** Kart başlığı (örn. "Harita") */
  title: string;
  /** Kısa açıklama metni */
  description: string;
  /** Üst kısımda gösterilecek ikon */
  icon: ReactNode;
  /** Karta tıklandığında çalışacak fonksiyon */
  onPress: () => void;
}

export default function QuickAccessCard({
  title,
  description,
  icon,
  onPress,
}: QuickAccessCardProps) {
  return (
    <TouchableOpacity
      // flex-1: Grid içinde eşit genişlik
      // aspect-square: Kare oran
      // Aynı NavCard stilleri: rounded-2xl, shadow, arka plan renkleri
      className="flex-1 bg-mera-neutral-100 dark:bg-mera-neutral-950 rounded-2xl p-4 shadow shadow-black/10 items-center justify-center aspect-square"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Ikon kutusu — merkezi, yuvarlak arka plan */}
      <View className="w-14 h-14 rounded-xl bg-mera-primary/10 dark:bg-mera-primary/90 items-center justify-center mb-3">
        {icon}
      </View>

      {/* Başlık */}
      <Text className="text-base font-inter-semibold text-mera-neutral-900 dark:text-white text-center">
        {title}
      </Text>

      {/* Açıklama */}
      <Text
        className="text-xs font-inter text-mera-neutral-500 mt-1 text-center"
        numberOfLines={2}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
}
