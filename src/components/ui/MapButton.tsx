import React from "react";
import { Pressable } from "react-native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface MapButtonProps {
  onPress: () => void;
  iconColor: string;
}

export default function MapButton({ onPress, iconColor }: MapButtonProps) {
  return (
    <Pressable
      className="h-[48px] min-w-[48px] ml-2 items-center justify-center rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-3.5 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <MaterialIcons name="map" size={22} color={iconColor} />
    </Pressable>
  );
}
