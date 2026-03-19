/**
 * Button — Uygulamadaki tüm tıklanabilir aksiyonlar için kullanılan buton bileşeni.
 * İki varyantı vardır:
 *   • primary  → Ana CTA'lar için (örn. "Giriş Yap", "Kayıt Ol") — dolgulu, beyaz metin
 *   • secondary → Daha az vurgulu aksiyonlar için (örn. "Şifremi Unuttum") — kenarlıklı, şeffaf
 */
import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends Omit<TouchableOpacityProps, 'disabled'> {
  /** Butonun görsel tipi — varsayılan olarak 'primary' */
  variant?: 'primary' | 'secondary';
  /** Buton üzerinde gösterilecek metin */
  title: string;
  /** Butona basıldığında çağrılacak fonksiyon */
  onPress: () => void;
  /** true ise buton yarı saydam olur ve tıklanamaz */
  disabled?: boolean;
}

// Her varyant için NativeWind sınıf eşlemeleri
const styles = {
  primary: {
    // Dolgulu arka plan (mera-primary), yuvarlak köşeler, dikey iç boşluk
    // dark: Vurgu rengi (accent) arka plan — koyu zeminde daha görünür
    container: 'bg-mera-primary dark:bg-mera-accent rounded-lg py-3 items-center',
    // Beyaz metin (açık mod), koyu metin (karanlık mod — açık arka plan üzerinde okunabilirlik)
    text: 'text-white dark:text-mera-neutral-900 text-base font-inter-semibold',
  },
  secondary: {
    // Şeffaf arka plan, mera-primary kenarlık — düşük vurgulu görünüm
    // dark: Vurgu rengi kenarlık — koyu zeminde lacivert kenarlık görünmez olurdu
    container: 'border border-mera-primary dark:border-mera-accent rounded-lg py-3 items-center bg-transparent',
    // Marka rengi metin (açık mod), vurgu rengi metin (karanlık mod — kenarlıkla uyumlu)
    text: 'text-mera-primary dark:text-mera-accent text-base font-inter-semibold',
  },
} as const;

export default function Button({
  variant = 'primary',
  title,
  onPress,
  disabled = false,
  ...rest
}: ButtonProps) {
  const s = styles[variant];

  return (
    <TouchableOpacity
      // disabled durumunda opacity-50 eklenerek görsel geri bildirim sağlanır
      className={`${s.container} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7} // Basılı tutunca hafif solma efekti
      {...rest}
    >
      <Text className={s.text}>{title}</Text>
    </TouchableOpacity>
  );
}
