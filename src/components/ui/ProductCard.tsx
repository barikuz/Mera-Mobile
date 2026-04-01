/**
 * ProductCard — İki sütunlu grid düzeni için optimize edilmiş ürün kartı.
 * Görsel, ürün adı, fiyat ve sepete ekle aksiyonu içerir.
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const colorScheme = useColorScheme();

  // Fiyatı Türk Lirası formatında göster
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View
      className="bg-white dark:bg-mera-neutral-900 rounded-2xl overflow-hidden shadow shadow-black/10"
      style={{ width: "48%" }}
    >
      {/* Ürün Görseli */}
      <View className="aspect-square bg-mera-neutral-100 dark:bg-mera-neutral-950">
        <Image
          source={{ uri: product.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Ürün Bilgileri */}
      <View className="p-3">
        {/* Ürün Adı — Maksimum 2 satır */}
        <Text
          className="text-sm font-inter-semibold text-mera-neutral-900 dark:text-white mb-1"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Fiyat ve Sepete Ekle */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-base font-inter-bold text-mera-primary dark:text-mera-accent">
            {formatPrice(product.price)}
          </Text>

          <TouchableOpacity
            onPress={() => onAddToCart(product)}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-lg bg-mera-primary dark:bg-mera-accent items-center justify-center"
          >
            <Ionicons
              name="add"
              size={20}
              color={colorScheme === "dark" ? "#0F172A" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
