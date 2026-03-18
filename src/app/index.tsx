import { Text, View } from 'react-native';

export default function Home() {
  return (
    // Eğer NativeWind tam çalışıyorsa arka plan masmavi, yazı sapsarı olmalı
    <View className="flex-1 items-center justify-center bg-mera-primary">
      <Text className="text-3xl font-inter-bold text-mera-accent">
        Mera Kurulum Testi
      </Text>
    </View>
  );
}