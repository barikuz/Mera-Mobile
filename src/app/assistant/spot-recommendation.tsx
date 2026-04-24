import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import Button from "@/components/ui/Button";
import ChipGroup from "@/components/ui/ChipGroup";
import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import FishingSpotMapPreview from "@/components/ui/FishingSpotMapPreview";
import ScreenContainer from "@/components/ui/ScreenContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import SkeletonBlock from "@/components/ui/SkeletonBlock";
import StatusBadge from "@/components/ui/StatusBadge";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Statik Mock Veri ──────────────────────────────────────────────────────────
interface MeraSuggestion {
  id: string;
  name: string;
  description: string;
  waterType: "Tatlı Su" | "Tuzlu Su" | "Akarsu";
  depthRange: string;
  coordinate: { latitude: number; longitude: number };
}

const FISH_SPECIES = [
  "Levrek",
  "Çipura",
  "Lüfer",
  "İstavrit",
  "Palamut",
] as const;

type FishSpecies = (typeof FISH_SPECIES)[number];

const MOCK_SUGGESTIONS: MeraSuggestion[] = [
  {
    id: "1",
    name: "Keban Barajı Çıkışı",
    description:
      "Baraj çıkışındaki akıntı bölgesi, özellikle sabah saatlerinde yoğun sazan ve şabut aktivitesi gözlemlenir.",
    waterType: "Tatlı Su",
    depthRange: "2m – 15m",
    coordinate: { latitude: 38.7936, longitude: 38.7289 },
  },
  {
    id: "2",
    name: "Hazar Gölü Kuzey Kıyısı",
    description:
      "Rüzgar korunaklı kuzey kıyısı, durgun su koşullarında levrek avı için idealdir.",
    waterType: "Tatlı Su",
    depthRange: "5m – 30m",
    coordinate: { latitude: 38.5095, longitude: 39.3826 },
  },
  {
    id: "3",
    name: "Palu Çayı Kavşağı",
    description:
      "Murat Nehri ile Palu Çayı'nın birleştiği nokta; akarsuda alabalık ve capoeta avına uygundur.",
    waterType: "Akarsu",
    depthRange: "1m – 4m",
    coordinate: { latitude: 38.6912, longitude: 39.9312 },
  },
];

// ── Su Tipi Rozeti Renkleri ───────────────────────────────────────────────────
const WATER_TYPE_STYLES: Record<
  MeraSuggestion["waterType"],
  { bg: string; text: string }
> = {
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

// ── Ana Ekran Bileşeni ────────────────────────────────────────────────────────
export default function SpotRecommendationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;

  // ── AI Öneri Durumu ─────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);

  // ── Harita Modalı için Seçili Mera ──────────────────────────────────────────
  const [selectedMera, setSelectedMera] = useState<MeraSuggestion | null>(null);

  // ── Mera Keşfi (orijinal harita) expandable overlay ─────────────────────────
  const exploreOverlay = useExpandableOverlay();

  // ── Kart Haritası expandable overlay ────────────────────────────────────────
  const cardMapOverlay = useExpandableOverlay();

  // ── Akıllı Öneri Al butonuna basıldığında ───────────────────────────────────
  const handleGetSuggestions = useCallback(() => {
    setIsLoading(true);
    setShowResults(false);

    // Simüle loading — 1.5 saniye sonra sonuçları göster
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  }, []);

  // ── Haritada Gör butonuna basıldığında ──────────────────────────────────────
  const handleShowOnMap = useCallback(
    (mera: MeraSuggestion) => {
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
              items={FISH_SPECIES}
              selectedItem={selectedFish}
              onSelect={setSelectedFish}
            />
          </View>

          <Button
            title={isLoading ? "Analiz Ediliyor..." : "Akıllı Öneri Al"}
            onPress={handleGetSuggestions}
            disabled={isLoading || !selectedFish}
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
        {showResults && !isLoading && (
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
              badge={`${MOCK_SUGGESTIONS.length} sonuç`}
              variant="subsection"
              className="mb-3"
            />

            {MOCK_SUGGESTIONS.map((mera) => {
              const waterStyle = WATER_TYPE_STYLES[mera.waterType];

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
