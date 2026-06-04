import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import FishingSpotMapPreview from "@/components/ui/FishingSpotMapPreview";
import Loader from "@/components/ui/Loader";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { CatchItem, formatCatchDate, useCatches } from "@/hooks/useCatches";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "../../lib/supabase";

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme === "dark" ? "dark" : "light";
  const router = useRouter();
  const { user, session, isInitialized } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedCatchCoordinate, setSelectedCatchCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    isExpanded,
    expand,
    collapse,
    animatedOverlayStyle,
    animatedMapStyle,
    animatedBackButtonStyle,
  } = useExpandableOverlay();

  const {
    data: catches = [],
    isLoading: isLoadingCatches,
    isError: hasCatchesError,
    error: catchesError,
    refetch: refetchCatches,
  } = useCatches();

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingProfile(false);
      setFetchError("Kullanıcı oturumu bulunamadı.");
      return;
    }

    try {
      setIsLoadingProfile(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        setFetchError("Profil bilgileri yüklenirken bir hata oluştu.");
        return;
      }

      setProfile(data);
    } catch {
      setFetchError("Beklenmeyen bir hata oluştu.");
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user?.id]);

  // Profil verilerini Supabase'den çek
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();

      if (isInitialized && user?.id && session?.access_token) {
        refetchCatches();
      }
    }, [
      fetchProfile,
      isInitialized,
      refetchCatches,
      session?.access_token,
      user?.id,
    ]),
  );

  // Çıkış yap
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
        return;
      }

      console.log("Kullanıcı başarıyla çıkış yaptı.");
      router.replace("/");
    } catch {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const openCatchLocationMap = (latitude: number, longitude: number) => {
    setSelectedCatchCoordinate({ latitude, longitude });
    expand();
  };

  const closeCatchLocationMap = () => {
    collapse();
  };

  // Profil yüklenirken Loader göster
  if (isLoadingProfile) {
    return (
      <ScreenContainer>
        <Loader />
      </ScreenContainer>
    );
  }

  // Hata durumunda hata mesajı göster
  if (fetchError) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Typography variant="body" className="text-center text-red-500">
            {fetchError}
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  const placeholderIconColor = COLORS[themeMode].iconInactive;

  const totalCatchCount = catches.length;
  const speciesCountMap = catches.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.species] = (acc[item.species] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const speciesStats = Object.entries(speciesCountMap)
    .map(([species, count]) => ({
      species,
      count,
      percentage: totalCatchCount > 0 ? (count / totalCatchCount) * 100 : 0,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.species.localeCompare(b.species, "tr");
    });

  const mostCaughtSpecies = speciesStats[0]?.species ?? "-";
  const isCatchListEmpty =
    !isLoadingCatches && !hasCatchesError && totalCatchCount === 0;

  const renderCatchItem = ({ item }: { item: CatchItem }) => {
    const hasLocation =
      item.location_lat !== null && item.location_lng !== null;
    const selectedCoordinate = hasLocation
      ? { latitude: item.location_lat!, longitude: item.location_lng! }
      : null;

    return (
      <View className="mb-3 rounded-2xl border border-mera-neutral-200 bg-white p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
        <View className="flex-row items-stretch">
          <View className="flex-1 pr-3">
            <Typography
              variant="h2"
              className="mb-1 text-lg"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.species}
            </Typography>

            <Typography
              variant="caption"
              className="mb-3 text-mera-neutral-500"
            >
              {formatCatchDate(item.created_at)}
            </Typography>

            <View className="flex-row flex-wrap gap-2">
              {item.weight_kg !== null ? (
                <View className="rounded-full bg-mera-neutral-200 px-3 py-1 dark:bg-mera-neutral-900">
                  <Typography variant="caption" className="font-inter-semibold">
                    {`${item.weight_kg.toLocaleString("tr-TR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })} kg`}
                  </Typography>
                </View>
              ) : null}

              {item.length_cm !== null ? (
                <View className="rounded-full bg-mera-neutral-200 px-3 py-1 dark:bg-mera-neutral-900">
                  <Typography variant="caption" className="font-inter-semibold">
                    {`${item.length_cm.toLocaleString("tr-TR", {
                      maximumFractionDigits: 0,
                    })} cm`}
                  </Typography>
                </View>
              ) : null}
            </View>

            {!hasLocation ? (
              <Typography
                variant="caption"
                className="mt-3 text-mera-neutral-500"
              >
                Konum bilgisi yok
              </Typography>
            ) : null}
          </View>

          <View className="w-[42%]">
            {selectedCoordinate ? (
              <FishingSpotMapPreview
                onPress={() =>
                  openCatchLocationMap(
                    selectedCoordinate.latitude,
                    selectedCoordinate.longitude,
                  )
                }
                selectedCoordinate={selectedCoordinate}
                containerClassName="h-36 rounded-xl overflow-hidden"
                showsUserLocation={false}
              />
            ) : (
              <View className="h-36 items-center justify-center rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-900">
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={COLORS[themeMode].iconInactive}
                />
                <Typography
                  variant="caption"
                  className="mt-1 text-center text-mera-neutral-500"
                >
                  Konum Yok
                </Typography>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View className="pt-8">
        <View className="items-center">
          <View className="mb-6">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="h-28 w-28 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-28 w-28 items-center justify-center rounded-full bg-mera-neutral-200 dark:bg-mera-neutral-800">
                <Ionicons
                  name="person"
                  size={56}
                  color={placeholderIconColor}
                />
              </View>
            )}
          </View>

          <Typography variant="h2" className="mb-2 text-center">
            {profile?.display_name || "İsimsiz Kullanıcı"}
          </Typography>

          <Typography variant="caption" className="text-center">
            {profile?.email || user?.email || "E-posta bulunamadı"}
          </Typography>
        </View>

        {/* Siparişlerim butonu */}
        <TouchableOpacity
          onPress={() => router.push("/orders")}
          activeOpacity={0.7}
          className="mt-6 flex-row items-center rounded-2xl border border-mera-neutral-200 bg-white px-4 py-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-mera-primary/10 dark:bg-mera-accent/10">
            <Ionicons
              name="receipt-outline"
              size={20}
              color={COLORS[themeMode].iconActive}
            />
          </View>
          <Typography variant="body" className="flex-1 font-inter-semibold">
            Siparişlerim
          </Typography>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS[themeMode].iconInactive}
          />
        </TouchableOpacity>

        <View className="mt-6">
          {isLoadingCatches ? (
            <View className="items-center justify-center rounded-2xl border border-mera-neutral-200 bg-white px-4 py-8 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
              <ActivityIndicator
                size="large"
                color={COLORS[themeMode].iconActive}
              />
              <Typography
                variant="body"
                className="mt-3 text-center text-mera-neutral-500"
              >
                Av kayıtları yükleniyor...
              </Typography>
            </View>
          ) : hasCatchesError ? (
            <View className="items-center justify-center rounded-2xl border border-mera-status-error bg-white px-4 py-8 dark:bg-mera-neutral-800">
              <Typography
                variant="body"
                className="text-center text-mera-status-error"
              >
                {(catchesError as Error)?.message ||
                  "Av kayıtları yüklenemedi."}
              </Typography>
            </View>
          ) : isCatchListEmpty ? (
            <View className="items-center justify-center rounded-2xl border border-mera-neutral-200 bg-white px-6 py-10 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
              <Typography variant="body" className="text-center">
                Henüz bir maceran yok! İlk balığını kaydetmeye ne dersin?
              </Typography>
            </View>
          ) : (
            <View className="gap-3">
              <View className="flex-row">
                <View className="flex-1 rounded-2xl border border-mera-neutral-200 bg-white p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                  <Typography
                    variant="caption"
                    className="mb-1 text-mera-neutral-500"
                  >
                    Toplam Av
                  </Typography>
                  <Typography variant="h2">{totalCatchCount}</Typography>
                </View>

                <View className="ml-3 flex-1 rounded-2xl border border-mera-neutral-200 bg-white p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                  <Typography
                    variant="caption"
                    className="mb-1 text-mera-neutral-500"
                  >
                    En Çok Tutulan Tür
                  </Typography>
                  <Typography variant="h2">{mostCaughtSpecies}</Typography>
                </View>
              </View>

              <View className="rounded-2xl border border-mera-neutral-200 bg-white p-4 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
                <Typography
                  variant="caption"
                  className="mb-3 text-mera-neutral-500"
                >
                  Tür Dağılımı
                </Typography>

                <View className="gap-3">
                  {speciesStats.map((stat) => (
                    <View key={stat.species}>
                      <View className="mb-1 flex-row items-center justify-between">
                        <Typography
                          variant="caption"
                          className="font-inter-semibold text-mera-neutral-900 dark:text-white"
                        >
                          {stat.species}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-mera-neutral-500"
                        >
                          %{Math.round(stat.percentage)}
                        </Typography>
                      </View>

                      <View className="h-2 w-full overflow-hidden rounded-full bg-mera-neutral-200 dark:bg-mera-neutral-900">
                        <View
                          className="h-full rounded-full bg-mera-primary dark:bg-mera-accent"
                          style={{ width: `${Math.max(4, stat.percentage)}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {!isLoadingCatches && !hasCatchesError && !isCatchListEmpty ? (
          <Typography variant="h2" className="mb-3 mt-6">
            Av Geçmişi
          </Typography>
        ) : null}
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View className="gap-3 pb-4 pt-3">
        <Button
          title="Av Kaydı Ekle"
          onPress={() => router.push("/add-catch")}
        />

        <Button
          variant="secondary"
          title="Çıkış Yap"
          onPress={handleSignOut}
          disabled={isSigningOut}
        />
      </View>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={
          isLoadingCatches || hasCatchesError || isCatchListEmpty ? [] : catches
        }
        keyExtractor={(item) => item.id}
        renderItem={renderCatchItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <FishingSpotMapFullscreen
        visible={isExpanded}
        onClose={closeCatchLocationMap}
        animatedOverlayStyle={animatedOverlayStyle}
        animatedMapStyle={animatedMapStyle}
        animatedBackButtonStyle={animatedBackButtonStyle}
        mode="coordinate"
        selectedCoordinate={selectedCatchCoordinate}
        readOnlyCoordinate={true}
      />
    </ScreenContainer>
  );
}
