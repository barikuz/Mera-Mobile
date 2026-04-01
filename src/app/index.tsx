import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, useColorScheme, View } from "react-native";

import QuickAccessCard from "@/components/ui/QuickAccessCard";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { useLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AnaSayfaScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { locationName, isLoading, permissionDenied } = useLocation();

  // Selamlama mantığı
  const displayName = user?.user_metadata?.display_name;
  const greeting = displayName
    ? `Rast gele ${displayName}!`
    : "Rast gele balıkçı!";

  // Konum gösterimi
  const renderLocation = () => {
    if (isLoading) {
      const spinnerColor = colorScheme === "dark" ? "#E1AA74" : "#192655";
      return <ActivityIndicator size="small" color={spinnerColor} />;
    }
    if (permissionDenied) {
      return <Typography variant="caption">Konum izni verilmedi</Typography>;
    }
    return (
      <View className="flex-row items-center">
        <Ionicons name="location-outline" size={16} color="#64748B" />
        <Typography variant="caption" className="ml-1">
          {locationName || "Konum bulunamadı"}
        </Typography>
      </View>
    );
  };

  // Kart ikon rengi
  const iconColor = colorScheme === "dark" ? "#F8FAFC" : "#192655";

  // Henüz uygulanmamış özellikler için alert
  const showComingSoon = () => {
    Alert.alert("Yakında", "Bu özellik yakında eklenecek.");
  };

  return (
    <ScreenContainer>
      {/* Selamlama Bölümü */}
      <View className="mt-4 mb-4 items-center">
        <Typography variant="h1" className="text-center">
          {greeting}
        </Typography>
      </View>

      {/* Konum Bölümü */}
      <View className="mb-12 items-center">{renderLocation()}</View>

      {/* Hızlı Erişim Bölümü */}
      <Typography variant="h2" className="mb-4 text-center">
        Hızlı Erişim
      </Typography>

      {/* 2x2 Grid - Üst Satır */}
      <View className="flex-row gap-3 mb-3">
        <QuickAccessCard
          title="Harita"
          description="Av bölgelerini keşfedin"
          icon={<Ionicons name="map-outline" size={28} color={iconColor} />}
          onPress={showComingSoon}
        />
        <QuickAccessCard
          title="Mağaza"
          description="Ekipman ve malzemeler"
          icon={
            <MaterialCommunityIcons name="store" size={28} color={iconColor} />
          }
          onPress={() => router.push("/shop")}
        />
      </View>

      {/* 2x2 Grid - Alt Satır */}
      <View className="flex-row gap-3">
        <QuickAccessCard
          title="Asistan"
          description="Yapay zekâ yardımı"
          icon={<MaterialIcons name="assistant" size={28} color={iconColor} />}
          onPress={() => router.push("/asistan")}
        />
        <QuickAccessCard
          title="Av İstatistikleri"
          description="Performansınızı takip edin"
          icon={
            <Ionicons name="stats-chart-outline" size={28} color={iconColor} />
          }
          onPress={showComingSoon}
        />
      </View>
    </ScreenContainer>
  );
}
