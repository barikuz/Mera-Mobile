/**
 * GearRecommendationScreen — Ekipman Tavsiyesi ekranı.
 *
 * Hedef balık türü, avlak noktası ve avlanma stili parametrelerine göre
 * AI destekli ekipman seti önerisi sunar. Tüm veri statik mock'tur;
 * yükleme durumu setTimeout ile simüle edilir.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ── Statik Mock Veri ──────────────────────────────────────────────────────────

/** Hedef balık türleri */
const FISH_SPECIES = ["Levrek", "Çipura", "Lüfer", "İstavrit", "Palamut"] as const;
type FishSpecies = (typeof FISH_SPECIES)[number];

/** Avlanma stilleri */
const FISHING_STYLES = ["Spin", "LRF", "Yemli", "Surf"] as const;
type FishingStyle = (typeof FISHING_STYLES)[number];

/** Mock mera listesi (dropdown için) */
interface MockMera {
  id: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
}

const MOCK_MERAS: MockMera[] = [
  {
    id: "m1",
    name: "Keban Barajı Çıkışı",
    coordinate: { latitude: 38.7936, longitude: 38.7289 },
  },
  {
    id: "m2",
    name: "Hazar Gölü Kuzey Kıyısı",
    coordinate: { latitude: 38.5095, longitude: 39.3826 },
  },
  {
    id: "m3",
    name: "Palu Çayı Kavşağı",
    coordinate: { latitude: 38.6912, longitude: 39.9312 },
  },
  {
    id: "m4",
    name: "Fırat Nehri Deltası",
    coordinate: { latitude: 38.4321, longitude: 38.9145 },
  },
  {
    id: "m5",
    name: "Sivrice Kıyıları",
    coordinate: { latitude: 38.4503, longitude: 39.3105 },
  },
];

/** Ekipman tipi ikonları ve etiketleri */
interface GearItem {
  type: "rod" | "reel" | "bait";
  label: string;
  icon: string;
  name: string;
  price: number;
  expertNote: string;
}

/**
 * Mock AI önerisi: Seçilen parametrelere göre ekipman seti döndürür.
 * Gerçek senaryoda burası API'den gelir.
 */
function getMockGearSet(
  fish: FishSpecies,
  _meraId: string,
  style: FishingStyle,
): GearItem[] {
  // Balık ve stil kombinasyonuna göre farklı mock veriler
  const gearMap: Record<string, GearItem[]> = {
    default: [
      {
        type: "rod",
        label: "Kamış",
        icon: "fishing",
        name: "Shimano Nasci AX 270MH",
        price: 3249,
        expertNote: `${fish} avında ${style} tekniği için 2.70m orta-ağır aksiyon kamış, atış mesafesi ve hassasiyet arasında ideal denge sağlar.`,
      },
      {
        type: "reel",
        label: "Makine",
        icon: "rotate-3d-variant",
        name: "Daiwa Fuego LT 3000-C",
        price: 4599,
        expertNote: `LT (Light & Tough) gövde yapısı gün boyu yorulmadan kullanım sağlar. 3000 numara, ${fish} için gereken ipek kapasitesi ve fren gücünü sunar.`,
      },
      {
        type: "bait",
        label: "Yem / Sahte Yem",
        icon: "hook",
        name: "DUO Tide Minnow 75 Sprint",
        price: 549,
        expertNote: `Sığ su ${style} uygulamalarında ${fish} için mükemmel. Gerçekçi yüzme aksiyonu ve doğal renk paleti hedef balığı tahrik eder.`,
      },
    ],
  };

  return gearMap.default;
}

// ── Yardımcı Bileşenler ───────────────────────────────────────────────────────

/** Shimmer / pulse animasyonlu skeleton blok */
function SkeletonBlock({ className }: { className: string }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`rounded-lg bg-mera-neutral-200 dark:bg-mera-neutral-500 ${className}`}
      style={{ opacity }}
    />
  );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function GearRecommendationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;

  // ── Form durumu ───────────────────────────────────────────────────────────
  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);
  const [selectedMera, setSelectedMera] = useState<MockMera | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<FishingStyle | null>(null);
  const [isMeraDropdownOpen, setIsMeraDropdownOpen] = useState(false);

  // ── Sonuç durumu ──────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [gearResults, setGearResults] = useState<GearItem[] | null>(null);

  // ── Harita Overlay ────────────────────────────────────────────────────────
  const mapOverlay = useExpandableOverlay();

  // ── Formu tamamlanmış mı kontrol et ───────────────────────────────────────
  const isFormComplete = useMemo(
    () => selectedFish !== null && selectedMera !== null && selectedStyle !== null,
    [selectedFish, selectedMera, selectedStyle],
  );

  // ── Kombinasyon Önerisi Al ────────────────────────────────────────────────
  const handleGetRecommendation = useCallback(() => {
    if (!isFormComplete || !selectedFish || !selectedMera || !selectedStyle) return;

    setIsLoading(true);
    setGearResults(null);

    setTimeout(() => {
      const results = getMockGearSet(selectedFish, selectedMera.id, selectedStyle);
      setGearResults(results);
      setIsLoading(false);
    }, 1800);
  }, [isFormComplete, selectedFish, selectedMera, selectedStyle]);

  // ── Sepete Ekle (Simülasyon) ──────────────────────────────────────────────
  const handleAddAllToCart = useCallback(() => {
    if (!gearResults) return;

    const totalPrice = gearResults.reduce((sum, item) => sum + item.price, 0);
    console.log("──────────────────────────────────────");
    console.log("🛒 Tüm set sepete eklendi!");
    gearResults.forEach((item) =>
      console.log(`   • ${item.label}: ${item.name} — ₺${item.price}`),
    );
    console.log(`   💰 Toplam: ₺${totalPrice}`);
    console.log("──────────────────────────────────────");
  }, [gearResults]);

  // ── Fiyat formatı ─────────────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);

  // ── Gear type icon renklerine göre badge ──────────────────────────────────
  const gearTypeBadge: Record<GearItem["type"], { bg: string; text: string }> = {
    rod: { bg: "bg-mera-status-info/20", text: "text-mera-status-info" },
    reel: { bg: "bg-mera-status-warning/20", text: "text-mera-status-warning" },
    bait: { bg: "bg-mera-status-success/20", text: "text-mera-status-success" },
  };

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Başlık ───────────────────────────────────────────────────────── */}
        <View className="mb-5">
          <View className="mb-1 flex-row items-center">
            <MaterialCommunityIcons name="hook" size={24} color={accentColor} />
            <Typography variant="h2" className="ml-2">
              Ekipman Tavsiyesi
            </Typography>
          </View>
          <Typography variant="caption">
            Hedef balığına, merana ve stile göre AI destekli ekipman seti önerisi al.
          </Typography>
        </View>

        {/* ── 1. Hedef Balık Türü (Chip Grubu) ─────────────────────────────── */}
        <View className="mb-5">
          <Typography variant="body" className="mb-2 font-inter-semibold">
            Hedef Balık Türü
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {FISH_SPECIES.map((fish) => {
              const isSelected = selectedFish === fish;
              return (
                <Pressable
                  key={fish}
                  onPress={() => setSelectedFish(isSelected ? null : fish)}
                  className={`rounded-full px-4 py-2.5 border ${
                    isSelected
                      ? "bg-mera-primary border-mera-primary dark:bg-mera-accent dark:border-mera-accent"
                      : "bg-mera-neutral-100 border-mera-neutral-200 dark:bg-mera-neutral-800 dark:border-mera-neutral-500"
                  }`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Typography
                    variant="caption"
                    className={`font-inter-semibold text-sm ${
                      isSelected
                        ? "text-mera-neutral-100 dark:text-mera-neutral-950"
                        : "text-mera-neutral-900 dark:text-white"
                    }`}
                  >
                    {fish}
                  </Typography>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── 2. Avlak Noktası (Dropdown + Harita Butonu) ──────────────────── */}
        <View className="mb-5">
          <Typography variant="body" className="mb-2 font-inter-semibold">
            Avlak Noktası (Mera)
          </Typography>

          <View className="flex-row items-stretch gap-2">
            {/* Dropdown Toggle */}
            <Pressable
              className="flex-1 flex-row items-center justify-between rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-4 py-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              onPress={() => setIsMeraDropdownOpen((prev) => !prev)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Typography
                variant="body"
                className={`flex-1 ${
                  selectedMera
                    ? "text-mera-neutral-900 dark:text-white"
                    : "text-mera-neutral-500"
                }`}
                numberOfLines={1}
              >
                {selectedMera ? selectedMera.name : "Mera seçin..."}
              </Typography>
              <MaterialIcons
                name={isMeraDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={22}
                color={isDark ? "#64748B" : "#64748B"}
              />
            </Pressable>

            {/* Haritada Seç Butonu */}
            <Pressable
              className="items-center justify-center rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-3.5 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
              onPress={mapOverlay.expand}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <MaterialIcons name="map" size={22} color={accentColor} />
            </Pressable>
          </View>

          {/* Dropdown Listesi */}
          {isMeraDropdownOpen && (
            <View className="mt-1.5 overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
              {MOCK_MERAS.map((mera, index) => {
                const isSelected = selectedMera?.id === mera.id;
                const isLast = index === MOCK_MERAS.length - 1;

                return (
                  <Pressable
                    key={mera.id}
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
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={18}
                      color={isSelected ? accentColor : (isDark ? "#64748B" : "#64748B")}
                    />
                    <Typography
                      variant="body"
                      className={`ml-2 flex-1 text-sm ${
                        isSelected
                          ? "font-inter-semibold text-mera-primary dark:text-mera-accent"
                          : ""
                      }`}
                      numberOfLines={1}
                    >
                      {mera.name}
                    </Typography>
                    {isSelected && (
                      <MaterialIcons name="check" size={18} color={accentColor} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── 3. Avlanma Stili (Chip Grubu) ────────────────────────────────── */}
        <View className="mb-6">
          <Typography variant="body" className="mb-2 font-inter-semibold">
            Avlanma Stili
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {FISHING_STYLES.map((style) => {
              const isSelected = selectedStyle === style;
              return (
                <Pressable
                  key={style}
                  onPress={() => setSelectedStyle(isSelected ? null : style)}
                  className={`rounded-full px-4 py-2.5 border ${
                    isSelected
                      ? "bg-mera-primary border-mera-primary dark:bg-mera-accent dark:border-mera-accent"
                      : "bg-mera-neutral-100 border-mera-neutral-200 dark:bg-mera-neutral-800 dark:border-mera-neutral-500"
                  }`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Typography
                    variant="caption"
                    className={`font-inter-semibold text-sm ${
                      isSelected
                        ? "text-mera-neutral-100 dark:text-mera-neutral-950"
                        : "text-mera-neutral-900 dark:text-white"
                    }`}
                  >
                    {style}
                  </Typography>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Ana Aksiyon Butonu ────────────────────────────────────────────── */}
        <View className="mb-6">
          <Button
            title={isLoading ? "Analiz Ediliyor..." : "Kombinasyon Önerisi Al"}
            onPress={handleGetRecommendation}
            disabled={!isFormComplete || isLoading}
            icon={
              <MaterialIcons
                name={isLoading ? "hourglass-top" : "auto-awesome"}
                size={20}
                color={isDark ? "#0F162A" : "#F8FAFC"}
              />
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
                  {/* Image placeholder skeleton */}
                  <SkeletonBlock className="mr-3 h-20 w-20 rounded-xl" />
                  <View className="flex-1">
                    {/* Type badge skeleton */}
                    <SkeletonBlock className="mb-2 h-5 w-16 rounded-full" />
                    {/* Name skeleton */}
                    <SkeletonBlock className="mb-2 h-4 w-4/5 rounded" />
                    {/* Price skeleton */}
                    <SkeletonBlock className="h-5 w-20 rounded" />
                  </View>
                </View>
                {/* Expert note skeleton */}
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
            <View className="mb-3 flex-row items-center">
              <MaterialIcons
                name="auto-awesome"
                size={20}
                color={accentColor}
              />
              <Typography variant="body" className="ml-1.5 font-inter-semibold">
                Önerilen Ekipman Seti
              </Typography>
              <View className="ml-2 rounded-full bg-mera-primary/10 px-2 py-0.5 dark:bg-mera-accent/15">
                <Typography
                  variant="caption"
                  className="text-xs text-mera-primary dark:text-mera-accent"
                >
                  {gearResults.length} parça
                </Typography>
              </View>
            </View>

            {/* Seçili parametreler özeti */}
            <View className="mb-3 flex-row flex-wrap gap-1.5">
              {selectedFish && (
                <View className="rounded-full bg-mera-primary/10 px-2.5 py-1 dark:bg-mera-accent/15">
                  <Typography
                    variant="caption"
                    className="text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
                  >
                    🐟 {selectedFish}
                  </Typography>
                </View>
              )}
              {selectedMera && (
                <View className="rounded-full bg-mera-primary/10 px-2.5 py-1 dark:bg-mera-accent/15">
                  <Typography
                    variant="caption"
                    className="text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
                    numberOfLines={1}
                  >
                    📍 {selectedMera.name}
                  </Typography>
                </View>
              )}
              {selectedStyle && (
                <View className="rounded-full bg-mera-primary/10 px-2.5 py-1 dark:bg-mera-accent/15">
                  <Typography
                    variant="caption"
                    className="text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
                  >
                    🎣 {selectedStyle}
                  </Typography>
                </View>
              )}
            </View>

            {/* Ekipman Kartları */}
            {gearResults.map((item) => {
              const badge = gearTypeBadge[item.type];

              return (
                <View
                  key={item.type}
                  className="mb-3 overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
                >
                  <View className="p-4">
                    {/* Üst satır: Görsel placeholder + Bilgi */}
                    <View className="flex-row">
                      {/* Ürün görseli placeholder */}
                      <View className="mr-3 h-20 w-20 items-center justify-center rounded-xl bg-mera-neutral-200 dark:bg-mera-neutral-950">
                        <MaterialCommunityIcons
                          name={item.icon as any}
                          size={32}
                          color={accentColor}
                        />
                      </View>

                      {/* Ürün bilgileri */}
                      <View className="flex-1 justify-center">
                        {/* Tip rozeti */}
                        <View className="mb-1 flex-row">
                          <View className={`rounded-full px-2 py-0.5 ${badge.bg}`}>
                            <Typography
                              variant="caption"
                              className={`text-xs font-inter-semibold ${badge.text}`}
                            >
                              {item.label}
                            </Typography>
                          </View>
                        </View>

                        {/* Ürün adı */}
                        <Typography
                          variant="body"
                          className="font-inter-semibold text-sm"
                          numberOfLines={2}
                        >
                          {item.name}
                        </Typography>

                        {/* Fiyat */}
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
      </ScrollView>

      {/* ── Tam Ekran Harita Modalı ────────────────────────────────────────── */}
      <FishingSpotMapFullscreen
        visible={mapOverlay.isExpanded}
        onClose={mapOverlay.collapse}
        animatedOverlayStyle={mapOverlay.animatedOverlayStyle}
        animatedMapStyle={mapOverlay.animatedMapStyle}
        animatedBackButtonStyle={mapOverlay.animatedBackButtonStyle}
        mode="coordinate"
        selectedCoordinate={selectedMera?.coordinate ?? null}
        readOnlyCoordinate={true}
      />
    </ScreenContainer>
  );
}
