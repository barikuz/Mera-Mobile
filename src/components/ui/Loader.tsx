/**
 * Loader — Veri yüklenirken gösterilen standart yükleme döndürücüsü (spinner).
 * Tam ekran merkezleme ile kullanılır — örneğin bir API isteği beklenirken.
 * Renk olarak mera-primary kullanılarak marka tutarlılığı sağlanır.
 */
import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

interface LoaderProps {
  /** Döndürücü boyutu — varsayılan olarak 'large' kullanılır */
  size?: 'small' | 'large';
}

export default function Loader({ size = 'large' }: LoaderProps) {
  const scheme = useColorScheme();
  // Açık modda ana renk, karanlık modda vurgu rengi — koyu zeminde primary görünmez olur
  const spinnerColor = scheme === 'dark' ? '#E1AA74' : '#192655';

  return (
    // flex-1: Mevcut alanın tamamını kaplar, items/justify-center: tam ortalar
    <View className="flex-1 items-center justify-center">
      {/* color: NativeWind sınıfı desteklenmediği için hex kullanılır */}
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
}
