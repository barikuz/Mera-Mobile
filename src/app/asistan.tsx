import React from "react";
import { View } from "react-native";

import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import FishingSpotMapPreview from "@/components/ui/FishingSpotMapPreview";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { getMapInitialRegion } from "@/constants/map";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";
import { useLocation } from "@/hooks/useLocation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function AsistanScreen() {
  const colorScheme = useColorScheme();
  const accentColor =
    colorScheme === "dark" ? COLORS.dark.iconActive : COLORS.light.iconActive;
  const { coords } = useLocation();
  const initialRegion = getMapInitialRegion(coords);

  const {
    isExpanded,
    expand,
    collapse,
    animatedOverlayStyle,
    animatedMapStyle,
    animatedBackButtonStyle,
  } = useExpandableOverlay();

  return (
    <ScreenContainer>
      <View className="flex-1">
        <View className="flex-row items-center mb-2">
          <MaterialIcons
            name="location-searching"
            size={24}
            color={accentColor}
          />
          <Typography variant="h2" className="ml-2">
            Mera Keşfi
          </Typography>
        </View>

        <Typography variant="caption" className="mb-4">
          Bölgenizdeki en verimli balık tutma noktalarını harita üzerinden
          keşfedin ve yeni meralar bulun.
        </Typography>

        <FishingSpotMapPreview onPress={expand} initialRegion={initialRegion} />
      </View>

      <FishingSpotMapFullscreen
        visible={isExpanded}
        onClose={collapse}
        initialRegion={initialRegion}
        animatedOverlayStyle={animatedOverlayStyle}
        animatedMapStyle={animatedMapStyle}
        animatedBackButtonStyle={animatedBackButtonStyle}
      />
    </ScreenContainer>
  );
}
