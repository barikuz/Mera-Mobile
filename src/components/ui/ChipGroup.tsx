/**
 * ChipGroup — Yatay kaydırılabilir chip/pill seçim grubu.
 * Balık türü, avlanma stili gibi tekli seçim listeleri için kullanılır.
 * Seçili chip'e tekrar basıldığında seçim kaldırılır (toggle davranışı).
 */
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import Typography from "./Typography";

interface ChipGroupProps<T extends string> {
  /** Chip grubu üzerinde gösterilecek etiket */
  label: string;
  /** Gösterilecek seçenekler */
  items: readonly T[];
  /** Seçili olan öğe (null = hiçbiri seçili değil) */
  selectedItem: T | null;
  /** Seçim değiştiğinde çağrılır — aynı öğeye tekrar basılırsa null döner */
  onSelect: (item: T | null) => void;
}

export default function ChipGroup<T extends string>({
  label,
  items,
  selectedItem,
  onSelect,
}: ChipGroupProps<T>) {
  return (
    <View>
      <Typography variant="body" className="mb-2 font-inter-semibold">
        {label}
      </Typography>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {items.map((item) => {
          const isSelected = selectedItem === item;

          return (
            <Pressable
              key={item}
              onPress={() => onSelect(isSelected ? null : item)}
              className={`rounded-full border px-4 py-2.5 ${
                isSelected
                  ? "border-mera-primary bg-mera-primary dark:border-mera-accent dark:bg-mera-accent"
                  : "border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Typography
                variant="caption"
                className={`text-sm font-inter-semibold ${
                  isSelected
                    ? "text-mera-neutral-100 dark:text-mera-neutral-950"
                    : "text-mera-neutral-900 dark:text-white"
                }`}
              >
                {item}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
