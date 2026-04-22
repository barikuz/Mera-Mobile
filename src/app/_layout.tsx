import {
  Comfortaa_500Medium,
  Comfortaa_700Bold,
} from "@expo-google-fonts/comfortaa";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import Header from "@/components/ui/Header";
import { COLORS } from "@/constants/color";

// Expo Router'dan yönlendirme ve mevcut sayfayı bulma kancaları
import { useRouter, useSegments } from "expo-router";
// Kasa ve Hafıza bağlantılarımız (Yolların projene uygun olduğundan emin ol)
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "../../lib/supabase";

// Fontlar asenkron olarak yüklenene dek açılış ekranını (Splash Screen) görünür tutuyoruz
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function TabLayout() {
  // Cihazın mevcut renk temasını (karanlık veya açık) alır
  const colorScheme = useColorScheme();

  // Tema tanımlı değilse (null/undefined) varsayılan olarak açık (light) temayı kullanmak için güvenli kontrol
  const scheme = colorScheme === "dark" ? "dark" : "light";

  // Bulunan temaya uygun renk dizisini yapılandırma objemizden çekeriz
  const c = COLORS[scheme];

  // Proje genelinde kullanılacak özel fontları (Inter ve Comfortaa) asenkron olarak projeye dahil eder
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Comfortaa-Medium": Comfortaa_500Medium,
    "Comfortaa-Bold": Comfortaa_700Bold,
  });

  // Zustand mağazamızdan verileri ve fonksiyonları çekiyoruz
  const { session, isInitialized, setSession, setInitialized } = useAuthStore();

  const segments = useSegments(); // Kullanıcının o an hangi sayfada (segment) olduğunu söyler
  const router = useRouter(); // Sayfalar arası geçiş yapmamızı sağlar

  // 1. SUPABASE DİNLEYİCİSİ: Uygulama açıldığında ve oturum değiştiğinde çalışır
  useEffect(() => {
    // Uygulama ilk açıldığında kasada (SecureStore) token var mı diye bakar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true); // "Evet, kasayı kontrol ettim, artık yönlendirme yapabiliriz" der
    });

    // Kullanıcı giriş yaptığında, çıkış yaptığında veya token yenilendiğinde anında tetiklenir
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe(); // Performans için dinleyiciyi temizleriz
    };
  }, []);

  // 2. YÖNLENDİRİCİ (ESNEK AUTH GUARD): Misafir kullanımına izin verir
  useEffect(() => {
    // Supabase kasayı kontrol etmeyi bitirmeden yönlendirme yapma
    if (!isInitialized) return;

    // Kullanıcı şu an Login veya Register sayfasında mı?
    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    // MANTIK KURALI: Kullanıcı zaten GİRİŞ YAPMIŞSA, tekrar Login veya Register sayfasını görememeli.
    if (session && inAuthGroup) {
      // Eğer girişli biri Login sayfasına düşerse (örneğin geri tuşuyla), onu doğrudan Ana Sayfaya yolla.
      router.replace("/");
    }
  }, [session, isInitialized, segments]);

  // Fontlar tamamen yüklendiğinde ya da bir yükleme hatası oluştuğunda Splash Screen'i kalıcı olarak gizler
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Eğer fontlar henüz hazır değilse hata atmamak adına arayüzü çizmeyi (render etmeyi) bekletir
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // Uygulama içerisindeki React Navigation temeli, cihazın karanlık/açık mod durumuna göre entegre edilir
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        {/* İkon içeren özel animasyonlu açılış ekranı katmanı */}
        <AnimatedSplashOverlay />

        <Tabs
          screenOptions={({ route }) => ({
            // Her sekmenin üst kısmında paylaşılan (shared) Header bileşenini kullanmasını belirleriz
            // Sepet ikonu mağaza ve ödeme ekranlarında gösterilir; diğer ekranlarda başlık dengesi korunur.
            header: () => (
              <Header
                showCartButton={
                  route.name === "shop" || route.name === "checkout"
                }
              />
            ),

            // ── Sekme Çubuğu (Tab Bar) Konteyner Stil Ayarları ────────────────────
            tabBarStyle: {
              backgroundColor: c.tabBarBackground, // Aktif temaya uygun taban arka plan rengi
              borderTopColor: c.tabBarBorder, // Sekme çubuğunun üst ayırıcı çizgisi (border)
              borderTopWidth: 1, // İnce ve net bir sınır çizgisi

              // İşletim sistemine (OS) özgü ekran altı yüksekliği (Çentikli yapılar ve Home Indicator için):
              // Android platformu için ekran bitiminden başlar, iOS cephesinde Safe Area'ya riayet eder
              height: Platform.select({ ios: 80, android: 64 }),

              // Alt kısımdan (padding) bırakılan emniyet boşluğu
              paddingBottom: Platform.select({ ios: 24, android: 8 }),
              paddingTop: 8, // İkonların üst kısımdan bırakacağı estetik iç boşluk

              elevation: 0, // Android'in varsayılan düşen gölgesini siler (Flat/Düz görünüm için)
              shadowOpacity: 0, // iOS'in varsayılan düşen gölgesini siler (Flat/Düz görünüm için)
            },

            // ── İkon & Metin (Label) Durum Renklendirmeleri ─────────────────────────
            tabBarActiveTintColor: c.iconActive, // İlgili sekmeye geçildiğinde simgeye uygulanacak odak rengi
            tabBarInactiveTintColor: c.iconInactive, // Sekme seçili olmadığında uygulanacak donuk/pasif renk

            // ── Metin (Label) Tipografi Ayarları ────────────────────────────────────
            tabBarLabelStyle: {
              fontFamily: "Inter-SemiBold", // Yarı kalın (SemiBold) gövde fontu
              fontSize: 11, // Okunaklılığın korunarak alanın kaplanmasını engelleyen boyut
              letterSpacing: 0.2, // Harfler arası dar ferahlık (tipografik estetik için)
            },
          })}
        >
          {/* ── 1. Sekme: Mağaza ────────────────────────────────────────────── */}
          <Tabs.Screen
            name="shop" // Eşleşen expo-router dosya yolu: 'src/app/shop.tsx'
            options={{
              title: "Mağaza", // Alt menü barında ikonun hemen altında yer alacak başlık adı
              tabBarIcon: ({ color, size }) => (
                // İçerikle bağlantılı ve işlevsellik katması amacıyla bir mağaza ikonu kullanıyoruz
                <MaterialCommunityIcons
                  name="store"
                  color={color}
                  size={size}
                />
              ),
            }}
          />

          {/* ── 2. Sekme: Ana Sayfa ─────────────────────────────────────────── */}
          <Tabs.Screen
            name="index" // Eşleşen expo-router dosya yolu: 'src/app/index.tsx' (Kök dizin giriş sayfası)
            options={{
              title: "Ana Sayfa", // Alt menü barı başlık adı
              tabBarIcon: ({ color, size }) => (
                // Genel alışveriş/ev manasını taşıyan klasik bir ev simgesi
                <Ionicons name="home-outline" color={color} size={size} />
              ),
            }}
          />

          {/* ── 3. Sekme: Asistan ───────────────────────────────────────────── */}
          <Tabs.Screen
            name="asistan" // Eşleşen expo-router dosya yolu: 'src/app/asistan.tsx'
            options={{
              title: "Asistan", // Alt menü barı başlık adı
              tabBarIcon: ({ color, size }) => (
                // Yapay zeka modülünü veya iletişim asistanını andıran simge
                <MaterialIcons name="assistant" color={color} size={size} />
              ),
            }}
          />

          {/* ── Mantıksal Stack Ekranı: Profil ──────────────────────────────── */}
          <Tabs.Screen
            name="profile" // Eşleşen expo-router dosya yolu: 'src/app/profile.tsx'
            options={{
              title: "Profil",
              // 'href: null' değeri profil sekmesinin fiziksel bir sekme butonu (tab icon) oluşturmasını engeller.
              // Bu sayede profile sadece uygulama içerisindeki bir Header yönlendirmesinden (router.push) girilebilir ve normal bir stack sayfasıymış gibi tepki verir.
              href: null,
            }}
          />

          {/* ── Mantıksal Stack Ekranı: Sepet (sekmede gizli) ───────────────── */}
          <Tabs.Screen
            name="cart"
            options={{
              title: "Sepet",
              href: null,
            }}
          />

          <Tabs.Screen
            name="checkout"
            options={{
              title: "Ödeme",
              href: null,
            }}
          />

          <Tabs.Screen
            name="add-catch"
            options={{
              title: "Av Ekle",
              href: null,
            }}
          />

          <Tabs.Screen
            name="spot-recommendation"
            options={{
              title: "Mera Önerisi",
              href: null,
            }}
          />

          <Tabs.Screen
            name="gear-recommendation"
            options={{
              title: "Ekipman Tavsiyesi",
              href: null,
            }}
          />

          <Tabs.Screen
            name="technique-tips"
            options={{
              title: "Teknik İpuçları",
              href: null,
            }}
          />

          {/* ── Mantıksal Stack Ekranları: Auth ─────────────────────────────── */}
          <Tabs.Screen
            name="login"
            options={{
              title: "Giriş Yap",
              href: null,
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="register"
            options={{
              title: "Kayıt Ol",
              href: null,
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          />
        </Tabs>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
