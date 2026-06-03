/**
 * AuthToast — Oturum gerektiren bir işlem yapılmaya çalışıldığında
 * ekranın altında beliren ve ~2 saniye sonra fade-out ile kaybolan
 * bildirim bileşeni.
 *
 * Kullanım:
 *   const toast = useAuthToast();
 *   <AuthToast {...toast} />
 *   // tetiklemek için:
 *   toast.show();
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Text, View } from "react-native";

// ────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────

/** AuthToast'u kontrol eden hook. show() çağrısıyla toastı tetikler. */
export function useAuthToast() {
  const opacity = useState(() => new Animated.Value(0))[0];
  const [visible, setVisible] = useState(false);

  const show = () => {
    setVisible(true);
    opacity.setValue(1);
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  return { visible, opacity, show };
}

// ────────────────────────────────────────────────────────────────
// Bileşen
// ────────────────────────────────────────────────────────────────

interface AuthToastProps {
  visible: boolean;
  opacity: Animated.Value;
  /** Gösterilecek mesaj — varsayılan: "Bu özelliği kullanmak için oturum açmalısınız." */
  message?: string;
}

export default function AuthToast({
  visible,
  opacity,
  message = "Bu özelliği kullanmak için oturum açmalısınız.",
}: AuthToastProps) {
  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 32,
        left: 24,
        right: 24,
        opacity,
        backgroundColor: "#192655",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View style={{ marginRight: 10 }}>
        <Ionicons name="lock-closed-outline" size={18} color="#00ccb2" />
      </View>
      <Text
        style={{
          color: "#ffffff",
          fontSize: 14,
          fontWeight: "600",
          flexShrink: 1,
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}
