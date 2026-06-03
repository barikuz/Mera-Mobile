import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";

import AuthToast, { useAuthToast } from "@/components/ui/AuthToast";
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
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import SpotCard from "@/components/ui/SpotCard";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useLatestCatch } from "@/hooks/useCatches";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useFishingConditions } from "@/hooks/useFishingConditions";
import { useLocation } from "@/hooks/useLocation";
import { useNearestSpots } from "@/hooks/useNearestSpots";
import { useTopFish, useTopProducts } from "@/hooks/useTopStats";
import { useAssistantStore } from "@/store/useAssistantStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

// ────────────────────────────────────────────────────────────────
// Tip tanımları
// ────────────────────────────────────────────────────────────────

type Coordinate = { latitude: number; longitude: number };

// ────────────────────────────────────────────────────────────────
// Mock veriler
// ────────────────────────────────────────────────────────────────

// Ekipman tipi eşleştirmesi: store değeri → kart etiketi
const GEAR_TYPE_LABEL: Record<string, string> = {
  rod: "Olta",
  reel: "Makine",
  bait: "Yem",
};

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
  const { locationName, isLoading, permissionDenied, coords } = useLocation();

  // ── Av koşulları verisi ──────────────────────────────────────
  const {
    data: conditionsData,
    isLoading: conditionsLoading,
    error: conditionsError,
    refetch: refetchConditions,
  } = useFishingConditions(coords);

  // ── En yakın meralar ─────────────────────────────────────────
  const {
    spots: nearestSpots,
    isLoading: nearestSpotsLoading,
    error: nearestSpotsError,
    refetch: refetchNearestSpots,
  } = useNearestSpots(coords);

  // ── En çok satılan ürünler ───────────────────────────────────
  const {
    data: topProducts,
    isLoading: topProductsLoading,
    isError: topProductsError,
    refetch: refetchTopProducts,
  } = useTopProducts();

  // ── En çok tutulan balıklar ──────────────────────────────────
  const {
    data: topFish,
    isLoading: topFishLoading,
    isError: topFishError,
    refetch: refetchTopFish,
  } = useTopFish();

  const addToCart = useCartStore((state) => state.addToCart);
  const mapOverlay = useExpandableOverlay();
  const [mapMode, setMapMode] = useState<"spots" | "coordinate">("spots");
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<Coordinate | null>(null);
  // ── Son av verisi ────────────────────────────────────────────
  const {
    data: latestCatch,
    isLoading: latestCatchLoading,
    isError: latestCatchError,
    refetch: refetchLatestCatch,
  } = useLatestCatch();

  // ── AI öneri verisi (kalıcı depolama) ────────────────────────
  const spotRecommendation = useAssistantStore(
    (state) => state.spotRecommendation,
  );
  const gearRecommendation = useAssistantStore(
    (state) => state.gearRecommendation,
  );

  // Zustand persist store'un AsyncStorage'ı okumayı bitirmesini bekle
  const [isStoreHydrated, setIsStoreHydrated] = useState(() =>
    useAssistantStore.persist.hasHydrated(),
  );
  useEffect(() => {
    if (useAssistantStore.persist.hasHydrated()) {
      setIsStoreHydrated(true);
      return;
    }
    const unsub = useAssistantStore.persist.onFinishHydration(() =>
      setIsStoreHydrated(true),
    );
    return unsub;
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  // ── Auth toast bildirisi ─────────────────────────────────────
  const authToast = useAuthToast();

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
    refetchConditions();
    refetchNearestSpots();
    void refetchLatestCatch();
    void refetchTopProducts();
    void refetchTopFish();
    setTimeout(() => setRefreshing(false), 1200);
  }, [
    refetchConditions,
    refetchNearestSpots,
    refetchLatestCatch,
    refetchTopProducts,
    refetchTopFish,
  ]);

  // ── Memoize edilmiş veri dönüşümleri ─────────────────────────
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
              onPress={() => {
                if (!user) {
                  authToast.show();
                  return;
                }
                router.push("/profile");
              }}
              iconBgClass="bg-amber-500/10 dark:bg-amber-400/15"
            />
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            § 3 — Av Koşulları Hero Kartı
            ═══════════════════════════════════════════════════════ */}
        <View className="mb-8">
          {conditionsLoading ? (
            // Yükleme iskeleti — kartın yaklaşık yüksekliğini tutar
            <View
              style={{
                overflow: "hidden",
                borderRadius: 24,
                backgroundColor: "#192655",
                padding: 20,
              }}
            >
              {/* Üst satır: başlık + durum göstergesi */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <SkeletonBlock
                    className="rounded-md"
                    style={{ height: 12, width: "40%", marginBottom: 8 }}
                  />
                  <SkeletonBlock
                    className="rounded-md"
                    style={{ height: 20, width: "60%" }}
                  />
                </View>
                <SkeletonBlock
                  className="rounded-full"
                  style={{ height: 48, width: 48 }}
                />
              </View>

              {/* Özet metni */}
              <SkeletonBlock
                className="rounded-md"
                style={{ height: 14, width: "80%", marginBottom: 16 }}
              />

              {/* Metrik bloğu */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <SkeletonBlock
                  className="rounded-2xl"
                  style={{ height: 64, flex: 1 }}
                />
                <SkeletonBlock
                  className="rounded-2xl"
                  style={{ height: 64, flex: 1 }}
                />
                <SkeletonBlock
                  className="rounded-2xl"
                  style={{ height: 64, flex: 1 }}
                />
              </View>
            </View>
          ) : conditionsError ? (
            // Hata durumu — kullanıcı dostu fallback
            <View className="items-center overflow-hidden rounded-3xl bg-[#192655] p-6">
              <Ionicons
                name="cloud-offline-outline"
                size={36}
                color="rgba(255,255,255,0.45)"
              />
              <Typography
                variant="caption"
                className="mb-3 mt-2 text-center text-sm text-white/60"
              >
                Av koşulları yüklenemedi.
              </Typography>
              <Button
                title="Tekrar Dene"
                onPress={refetchConditions}
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.80)"
                    : "rgba(255,255,255,0.18)",
                }}
              />
            </View>
          ) : conditionsData ? (
            <FishingConditionsHeroCard conditions={conditionsData} />
          ) : null}
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

          {nearestSpotsLoading ? (
            // Yükleme iskeleti — yatay kart sırasını taklit eder
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
              scrollEnabled={false}
            >
              <View className="flex-row" style={{ gap: 12 }}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: 208,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    {/* Gradient vurgu çizgisi */}
                    <SkeletonBlock style={{ height: 3, borderRadius: 0 }} />
                    <View style={{ padding: 16 }}>
                      <SkeletonBlock
                        className="rounded-md"
                        style={{ height: 14, width: "70%", marginBottom: 10 }}
                      />
                      <SkeletonBlock
                        className="rounded-lg"
                        style={{ height: 22, width: "45%", marginBottom: 14 }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <SkeletonBlock
                          className="rounded-md"
                          style={{ height: 12, width: "35%" }}
                        />
                        <SkeletonBlock
                          className="rounded-md"
                          style={{ height: 12, width: "30%" }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : nearestSpotsError ? (
            // Hata durumu — ekranı çökertme, kullanıcı dostu mesaj göster
            <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
              <Ionicons
                name="location-outline"
                size={30}
                color={isDark ? "#475569" : "#94A3B8"}
              />
              <Typography
                variant="caption"
                className="mb-3 mt-2 text-center text-sm"
              >
                {nearestSpotsError}
              </Typography>
              <Button title="Tekrar Dene" onPress={refetchNearestSpots} />
            </View>
          ) : nearestSpots.length === 0 ? (
            // Boş durum — konuma yakın mera bulunamadı
            <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
              <Ionicons
                name="map-outline"
                size={30}
                color={isDark ? "#475569" : "#94A3B8"}
              />
              <Typography
                variant="caption"
                className="mt-2 text-center text-sm"
              >
                Yakınında kayıtlı mera bulunamadı.
              </Typography>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              <View className="flex-row" style={{ gap: 12 }}>
                {nearestSpots.map((spot) => (
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
          )}
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
            {latestCatchLoading ? (
              // Yükleme iskeleti — kartın layout’unu taklit eder
              <View className="overflow-hidden rounded-2xl border border-mera-neutral-200 bg-white dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <View className="flex-row">
                  {/* Sol gradient alanı */}
                  <SkeletonBlock
                    style={{ width: 80, height: 96 }}
                    className="rounded-none"
                  />
                  {/* Sağ bilgi alanı */}
                  <View className="flex-1 p-4">
                    <SkeletonBlock
                      className="mb-2 rounded-md"
                      style={{ height: 18, width: "55%" }}
                    />
                    <SkeletonBlock
                      className="mb-3 rounded-md"
                      style={{ height: 12, width: "70%" }}
                    />
                    <View className="flex-row" style={{ gap: 8 }}>
                      <SkeletonBlock
                        className="rounded-full"
                        style={{ height: 24, width: 52 }}
                      />
                      <SkeletonBlock
                        className="rounded-full"
                        style={{ height: 24, width: 90 }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : latestCatchError ? (
              // Hata durumu — ekranı çökütme, sessiz fallback göster
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <Ionicons
                  name="cloud-offline-outline"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mb-3 mt-2 text-center text-sm"
                >
                  Son av yüklenemedi.
                </Typography>
                <Button
                  title="Tekrar Dene"
                  onPress={() => void refetchLatestCatch()}
                />
              </View>
            ) : latestCatch ? (
              // Başarılı durum — API verisiyle kartı doldur
              <RecentCatchCard
                species={latestCatch.species}
                weightKg={latestCatch.weightKg ?? 0}
                date={latestCatch.date}
                location={latestCatch.location}
              />
            ) : (
              // Boş durum — henüz av kaydı yok
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-6 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <MaterialCommunityIcons
                  name="fish-off"
                  size={40}
                  color={isDark ? "#64748B" : "#94A3B8"}
                />
                <Typography variant="caption" className="mb-3 mt-2 text-center">
                  Henüz bir av kaydın yok.
                </Typography>
                <View className="w-full">
                  <Button
                    title="İlk avını ekle"
                    onPress={() => {
                      if (!user) {
                        authToast.show();
                        return;
                      }
                      router.push("/add-catch");
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* AI Önerisi Kartı — Mera Önerisi */}
          <View className="mb-3">
            {!isStoreHydrated ? (
              // Yükleme iskeleti — mera kartının layout'unu taklit eder
              <View className="overflow-hidden rounded-2xl border border-mera-accent/20 p-4">
                <View className="mb-3 flex-row items-center">
                  <SkeletonBlock
                    className="mr-2 rounded-lg"
                    style={{ height: 28, width: 28 }}
                  />
                  <SkeletonBlock
                    className="rounded-full"
                    style={{ height: 20, width: 48 }}
                  />
                </View>
                <SkeletonBlock
                  className="mb-1 rounded-md"
                  style={{ height: 16, width: "50%" }}
                />
                <SkeletonBlock
                  className="rounded-md"
                  style={{ height: 12, width: "75%" }}
                />
              </View>
            ) : spotRecommendation.lastResult &&
              spotRecommendation.lastResult.length > 0 ? (
              // Başarılı durum — store'daki ilk öneri
              <RecentSpotRecommendationCard
                spotName={spotRecommendation.lastResult[0].name}
                note={spotRecommendation.lastResult[0].description}
                onPress={() =>
                  openCoordinateMap(
                    spotRecommendation.lastResult![0].coordinate,
                  )
                }
              />
            ) : (
              // Boş durum — henüz asistan kullanılmamış
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <MaterialIcons
                  name="auto-awesome"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mb-3 mt-2 text-center text-sm"
                >
                  Henüz bir mera önerisi yok. Asistanı kullanarak başla!
                </Typography>
                <View className="w-full">
                  <Button
                    title="Asistanı Aç"
                    onPress={() => router.push("/assistant")}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Ekipman Tavsiyeleri */}
          <View>
            {!isStoreHydrated ? (
              // Yükleme iskeleti — yatay ekipman kart sırasını taklit eder
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
                scrollEnabled={false}
              >
                <View className="flex-row" style={{ gap: 12 }}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      className="w-44 overflow-hidden rounded-2xl border border-mera-neutral-200 dark:border-mera-neutral-500/30"
                    >
                      <View className="flex-row">
                        <SkeletonBlock
                          style={{ width: 3 }}
                          className="rounded-none"
                        />
                        <View className="flex-1 p-3">
                          <View className="mb-2 flex-row items-center">
                            <SkeletonBlock
                              className="mr-2 rounded-lg"
                              style={{ height: 28, width: 28 }}
                            />
                            <SkeletonBlock
                              className="rounded-full"
                              style={{ height: 20, width: 48 }}
                            />
                          </View>
                          <SkeletonBlock
                            className="mb-1 rounded-md"
                            style={{ height: 14, width: "80%" }}
                          />
                          <SkeletonBlock
                            className="rounded-md"
                            style={{ height: 12, width: "60%" }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : gearRecommendation.lastResult &&
              gearRecommendation.lastResult.length > 0 ? (
              // Başarılı durum — store'daki ekipman önerileri
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                <View className="flex-row" style={{ gap: 12 }}>
                  {gearRecommendation.lastResult.map((item) => (
                    <RecentGearRecommendationCard
                      key={item.type}
                      type={GEAR_TYPE_LABEL[item.type] ?? item.label}
                      name={item.name}
                      note={item.expertNote}
                    />
                  ))}
                </View>
              </ScrollView>
            ) : (
              // Boş durum — ekipman önerisi yok
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <MaterialCommunityIcons
                  name="fish-off"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mt-2 text-center text-sm"
                >
                  Henüz bir ekipman tavsiyesi yok.
                </Typography>
              </View>
            )}
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

            {topProductsLoading ? (
              // Yükleme iskeleti — 2 sütunlu ürün grid'ini taklit eder
              <View
                className="flex-row flex-wrap justify-between"
                style={{ gap: 12 }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className="overflow-hidden rounded-2xl bg-white dark:bg-mera-neutral-800"
                    style={{ width: "48%" }}
                  >
                    <SkeletonBlock
                      style={{ aspectRatio: 1 }}
                      className="rounded-none"
                    />
                    <View className="p-3">
                      <SkeletonBlock
                        className="mb-2 rounded-md"
                        style={{ height: 14, width: "70%" }}
                      />
                      <View className="flex-row items-center justify-between mt-1">
                        <SkeletonBlock
                          className="rounded-md"
                          style={{ height: 16, width: "40%" }}
                        />
                        <SkeletonBlock
                          className="rounded-lg"
                          style={{ height: 32, width: 32 }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : topProductsError ? (
              // Hata durumu — kullanıcı dostu fallback
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <Ionicons
                  name="cloud-offline-outline"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mb-3 mt-2 text-center text-sm"
                >
                  Ürünler yüklenemedi.
                </Typography>
                <Button
                  title="Tekrar Dene"
                  onPress={() => void refetchTopProducts()}
                />
              </View>
            ) : topProducts && topProducts.length > 0 ? (
              // Başarılı durum — API verisiyle kartları doldur
              <View
                className="flex-row flex-wrap justify-between"
                style={{ gap: 12 }}
              >
                {topProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </View>
            ) : (
              // Boş durum — satılan ürün verisi henüz yok
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mt-2 text-center text-sm"
                >
                  Henüz satış verisi yok.
                </Typography>
              </View>
            )}
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

            {topFishLoading ? (
              // Yükleme iskeleti — pill rozetlerini taklit eder
              <View className="flex-row flex-wrap">
                {[0, 1, 2, 3, 4].map((i) => (
                  <SkeletonBlock
                    key={i}
                    className="rounded-full"
                    style={{ height: 32, width: 90 + (i % 2) * 20 }}
                  />
                ))}
              </View>
            ) : topFishError ? (
              // Hata durumu — kullanıcı dostu fallback
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <Ionicons
                  name="cloud-offline-outline"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mb-3 mt-2 text-center text-sm"
                >
                  Balık verileri yüklenemedi.
                </Typography>
                <Button
                  title="Tekrar Dene"
                  onPress={() => void refetchTopFish()}
                />
              </View>
            ) : topFish && topFish.length > 0 ? (
              // Başarılı durum — API verisiyle rozetleri doldur
              <View className="flex-row flex-wrap">
                {topFish.map((fish, index) => (
                  <FishBadge key={fish} name={fish} rank={index + 1} />
                ))}
              </View>
            ) : (
              // Boş durum — av istatistiği henüz yok
              <View className="items-center rounded-2xl border border-mera-neutral-200 bg-white p-5 dark:border-mera-neutral-500/30 dark:bg-mera-neutral-800">
                <MaterialCommunityIcons
                  name="fish-off"
                  size={30}
                  color={isDark ? "#475569" : "#94A3B8"}
                />
                <Typography
                  variant="caption"
                  className="mt-2 text-center text-sm"
                >
                  Henüz balık istatistiği yok.
                </Typography>
              </View>
            )}
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

      {/* ── Auth Toast Bildirisi ─────────────────────────────── */}
      <AuthToast visible={authToast.visible} opacity={authToast.opacity} />
    </ScreenContainer>
  );
}
