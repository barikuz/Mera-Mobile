/**
 * NavCard — Ana Sayfa'daki modül navigasyon kartı bileşeni.
 * Harita, Mağaza, Yapay Zeka Asistanı gibi ana modüllere yönlendirmek için kullanılır.
 * Her kart bir ikon, başlık ve kısa açıklama içerir.
 */
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NavCardProps {
  /** Kartın ana başlığı (örn. "Harita") */
  title: string;
  /** Başlığın altındaki kısa açıklama metni */
  description: string;
  /** Sol tarafta gösterilecek ikon — herhangi bir React elemanı olabilir */
  icon: ReactNode;
  /** Karta tıklandığında çalışacak navigasyon fonksiyonu */
  onPress: () => void;
}

export default function NavCard({ title, description, icon, onPress }: NavCardProps) {
  return (
    <TouchableOpacity
      // flex-row: İkon sol, metin sağ — yatay düzen
      // rounded-2xl: Belirgin yuvarlak köşeler — modern kart görünümü
      // shadow: Hafif gölge — kartı arka plandan ayırır
      className="flex-row items-center bg-mera-neutral-100 dark:bg-mera-neutral-950 rounded-2xl p-4 mb-3 shadow shadow-black/10"
      onPress={onPress}
      activeOpacity={0.7} // Basıldığında hafif solma — dokunma geri bildirimi
    >
      {/* İkon kutusu — sabit boyut, yarı saydam marka rengi arka plan */}
      <View className="w-12 h-12 rounded-xl bg-mera-primary/10 dark:bg-mera-primary/90 items-center justify-center mr-4">
        {icon}
      </View>
      {/* Metin alanı — kalan genişliği doldurur (flex-1) */}
      <View className="flex-1">
        {/* Kart başlığı — yarı kalın, ana metin rengi */}
        <Text className="text-base font-inter-semibold text-mera-neutral-900 dark:text-white">
          {title}
        </Text>
        {/* Açıklama — daha küçük ve soluk — ikincil bilgi olduğunu belirtir */}
        <Text className="text-sm font-inter text-mera-neutral-500 mt-0.5">
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
