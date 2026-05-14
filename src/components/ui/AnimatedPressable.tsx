/**
 * AnimatedPressable — Basıldığında yumuşak ölçek animasyonu uygulayan dokunulabilir sarmalayıcı.
 * React Native Reanimated ile spring fiziği kullanarak premium his veren etkileşim sağlar.
 * Tüm ana sayfa kartlarında ham Pressable yerine kullanılmalıdır.
 */
import React, { ReactNode } from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedPressableProps extends Omit<PressableProps, "style"> {
  /** Alt bileşenler */
  children: ReactNode;
  /** Ek NativeWind sınıfları (Animated.View'e uygulanır) */
  className?: string;
  /** Basıldığında uygulanacak ölçek değeri — varsayılan 0.97 */
  scaleValue?: number;
  /** Dış Pressable'a uygulanacak ek stil (flex layout için) */
  outerStyle?: ViewStyle;
}

export default function AnimatedPressable({
  children,
  className,
  scaleValue = 0.97,
  outerStyle,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleValue, {
      damping: 15,
      stiffness: 300,
    });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    onPressOut?.(e);
  };

  // className'den flex-1 varsa dışa da uygula
  const hasFlex1 = className?.includes("flex-1");

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[hasFlex1 ? { flex: 1 } : undefined, outerStyle]}
      {...rest}
    >
      <Animated.View className={className} style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
