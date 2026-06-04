/**
 * OrderCard — Tek bir siparişi kart olarak görüntüleyen bileşen.
 * Sipariş numarası, tarih, durum rozeti, ürün listesi ve toplam tutarı içerir.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

import StatusBadge from "@/components/ui/StatusBadge";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import {
  getStatusColors,
  getStatusLabel,
  Order,
  OrderItem,
} from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/utils/format";

// ────────────────────────────────────────────────────────────────
// Order Item Row (dahili)
// ────────────────────────────────────────────────────────────────

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <View className="flex-row items-center py-2.5">
      {/* Ürün görseli (varsa) */}
      {item.image_url ? (
        <View className="mr-3 h-11 w-11 overflow-hidden rounded-lg bg-mera-neutral-100 dark:bg-mera-neutral-900">
          <Image
            source={{ uri: item.image_url }}
            className="h-full w-full"
            contentFit="cover"
            transition={150}
          />
        </View>
      ) : (
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-mera-neutral-100 dark:bg-mera-neutral-900">
          <Ionicons name="cube-outline" size={20} color="#64748B" />
        </View>
      )}

      {/* Ürün adı ve adet */}
      <View className="flex-1 pr-2">
        <Text
          className="text-sm font-inter-semibold text-mera-neutral-900 dark:text-white"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.product_name}
        </Text>
        <Text className="mt-0.5 text-xs font-inter text-mera-neutral-500">
          {item.quantity} adet
        </Text>
      </View>

      {/* Fiyat */}
      <Text className="text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
        {formatCurrency(item.unit_price * item.quantity)}
      </Text>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────
// Divider (dahili)
// ────────────────────────────────────────────────────────────────

function Divider({ className = "mt-3" }: { className?: string }) {
  return (
    <View
      className={`h-[1px] bg-mera-neutral-200 dark:bg-mera-neutral-700 ${className}`}
    />
  );
}

// ────────────────────────────────────────────────────────────────
// Order Card
// ────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  index: number;
}

export default function OrderCard({ order, index }: OrderCardProps) {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const themeColors = COLORS[scheme];

  const statusLabel = getStatusLabel(order.status);
  const statusColors = getStatusColors(order.status);

  return (
    <View className="mb-3 rounded-2xl border border-mera-neutral-200 bg-white p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
      {/* Başlık: Sipariş numarası + tarih + durum */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={16}
              color={themeColors.iconActive}
            />
            <Typography variant="body" className="font-inter-semibold">
              Sipariş #{index + 1}
            </Typography>
          </View>
          <Typography variant="caption" className="mt-1 text-mera-neutral-500">
            {formatDate(order.created_at)}
          </Typography>
        </View>

        <StatusBadge
          label={statusLabel}
          bgClass={statusColors.bgClass}
          textClass={statusColors.textClass}
          noMarginLeft
          noMarginBottom
        />
      </View>

      {/* Divider: Header and Items */}
      <Divider />

      {/* Ürün listesi */}
      <View className="mt-2">
        {order.items.map((item, itemIndex) => (
          <OrderItemRow key={`${item.product_name}-${itemIndex}`} item={item} />
        ))}
      </View>

      {/* Divider: Items and Shipping */}
      <Divider />

      {/* Teslimat bilgileri */}
      <View className="mt-3" style={{ gap: 4 }}>
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={14} color="#64748B" />
          <Typography variant="caption" className="ml-2 text-mera-neutral-500">
            Alıcı
          </Typography>
          <Typography
            variant="caption"
            className="ml-auto font-inter-semibold text-mera-neutral-900 dark:text-white"
          >
            {order.shipping_name}
          </Typography>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="call-outline" size={14} color="#64748B" />
          <Typography variant="caption" className="ml-2 text-mera-neutral-500">
            Telefon
          </Typography>
          <Typography
            variant="caption"
            className="ml-auto font-inter-semibold text-mera-neutral-900 dark:text-white"
          >
            {order.shipping_phone}
          </Typography>
        </View>

        <View className="flex-row items-start">
          <Ionicons
            name="location-outline"
            size={14}
            color="#64748B"
            style={{ marginTop: 2 }}
          />
          <Typography variant="caption" className="ml-2 text-mera-neutral-500">
            Adres
          </Typography>
          <Typography
            variant="caption"
            className="ml-auto max-w-[60%] text-right font-inter-semibold text-mera-neutral-900 dark:text-white"
          >
            {order.shipping_address}
          </Typography>
        </View>
      </View>

      {/* Divider: Shipping and Total */}
      <Divider />

      {/* Toplam tutar */}
      <View className="mt-3 flex-row items-center justify-end">
        <Typography variant="caption" className="mr-2 text-mera-neutral-500">
          Toplam
        </Typography>
        <Typography
          variant="body"
          className="font-inter-bold text-mera-primary dark:text-mera-accent"
        >
          {formatCurrency(order.total_amount)}
        </Typography>
      </View>
    </View>
  );
}
