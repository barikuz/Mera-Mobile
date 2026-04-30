import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFishSpecies } from "@/hooks/useCatalog";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useFishingSpots } from "@/hooks/useFishingSpots";
import { useTechnicalTips } from "@/hooks/useTechnicalTips";
import { SelectedSpot, TechniqueTip } from "@/store/useAssistantStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DropdownMenu from "../../components/ui/DropdownMenu";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\u0131/g, "i")
    .replace(/\u015f/g, "s")
    .replace(/\u011f/g, "g")
    .replace(/\u00e7/g, "c")
    .replace(/\u00f6/g, "o")
    .replace(/\u00fc/g, "u");

const renderTipIcon = (title: string, color: string) => {
  const normalized = normalizeText(title);

  if (normalized.includes("zaman")) {
    return <MaterialIcons name="schedule" size={20} color={color} />;
  }

  if (normalized.includes("aksiyon") || normalized.includes("olta")) {
    return <MaterialCommunityIcons name="waves" size={20} color={color} />;
  }

  if (normalized.includes("dugum") || normalized.includes("takim")) {
    return <MaterialCommunityIcons name="hook" size={20} color={color} />;
  }

  if (normalized.includes("uzman")) {
    return <MaterialIcons name="emoji-objects" size={20} color={color} />;
  }

  return <MaterialIcons name="auto-awesome" size={20} color={color} />;
};

export default function TechniqueTipsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;
  const fishSpeciesQuery = useFishSpecies();
  const fishingSpotsQuery = useFishingSpots();
  const fishSpeciesItems =
    fishSpeciesQuery.data?.map((item) => item.name) ?? [];
  const {
    data: tips,
    lastRequest,
    isLoading,
    error,
    getTips,
    retry,
  } = useTechnicalTips();
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
  const [isMeraDropdownOpen, setIsMeraDropdownOpen] = useState(false);

  const mapOverlay = useExpandableOverlay();

  useEffect(() => {
    if (!lastRequest) {
      return;
    }

    setSelectedFish((prev) => prev ?? lastRequest.targetFish);
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

  const isFormComplete = useMemo(
    () => selectedFish !== null && selectedMera !== null,
    [selectedFish, selectedMera],
  );

  const handleGenerateGuide = useCallback(() => {
    if (!selectedFish || !selectedMera) return;

    void getTips({
      targetFish: selectedFish,
      coordinates: selectedMera.coordinate,
      selectedSpot: selectedMera,
    });
  }, [getTips, selectedFish, selectedMera]);

  const renderedCardCount = tips?.length ?? 0;

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          icon={
            <MaterialIcons
              name="tips-and-updates"
              size={24}
              color={accentColor}
            />
          }
          title="Teknik İpuçları"
          subtitle="Hedef balık ve mera seçimine göre AI destekli taktik rehberini saniyeler içinde oluştur."
          className="mb-5"
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

        <View className="mb-6">
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
                    } ${
                      !isLast
                        ? "border-b border-mera-neutral-200 dark:border-mera-neutral-500"
                        : ""
                    }`}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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

        <View className="mb-6">
          <Button
            title={
              isLoading
                ? "Rehber Hazırlanıyor..."
                : tips
                  ? "Yeni Taktikleri Gör"
                  : "Taktikleri Gör"
            }
            onPress={handleGenerateGuide}
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

        {isLoading && (
          <View className="mb-6">
            {[1, 2, 3].map((index) => (
              <View
                key={index}
                className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              >
                <View className="mb-3 flex-row items-center">
                  <SkeletonBlock className="mr-2.5 h-9 w-9 rounded-full" />
                  <SkeletonBlock className="h-5 w-3/5 rounded-md" />
                </View>
                <SkeletonBlock className="mb-2 h-3 w-full rounded" />
                <SkeletonBlock className="mb-2 h-3 w-4/5 rounded" />
                <SkeletonBlock className="mb-3 h-3 w-3/5 rounded" />
                <View className="gap-2">
                  <SkeletonBlock className="h-3 w-full rounded" />
                  <SkeletonBlock className="h-3 w-5/6 rounded" />
                </View>
              </View>
            ))}
          </View>
        )}

        {tips && !isLoading && (
          <View className="pb-2">
            <SectionHeader
              icon={
                <MaterialCommunityIcons
                  name="target"
                  size={20}
                  color={accentColor}
                />
              }
              title="Av Taktikleri"
              badge={`${renderedCardCount} tavsiye`}
              variant="subsection"
              className="mb-3"
            />

            <View className="mb-3 flex-row flex-wrap gap-1.5">
              {lastRequest?.targetFish && (
                <StatusBadge label={`🐟 ${lastRequest.targetFish}`} />
              )}
              {lastRequest?.selectedSpot && (
                <StatusBadge label={`📍 ${lastRequest.selectedSpot.name}`} />
              )}
            </View>

            {tips.map((tip: TechniqueTip, index: number) => (
              <View
                key={`${tip.title}-${index}`}
                className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              >
                <View className="mb-2 flex-row items-center">
                  {renderTipIcon(tip.title, accentColor)}
                  <Typography
                    variant="body"
                    className="ml-2 font-inter-semibold"
                  >
                    {tip.title}
                  </Typography>
                </View>

                {tip.subtitle ? (
                  <Typography
                    variant="caption"
                    className="mb-3 text-sm font-inter-semibold text-mera-primary dark:text-mera-accent"
                  >
                    {tip.subtitle}
                  </Typography>
                ) : null}

                {tip.items.length > 0 && (
                  <View>
                    {tip.items.map((item, itemIndex) => (
                      <View
                        key={`${item}-${itemIndex}`}
                        className="mb-2 flex-row items-start"
                      >
                        <MaterialIcons
                          name="check-circle"
                          size={14}
                          color={accentColor}
                          style={{ marginTop: 2 }}
                        />
                        <Typography
                          variant="caption"
                          className="ml-2 flex-1 leading-5"
                        >
                          {item}
                        </Typography>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {renderedCardCount === 0 && (
              <Typography variant="caption" className="text-sm leading-5">
                Bu kombinasyon için gösterilebilir taktik bulunamadı. Farklı
                balık veya mera seçerek tekrar deneyin.
              </Typography>
            )}
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
      </ScrollView>

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
