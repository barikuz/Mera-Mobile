import React from "react";
import { Pressable, View } from "react-native";

import Typography from "@/components/ui/Typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface DropdownMenuProps {
  value?: string | null;
  placeholder: string;
  isOpen: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

export default function DropdownMenu({
  value,
  placeholder,
  isOpen,
  onPress,
  children,
}: DropdownMenuProps) {
  return (
    <View className="ml-2 flex-1 overflow-hidden rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 dark:border-mera-neutral-500 dark:bg-mera-neutral-800">
      <Pressable
        className={`flex-row items-center justify-between px-4 py-3 ${
          isOpen
            ? "border-b border-mera-neutral-200 dark:border-mera-neutral-500"
            : ""
        }`}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <Typography
          variant="body"
          className={`flex-1 ${
            value
              ? "text-mera-neutral-900 dark:text-white"
              : "text-mera-neutral-500"
          }`}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Typography>

        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={22}
          color="#64748B"
        />
      </Pressable>

      {isOpen ? children : null}
    </View>
  );
}
