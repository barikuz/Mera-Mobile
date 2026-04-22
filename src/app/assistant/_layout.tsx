/**
 * Assistant Stack Layout — Asistan sekmesinin alt ekranlarını yöneten stack navigator.
 *
 * Bu layout, Asistan sekmesinin ana sayfasını (index) ve alt ekranlarını
 * (Mera Önerisi, Ekipman Tavsiyesi, Teknik İpuçları) bir Stack yapısında yönetir.
 * Header, üst kattaki Tabs layout tarafından sağlandığı için burada gizlenmiştir.
 */
import { Stack } from "expo-router";
import React from "react";

export default function AssistantStackLayout() {
  return (
    <Stack
      screenOptions={{
        // Header, kök (root) Tabs layout'tan geldiği için stack seviyesinde gizlenir
        headerShown: false,
        // Stack geçiş animasyonu
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="spot-recommendation" />
      <Stack.Screen name="gear-recommendation" />
      <Stack.Screen name="technique-tips" />
    </Stack>
  );
}
