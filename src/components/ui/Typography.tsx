/**
 * Typography — Uygulama genelinde tutarlı metin stilleri sağlayan bileşen.
 * Tüm ekranlarda başlıklar, gövde metinleri ve alt bilgiler için kullanılır.
 * Doğrudan <Text> yerine bu bileşen tercih edilmelidir.
 */
import React from 'react';
import { Text, TextProps } from 'react-native';

// Desteklenen metin varyantları
type Variant = 'h1' | 'h2' | 'body' | 'caption';

interface TypographyProps extends TextProps {
  /** Metin stili varyantı — varsayılan olarak 'body' kullanılır */
  variant?: Variant;
  /** Ek NativeWind sınıfları (örn. margin, padding) eklemek için */
  className?: string;
}

// Her varyant için NativeWind sınıf eşlemeleri
const variantClasses: Record<Variant, string> = {
  // Ana sayfa başlıkları — en büyük ve en kalın yazı tipi
  h1: 'text-3xl font-inter-bold text-mera-neutral-900 dark:text-white',
  // Bölüm başlıkları — orta büyüklükte, yarı kalın
  h2: 'text-xl font-inter-semibold text-mera-neutral-900 dark:text-white',
  // Standart paragraf metni — temel okunabilirlik için normal ağırlık
  body: 'text-base font-inter text-mera-neutral-900 dark:text-white',
  // Tarihler, alt bilgiler gibi ikincil metinler — daha küçük ve soluk renk
  caption: 'text-sm font-inter text-mera-neutral-500',
};

export default function Typography({
  variant = 'body',
  className = '',
  children,
  ...rest
}: TypographyProps) {
  return (
    // Varyant sınıfları ile dışarıdan gelen ek sınıflar birleştirilir
    <Text className={`${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </Text>
  );
}
