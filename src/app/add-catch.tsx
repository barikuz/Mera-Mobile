import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import Input from "@/components/ui/Input";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFishSpecies } from "@/hooks/useCatalog";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useAuthStore } from "@/store/useAuthStore";

type CreateCatchPayload = {
  species_id: string | null;
  weight_kg: number | null;
  length_cm: number | null;
  location_lat: number | null;
  location_lng: number | null;
};

type CatchResponse = Record<string, unknown> | null;

async function createCatch(
  payload: CreateCatchPayload,
): Promise<CatchResponse> {
  const token = useAuthStore.getState().session?.access_token;

  if (!token) {
    throw new Error("Oturum hatası. Lütfen giriş yapın.");
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const response = await fetch(`${baseUrl}/catches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      species_id: payload.species_id,
      weight_kg: payload.weight_kg,
      length_cm: payload.length_cm,
      location_lat: payload.location_lat,
      location_lng: payload.location_lng,
    }),
  });

  if (!response.ok) {
    let backendMessage = "";

    try {
      const text = await response.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          if (typeof data?.message === "string") {
            backendMessage = data.message;
          } else {
            backendMessage = text;
          }
        } catch {
          backendMessage = text;
        }
      }
    } catch {
      backendMessage = "";
    }

    throw new Error(backendMessage || `HTTP ${response.status}`);
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface StepperFieldProps {
  label: string;
  unit: string;
  value: number | null;
  step: number;
  precision: number;
  iconColor: string;
  onChange: (nextValue: number | null) => void;
}

function StepperField({
  label,
  unit,
  value,
  step,
  precision,
  iconColor,
  onChange,
}: StepperFieldProps) {
  const formattedValue =
    value === null ? "—" : `${value.toFixed(precision)} ${unit}`;

  const increase = () => {
    if (value === null) {
      onChange(Number(step.toFixed(precision)));
      return;
    }

    const next = value + step;
    onChange(Number(next.toFixed(precision)));
  };

  const decrease = () => {
    if (value === null) {
      return;
    }

    const next = value - step;
    if (next <= 0) {
      onChange(null);
      return;
    }

    onChange(Number(next.toFixed(precision)));
  };

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-mera-neutral-800">
      <Text className="mb-3 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
        {label}
      </Text>

      <View className="flex-row items-center justify-between rounded-2xl border border-mera-neutral-200 bg-mera-neutral-100 px-3 py-2 dark:border-mera-neutral-500 dark:bg-mera-neutral-900">
        <TouchableOpacity
          onPress={decrease}
          className="h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-mera-neutral-800"
          activeOpacity={0.7}
          hitSlop={8}
        >
          <MaterialIcons name="remove" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className="min-w-28 text-center text-xl font-inter-semibold text-mera-neutral-900 dark:text-white">
          {formattedValue}
        </Text>

        <TouchableOpacity
          onPress={increase}
          className="h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-mera-neutral-800"
          activeOpacity={0.7}
          hitSlop={8}
        >
          <MaterialIcons name="add" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AddCatchScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === "dark" ? "dark" : "light";
  const themeColors = COLORS[scheme];
  const fishSpeciesQuery = useFishSpecies();
  const speciesOptions = useMemo(
    () => [...(fishSpeciesQuery.data?.map((item) => item.name) ?? []), "Diğer"],
    [fishSpeciesQuery.data],
  );

  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [speciesName, setSpeciesName] = useState("");
  const [isOtherSpeciesSelected, setIsOtherSpeciesSelected] = useState(false);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [lengthCm, setLengthCm] = useState<number | null>(null);
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [pendingLocationLat, setPendingLocationLat] = useState<number | null>(
    null,
  );
  const [pendingLocationLng, setPendingLocationLng] = useState<number | null>(
    null,
  );

  const {
    isExpanded,
    expand,
    collapse,
    animatedOverlayStyle,
    animatedMapStyle,
    animatedBackButtonStyle,
  } = useExpandableOverlay();

  const selectedCoordinate = useMemo(() => {
    if (pendingLocationLat === null || pendingLocationLng === null) {
      return null;
    }

    return { latitude: pendingLocationLat, longitude: pendingLocationLng };
  }, [pendingLocationLat, pendingLocationLng]);

  const isSpeciesValid = isOtherSpeciesSelected
    ? speciesName.trim().length > 0
    : speciesId !== null && speciesId.trim().length > 0;

  const createCatchMutation = useMutation({
    mutationFn: createCatch,
  });

  const handleSpeciesSelect = (option: string) => {
    if (option === "Diğer") {
      setIsOtherSpeciesSelected(true);
      setSpeciesId(null);
      setSpeciesName("");
      return;
    }

    setIsOtherSpeciesSelected(false);

    // Find the species ID from the catalog
    const selectedSpecies = fishSpeciesQuery.data?.find(
      (item) => item.name === option,
    );

    if (selectedSpecies) {
      setSpeciesId(String(selectedSpecies.id));
      setSpeciesName(option);
    }
  };

  const openMap = () => {
    setPendingLocationLat(locationLat);
    setPendingLocationLng(locationLng);
    expand();
  };

  const handleCoordinateSelect = (coordinate: {
    latitude: number;
    longitude: number;
  }) => {
    setPendingLocationLat(Number(coordinate.latitude.toFixed(6)));
    setPendingLocationLng(Number(coordinate.longitude.toFixed(6)));
  };

  const handleConfirmLocation = () => {
    if (pendingLocationLat === null || pendingLocationLng === null) {
      return;
    }

    setLocationLat(pendingLocationLat);
    setLocationLng(pendingLocationLng);
    collapse();
  };

  const handleCloseMap = () => {
    collapse();
  };

  const handleSave = async () => {
    if (!isSpeciesValid || createCatchMutation.isPending) {
      return;
    }

    try {
      // For "Other" species, attempt to find its ID from the catalog
      let finalSpeciesId = speciesId;
      if (isOtherSpeciesSelected && finalSpeciesId === null) {
        const otherSpecies = fishSpeciesQuery.data?.find(
          (item) => item.name === "Diğer",
        );
        if (otherSpecies) {
          finalSpeciesId = String(otherSpecies.id);
        }
      }

      // If still no ID found (for truly custom "Other" entry without predefined ID)
      if (finalSpeciesId === null && isOtherSpeciesSelected) {
        Alert.alert(
          "Uyarı",
          "Seçili tür sisteme kaydedilemedi. Lütfen listeden bir tür seçiniz.",
        );
        return;
      }

      await createCatchMutation.mutateAsync({
        species_id: finalSpeciesId,
        weight_kg: weightKg,
        length_cm: lengthCm,
        location_lat: locationLat,
        location_lng: locationLng,
      });

      await queryClient.invalidateQueries({ queryKey: ["catches"] });

      Alert.alert("Başarılı", "Av kaydı eklendi.");
      router.replace("/profile");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      Alert.alert(
        "Hata",
        message || "Av kaydı eklenemedi. Lütfen tekrar deneyin.",
      );
    }
  };

  return (
    <ScreenContainer className="pb-36">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 176 }}
        >
          <Typography variant="h2" className="mb-2 text-center">
            Av Ekle
          </Typography>
          <Typography variant="caption" className="mb-4 text-center">
            Tür seçimi zorunlu, diğer alanlar isteğe bağlıdır.
          </Typography>

          <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-mera-neutral-800">
            <Text className="mb-3 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
              Tür
            </Text>

            {fishSpeciesQuery.isLoading ? (
              <View className="mb-3 flex-row items-center gap-2">
                <ActivityIndicator
                  size="small"
                  color={themeColors.iconActive}
                />
                <Text className="text-sm text-mera-neutral-500">
                  Türler yükleniyor...
                </Text>
              </View>
            ) : fishSpeciesQuery.isError ? (
              <Text className="mb-3 text-sm text-mera-status-error">
                Türler yüklenemedi. Lütfen tekrar deneyin.
              </Text>
            ) : null}

            <View className="flex-row flex-wrap justify-between">
              {speciesOptions.map((option) => {
                const isSelected =
                  option === "Diğer"
                    ? isOtherSpeciesSelected
                    : !isOtherSpeciesSelected && speciesName === option;

                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleSpeciesSelect(option)}
                    activeOpacity={0.8}
                    className={`mb-3 h-14 w-[48%] items-center justify-center rounded-2xl border ${
                      isSelected
                        ? "border-mera-primary bg-mera-primary dark:border-mera-accent dark:bg-mera-accent"
                        : "border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-900"
                    }`}
                  >
                    <Text
                      className={`text-base font-inter-semibold ${
                        isSelected
                          ? "text-white dark:text-mera-neutral-900"
                          : "text-mera-neutral-900 dark:text-white"
                      }`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isOtherSpeciesSelected ? (
              <Input
                label="Diğer tür"
                placeholder="Balık türünü yazın"
                value={speciesName}
                onChangeText={setSpeciesName}
                autoCapitalize="words"
              />
            ) : null}
          </View>

          <StepperField
            label="Boy (cm)"
            unit="cm"
            value={lengthCm}
            step={1}
            precision={0}
            iconColor={themeColors.iconActive}
            onChange={setLengthCm}
          />

          <StepperField
            label="Ağırlık (kg)"
            unit="kg"
            value={weightKg}
            step={0.1}
            precision={1}
            iconColor={themeColors.iconActive}
            onChange={setWeightKg}
          />

          <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-mera-neutral-800">
            <Text className="mb-3 text-sm font-inter-semibold text-mera-neutral-900 dark:text-white">
              Konum
            </Text>

            <TouchableOpacity
              onPress={openMap}
              activeOpacity={0.8}
              className="h-14 flex-row items-center justify-center rounded-xl border border-mera-primary bg-mera-neutral-100 px-4 dark:border-mera-accent dark:bg-mera-neutral-900"
            >
              <Ionicons
                name="location"
                size={22}
                color={themeColors.iconActive}
                style={{ marginRight: 8 }}
              />
              <Text className="text-base font-inter-semibold text-mera-primary dark:text-mera-accent">
                Haritadan Konum Seç
              </Text>
            </TouchableOpacity>

            {locationLat !== null && locationLng !== null ? (
              <View className="mt-3 rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 p-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-900">
                <Text className="text-sm font-inter text-mera-neutral-900 dark:text-white">
                  Seçilen konum: {locationLat.toFixed(4)},{" "}
                  {locationLng.toFixed(4)}
                </Text>
              </View>
            ) : (
              <Text className="mt-3 text-sm font-inter text-mera-neutral-500">
                Konum seçilmedi.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="absolute inset-x-0 bottom-0 border-t border-mera-neutral-200 bg-mera-neutral-100 px-4 pb-4 pt-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-950">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isSpeciesValid || createCatchMutation.isPending}
          activeOpacity={0.7}
          className={`items-center rounded-lg bg-mera-primary py-3 dark:bg-mera-accent ${
            !isSpeciesValid || createCatchMutation.isPending ? "opacity-50" : ""
          }`}
        >
          {createCatchMutation.isPending ? (
            <ActivityIndicator
              size="small"
              color={scheme === "dark" ? "#111827" : "#FFFFFF"}
            />
          ) : (
            <Text className="text-base font-inter-semibold text-white dark:text-mera-neutral-900">
              Kaydet
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <FishingSpotMapFullscreen
        visible={isExpanded}
        onClose={handleCloseMap}
        onConfirmSelection={handleConfirmLocation}
        animatedOverlayStyle={animatedOverlayStyle}
        animatedMapStyle={animatedMapStyle}
        animatedBackButtonStyle={animatedBackButtonStyle}
        mode="coordinate"
        selectedCoordinate={selectedCoordinate}
        onCoordinateSelect={handleCoordinateSelect}
      />
    </ScreenContainer>
  );
}
