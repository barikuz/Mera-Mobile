/**
 * ShopScreen — Balıkçılık ürünlerinin listelendiği e-ticaret ekranı.
 * Arama, kategori filtreleme ve ürün grid'i içerir.
 */
import React, { useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";

import CategoryFilter, { Category } from "@/components/ui/CategoryFilter";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SearchBar from "@/components/ui/SearchBar";
import Typography from "@/components/ui/Typography";

// Mock kategoriler
const CATEGORIES: Category[] = [
  { id: "olta", name: "Oltalar" },
  { id: "makine", name: "Makineler" },
  { id: "yem", name: "Yemler" },
  { id: "aksesuar", name: "Aksesuarlar" },
  { id: "giyim", name: "Giyim" },
];

// Mock ürünler
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Shimano Speedmaster Surf Olta Seti",
    price: 4599,
    category: "olta",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Daiwa BG 4000 Spinning Makine",
    price: 3299,
    category: "makine",
    image:
      "https://images.unsplash.com/photo-1516382799247-87df95d790b7?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Doğal Karides Yem Seti 500g",
    price: 189,
    category: "yem",
    image:
      "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Su Geçirmez Balıkçı Yeleği",
    price: 899,
    category: "giyim",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Profesyonel Takım Çantası",
    price: 649,
    category: "aksesuar",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    name: "Penn Battle III 3000 Makine",
    price: 2799,
    category: "makine",
    image:
      "https://images.unsplash.com/photo-1545816250-e12bedba42ba?w=400&h=400&fit=crop",
  },
];

export default function ShopScreen() {
  // Arama sorgusu state'i
  const [searchQuery, setSearchQuery] = useState("");
  // Seçili kategori state'i (null = Tümü)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Arama ve kategori filtrelemesi
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === null || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Sepete ekleme işlevi (şimdilik sadece bildirim)
  const handleAddToCart = (product: Product) => {
    Alert.alert("Sepete Eklendi", `${product.name} sepetinize eklendi.`);
  };

  return (
    <ScreenContainer>
      {/* Arama Çubuğu */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Kategori Filtreleri */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Ürün Grid'i */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <Typography
              variant="body"
              className="text-center text-mera-neutral-500"
            >
              Aramanızla eşleşen ürün bulunamadı.
            </Typography>
          </View>
        }
      />
    </ScreenContainer>
  );
}
