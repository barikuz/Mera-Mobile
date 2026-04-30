/**
 * GearRecommendationScreen — Ekipman Tavsiyesi ekranı.
 *
 * Hedef balık türü, avlak noktası ve avlanma stili parametrelerine göre
 * AI destekli ekipman seti önerisi sunar. Yanıtlar cihazda saklanır ve
 * kullanıcı yeni öneri istemedikçe tekrar istek atılmaz.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import MapButton from "@/components/ui/MapButton";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import StatusBadge from "@/components/ui/StatusBadge";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useFishingStyles, useFishSpecies } from "@/hooks/useCatalog";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useFishingSpots } from "@/hooks/useFishingSpots";
import { useGearRecommendation } from "@/hooks/useGearRecommendation";
import { useCartStore } from "@/store/useCartStore";
import { SelectedSpot } from "@/store/useAssistantStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DropdownMenu from "../../components/ui/DropdownMenu";

/** Ekipman tipi ikonları ve etiketleri */
interface GearItem {
  type: "rod" | "reel" | "bait";
  label: string;
  icon: string;
  name: string;
  price: number;
  expertNote: string;
}

// ── Gear type badge renk eşlemeleri ───────────────────────────────────────────
const GEAR_TYPE_BADGE: Record<GearItem["type"], { bg: string; text: string }> =
  {
    rod: { bg: "bg-mera-status-info/20", text: "text-mera-status-info" },
    reel: { bg: "bg-mera-status-warning/20", text: "text-mera-status-warning" },
    bait: { bg: "bg-mera-status-success/20", text: "text-mera-status-success" },
  };

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function GearRecommendationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;
  const addToCart = useCartStore((state) => state.addToCart);
  const fishSpeciesQuery = useFishSpecies();
  const fishingStylesQuery = useFishingStyles();
  const fishingSpotsQuery = useFishingSpots();
  const {
    data: gearResults,
    lastRequest,
    isLoading,
    error,
    getRecommendation,
    retry,
  } = useGearRecommendation();

  const fishSpeciesItems = fishSpeciesQuery.data?.map((item) => item.name) ?? [];
  const fishingStyleItems =
    fishingStylesQuery.data?.map((item) => item.name) ?? [];
  const fishingSpotItems = useMemo<SelectedSpot[]>(
    () =>
      fishingSpotsQuery.spots.map((spot) => ({
        id: spot.id,
        name: spot.name,
        coordinate: {
          latitude: spot.center_lat,
          longitude: spot.center_lng,
        },
      })),
    [fishingSpotsQuery.spots],
  );

  // ── Form durumu ───────────────────────────────────────────────────────────
  const [selectedFish, setSelectedFish] = useState<string | null>(
    lastRequest?.targetFish ?? null,
  );
  const [selectedMera, setSelectedMera] = useState<SelectedSpot | null>(
    lastRequest?.selectedSpot ?? null,
  );
  const [pendingCoordinate, setPendingCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(
    lastRequest?.fishingStyle ?? null,
  );
  const [isMeraDropdownOpen, setIsMeraDropdownOpen] = useState(false);

  // ── Harita Overlay ────────────────────────────────────────────────────────
  const mapOverlay = useExpandableOverlay();

  useEffect(() => {
    if (!lastRequest) {
      return;
    }

    setSelectedFish((prev) => prev ?? lastRequest.targetFish);
    setSelectedStyle((prev) => prev ?? lastRequest.fishingStyle);
    setSelectedMera((prev) => prev ?? lastRequest.selectedSpot);
  }, [lastRequest]);

  const openMap = useCallback(() => {
    setPendingCoordinate(selectedMera?.coordinate ?? null);
    mapOverlay.expand();
  }, [mapOverlay, selectedMera]);

  const handleCoordinateSelect = useCallback(
    (coordinate: { latitude: number; longitude: number }) => {
      setPendingCoordinate({
        latitude: Number(coordinate.latitude.toFixed(6)),
        longitude: Number(coordinate.longitude.toFixed(6)),
      });
    },
    [],
  );

  const handleConfirmLocation = useCallback(() => {
    if (!pendingCoordinate) {
      return;
    }

    setSelectedMera({
      id: "custom-map",
      name: `Koordinat (${pendingCoordinate.latitude.toFixed(4)}, ${pendingCoordinate.longitude.toFixed(4)})`,
      coordinate: pendingCoordinate,
    });
    mapOverlay.collapse();
  }, [mapOverlay, pendingCoordinate]);

  // ── Formu tamamlanmış mı kontrol et ───────────────────────────────────────
  const isFormComplete = useMemo(
    () =>
      selectedFish !== null && selectedMera !== null && selectedStyle !== null,
    [selectedFish, selectedMera, selectedStyle],
  );

  // ── Kombinasyon Önerisi Al ────────────────────────────────────────────────
  const handleGetRecommendation = useCallback(() => {
    if (!isFormComplete || !selectedFish || !selectedMera || !selectedStyle)
      return;

    void getRecommendation({
      targetFish: selectedFish,
      coordinates: selectedMera.coordinate,
      fishingStyle: selectedStyle,
      selectedSpot: selectedMera,
    });
  }, [getRecommendation, isFormComplete, selectedFish, selectedMera, selectedStyle]);

  // ── Sepete Ekle (Simülasyon) ──────────────────────────────────────────────
  const handleAddAllToCart = useCallback(() => {
    if (!gearResults || gearResults.length === 0) {
      Alert.alert(
        "Sepete Eklenemedi",
        "Sepete eklenecek ekipman önerisi bulunamadı.",
      );
      return;
    }

    try {
      const cartReadyItems = gearResults.filter(
        (item): item is typeof item & { productId: string } =>
          typeof item.productId === "string" && item.productId.length > 0,
      );

      if (cartReadyItems.length === 0) {
        Alert.alert(
          "Sepete Eklenemedi",
          "Önerilerde sepete eklenebilecek ürün kimliği bulunamadı.",
        );
        return;
      }

      cartReadyItems.forEach((item) => {
        addToCart({
          productId: item.productId,
          productName: item.name || item.label,
          price: item.price,
          imageUrl: item.imageUrl ?? "",
        });
      });

      const skippedItemCount = gearResults.length - cartReadyItems.length;
      const successMessage =
        skippedItemCount > 0
          ? `${cartReadyItems.length} ekipman sepete eklendi. ${skippedItemCount} öneri, ürün kimliği eksik olduğu için atlandı.`
          : `Önerilen ${cartReadyItems.length} ekipman parçası sepetinize eklendi.`;

      Alert.alert(
        skippedItemCount > 0 ? "Kısmen Eklendi" : "Sepete Eklendi",
        successMessage,
      );
    } catch {
      Alert.alert(
        "Sepete Eklenemedi",
        "Önerilen ekipmanlar sepete eklenirken bir hata oluştu.",
      );
    }
  }, [addToCart, gearResults]);

  // ── Fiyat formatı ─────────────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Başlık ───────────────────────────────────────────────────────── */}
        <SectionHeader
          icon={
            <MaterialCommunityIcons name="hook" size={24} color={accentColor} />
          }
          title="Ekipman Tavsiyesi"
          subtitle="Hedef balığına, merana ve stile göre AI destekli ekipman seti önerisi al."
          className="mb-5"
        />

        {/* ── 1. Hedef Balık Türü ──────────────────────────────────────────── */}
        <View className="mb-5">
          <ChipGroup
            label="Hedef Balık Türü"
            items={fishSpeciesItems}
            selectedItem={selectedFish}
            onSelect={setSelectedFish}
          />
          {fishSpeciesQuery.isLoading ? (
            <View className="mt-2 flex-row items-center gap-2">
              <ActivityIndicator size="small" color={accentColor} />
              <Typography variant="caption" className="text-mera-neutral-500">
                Türler yükleniyor...
              </Typography>
            </View>
          ) : fishSpeciesQuery.isError ? (
            <Typography
              variant="caption"
              className="mt-2 text-mera-status-error"
            >
              Türler yüklenemedi. Lütfen tekrar deneyin.
            </Typography>
          ) : null}
        </View>

        {/* ── 2. Avlak Noktası (Dropdown + Harita Butonu) ──────────────────── */}
        <View className="mb-5">
          <Typography variant="body" className="mb-5 font-inter-semibold">
            Avlak Noktası
          </Typography>

          <View className="flex-row items-start gap-2">
            <DropdownMenu
              value={selectedMera?.name}
              placeholder="Mera seçin..."
              isOpen={isMeraDropdownOpen}
              onPress={() => setIsMeraDropdownOpen((prev) => !prev)}
            >
              {[null, ...fishingSpotItems].map((mera, index) => {
                const isSelected = mera
                  ? selectedMera?.id === mera.id
                  : !selectedMera;
                const isLast = index === fishingSpotItems.length;

                return (
                  <Pressable
                    key={mera?.id ?? "reset-mera-option"}
                    onPress={() => {
                      setSelectedMera(isSelected ? null : mera);
                      setIsMeraDropdownOpen(false);
                    }}
                    className={`flex-row items-center px-4 py-3 ${
                      isSelected
                        ? "bg-mera-primary/10 dark:bg-mera-accent/15"
                        : ""
                    } ${!isLast ? "border-b border-mera-neutral-200 dark:border-mera-neutral-500" : ""}`}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    {mera ? (
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={18}
                        color={isSelected ? accentColor : "#64748B"}
                      />
                    ) : null}
                    <Typography
                      variant="body"
                      className={`${mera ? "ml-2" : ""} flex-1 text-sm ${
                        isSelected
                          ? "font-inter-semibold text-mera-primary dark:text-mera-accent"
                          : ""
                      }`}
                      numberOfLines={1}
                    >
                      {mera?.name ?? "Mera seçin..."}
                    </Typography>
                    {isSelected && (
                      <MaterialIcons
                        name="check"
                        size={18}
                        color={accentColor}
                      />
                    )}
                  </Pressable>
                );
              })}
            </DropdownMenu>

            <MapButton onPress={openMap} iconColor={accentColor} />
          </View>
          {fishingSpotsQuery.loading ? (
            <View className="mt-2 flex-row items-center gap-2">
              <ActivityIndicator size="small" color={accentColor} />
              <Typography variant="caption" className="text-mera-neutral-500">
                Meralar yükleniyor...
              </Typography>
            </View>
          ) : fishingSpotsQuery.error ? (
            <Typography
              variant="caption"
              className="mt-2 text-mera-status-error"
            >
              {fishingSpotsQuery.error}
            </Typography>
          ) : null}
        </View>

        {/* ── 3. Avlanma Stili ─────────────────────────────────────────────── */}
        <View className="mb-6">
          <ChipGroup
            label="Avlanma Stili"
            items={fishingStyleItems}
            selectedItem={selectedStyle}
            onSelect={setSelectedStyle}
          />
          {fishingStylesQuery.isLoading ? (
            <View className="mt-2 flex-row items-center gap-2">
              <ActivityIndicator size="small" color={accentColor} />
              <Typography variant="caption" className="text-mera-neutral-500">
                Stiller yükleniyor...
              </Typography>
            </View>
          ) : fishingStylesQuery.isError ? (
            <Typography
              variant="caption"
              className="mt-2 text-mera-status-error"
            >
              Avlanma stilleri yüklenemedi. Lütfen tekrar deneyin.
            </Typography>
          ) : null}
        </View>

        {/* ── Ana Aksiyon Butonu ────────────────────────────────────────────── */}
        <View className="mb-6">
          <Button
            title={
              isLoading
                ? "Analiz Ediliyor..."
                : gearResults
                  ? "Yeni Kombinasyon Al"
                  : "Kombinasyon Önerisi Al"
            }
            onPress={handleGetRecommendation}
            disabled={!isFormComplete || isLoading}
            icon={
              isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#0F162A" : "#F8FAFC"}
                />
              ) : (
                <MaterialIcons
                  name="auto-awesome"
                  size={20}
                  color={isDark ? "#0F162A" : "#F8FAFC"}
                />
              )
            }
          />
        </View>

        {/* ── Skeleton Loader ──────────────────────────────────────────────── */}
        {isLoading && (
          <View className="mb-6">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              >
                <View className="flex-row">
                  <SkeletonBlock className="mr-3 h-20 w-20 rounded-xl" />
                  <View className="flex-1">
                    <SkeletonBlock className="mb-2 h-5 w-16 rounded-full" />
                    <SkeletonBlock className="mb-2 h-4 w-4/5 rounded" />
                    <SkeletonBlock className="h-5 w-20 rounded" />
                  </View>
                </View>
                <SkeletonBlock className="mt-3 h-3 w-full rounded" />
                <SkeletonBlock className="mt-1.5 h-3 w-3/4 rounded" />
              </View>
            ))}
          </View>
        )}

        {/* ── Sonuç Kartları ───────────────────────────────────────────────── */}
        {gearResults && !isLoading && (
          <View>
            {/* Sonuç Başlığı */}
            <SectionHeader
              icon={
                <MaterialIcons name="backpack" size={20} color={accentColor} />
              }
              title="Önerilen Ekipman Seti"
              badge={`${gearResults.length} parça`}
              variant="subsection"
              className="mb-3"
            />

            {/* Seçili parametreler özeti */}
            <View className="mb-3 flex-row flex-wrap gap-1.5">
              {lastRequest?.targetFish && (
                <StatusBadge label={`🐟 ${lastRequest.targetFish}`} />
              )}
              {lastRequest?.selectedSpot && (
                <StatusBadge label={`📍 ${lastRequest.selectedSpot.name}`} />
              )}
              {lastRequest?.fishingStyle && (
                <StatusBadge
                  label={`🎣 ${lastRequest.fishingStyle}`}
                  className="!mt-2"
                />
              )}
            </View>

            {/* Ekipman Kartları */}
            {gearResults.map((item, index) => {
              const badge = GEAR_TYPE_BADGE[item.type];

              return (
                <View
                  key={`${item.type}-${item.name}-${index}`}
                  className="mb-3 overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
                >
                  <View className="p-4">
                    {/* Üst satır: Görsel placeholder + Bilgi */}
                    <View className="flex-row">
                      {/* Ürün görseli — gerçek görsel yoksa ikonlu placeholder */}
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="mr-3 h-20 w-20 rounded-xl bg-mera-neutral-200 dark:bg-mera-neutral-950"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="mr-3 h-20 w-20 items-center justify-center rounded-xl bg-mera-neutral-200 dark:bg-mera-neutral-950">
                          <MaterialCommunityIcons
                            name={item.icon as any}
                            size={32}
                            color={accentColor}
                          />
                        </View>
                      )}

                      {/* Ürün bilgileri */}
                      <View className="flex-1 justify-center">
                        <View className="mb-1 flex-row">
                          <StatusBadge
                            label={item.label}
                            bgClass={badge.bg}
                            textClass={badge.text}
                            className=""
                            noMarginLeft
                            noMarginBottom
                          />
                        </View>

                        <Typography
                          variant="body"
                          className="font-inter-semibold text-sm"
                          numberOfLines={2}
                        >
                          {item.name}
                        </Typography>

                        <Typography
                          variant="body"
                          className="mt-0.5 font-inter-bold text-mera-primary dark:text-mera-accent"
                        >
                          {formatPrice(item.price)}
                        </Typography>
                      </View>
                    </View>

                    {/* Uzman Notu */}
                    <View className="mt-3 rounded-lg bg-mera-primary/5 p-3 dark:bg-mera-accent/10">
                      <View className="mb-1 flex-row items-center">
                        <MaterialIcons
                          name="psychology"
                          size={14}
                          color={accentColor}
                        />
                        <Typography
                          variant="caption"
                          className="ml-1 text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
                        >
                          Uzman Notu
                        </Typography>
                      </View>
                      <Typography variant="caption" className="leading-5">
                        {item.expertNote}
                      </Typography>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Toplam Fiyat */}
            <View className="mb-3 flex-row items-center justify-between rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-4 py-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
              <Typography variant="body" className="font-inter-semibold">
                Toplam Set Fiyatı
              </Typography>
              <Typography
                variant="h2"
                className="text-mera-primary dark:text-mera-accent"
              >
                {formatPrice(
                  gearResults.reduce((sum, item) => sum + item.price, 0),
                )}
              </Typography>
            </View>

            {/* Sepete Ekle CTA */}
            <Button
              title="Tüm Seti Sepete Ekle"
              onPress={handleAddAllToCart}
              icon={
                <MaterialCommunityIcons
                  name="cart-plus"
                  size={22}
                  color={isDark ? "#0F162A" : "#F8FAFC"}
                />
              }
            />
          </View>
        )}

        {error && !isLoading && (
          <View className="mb-6 rounded-xl border border-mera-status-error/20 bg-mera-status-error/10 p-4">
            <Typography
              variant="body"
              className="font-inter-semibold text-mera-status-error"
            >
              Öneri alınamadı.
            </Typography>
            <Typography variant="caption" className="mt-1 text-mera-status-error">
              {error}
            </Typography>
            <View className="mt-3">
              <Button
                variant="secondary"
                title="Tekrar Dene"
                onPress={retry}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Tam Ekran Harita Modalı ────────────────────────────────────────── */}
      <FishingSpotMapFullscreen
        visible={mapOverlay.isExpanded}
        onClose={mapOverlay.collapse}
        onConfirmSelection={handleConfirmLocation}
        animatedOverlayStyle={mapOverlay.animatedOverlayStyle}
        animatedMapStyle={mapOverlay.animatedMapStyle}
        animatedBackButtonStyle={mapOverlay.animatedBackButtonStyle}
        mode="coordinate"
        selectedCoordinate={pendingCoordinate}
        onCoordinateSelect={handleCoordinateSelect}
      />
    </ScreenContainer>
  );
}
