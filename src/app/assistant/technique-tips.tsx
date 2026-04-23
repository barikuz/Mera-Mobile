import React, { useCallback, useMemo, useState } from "react";
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
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DropdownMenu from "../../components/ui/DropdownMenu";

const FISH_SPECIES = [
  "Levrek",
  "Çipura",
  "Lüfer",
  "İstavrit",
  "Palamut",
] as const;

type FishSpecies = (typeof FISH_SPECIES)[number];

interface MockMera {
  id: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
}

interface TechniqueSection {
  headline: string;
  bullets: string[];
}

interface TechniqueGuide {
  bestTime?: TechniqueSection;
  rodAction?: TechniqueSection;
  knotRig?: TechniqueSection;
  expertTip?: string;
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

const DEFAULT_TECHNIQUES: Record<FishSpecies, TechniqueGuide> = {
  Levrek: {
    bestTime: {
      headline: "Şafak ve gün batımı arası rüzgar kırığı kıyılar",
      bullets: [
        "İlk ışıkta 30-45 dakikalık agresif tarama yap.",
        "Bulutlu havada öğlen penceresi de aktifleşebilir.",
      ],
    },
    rodAction: {
      headline: "Orta hız + kısa stop-go ritmi",
      bullets: [
        "4-5 sarım sonra 1 saniye durdur.",
        "Her üçüncü döngüde tek sert bilek jerk'i ekle.",
      ],
    },
    knotRig: {
      headline: "Rapala düğümü + 0.18-0.22 mm lider",
      bullets: [
        "Sahteye serbest hareket alanı vererek aksiyonu artırır.",
        "Kıyı yapısı taşlıysa lideri 0.24 mm'ye çıkar.",
      ],
    },
    expertTip:
      "Suyu okumadan yem değiştirme: önce aynı aksiyonu farklı derinlikte 3 açıdan dene.",
  },
  Çipura: {
    bestTime: {
      headline: "Sabahın ilk saatleri ve durgun akşamüstü",
      bullets: [
        "Basınç hızlı düşüyorsa dipte daha uzun beklet.",
        "Akıntı zayıfken yemli takımı daha ince sun.",
      ],
    },
    rodAction: {
      headline: "Yavaş dip süpürme + mikro kaldır bırak",
      bullets: [
        "2 tur sar, 2 saniye beklet döngüsünü koru.",
        "Vuruş yoksa aynı hattı 15-20 cm daha derinden tara.",
      ],
    },
    knotRig: {
      headline: "Palomar düğümü + 0.16-0.20 mm fluorocarbon",
      bullets: [
        "Düğüm sonrası mutlaka ıslatarak sıkıştır.",
        "Dipte midye varsa sürtünmeye karşı kısa kalın uç ekle.",
      ],
    },
    expertTip:
      "Yemin doğal düşüşü bozuluyorsa kurşun değil beden boyu ayarıyla denge kur.",
  },
  Lüfer: {
    bestTime: {
      headline: "Akşam alacası ve geceye geçiş hattı",
      bullets: [
        "Rüzgar kıyıya vuruyorsa üst suyu 10 dakika dene.",
        "Sürü takibi için aynı rotayı en az 3 tur tekrarla.",
      ],
    },
    rodAction: {
      headline: "Hızlı çekiş + çift kısa jerk",
      bullets: [
        "6-7 hızlı sarım sonrası çift bilek darbesi ekle.",
        "Yemin kaçış hissini artırmak için stop süresini kısa tut.",
      ],
    },
    knotRig: {
      headline: "FG düğüm + 0.24-0.28 mm lider",
      bullets: [
        "Diş kesimine karşı lider uzunluğunu 70-90 cm tut.",
        "Metal bağlantıda küçük ama güçlü klips kullan.",
      ],
    },
    expertTip:
      "Sürüyü bulduğunda noktayı değil hattı takip et; vuruşlar çoğunlukla geçiş koridorunda gelir.",
  },
  İstavrit: {
    bestTime: {
      headline: "Sabah erken ve ışık azalmaya başladığında",
      bullets: [
        "Liman ağzında akıntı kırılımını tarayarak başla.",
        "Sürü yükselirse daha hafif jig'e geç.",
      ],
    },
    rodAction: {
      headline: "Ritimli mikro twitch + kısa düşüş",
      bullets: [
        "3 küçük twitch sonrası kontrollü salış yap.",
        "Vuruşlar düşüşte geliyorsa sarım hızını azalt.",
      ],
    },
    knotRig: {
      headline: "Palomar + 0.12-0.14 mm beden",
      bullets: [
        "İğne boyunu sürü iriliğine göre küçült.",
        "Köstek aralığını çok sık tutma, dolaşmayı azalt.",
      ],
    },
    expertTip:
      "Sürüde acele etme: ilk iki balığı aldıktan sonra ritmi korumak toplam verimi artırır.",
  },
  Palamut: {
    bestTime: {
      headline: "Akıntının hızlandığı sabah ve akşam geçişleri",
      bullets: [
        "Kıyıdan uzağa atışta yüzey köpük hatlarını hedefle.",
        "Aktivite düştüğünde aynı hattı daha derinden geç.",
      ],
    },
    rodAction: {
      headline: "Hızlı lineer çekiş + ani hız değişimi",
      bullets: [
        "10 sarımda bir yarım tur hız patlaması uygula.",
        "Vuruş kaçarsa hemen aynı açıdan yeniden gönder.",
      ],
    },
    knotRig: {
      headline: "Uni to Uni + 0.26-0.30 mm lider",
      bullets: [
        "Uzun atışta sürtünme için düğümün kompakt kalmasına dikkat et.",
        "Kurşun arkası kullanımda klipsi hafif seç.",
      ],
    },
    expertTip:
      "Sürüye denk geldiğinde yem değiştirmek yerine hız paterni değiştir; zaman kaybını minimize et.",
  },
};

const TECHNIQUE_OVERRIDES: Record<string, TechniqueGuide> = {
  "Levrek:m2": {
    bestTime: {
      headline: "Bulutlu günlerde öğlen bandı da aktif",
      bullets: [
        "Kuzey kıyısında rüzgar kırığı ceplerini önceliklendir.",
        "Su berraksa daha doğal renk paleti kullan.",
      ],
    },
    rodAction: {
      headline: "Yavaş-orta hız + uzatılmış duraklama",
      bullets: [
        "4 sarım sonrası 2 saniye stop uygula.",
        "Dipten yükseltirken tek sert jerk ile tepki al.",
      ],
    },
    expertTip:
      "Aynı noktada ısrar etme; 15 metrelik dilimler halinde kıyıyı sistemli taramak daha verimlidir.",
  },
  "Palamut:m4": {
    bestTime: {
      headline: "Akıntı çıkışında köpük hatları",
      bullets: [
        "Geçiş saatlerinde uzun atış avantaj sağlar.",
        "Rüzgar karşıdan geliyorsa daha kompakt yem seç.",
      ],
    },
    knotRig: {
      headline: "FG düğüm + 0.30 mm lider",
      bullets: [
        "Sık düğüm kontrolü kopma riskini azaltır.",
        "Sürtünme izinde lideri 10-15 cm kısalt.",
      ],
    },
    expertTip:
      "Yemi suya düşürür düşürmez hızlanma yerine 1 saniye sayıp ilk ivmeyi öyle ver.",
  },
};

function getTechniqueGuide(fish: FishSpecies, meraId: string): TechniqueGuide {
  const override = TECHNIQUE_OVERRIDES[`${fish}:${meraId}`];
  if (override) {
    return override;
  }
  return DEFAULT_TECHNIQUES[fish];
}

function hasSectionData(section?: TechniqueSection): boolean {
  if (!section) return false;
  const headline = section.headline.trim().length > 0;
  const bullets = section.bullets.some((item) => item.trim().length > 0);
  return headline || bullets;
}

export default function TechniqueTipsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const accentColor = isDark ? COLORS.dark.iconActive : COLORS.light.iconActive;

  const [selectedFish, setSelectedFish] = useState<FishSpecies | null>(null);
  const [selectedMera, setSelectedMera] = useState<MockMera | null>(null);
  const [pendingCoordinate, setPendingCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isMeraDropdownOpen, setIsMeraDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<TechniqueGuide | null>(null);

  const mapOverlay = useExpandableOverlay();

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

    setGuide(null);
    setIsLoading(true);

    setTimeout(() => {
      setGuide(getTechniqueGuide(selectedFish, selectedMera.id));
      setIsLoading(false);
    }, 1600);
  }, [selectedFish, selectedMera]);

  const hasBestTime = hasSectionData(guide?.bestTime);
  const hasRodAction = hasSectionData(guide?.rodAction);
  const hasKnotRig = hasSectionData(guide?.knotRig);
  const hasExpertTip = Boolean(guide?.expertTip?.trim());

  const renderedCardCount = [
    hasBestTime,
    hasRodAction,
    hasKnotRig,
    hasExpertTip,
  ].filter(Boolean).length;

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
            items={FISH_SPECIES}
            selectedItem={selectedFish}
            onSelect={setSelectedFish}
          />
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
              {[null, ...MOCK_MERAS].map((mera, index) => {
                const isSelected = mera
                  ? selectedMera?.id === mera.id
                  : !selectedMera;
                const isLast = index === MOCK_MERAS.length;

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
        </View>

        <View className="mb-6">
          <Button
            title={isLoading ? "Rehber Hazırlanıyor..." : "Taktikleri Gör"}
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

        {guide && !isLoading && (
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
              {selectedFish && <StatusBadge label={`🐟 ${selectedFish}`} />}
              {selectedMera && (
                <StatusBadge label={`📍 ${selectedMera.name}`} />
              )}
            </View>

            {hasBestTime && guide.bestTime && (
              <View className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                <View className="mb-2 flex-row items-center">
                  <MaterialIcons
                    name="schedule"
                    size={20}
                    color={accentColor}
                  />
                  <Typography
                    variant="body"
                    className="ml-2 font-inter-semibold"
                  >
                    En Verimli Zaman
                  </Typography>
                </View>

                <Typography
                  variant="caption"
                  className="mb-3 text-sm font-inter-semibold text-mera-primary dark:text-mera-accent"
                >
                  {guide.bestTime.headline}
                </Typography>

                <View>
                  {guide.bestTime.bullets.map((bullet, index) => (
                    <View
                      key={`${bullet}-${index}`}
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
                        {bullet}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasRodAction && guide.rodAction && (
              <View className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                <View className="mb-2 flex-row items-center">
                  <MaterialCommunityIcons
                    name="waves"
                    size={20}
                    color={accentColor}
                  />
                  <Typography
                    variant="body"
                    className="ml-2 font-inter-semibold"
                  >
                    Olta Aksiyonu
                  </Typography>
                </View>

                <Typography
                  variant="caption"
                  className="mb-3 text-sm font-inter-semibold text-mera-primary dark:text-mera-accent"
                >
                  {guide.rodAction.headline}
                </Typography>

                <View>
                  {guide.rodAction.bullets.map((bullet, index) => (
                    <View
                      key={`${bullet}-${index}`}
                      className="mb-2 flex-row items-start"
                    >
                      <MaterialIcons
                        name="play-arrow"
                        size={14}
                        color={accentColor}
                        style={{ marginTop: 2 }}
                      />
                      <Typography
                        variant="caption"
                        className="ml-2 flex-1 leading-5"
                      >
                        {bullet}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasKnotRig && guide.knotRig && (
              <View className="mb-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                <View className="mb-2 flex-row items-center">
                  <MaterialCommunityIcons
                    name="hook"
                    size={20}
                    color={accentColor}
                  />
                  <Typography
                    variant="body"
                    className="ml-2 font-inter-semibold"
                  >
                    İdeal Düğüm ve Takım
                  </Typography>
                </View>

                <Typography
                  variant="caption"
                  className="mb-3 text-sm font-inter-semibold text-mera-primary dark:text-mera-accent"
                >
                  {guide.knotRig.headline}
                </Typography>

                <View>
                  {guide.knotRig.bullets.map((bullet, index) => (
                    <View
                      key={`${bullet}-${index}`}
                      className="mb-2 flex-row items-start"
                    >
                      <MaterialIcons
                        name="radio-button-checked"
                        size={14}
                        color={accentColor}
                        style={{ marginTop: 2 }}
                      />
                      <Typography
                        variant="caption"
                        className="ml-2 flex-1 leading-5"
                      >
                        {bullet}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {hasExpertTip && guide.expertTip && (
              <View className="mb-3 rounded-xl border border-mera-primary/20 bg-mera-primary/5 p-4 dark:border-mera-accent/25 dark:bg-mera-accent/10">
                <View className="mb-2 flex-row items-center">
                  <MaterialIcons
                    name="emoji-objects"
                    size={20}
                    color={accentColor}
                  />
                  <Typography
                    variant="body"
                    className="ml-2 font-inter-semibold text-mera-primary dark:text-mera-accent"
                  >
                    Uzman İpucu
                  </Typography>
                </View>

                <Typography variant="body" className="leading-6">
                  {guide.expertTip}
                </Typography>
              </View>
            )}

            {renderedCardCount === 0 && (
              <Typography variant="caption" className="text-sm leading-5">
                Bu kombinasyon için gösterilebilir taktik bulunamadı. Farklı
                balık veya mera seçerek tekrar deneyin.
              </Typography>
            )}
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
