import React from "react";
import { Pressable } from "react-native";

import Typography from "@/components/ui/Typography";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface DropdownMenuProps {
  value?: string | null;
  placeholder: string;
  isOpen: boolean;
  onPress: () => void;
}

export default function DropdownMenu({
  value,
  placeholder,
  isOpen,
  onPress,
}: DropdownMenuProps) {
  return (
    <Pressable
      className="flex-1 flex-row items-center justify-between rounded-xl border border-mera-neutral-200 bg-mera-neutral-100 px-4 py-3 dark:border-mera-neutral-500 dark:bg-mera-neutral-800"
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
  );
}
