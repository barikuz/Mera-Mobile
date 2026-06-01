/**
 * SkeletonBlock — Pulse animasyonlu iskelet yükleyici bloğu.
 * Yükleme durumlarında içerik placeholder'ı olarak kullanılır.
 * className ile şekil (rounded vb.), style ile boyut belirlenir.
 *
 * Not: Animated.View üzerinde NativeWind'in flex/width/height sınıfları
 * güvenilir çalışmayabilir; bu nedenle boyut için style prop'unu kullanın.
 */
import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

interface SkeletonBlockProps {
  /** Şekil ve konum için NativeWind sınıfları (örn. "rounded-md") */
  className?: string;
  /** Boyut ve layout için explicit stil — flex, width, height buraya gelir */
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonBlock({
  className = "",
  style,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`rounded-lg bg-mera-neutral-200 dark:bg-mera-neutral-500 ${className}`}
      style={[{ opacity }, style]}
    />
  );
}
