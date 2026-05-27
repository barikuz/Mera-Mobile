import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import FishBadge from "@/components/ui/FishBadge";
import FishingConditionsHeroCard from "@/components/ui/FishingConditionsHeroCard";
import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import QuickAccessCard from "@/components/ui/QuickAccessCard";
import RecentCatchCard from "@/components/ui/RecentCatchCard";
import RecentGearRecommendationCard from "@/components/ui/RecentGearRecommendationCard";
import RecentSpotRecommendationCard from "@/components/ui/RecentSpotRecommendationCard";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import SpotCard from "@/components/ui/SpotCard";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

// ────────────────────────────────────────────────────────────────
// Tip tanımları
// ────────────────────────────────────────────────────────────────

type Coordinate = { latitude: number; longitude: number };
type ConditionsStatus = "good" | "okay" | "poor";

// ────────────────────────────────────────────────────────────────
// Mock veriler
// ────────────────────────────────────────────────────────────────

const mockConditions = {
  status: "good" as ConditionsStatus,
  temperature: 18,
  windSpeed: 3,
  pressure: 1016,
  summary: "Hafif rüzgar ve stabil basınç, sabah ve akşam verimli.",
};

const mockNearestSpots = [
  {
    id: "spot-1",
    name: "Kilyos Koyu",
    distanceKm: 4.2,
    waterType: "Tuzlu Su",
    coordinate: { latitude: 41.2496, longitude: 29.0301 },
  },
  {
    id: "spot-2",
    name: "Sazlidere Golu",
    distanceKm: 6.8,
    waterType: "Tatli Su",
    coordinate: { latitude: 41.0861, longitude: 28.6209 },
  },
  {
    id: "spot-3",
    name: "Ayvat Bendi",
    distanceKm: 9.4,
    waterType: "Akarsu",
    coordinate: { latitude: 41.2337, longitude: 28.9179 },
  },
];

const mockRecentCatch = {
  species: "Levrek",
  weightKg: 1.8,
  date: "10 Mayis 2026, 07:45",
  location: "Kilyos Koyu",
};

const mockRecommendedSpot = {
  name: "Rumelifeneri",
  note: "Sabah akintisi ile palamut hareketli.",
  coordinate: { latitude: 41.2308, longitude: 29.1248 },
};

const mockGearRecommendations = [
  {
    id: "gear-rod",
    type: "Olta",
    name: "Shimano Nexave 2.40",
    note: "Orta sertlik, kiyida ideal. ",
  },
  {
    id: "gear-reel",
    type: "Makine",
    name: "Daiwa Revros LT",
    note: "Hafif govde, uzun atis.",
  },
  {
    id: "gear-bait",
    type: "Yem",
    name: "Silikon Sasi 8 cm",
    note: "Bulanik suda etkili.",
  },
];

const mockPopularSpots = [
  {
    id: "popular-spot-1",
    name: "Beykoz Iskelesi",
    distanceKm: 12.1,
    waterType: "Tuzlu Su",
    coordinate: { latitude: 41.1332, longitude: 29.1022 },
  },
  {
    id: "popular-spot-2",
    name: "Buyukcekmece Golu",
    distanceKm: 18.4,
    waterType: "Tatli Su",
    coordinate: { latitude: 41.0112, longitude: 28.5506 },
  },
  {
    id: "popular-spot-3",
    name: "Terkos Golu",
    distanceKm: 28.6,
    waterType: "Tatli Su",
    coordinate: { latitude: 41.2955, longitude: 28.6453 },
  },
];

const mockPopularProducts = [
  {
    id: "product-1",
    name: "Karbon Olta 2.70",
    price: 1450,
    image_url: "https://picsum.photos/seed/mera-rod/400/400",
  },
  {
    id: "product-2",
    name: "Spin Makine 3000",
    price: 2190,
    image_url: "https://picsum.photos/seed/mera-reel/400/400",
  },
  {
    id: "product-3",
    name: "Popper Set 5'li",
    price: 720,
    image_url: "https://picsum.photos/seed/mera-bait/400/400",
  },
];

const mockTopFishes = ["Levrek", "Sazan", "Uskumru", "Sudak", "Istavrit"];

// ────────────────────────────────────────────────────────────────
// Ana Sayfa Ekranı
// ────────────────────────────────────────────────────────────────

export default function AnaSayfaScreen() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme === "dark" ? "dark" : "light";
  const themeColors = COLORS[themeMode];
  const isDark = themeMode === "dark";
  const router = useRouter();
  const { user } = useAuthStore();
  const { locationName, isLoading, permissionDenied } = useLocation();
  const addToCart = useCartStore((state) => state.addToCart);
  const mapOverlay = useExpandableOverlay();
  const [mapMode, setMapMode] = useState<"spots" | "coordinate">("spots");
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<Coordinate | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Harita işlevleri ──────────────────────────────────────────
  const openSpotsMap = () => {
    setMapMode("spots");
    setSelectedCoordinate(null);
    mapOverlay.expand();
  };

  const openCoordinateMap = (coordinate: Coordinate) => {
    setMapMode("coordinate");
    setSelectedCoordinate(coordinate);
    mapOverlay.expand();
  };

  // ── Sepete ekle ───────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      imageUrl: product.image_url,
    });
  };

  // ── Pull-to-refresh ──────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simüle: Gerçek API entegrasyonunda burada refetch çağrılır
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  // ── Memoize edilmiş veri dönüşümleri ─────────────────────────
  const formattedNearestSpots = useMemo(
    () =>
      mockNearestSpots.map((spot) => ({
        ...spot,
        distanceLabel: `${spot.distanceKm.toFixed(1)} km`,
      })),
    [],
  );

  const formattedPopularSpots = useMemo(
    () =>
      mockPopularSpots.map((spot) => ({
        ...spot,
        distanceLabel: `${spot.distanceKm.toFixed(1)} km`,
      })),
    [],
  );

  // ── Selamlama mantığı ────────────────────────────────────────
  const displayName = user?.user_metadata?.display_name;

  // ── Konum gösterimi ──────────────────────────────────────────
  const renderLocation = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={themeColors.iconActive} />;
    }
    if (permissionDenied) {
      return (
        <View className="flex-row items-center rounded-full bg-mera-status-warning/10 px-3 py-1">
          <Ionicons name="warning-outline" size={14} color="#F59E0B" />
          <Typography variant="caption" className="ml-1.5 text-xs">
            Konum izni verilmedi
          </Typography>
        </View>
      );
    }
    return (
      <View className="flex-row items-center rounded-full bg-mera-neutral-200/60 px-3 py-1.5 dark:bg-mera-neutral-800">
        <Ionicons
          name="location"
          size={14}
          color={isDark ? "#00ccb2" : "#192655"}
        />
        <Typography
          variant="caption"
          className="ml-1.5 text-xs font-inter-semibold text-mera-neutral-900 dark:text-white"
        >
          {locationName || "Konum bulunamadı"}
        </Typography>
      </View>
    );
  };

  // ── İkon rengi ───────────────────────────────────────────────
  const iconColor = themeColors.iconActive;

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#00ccb2" : "#192655"}
            colors={["#192655", "#00ccb2"]}
          />
        }
      >
        {/* ═══════════════════════════════════════════════════════
            § 1 — Selamlama + Konum
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-6 items-center">
          <View className="flex-row items-center justify-center">
            <View className="w-12 items-end pr-2">
              <Typography variant="h1" className="mb-1">
                🎣
              </Typography>
            </View>
            <Typography variant="h1" className="mb-1 text-center">
              Rastgele
            </Typography>
            <View className="w-12" />
          </View>
          <Typography
            variant="body"
            className="mb-3 text-center text-mera-neutral-600 dark:text-mera-neutral-400"
          >
            {displayName || "Balıkçı"}!
          </Typography>
          {renderLocation()}
        </View>

        {/* ═══════════════════════════════════════════════════════
            § 2 — Hızlı Erişim Grid (2×2)
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-8 px-1">
          {/* Üst Satır */}
          <View className="mb-4 flex-row" style={{ gap: 12 }}>
            <QuickAccessCard
              title="Harita"
              description="Av bölgelerini keşfedin"
              icon={<Ionicons name="map-outline" size={26} color={iconColor} />}
              onPress={openSpotsMap}
              iconBgClass="bg-blue-500/10 dark:bg-blue-400/15"
            />
            <QuickAccessCard
              title="Mağaza"
              description="Ekipman ve malzemeler"
              icon={
                <MaterialCommunityIcons
                  name="store"
                  size={26}
                  color={iconColor}
                />
              }
              onPress={() => router.push("/shop")}
              iconBgClass="bg-emerald-500/10 dark:bg-emerald-400/15"
            />
          </View>

          {/* Alt Satır */}
          <View className="flex-row" style={{ gap: 12 }}>
            <QuickAccessCard
              title="Asistan"
              description="Yapay zeka yardımı"
              icon={
                <MaterialIcons name="assistant" size={26} color={iconColor} />
              }
              onPress={() => router.push("/assistant")}
              iconBgClass="bg-violet-500/10 dark:bg-violet-400/15"
            />
            <QuickAccessCard
              title="Av İstatistikleri"
              description="Performansınızı takip edin"
              icon={
                <Ionicons
                  name="stats-chart-outline"
                  size={26}
                  color={iconColor}
                />
              }
              onPress={() => router.push("/profile")}
              iconBgClass="bg-amber-500/10 dark:bg-amber-400/15"
            />
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            § 3 — Av Koşulları Hero Kartı
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-8">
          <FishingConditionsHeroCard conditions={mockConditions} />
        </View>

        {/* ═══════════════════════════════════════════════════════
            § 4 — En Yakın Meralar
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-8">
          <SectionHeader
            icon={
              <MaterialIcons
                name="location-on"
                size={20}
                color={themeColors.iconActive}
              />
            }
            title="En yakın meralar"
            subtitle="Sana en yakın 3 avlak noktası."
            className="mb-4"
            actionLabel="Tümü"
            onAction={openSpotsMap}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row" style={{ gap: 12 }}>
              {formattedNearestSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  name={spot.name}
                  distanceLabel={spot.distanceLabel}
                  waterType={spot.waterType}
                  onPress={() => openCoordinateMap(spot.coordinate)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════════════════
            § 5 — Son Aktiviteler
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-8">
          <SectionHeader
            icon={
              <MaterialIcons
                name="history"
                size={20}
                color={themeColors.iconActive}
              />
            }
            title="Son aktiviteler"
            subtitle="Son avın, önerilen meran ve ekipman tavsiyen."
            className="mb-4"
          />

          {/* Son Av Kartı */}
          <View className="mb-3">
            {mockRecentCatch ? (
              <RecentCatchCard
                species={mockRecentCatch.species}
                weightKg={mockRecentCatch.weightKg}
                date={mockRecentCatch.date}
                location={mockRecentCatch.location}
              />
            ) : (
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-6 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <MaterialCommunityIcons
                  name="fish-off"
                  size={40}
                  color={isDark ? "#64748B" : "#94A3B8"}
                />
                <Typography variant="caption" className="mb-3 mt-2 text-center">
                  Henuz bir av kaydin yok.
                </Typography>
                <View className="w-full">
                  <Button
                    title="Ilk avini ekle"
                    onPress={() => router.push("/add-catch")}
                  />
                </View>
              </View>
            )}
          </View>

          {/* AI Önerisi Kartı */}
          <View className="mb-3">
            <RecentSpotRecommendationCard
              spotName={mockRecommendedSpot.name}
              note={mockRecommendedSpot.note}
              onPress={() => openCoordinateMap(mockRecommendedSpot.coordinate)}
            />
          </View>

          {/* Ekipman Tavsiyeleri */}
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              <View className="flex-row" style={{ gap: 12 }}>
                {mockGearRecommendations.map((item) => (
                  <RecentGearRecommendationCard
                    key={item.id}
                    type={item.type}
                    name={item.name}
                    note={item.note}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            § 6 — Popüler
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-4">
          <SectionHeader
            icon={
              <MaterialCommunityIcons
                name="fire"
                size={20}
                color={themeColors.iconActive}
              />
            }
            title="Popüler"
            subtitle="Toplulukta en çok ilgi görenler."
            className="mb-4"
          />

          {/* Popüler Meralar */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center">
              <View
                className="mr-2 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isDark ? "#00ccb2" : "#192655",
                }}
              />
              <Typography
                variant="body"
                className="text-sm font-inter-semibold"
              >
                Popüler meralar
              </Typography>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              <View className="flex-row" style={{ gap: 12 }}>
                {formattedPopularSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    name={spot.name}
                    distanceLabel={spot.distanceLabel}
                    waterType={spot.waterType}
                    onPress={() => openCoordinateMap(spot.coordinate)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* En Çok Satılan Ürünler */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center">
              <View
                className="mr-2 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isDark ? "#00ccb2" : "#192655",
                }}
              />
              <Typography
                variant="body"
                className="text-sm font-inter-semibold"
              >
                En çok satılan ürünler
              </Typography>
            </View>
            <View
              className="flex-row flex-wrap justify-between"
              style={{ gap: 12 }}
            >
              {mockPopularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </View>
          </View>

          {/* En Çok Tutulan Balıklar */}
          <View>
            <View className="mb-2 flex-row items-center">
              <View
                className="mr-2 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: isDark ? "#00ccb2" : "#192655",
                }}
              />
              <Typography
                variant="body"
                className="text-sm font-inter-semibold"
              >
                En çok tutulan balıklar
              </Typography>
            </View>
            <View className="flex-row flex-wrap">
              {mockTopFishes.map((fish, index) => (
                <FishBadge key={fish} name={fish} rank={index + 1} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <FishingSpotMapFullscreen
        visible={mapOverlay.isExpanded}
        onClose={mapOverlay.collapse}
        animatedOverlayStyle={mapOverlay.animatedOverlayStyle}
        animatedMapStyle={mapOverlay.animatedMapStyle}
        animatedBackButtonStyle={mapOverlay.animatedBackButtonStyle}
        mode={mapMode}
        selectedCoordinate={selectedCoordinate}
        readOnlyCoordinate={mapMode === "coordinate"}
      />
    </ScreenContainer>
  );
}
