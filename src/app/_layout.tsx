import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Comfortaa_500Medium, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import Header from '@/components/ui/Header';

// Mera tasarım sistemi renk token'ları (tailwind.config.js dosyasıyla birebir uyumludur)
export const COLORS = {
  // Açık (Light) tema renkleri
  light: {
    tabBarBackground: '#F8FAFC',   // Uygulama zemin arka plan rengi (mera-neutral-100)
    tabBarBorder: '#E2E8F0',       // Sekme çubuğu üst sınır çizgisi (mera-neutral-200)
    iconActive: '#192655',         // Aktif (seçili) sekme ikonu rengi (mera-primary)
    iconInactive: '#64748B',       // Pasif (seçili olmayan) sekme ikonu rengi (mera-neutral-500)
    labelActive: '#192655',        // Aktif sekme metni rengi
    labelInactive: '#64748B',      // Pasif sekme metni rengi
  },
  // Karanlık (Dark) tema renkleri
  dark: {
    tabBarBackground: '#0F162A',   // Karanlık mod uygulama zemin rengi (mera-neutral-950)
    tabBarBorder: '#1E2A45',       // Keskinliği azaltmak ve derinlik katmak adına arka plandan çok hafif daha açık bir ton
    iconActive: '#E1AA74',         // Aktif sekme ikonu rengi (Koyu lacivert üzerinde dikkat çeken sıcak vurgu rengi - mera-accent)
    iconInactive: '#64748B',       // Pasif sekme ikonu rengi (mera-neutral-500)
    labelActive: '#E1AA74',        // Aktif sekme metni rengi
    labelInactive: '#64748B',      // Pasif sekme metni rengi
  },
} as const;

// Fontlar asenkron olarak yüklenene dek açılış ekranını (Splash Screen) görünür tutuyoruz
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // Cihazın mevcut renk temasını (karanlık veya açık) alır
  const colorScheme = useColorScheme();
  
  // Tema tanımlı değilse (null/undefined) varsayılan olarak açık (light) temayı kullanmak için güvenli kontrol
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  
  // Bulunan temaya uygun renk dizisini yapılandırma objemizden çekeriz
  const c = COLORS[scheme];

  // Proje genelinde kullanılacak özel fontları (Inter ve Comfortaa) asenkron olarak projeye dahil eder
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Comfortaa-Medium': Comfortaa_500Medium,
    'Comfortaa-Bold': Comfortaa_700Bold,
  });

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* İkon içeren özel animasyonlu açılış ekranı katmanı */}
      <AnimatedSplashOverlay />

      <Tabs
        screenOptions={{
          // Her sekmenin üst kısmında paylaşılan (shared) Header bileşenini kullanmasını belirleriz
          header: () => <Header />,

          // ── Sekme Çubuğu (Tab Bar) Konteyner Stil Ayarları ────────────────────
          tabBarStyle: {
            backgroundColor: c.tabBarBackground, // Aktif temaya uygun taban arka plan rengi
            borderTopColor: c.tabBarBorder,      // Sekme çubuğunun üst ayırıcı çizgisi (border)
            borderTopWidth: 1,                   // İnce ve net bir sınır çizgisi
            
            // İşletim sistemine (OS) özgü ekran altı yüksekliği (Çentikli yapılar ve Home Indicator için):
            // Android platformu için ekran bitiminden başlar, iOS cephesinde Safe Area'ya riayet eder
            height: Platform.select({ ios: 80, android: 64 }),
            
            // Alt kısımdan (padding) bırakılan emniyet boşluğu
            paddingBottom: Platform.select({ ios: 24, android: 8 }),
            paddingTop: 8,                       // İkonların üst kısımdan bırakacağı estetik iç boşluk
            
            elevation: 0,                        // Android'in varsayılan düşen gölgesini siler (Flat/Düz görünüm için)
            shadowOpacity: 0,                    // iOS'in varsayılan düşen gölgesini siler (Flat/Düz görünüm için)
          },

          // ── İkon & Metin (Label) Durum Renklendirmeleri ─────────────────────────
          tabBarActiveTintColor: c.iconActive,       // İlgili sekmeye geçildiğinde simgeye uygulanacak odak rengi
          tabBarInactiveTintColor: c.iconInactive,   // Sekme seçili olmadığında uygulanacak donuk/pasif renk

          // ── Metin (Label) Tipografi Ayarları ────────────────────────────────────
          tabBarLabelStyle: {
            fontFamily: 'Inter-SemiBold',        // Yarı kalın (SemiBold) gövde fontu
            fontSize: 11,                        // Okunaklılığın korunarak alanın kaplanmasını engelleyen boyut
            letterSpacing: 0.2,                  // Harfler arası dar ferahlık (tipografik estetik için)
          },
        }}
      >
        {/* ── 1. Sekme: Mağaza ────────────────────────────────────────────── */}
        <Tabs.Screen
          name="magaza" // Eşleşen expo-router dosya yolu: 'src/app/magaza.tsx'
          options={{
            title: 'Mağaza', // Alt menü barında ikonun hemen altında yer alacak başlık adı
            tabBarIcon: ({ color, size }) => (
              // İçerikle bağlantılı ve işlevsellik katması amacıyla bir mağaza ikonu kullanıyoruz
              <MaterialCommunityIcons name="store" color={color} size={size} />
            ),
          }}
        />

        {/* ── 2. Sekme: Ana Sayfa ─────────────────────────────────────────── */}
        <Tabs.Screen
          name="index" // Eşleşen expo-router dosya yolu: 'src/app/index.tsx' (Kök dizin giriş sayfası)
          options={{
            title: 'Ana Sayfa', // Alt menü barı başlık adı
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
            title: 'Asistan', // Alt menü barı başlık adı
            tabBarIcon: ({ color, size }) => (
              // Yapay zeka modülünü veya iletişim asistanını andıran simge
              <MaterialIcons name="assistant" color={color} size={size} />),
          }}
        />

        {/* ── Gizli Rota: Explore (Eski projeden kalma veya bağımsız sayfa) ─ */}
        <Tabs.Screen
          name="explore" // Eşleşen expo-router dosya yolu: 'src/app/explore.tsx'
          // 'href: null' propertysi verilerek bu ekranın sekme navigasyonunda bir buton olarak listelenmesinin aktif olarak önüne geçilir.
          options={{ href: null }}
        />

        {/* ── Mantıksal Stack Ekranı: Profil ──────────────────────────────── */}
        <Tabs.Screen
          name="profile" // Eşleşen expo-router dosya yolu: 'src/app/profile.tsx'
          options={{
            title: 'Profil',
            // 'href: null' değeri profil sekmesinin fiziksel bir sekme butonu (tab icon) oluşturmasını engeller.
            // Bu sayede profile sadece uygulama içerisindeki bir Header yönlendirmesinden (router.push) girilebilir ve normal bir stack sayfasıymış gibi tepki verir.
            href: null,
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
