import React from "react";
import { View } from "react-native";

import FishingSpotMapFullscreen from "@/components/ui/FishingSpotMapFullscreen";
import FishingSpotMapPreview from "@/components/ui/FishingSpotMapPreview";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { useExpandableOverlay } from "@/hooks/useExpandableOverlay";

export default function AsistanScreen() {
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
        <Typography variant="h2" className="mt-2 mb-2">
          Mera Keşfi
        </Typography>

        <Typography variant="caption" className="mb-4">
          Bölgenizdeki en verimli balık tutma noktalarını harita üzerinden
          keşfedin ve yeni meralar bulun.
        </Typography>

        <FishingSpotMapPreview onPress={expand} />
      </View>

      <FishingSpotMapFullscreen
        visible={isExpanded}
        onClose={collapse}
        animatedOverlayStyle={animatedOverlayStyle}
        animatedMapStyle={animatedMapStyle}
        animatedBackButtonStyle={animatedBackButtonStyle}
      />
    </ScreenContainer>
  );
}
