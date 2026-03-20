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

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [display_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ekran odaklandığında form alanlarını temizle
  useFocusEffect(
    useCallback(() => {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }, []),
  );

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: display_name,
            email: email,
          },
        },
      });

      if (error) {
        Alert.alert("Kayıt Hatası", error.message);
        return;
      }

      console.log("Registration successful");
      Alert.alert(
        "Başarılı",
        "Kayıt başarılı! Lütfen e-postanızı kontrol edin.",
      );
      router.replace("/login");
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
              Hesap Oluştur
            </Typography>
            <Typography variant="body" className="text-center">
              Başlamak için kayıt olun
            </Typography>
          </View>

          {/* Form section */}
          <View className="mb-6">
            <Input
              label="Görünecek Ad"
              placeholder="Ahmet Yılmaz"
              value={display_name}
              onChangeText={setName}
              autoCapitalize="words"
            />
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
            <Input
              label="Şifre Tekrarı"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View className="mt-4">
              <Button
                title={isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                onPress={handleRegister}
                variant="primary"
                disabled={isLoading}
              />
            </View>
          </View>

          {/* Footer section (Login Link) */}
          <View className="mt-auto pt-4 pb-8 items-center flex-row justify-center">
            <Typography variant="body">Zaten hesabınız var mı? </Typography>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="py-2"
              activeOpacity={0.7}
            >
              <Typography
                variant="body"
                className="font-inter-semibold text-mera-primary dark:text-mera-accent"
              >
                Giriş Yap
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
