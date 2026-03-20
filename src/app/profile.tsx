import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, useColorScheme, View } from "react-native";

import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "../../lib/supabase";

interface Profile {
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Profil verilerini Supabase'den çek
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setIsLoadingProfile(false);
        setFetchError("Kullanıcı oturumu bulunamadı.");
        return;
      }

      try {
        setIsLoadingProfile(true);
        setFetchError(null);

        const { data, error } = await supabase
          .from("profiles")
          .select("display_name, email, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          setFetchError("Profil bilgileri yüklenirken bir hata oluştu.");
          return;
        }

        setProfile(data);
      } catch {
        setFetchError("Beklenmeyen bir hata oluştu.");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  // Çıkış yap
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu.");
        return;
      }

      console.log("Kullanıcı başarıyla çıkış yaptı.");
      router.replace("/");
    } catch {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu.");
    } finally {
      setIsSigningOut(false);
    }
  };

  // Profil yüklenirken Loader göster
  if (isLoadingProfile) {
    return (
      <ScreenContainer>
        <Loader />
      </ScreenContainer>
    );
  }

  // Hata durumunda hata mesajı göster
  if (fetchError) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Typography variant="body" className="text-center text-red-500">
            {fetchError}
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  // Placeholder ikon rengi (tema uyumlu)
  const placeholderIconColor = colorScheme === "dark" ? "#64748B" : "#94A3B8";

  return (
    <ScreenContainer>
      <View className="flex-1 items-center pt-8">
        {/* Avatar */}
        <View className="mb-6">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="h-28 w-28 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-full bg-mera-neutral-200 dark:bg-mera-neutral-800">
              <Ionicons name="person" size={56} color={placeholderIconColor} />
            </View>
          )}
        </View>

        {/* Display Name */}
        <Typography variant="h2" className="mb-2 text-center">
          {profile?.display_name || "İsimsiz Kullanıcı"}
        </Typography>

        {/* Email */}
        <Typography variant="caption" className="text-center">
          {profile?.email || user?.email || "E-posta bulunamadı"}
        </Typography>
      </View>

      {/* Çıkış Yap Butonu */}
      <View className="pb-4">
        <Button
          variant="secondary"
          title="Çıkış Yap"
          onPress={handleSignOut}
          disabled={isSigningOut}
        />
      </View>
    </ScreenContainer>
  );
}
