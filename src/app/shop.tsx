/**
 * ShopScreen — Balıkçılık ürünlerinin listelendiği e-ticaret ekranı.
 * Arama, kategori filtreleme ve ürün grid'i içerir.
 */
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

import CategoryFilter, { Category } from "@/components/ui/CategoryFilter";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SearchBar from "@/components/ui/SearchBar";
import Typography from "@/components/ui/Typography";
import { useCategories, useProducts } from "@/hooks/useShop";
import { useCartStore } from "@/store/useCartStore";

export default function ShopScreen() {
  const addToCart = useCartStore((state) => state.addToCart);

  // Arama sorgusu state'i
  const [searchQuery, setSearchQuery] = useState("");
  // Seçili kategori state'i (null = Tümü)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();
  const { data: products = [], isLoading: isProductsLoading } = useProducts(
    selectedCategoryId ?? undefined,
  );

  const categoryItems = categories as unknown as Category[];
  const productItems = products as unknown as Product[];

  // Arama ve kategori filtrelemesi
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return productItems.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesSearch;
    });
  }, [productItems, searchQuery]);

  const isLoading = isCategoriesLoading || isProductsLoading;

  // Sepete ekleme işlevi
  const handleAddToCart = (product: Product) => {
    // Shop ürün şemasını CartStore'un beklediği alan adlarına burada dönüştürüyoruz.
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.image_url,
    });

    Alert.alert("Sepete Eklendi", `${product.name} sepetinize eklendi.`);
  };

  return (
    <ScreenContainer>
      {/* Arama Çubuğu */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Kategori Filtreleri */}
      <CategoryFilter
        categories={categoryItems}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
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
          isLoading ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color="#0F766E" />
              <Typography
                variant="body"
                className="mt-3 text-center text-mera-neutral-500"
              >
                Ürünler yükleniyor...
              </Typography>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <Typography
                variant="body"
                className="text-center text-mera-neutral-500"
              >
                Aramanızla eşleşen ürün bulunamadı.
              </Typography>
            </View>
          )
        }
      />
    </ScreenContainer>
  );
}
