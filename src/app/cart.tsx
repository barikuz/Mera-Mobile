import { MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { formatCurrency } from "@/utils/format";
import { useCartStore } from "@/store/useCartStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  // iconActive token'ı light modda primary, dark modda accent davranışını tek noktadan sağlar.
  const themeColors = COLORS[scheme];
  const { items, totalPrice, updateQuantity, removeFromCart } = useCartStore();

  if (items.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={
            <MaterialCommunityIcons
              name="shopping-outline"
              size={44}
              color="#64748B"
            />
          }
          title="Sepetiniz şu an boş"
          description="Ürün eklemek için mağazaya dönün."
          buttonTitle="Mağazaya Dön"
          onButtonPress={() => router.push("/shop")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="pb-36">
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        showsVerticalScrollIndicator={false}
        // Sabit konumlu alt ödeme barı içerik üzerine binmesin diye ekstra alt boşluk bırakılır.
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 160 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <View className="flex-row rounded-2xl  bg-white p-3 dark:bg-mera-neutral-800">
            <View className="mr-3 h-20 w-20 self-center overflow-hidden rounded-xl bg-mera-neutral-100 dark:bg-mera-neutral-800">
              <Image
                source={{ uri: item.imageUrl }}
                className="h-full w-full"
                contentFit="cover"
                transition={150}
              />
            </View>

            <View className="flex-1 justify-between pr-2">
              <View>
                <Typography variant="body" className="font-inter-semibold">
                  {item.productName}
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-1 mb-3 text-mera-neutral-500"
                >
                  {formatCurrency(item.price)} / adet
                </Typography>
              </View>

              <View className="mt-3 flex-row items-center justify-between gap-3">
                <View className="flex-row items-center rounded-full border border-mera-neutral-200 bg-mera-neutral-100 px-2 py-1 dark:border-mera-neutral-500 dark:bg-mera-neutral-900">
                  <Pressable
                    onPress={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-mera-neutral-900"
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name="remove"
                      size={18}
                      color={themeColors.iconActive}
                    />
                  </Pressable>

                  <Text className="mx-3 min-w-6 text-center text-base font-semibold text-mera-neutral-900 dark:text-white">
                    {item.quantity}
                  </Text>

                  <Pressable
                    onPress={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-mera-neutral-900"
                    hitSlop={8}
                  >
                    <MaterialIcons
                      name="add"
                      size={18}
                      color={themeColors.iconActive}
                    />
                  </Pressable>
                </View>

                <TouchableOpacity
                  onPress={() => removeFromCart(item.productId)}
                  activeOpacity={0.7}
                  className="items-center justify-center p-1"
                >
                  <Ionicons name="trash-bin" size={24} color={"#EF4444"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View className="absolute inset-x-0 bottom-0 border-t border-mera-neutral-200 bg-mera-neutral-100 px-4 pb-4 pt-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-950">
        <View className="mb-3 flex-row items-center justify-between">
          <Typography variant="body" className="font-inter-semibold">
            Genel Toplam
          </Typography>
          <Typography variant="h2">
            {formatCurrency(totalPrice)}
          </Typography>
        </View>
        <Button title="Ödemeye Geç" onPress={() => router.push("/checkout")} />
      </View>
    </ScreenContainer>
  );
}
