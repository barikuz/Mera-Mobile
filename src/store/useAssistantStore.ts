import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type SelectedSpot = {
  id: string;
  name: string;
  coordinate: Coordinates;
};

export type SpotRecommendationInput = {
  targetFish: string;
  coordinates: Coordinates;
};

export type RecommendedSpot = {
  id: string;
  name: string;
  description: string;
  waterType: string;
  depthRange: string;
  coordinate: Coordinates;
};

export type GearRecommendationInput = {
  targetFish: string;
  coordinates: Coordinates;
  fishingStyle: string;
  selectedSpot: SelectedSpot | null;
};

export type GearRecommendationItem = {
  type: "rod" | "reel" | "bait";
  label: string;
  icon: string;
  name: string;
  price: number;
  expertNote: string;
  productId?: string;
  imageUrl?: string | null;
};

export type TechnicalTipsInput = {
  targetFish: string;
  coordinates: Coordinates;
  selectedSpot: SelectedSpot | null;
};

export type TechniqueTip = {
  title: string;
  subtitle?: string;
  items: string[];
};

interface AssistantRecommendationState<RequestType, ResultType> {
  lastRequest: RequestType | null;
  lastResult: ResultType | null;
  lastUpdatedAt: string | null;
}

interface AssistantStoreState {
  spotRecommendation: AssistantRecommendationState<
    SpotRecommendationInput,
    RecommendedSpot[]
  >;
  gearRecommendation: AssistantRecommendationState<
    GearRecommendationInput,
    GearRecommendationItem[]
  >;
  technicalTips: AssistantRecommendationState<
    TechnicalTipsInput,
    TechniqueTip[]
  >;
  setSpotRecommendation: (payload: {
    request: SpotRecommendationInput;
    result: RecommendedSpot[];
  }) => void;
  setGearRecommendation: (payload: {
    request: GearRecommendationInput;
    result: GearRecommendationItem[];
  }) => void;
  setTechnicalTips: (payload: {
    request: TechnicalTipsInput;
    result: TechniqueTip[];
  }) => void;
}

const emptyRecommendation = <
  RequestType,
  ResultType,
>(): AssistantRecommendationState<RequestType, ResultType> => ({
  lastRequest: null,
  lastResult: null,
  lastUpdatedAt: null,
});

export const useAssistantStore = create<AssistantStoreState>()(
  persist(
    (set) => ({
      spotRecommendation: emptyRecommendation(),
      gearRecommendation: emptyRecommendation(),
      technicalTips: emptyRecommendation(),
      setSpotRecommendation: ({ request, result }) =>
        set({
          spotRecommendation: {
            lastRequest: request,
            lastResult: result,
            lastUpdatedAt: new Date().toISOString(),
          },
        }),
      setGearRecommendation: ({ request, result }) =>
        set({
          gearRecommendation: {
            lastRequest: request,
            lastResult: result,
            lastUpdatedAt: new Date().toISOString(),
          },
        }),
      setTechnicalTips: ({ request, result }) =>
        set({
          technicalTips: {
            lastRequest: request,
            lastResult: result,
            lastUpdatedAt: new Date().toISOString(),
          },
        }),
    }),
    {
      name: "mera-assistant-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
