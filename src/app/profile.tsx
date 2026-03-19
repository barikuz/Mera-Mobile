import React from 'react';
import { Text, View } from 'react-native';

import ScreenContainer from '@/components/ui/ScreenContainer';

export default function ProfileScreen() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center">
        <Text className="font-inter-semibold text-xl text-mera-neutral-900 dark:text-mera-neutral-100">
          Profil
        </Text>
      </View>
    </ScreenContainer>
  );
}
