/**
 * ScreenContainer — Tüm ekranların kök (root) düzen bileşeni.
 * SafeAreaView ile cihazın çentik/status bar alanını korur ve
 * standart yatay iç boşluk (px-4 = 16px) uygular.
 * Her ekran dosyasının en dış elemanı bu bileşen olmalıdır.
 */
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  /** Ekran içeriği — tüm alt bileşenler buraya yerleştirilir */
  children: ReactNode;
  /** İç View'e ek NativeWind sınıfları eklemek için (örn. "pt-4") */
  className?: string;
}

export default function ScreenContainer({
  children,
  className = '',
}: ScreenContainerProps) {
  return (
    // SafeAreaView: Çentik, ada (Dynamic Island) ve status bar'dan kaçınır
    // bg-mera-neutral-100: Açık mod arka plan, bg-mera-neutral-950: Karanlık mod (derin lacivert-siyah)
    <SafeAreaView className="flex-1 bg-mera-neutral-100 dark:bg-mera-neutral-950">
      {/* px-4: Tüm ekranlarda standart 16px yatay boşluk */}
      <View className={`flex-1 px-4 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
