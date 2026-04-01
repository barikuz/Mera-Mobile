/**
 * SearchBar — Mağaza ekranı için arama çubuğu bileşeni.
 * Kullanıcının ürünleri anahtar kelimeye göre filtrelemesini sağlar.
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface SearchBarProps {
  /** Arama kutusu değeri */
  value: string;
  /** Değer değiştiğinde çağrılır */
  onChangeText: (text: string) => void;
  /** İpucu metni */
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Ürün ara...",
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  // Her iki tema için aynı neutral ton
  const iconColor = colorScheme === "dark" ? "#64748B" : "#64748B";

  return (
    <View className="flex-row items-center bg-white dark:bg-mera-neutral-900 rounded-xl px-4 py-1 mb-3 border border-mera-neutral-200 dark:border-mera-neutral-500/30">
      <Ionicons name="search" size={20} color={iconColor} />
      <TextInput
        className="flex-1 ml-3 text-base font-inter text-mera-neutral-900 dark:text-white"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
      />
      {/* Arama kutusu doluysa temizle butonu göster */}
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={20} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}
