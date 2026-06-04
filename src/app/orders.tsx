import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, useColorScheme, View } from "react-native";

import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import OrderCard from "@/components/ui/OrderCard";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useOrders } from "@/hooks/useOrders";

export default function OrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const themeColors = COLORS[scheme];

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useOrders();

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ScreenContainer>
        <Loader />
      </ScreenContainer>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (isError) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={
            <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />
          }
          title="Siparişler yüklenemedi"
          description={(error as Error)?.message || "Bir hata oluştu."}
          buttonTitle="Tekrar Dene"
          onButtonPress={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  // ── Empty ────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={
            <MaterialCommunityIcons
              name="package-variant"
              size={44}
              color="#64748B"
            />
          }
          title="Henüz siparişiniz yok"
          description="İlk siparişinizi vermek için mağazaya göz atın."
          buttonTitle="Mağazaya Git"
          onButtonPress={() => router.push("/shop")}
        />
      </ScreenContainer>
    );
  }

  // ── Orders list ──────────────────────────────────────────────
  return (
    <ScreenContainer>
      <FlatList
        data={orders}
        keyExtractor={(_, index) => `order-${index}`}
        renderItem={({ item, index }) => (
          <OrderCard order={item} index={index} />
        )}
        ListHeaderComponent={
          <View className="flex-row items-center pb-3 pt-4">
            <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-mera-primary/10 dark:bg-mera-accent/10">
              <MaterialCommunityIcons
                name="shopping"
                size={28}
                color={themeColors.iconActive}
              />
            </View>
            <View className="flex-1">
              <Typography variant="h1">Siparişlerim</Typography>
              <Typography
                variant="caption"
                className="mt-1 text-mera-neutral-500"
              >
                Toplam {orders.length} sipariş
              </Typography>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={themeColors.iconActive}
            colors={[themeColors.iconActive]}
          />
        }
      />
    </ScreenContainer>
  );
}
