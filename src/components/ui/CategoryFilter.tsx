/**
 * CategoryFilter — Yatay kaydırılabilir kategori filtresi.
 * Pill tarzı butonlar ile ürünleri kategoriye göre filtrelemeyi sağlar.
 */
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  /** Mevcut kategoriler */
  categories: Category[];
  /** Seçili kategori ID'si (null = Tümü) */
  selectedId: string | null;
  /** Kategori seçildiğinde çağrılır */
  onSelect: (id: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) {
  // "Tümü" kategorisini başa ekleyerek tam kategori listesini oluştur
  const allCategories: Category[] = [
    { id: "all", name: "Tümü" },
    ...categories,
  ];

  return (
    <View className="py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
      >
        {allCategories.map((category) => {
          // "Tümü" için selectedId null kontrolü, diğerleri için ID eşleşmesi
          const isActive =
            category.id === "all"
              ? selectedId === null
              : selectedId === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() =>
                onSelect(category.id === "all" ? null : category.id)
              }
              activeOpacity={0.7}
              className={`px-4 py-2 rounded-full ${
                isActive
                  ? "bg-mera-primary dark:bg-mera-accent"
                  : "bg-white dark:bg-mera-neutral-900 border border-mera-neutral-200 dark:border-mera-neutral-500/30"
              }`}
            >
              <Text
                className={`text-sm font-inter-semibold ${
                  isActive
                    ? "text-white dark:text-mera-neutral-900"
                    : "text-mera-neutral-500 dark:text-mera-neutral-200"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
