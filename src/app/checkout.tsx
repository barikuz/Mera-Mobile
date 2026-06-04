import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useCartStore } from "@/store/useCartStore";

import { formatCurrency } from "@/utils/format";

export default function CheckoutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const themeColors = COLORS[scheme];
  const { items, totalPrice, totalItemCount, clearCart } = useCartStore();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireMonth, setExpireMonth] = useState("");
  const [expireYear, setExpireYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFormComplete =
    fullName.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    address.trim().length > 0 &&
    cardHolderName.trim().length > 0 &&
    cardNumber.trim().length > 0 &&
    expireMonth.trim().length > 0 &&
    expireYear.trim().length > 0 &&
    cvc.trim().length > 0;

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const { useAuthStore } = await import("@/store/useAuthStore");
      const token = useAuthStore.getState().session?.access_token;

      if (!token) {
        Alert.alert(
          "Oturum Hatası",
          "Sipariş verebilmek için lütfen giriş yapın.",
        );
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
      const payload = {
        shippingName: fullName.trim(),
        shippingPhone: phoneNumber.trim(),
        shippingAddress: address.trim(),
        paymentCard: {
          cardHolderName: cardHolderName.trim(),
          cardNumber: cardNumber.trim(),
          expireMonth: expireMonth.trim(),
          expireYear: expireYear.trim(),
          cvc: cvc.trim(),
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let backendMessage = "";

        try {
          const text = await response.text();
          if (text) {
            try {
              const data = JSON.parse(text);
              if (typeof data?.message === "string") {
                backendMessage = data.message;
              } else {
                backendMessage = text;
              }
            } catch {
              backendMessage = text;
            }
          }
        } catch {
          backendMessage = "";
        }

        throw new Error(backendMessage || `HTTP ${response.status}`);
      }

      clearCart();
      Alert.alert("Siparişiniz Alındı");
      router.replace("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      const lowerMessage = errorMessage.toLocaleLowerCase("tr-TR");
      const isPaymentError =
        lowerMessage.includes("kart") ||
        lowerMessage.includes("cvc") ||
        lowerMessage.includes("ödeme") ||
        lowerMessage.includes("odeme") ||
        lowerMessage.includes("payment");

      if (isPaymentError && errorMessage) {
        Alert.alert("Ödeme Hatası", errorMessage);
      } else {
        Alert.alert("Hata", "Siparişiniz alınamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="pb-36">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 160 }}
        >
          <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-mera-neutral-800">
            <Typography variant="h2" className="mb-3">
              Sipariş Özeti
            </Typography>

            <View className="gap-3">
              {items.map((item) => (
                <View
                  key={item.productId}
                  className="flex-row items-center justify-between rounded-xl bg-mera-neutral-100 px-3 py-3 dark:bg-mera-neutral-900"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-inter-semibold text-mera-neutral-900 dark:text-white">
                      {item.productName}
                    </Text>
                    <Text className="mt-1 text-sm font-inter text-mera-neutral-500 dark:text-mera-neutral-400">
                      Adet: {item.quantity}
                    </Text>
                  </View>
                  <Text className="text-sm font-inter-semibold text-mera-primary dark:text-mera-accent">
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-4 flex-row items-center justify-between border-t border-mera-neutral-200 pt-4 dark:border-mera-neutral-700">
              <View>
                <Text className="text-sm font-inter text-mera-neutral-500 dark:text-mera-neutral-400">
                  Toplam Ürün
                </Text>
                <Text className="mt-1 text-xl font-inter-semibold text-mera-neutral-900 dark:text-white">
                  {totalItemCount}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-sm font-inter text-mera-neutral-500 dark:text-mera-neutral-400">
                  Toplam Tutar
                </Text>
                <Text className="mt-1 text-2xl font-inter-bold text-mera-primary dark:text-mera-accent">
                  {formatCurrency(totalPrice)}
                </Text>
              </View>
            </View>
          </View>

          <View className="rounded-2xl bg-white p-4 dark:bg-mera-neutral-800">
            <Typography variant="h2" className="mb-4">
              Teslimat Bilgileri
            </Typography>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Ad Soyad
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Adınızı ve soyadınızı girin"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Telefon Numarası
              </Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="05xx xxx xx xx"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Adres
              </Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Teslimat adresinizi girin"
                placeholderTextColor={themeColors.iconInactive}
                className="min-h-32 rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View className="mt-4 rounded-2xl bg-white p-4 dark:bg-mera-neutral-800">
            <Typography variant="h2" className="mb-4">
              Ödeme Bilgileri
            </Typography>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Kart Sahibinin Adı
              </Text>
              <TextInput
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="Kart üzerindeki adı girin"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Kart Numarası
              </Text>
              <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="16 haneli kart numarası"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Son Kullanma Ay
              </Text>
              <TextInput
                value={expireMonth}
                onChangeText={setExpireMonth}
                placeholder="AA"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                Son Kullanma Yıl
              </Text>
              <TextInput
                value={expireYear}
                onChangeText={setExpireYear}
                placeholder="YYYY"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View>
              <Text className="mb-1 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
                CVC
              </Text>
              <TextInput
                value={cvc}
                onChangeText={setCvc}
                placeholder="***"
                placeholderTextColor={themeColors.iconInactive}
                className="rounded-lg border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-3 text-base font-inter text-mera-neutral-900 dark:border-mera-neutral-700 dark:bg-mera-neutral-900 dark:text-white"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="absolute inset-x-0 bottom-0 border-t border-mera-neutral-200 bg-mera-neutral-100 px-4 pb-4 pt-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-950">
        <Button
          title={isLoading ? "İşleniyor..." : "Siparişi Tamamla"}
          onPress={handleCheckout}
          disabled={!isFormComplete || isLoading}
        />
      </View>
    </ScreenContainer>
  );
}
