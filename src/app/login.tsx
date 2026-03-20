import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { supabase } from "../../lib/supabase";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Typography from "@/components/ui/Typography";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ekran odaklandığında form alanlarını temizle
  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setPassword("");
    }, []),
  );

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Giriş Hatası", error.message);
        return;
      }

      console.log("Login successful");
      Alert.alert("Başarılı", "Giriş başarılı!");
    } catch (error) {
      Alert.alert(
        "Hata",
        "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.push("/")}
        className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center rounded-full"
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color={colorScheme === "dark" ? "#F8FAFC" : "#0F172A"}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <View className="mb-8 mt-32 items-center">
            <Typography
              variant="h1"
              className="mb-2 text-center text-mera-primary dark:text-mera-accent"
            >
              Hoş Geldiniz
            </Typography>
            <Typography variant="body" className="text-center">
              Devam etmek için hesabınıza giriş yapın
            </Typography>
          </View>

          {/* Form section */}
          <View className="mb-6">
            <Input
              label="E-posta Adresi"
              placeholder="isim@ornek.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Forgot password link */}
            <View className="items-end mb-6 mt-1">
              <TouchableOpacity
                onPress={() => {}}
                className="py-2"
                activeOpacity={0.7}
              >
                <Typography
                  variant="caption"
                  className="font-inter-semibold text-mera-primary dark:text-mera-accent"
                >
                  Şifrenizi mi Unuttunuz?
                </Typography>
              </TouchableOpacity>
            </View>

            <Button
              title={isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              onPress={handleLogin}
              variant="primary"
              disabled={isLoading}
            />
          </View>

          {/* Footer section (Registration Link) */}
          <View className="mt-auto pt-6 pb-8 items-center flex-row justify-center">
            <Typography variant="body">Hesabınız yok mu? </Typography>
            <TouchableOpacity
              onPress={() => router.push("/register")}
              className="py-2"
              activeOpacity={0.7}
            >
              <Typography
                variant="body"
                className="font-inter-semibold text-mera-primary dark:text-mera-accent"
              >
                Kayıt Ol
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
