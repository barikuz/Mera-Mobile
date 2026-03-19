/**
 * Input — Metin ve şifre girişi için kullanılan form bileşeni.
 * Giriş Yap, Kayıt Ol gibi formlarda kullanılır.
 * Üç görsel durumu destekler: varsayılan, odaklanmış (focus) ve hata (error).
 */
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  /** Girdi alanının üstünde gösterilen etiket metni (örn. "E-posta") */
  label: string;
  /** Boşken görünen ipucu metni */
  placeholder?: string;
  /** true ise karakterler gizlenir — şifre alanları için */
  secureTextEntry?: boolean;
  /** Kontrol edilen (controlled) girdi değeri */
  value: string;
  /** Kullanıcı her karakter girdiğinde çağrılan fonksiyon */
  onChangeText: (text: string) => void;
  /** Varsa, girdi kırmızı kenarlık alır ve bu mesaj altında gösterilir */
  errorMessage?: string;
}

export default function Input({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  errorMessage,
  ...rest
}: InputProps) {
  // Odaklanma durumunu takip eden yerel state
  const [focused, setFocused] = useState(false);

  // Kenarlık rengi: hata > odak > varsayılan öncelik sırasıyla belirlenir
  const borderClass = errorMessage
    ? 'border-mera-status-error'    // Hata varsa kırmızı kenarlık
    : focused
      ? 'border-mera-primary'       // Odaklanmışsa marka rengi kenarlık
      : 'border-mera-neutral-200';  // Varsayılan: soluk gri kenarlık

  return (
    <View className="mb-4">
      {/* Etiket — girdi alanının üstünde, yarı kalın ve küçük punto */}
      <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
        {label}
      </Text>
      {/* Girdi alanı — rounded köşeler, iç boşluk, dinamik kenarlık rengi */}
      <TextInput
        className={`border rounded-lg px-3 py-3 text-base font-inter text-mera-neutral-900 dark:text-white bg-mera-neutral-100 dark:bg-gray-900 ${borderClass}`}
        placeholder={placeholder}
        placeholderTextColor="#64748B" // mera-neutral-500 — ipucu metni soluk görünür
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}   // Odak gelince kenarlık rengini değiştir
        onBlur={() => setFocused(false)}   // Odak gidince varsayılan kenarlığa dön
        {...rest}
      />
      {/* Hata mesajı — sadece errorMessage prop'u varsa gösterilir */}
      {errorMessage ? (
        <Text className="mt-1 text-sm font-inter text-mera-status-error">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
