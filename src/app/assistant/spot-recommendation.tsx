import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import FishingSpotMapPreview from "@/components/ui/FishingSpotMapPreview";
import MapButton from "@/components/ui/MapButton";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import StatusBadge from "@/components/ui/StatusBadge";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFishSpecies } from "@/hooks/useCatalog";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useSpotRecommendation } from "@/hooks/useSpotRecommendation";
import { Coordinates, RecommendedSpot } from "@/store/useAssistantStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Su Tipi Rozeti Renkleri ───────────────────────────────────────────────────
const WATER_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  "Tatlı Su": {
    bg: "bg-mera-status-info/20",
    text: "text-mera-status-info",
  },
  "Tuzlu Su": {
    bg: "bg-mera-status-warning/20",
    text: "text-mera-status-warning",
  },
  Akarsu: {
    bg: "bg-mera-status-success/20",
    text: "text-mera-status-success",
  },
};

const getWaterTypeStyles = (waterType: string) =>
  WATER_TYPE_STYLES[waterType] ?? {
    bg: "bg-mera-status-info/20",
    text: "text-mera-status-info",
  };

// ── Ana Ekran Bileşeni ────────────────────────────────────────────────────────
export default function SpotRecommendationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;
  const fishSpeciesQuery = useFishSpecies();
  const fishSpeciesItems =
    fishSpeciesQuery.data?.map((item) => item.name) ?? [];
  const {
    data: spotResults,
    lastRequest,
    isLoading,
    error,
    getRecommendation,
    retry,
  } = useSpotRecommendation();

  // ── AI Öneri Durumu ─────────────────────────────────────────────────────────
  const [selectedFish, setSelectedFish] = useState<string | null>(
    lastRequest?.targetFish ?? null,
  );
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<Coordinates | null>(lastRequest?.coordinates ?? null);
  const [pendingCoordinate, setPendingCoordinate] =
    useState<Coordinates | null>(null);

  // ── Harita Modalı için Seçili Mera ──────────────────────────────────────────
  const [selectedMera, setSelectedMera] = useState<RecommendedSpot | null>(
    null,
  );

  // ── Mera Keşfi (orijinal harita) expandable overlay ─────────────────────────
  const exploreOverlay = useExpandableOverlay();

  // ── Avlak Noktası seçimi için harita overlay ────────────────────────────────
  const locationOverlay = useExpandableOverlay();

  // ── Kart Haritası expandable overlay ────────────────────────────────────────
  const cardMapOverlay = useExpandableOverlay();

  useEffect(() => {
    if (!lastRequest) {
      return;
    }

    setSelectedFish((prev) => prev ?? lastRequest.targetFish);
    setSelectedCoordinate((prev) => prev ?? lastRequest.coordinates);
  }, [lastRequest]);

  // ── Akıllı Öneri Al butonuna basıldığında ───────────────────────────────────
  const handleGetSuggestions = useCallback(() => {
    if (!selectedFish || !selectedCoordinate) {
      return;
    }

    void getRecommendation({
      targetFish: selectedFish,
      coordinates: selectedCoordinate,
    });
  }, [getRecommendation, selectedCoordinate, selectedFish]);

  // ── Haritada Gör butonuna basıldığında ──────────────────────────────────────
  const handleShowOnMap = useCallback(
    (mera: RecommendedSpot) => {
      setSelectedMera(mera);
      cardMapOverlay.expand();
    },
    [cardMapOverlay],
  );

  // ── Kart Harita Modalını Kapat ──────────────────────────────────────────────
  const handleCloseCardMap = useCallback(() => {
    cardMapOverlay.collapse();
    // Animasyon bittikten sonra seçimi temizle
    setTimeout(() => setSelectedMera(null), 350);
  }, [cardMapOverlay]);

  const openLocationMap = useCallback(() => {
    setPendingCoordinate(selectedCoordinate);
    locationOverlay.expand();
  }, [locationOverlay, selectedCoordinate]);

  const handleCoordinateSelect = useCallback((coordinate: Coordinates) => {
    setPendingCoordinate({
      latitude: Number(coordinate.latitude.toFixed(6)),
      longitude: Number(coordinate.longitude.toFixed(6)),
    });
  }, []);

  const handleConfirmLocation = useCallback(() => {
    if (!pendingCoordinate) {
      return;
    }

    setSelectedCoordinate(pendingCoordinate);
    locationOverlay.collapse();
  }, [locationOverlay, pendingCoordinate]);

  const selectedCoordinateLabel = selectedCoordinate
    ? `Koordinat (${selectedCoordinate.latitude.toFixed(4)}, ${selectedCoordinate.longitude.toFixed(4)})`
    : "Konum seçin...";
  const lastRequestCoordinateLabel = lastRequest?.coordinates
    ? `Koordinat (${lastRequest.coordinates.latitude.toFixed(4)}, ${lastRequest.coordinates.longitude.toFixed(4)})`
    : null;
  const primaryButtonLabel = spotResults ? "Yeni Öneri Al" : "Akıllı Öneri Al";

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── AI Trigger Bölümü ──────────────────────────────────────────── */}
        <View className="mb-6">
          <SectionHeader
            icon={
              <MaterialIcons
                name="location-searching"
                size={24}
                color={accentColor}
              />
            }
            title="Mera Önerisi"
            subtitle="Hava, mevsim ve konum verilerinizi analiz ederek size en uygun avlak noktalarını önerir."
            className="mb-4"
          />

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

          <View className="mb-5">
            <Typography variant="body" className="mb-3 font-inter-semibold">
              Bölge
            </Typography>

            <View className="flex-row items-center">
              <View className="h-[48px] flex-1 justify-center rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                <View className="h-full justify-center">
                  <Typography
                    variant="body"
                    className={`${
                      selectedCoordinate
                        ? "text-mera-neutral-900 dark:text-white"
                        : "text-mera-neutral-500"
                    }`}
                    numberOfLines={1}
                  >
                    {selectedCoordinateLabel}
                  </Typography>
                </View>
              </View>

              <MapButton onPress={openLocationMap} iconColor={accentColor} />
            </View>
          </View>

          <Button
            title={isLoading ? "Analiz Ediliyor..." : primaryButtonLabel}
            onPress={handleGetSuggestions}
            disabled={isLoading || !selectedFish || !selectedCoordinate}
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

        {/* ── Loading Skeleton ────────────────────────────────────────────── */}
        {isLoading && (
          <View className="mb-6">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              >
                {/* İsim skeleton */}
                <SkeletonBlock className="mb-3 h-5 w-3/5 rounded-md" />
                {/* Açıklama skeleton */}
                <SkeletonBlock className="mb-2 h-3 w-full" />
                <SkeletonBlock className="mb-3 h-3 w-4/5" />
                {/* Alt satır skeleton */}
                <View className="flex-row items-center justify-between">
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-6 w-24 rounded-full" />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Mera Kartları ───────────────────────────────────────────────── */}
        {spotResults && !isLoading && (
          <View className="mb-6">
            <SectionHeader
              icon={
                <MaterialCommunityIcons
                  name="map-marker-multiple"
                  size={20}
                  color={accentColor}
                />
              }
              title="Önerilen Meralar"
              badge={`${spotResults.length} sonuç`}
              variant="subsection"
              className="mb-3"
            />

            <View className="mb-3 flex-row flex-wrap gap-1.5">
              {lastRequest?.targetFish && (
                <StatusBadge label={`🐟 ${lastRequest.targetFish}`} />
              )}
              {lastRequestCoordinateLabel && (
                <StatusBadge label={`📍 ${lastRequestCoordinateLabel}`} />
              )}
            </View>

            {spotResults.map((mera) => {
              const waterStyle = getWaterTypeStyles(mera.waterType);

              return (
                <View
                  key={mera.id}
                  className="mb-3 overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
                >
                  {/* Kart İçeriği */}
                  <View className="p-4">
                    {/* Başlık Satırı */}
                    <View className="mb-2 flex-row items-start justify-between">
                      <View className="mr-3 flex-1">
                        <Typography
                          variant="body"
                          className="font-inter-semibold"
                        >
                          {mera.name}
                        </Typography>
                      </View>
                    </View>

                    {/* Açıklama */}
                    <Typography variant="caption" className="mb-3 leading-5">
                      {mera.description}
                    </Typography>

                    {/* Alt Bilgi Satırı */}
                    <View className="flex-row items-center">
                      {/* Su Tipi Badge */}
                      <StatusBadge
                        label={mera.waterType}
                        bgClass={waterStyle.bg}
                        textClass={waterStyle.text}
                        noMarginLeft
                        noMarginBottom
                      />

                      {/* Derinlik Aralığı */}
                      <View className="ml-2 flex-row items-center">
                        <MaterialCommunityIcons
                          name="waves"
                          size={14}
                          color="#64748B"
                        />
                        <Typography variant="caption" className="ml-1 text-xs">
                          {mera.depthRange}
                        </Typography>
                      </View>

                      {/* Haritada Gör Butonu */}
                      <Pressable
                        className="ml-auto flex-row items-center rounded-lg bg-mera-primary/10 px-3 py-1.5 dark:bg-mera-accent/15"
                        onPress={() => handleShowOnMap(mera)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <MaterialIcons
                          name="map"
                          size={14}
                          color={accentColor}
                        />
                        <Typography
                          variant="caption"
                          className="ml-1 text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
                        >
                          Haritada Gör
                        </Typography>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
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
            <Typography
              variant="caption"
              className="mt-1 text-mera-status-error"
            >
              {error}
            </Typography>
            <View className="mt-3">
              <Button variant="secondary" title="Tekrar Dene" onPress={retry} />
            </View>
          </View>
        )}

        {/* ── Mera Keşfi Bölümü (Orijinal — aynen korunuyor) ─────────────── */}
        <View className="mb-2">
          <SectionHeader
            icon={
              <MaterialCommunityIcons
                name="magnify"
                size={24}
                color={accentColor}
              />
            }
            title="Mera Keşfi"
            subtitle="Bölgenizdeki en verimli balık tutma noktalarını harita üzerinden keşfedin ve yeni meralar bulun."
            className="mb-4"
          />

          <FishingSpotMapPreview onPress={exploreOverlay.expand} />
        </View>
      </ScrollView>

      {/* ── Mera Keşfi Tam Ekran Harita (Orijinal) ───────────────────────── */}
      <FishingSpotMapFullscreen
        visible={exploreOverlay.isExpanded}
        onClose={exploreOverlay.collapse}
        animatedOverlayStyle={exploreOverlay.animatedOverlayStyle}
        animatedMapStyle={exploreOverlay.animatedMapStyle}
        animatedBackButtonStyle={exploreOverlay.animatedBackButtonStyle}
      />

      {/* ── Avlak Noktası Seçimi Tam Ekran Harita ───────────────────────── */}
      <FishingSpotMapFullscreen
        visible={locationOverlay.isExpanded}
        onClose={locationOverlay.collapse}
        onConfirmSelection={handleConfirmLocation}
        animatedOverlayStyle={locationOverlay.animatedOverlayStyle}
        animatedMapStyle={locationOverlay.animatedMapStyle}
        animatedBackButtonStyle={locationOverlay.animatedBackButtonStyle}
        mode="coordinate"
        selectedCoordinate={pendingCoordinate}
        onCoordinateSelect={handleCoordinateSelect}
      />

      {/* ── Kart Harita Modalı (Seçili Mera Noktası) ─────────────────────── */}
      <FishingSpotMapFullscreen
        visible={cardMapOverlay.isExpanded}
        onClose={handleCloseCardMap}
        animatedOverlayStyle={cardMapOverlay.animatedOverlayStyle}
        animatedMapStyle={cardMapOverlay.animatedMapStyle}
        animatedBackButtonStyle={cardMapOverlay.animatedBackButtonStyle}
        mode="coordinate"
        selectedCoordinate={selectedMera?.coordinate ?? null}
        readOnlyCoordinate={true}
      />
    </ScreenContainer>
  );
}
