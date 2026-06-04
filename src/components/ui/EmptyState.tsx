/**
 * EmptyState — Veri bulunamadığında veya liste boş olduğunda
 * gösterilen yeniden kullanılabilir boş durum bileşeni.
 *
 * Sepet, siparişler ve benzeri ekranlarda kullanılır.
 * İkon, başlık, açıklama ve opsiyonel CTA butonu alır.
 */
import React, { ReactNode } from "react";
import { View } from "react-native";

import Button from "./Button";
import Typography from "./Typography";

interface EmptyStateProps {
  /** Durumu görsel olarak ifade eden ikon (ReactNode) */
  icon: ReactNode;
  /** Ana başlık metni */
  title: string;
  /** Açıklayıcı alt metin */
  description: string;
  /** Opsiyonel CTA buton metni */
  buttonTitle?: string;
  /** CTA butonuna basıldığında çağrılacak fonksiyon */
  onButtonPress?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  buttonTitle,
  onButtonPress,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-full items-center px-6 py-8">
        {icon}
        <Typography variant="h2" className="mt-4 text-center">
          {title}
        </Typography>
        <Typography
          variant="body"
          className="mt-2 text-center text-mera-neutral-500"
        >
          {description}
        </Typography>
        {buttonTitle && onButtonPress ? (
          <View className="mt-6 w-full">
            <Button title={buttonTitle} onPress={onButtonPress} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
