import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import NavCard from '@/components/ui/NavCard';
import ScreenContainer from '@/components/ui/ScreenContainer';
import Typography from '@/components/ui/Typography';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-inter-semibold text-mera-neutral-500 uppercase tracking-wide mb-2">
        {title}
      </Text>
      <View className="bg-mera-neutral-100 dark:bg-mera-neutral-950 rounded-xl p-4">{children}</View>
    </View>
  );
}

export default function ComponentDemo() {
  const [text, setText] = useState('');

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Typography variant="h1" className="mt-4 mb-1">Component Demo</Typography>
        <Typography variant="caption" className="mb-6">Visual QA — delete after review</Typography>

        {/* Typography */}
        <Section title="Typography">
          <Typography variant="h1">Heading 1</Typography>
          <Typography variant="h2" className="mt-2">Heading 2</Typography>
          <Typography variant="body" className="mt-2">Body text — The quick brown fox jumps over the lazy dog.</Typography>
          <Typography variant="caption" className="mt-2">Caption text — secondary information</Typography>
        </Section>

        {/* Input — default */}
        <Section title="Input — Default">
          <Input label="Email" placeholder="you@example.com" value={text} onChangeText={setText} />
        </Section>

        {/* Input — error */}
        <Section title="Input — Error">
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value="short"
            onChangeText={() => { }}
            errorMessage="Password must be at least 8 characters"
          />
        </Section>

        {/* Buttons */}
        <Section title="Button — Primary">
          <Button title="Sign In" onPress={() => { }} />
          <View className="mt-2" />
          <Button title="Sign In (Disabled)" onPress={() => { }} disabled />
        </Section>

        <Section title="Button — Secondary">
          <Button variant="secondary" title="Forgot Password" onPress={() => { }} />
          <View className="mt-2" />
          <Button variant="secondary" title="Forgot Password (Disabled)" onPress={() => { }} disabled />
        </Section>

        {/* NavCard */}
        <Section title="NavCard">
          <NavCard
            title="Map"
            description="Find nearby fishing spots"
            icon={<Text className="text-xl">🗺️</Text>}
            onPress={() => { }}
          />
          <NavCard
            title="AI Assistant"
            description="Get smart fishing tips"
            icon={<Text className="text-xl">🤖</Text>}
            onPress={() => { }}
          />
        </Section>

        {/* Loader */}
        <Section title="Loader — Large">
          <View className="h-20">
            <Loader size="large" />
          </View>
        </Section>

        <Section title="Loader — Small">
          <View className="h-16">
            <Loader size="small" />
          </View>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
