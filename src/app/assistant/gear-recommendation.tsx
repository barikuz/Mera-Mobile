import React from "react";
import { View } from "react-native";

import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { COLORS } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function GearRecommendationScreen() {
  const colorScheme = useColorScheme();
  const accentColor =
    colorScheme === "dark" ? COLORS.dark.iconActive : COLORS.light.iconActive;

  return (
    <ScreenContainer>
      <View className="flex-1 pt-2">
        <Typography variant="caption">
          Bu ekran yakinda ekipman oneri icerikleriyle doldurulacak.
        </Typography>
      </View>
    </ScreenContainer>
  );
}
