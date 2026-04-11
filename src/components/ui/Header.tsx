import { COLORS } from "@/constants/color";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

// Header bileşenine dışarıdan iletilebilecek (prop) türlerinin tanımı
interface HeaderProps {
  // Kullanıcının profil resminin URL'si (varsa). İsteğe bağlı (optional).
  avatarUrl?: string | null;
  // Sadece belirli ekranlarda solda sepet butonu göstermek için kullanılır.
  showCartButton?: boolean;
}

export default function Header({
  avatarUrl: propAvatarUrl,
  showCartButton = false,
}: HeaderProps) {
  // Cihazın durum çubuğu/çentik (notch) gibi güvenli alanlarının ölçülerini alır
  const insets = useSafeAreaInsets();

  // Cihazın veya uygulamanın o anki renk temasını (açık/koyu) elde eder
  const scheme = useColorScheme();

  // Expo Router yönlendirme kancası (hook), sayfa içi geçişler için kullanılır
  const router = useRouter();

  const handleProfilePress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  // NOT: Proje genelinde henüz kurulu bir Supabase Auth sistemi bulunamadığından
  // standart bir Supabase doğrulama mantığını temsil edecek yer tutucu (placeholder) değişkenler eklendi.
  // Gerçek auth state'i entegre edildiğinde `user` değişkenini sisteminizdeki karşılığıyla değiştirin.
  const user = null;
  // user objesi doluysa (truthy) giriş yapılmış kabul edilir, aksi halde false döndürür
  const isAuthenticated = !!user;

  // Öncelikle dışarıdan gelen prop değerini (propAvatarUrl) tercih eder,
  // yoksa null kullanarak placeholder ikona dönülmesini sağlar (simüle edilmiş state).
  const avatarUrl = propAvatarUrl || null;

  // Tema belirsizse (unspecified/null) hatayı önlemek adına 'light' olarak garantileme yapar
  const currentScheme = scheme === "dark" ? "dark" : "light";
  // İlgili tema şemasındaki (açık veya koyu) tasarım sistemine ait renkleri Layout'tan (COLORS) alır
  const themeColors = COLORS[currentScheme];

  return (
    // Header'ın ana kapsayıcısı. Alt çizgi (border-b) ve temaya ait ana arka plan renklerini NativeWind ile ayarlar.
    <View
      className="bg-mera-neutral-100 dark:bg-mera-neutral-950 border-b"
      // Güvenli alan (status bar vb.) boşluğunu paddingTop ile veririz.
      // borderBottomColor değerini ise layout'taki sekme çubuğu kenarlık rengi ile birebir aynı olması için buradan dinamik olarak uygularız.
      style={{
        paddingTop: insets.top,
        borderBottomColor: themeColors.tabBarBorder,
      }}
    >
      {/* Yatay eksende (row) elemanları hizalayıp (items-center) aralarına maksimum boşluk (justify-between) veren içerik sarmalayıcısı */}
      <View className="flex-row items-center justify-between px-4 py-3">
        {/*
          Sol Boşluk Tutucu (Spacer):
          "Mera" başlığının tam ortalanabilmesi için sağdaki profil butonunun (40x40) hizasal ağırlığını
          hesaba katarak solda görünmez bir denge unsuru oluşturur (w-10 h-10 = 40x40 piksel).
        */}
        {showCartButton ? (
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="w-10 h-10 items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="shopping-basket"
              size={24}
              color={themeColors.iconActive}
            />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}

        {/* 
          Ortalanmış Başlık (Center Title): 
          'flex-1' özelliğiyle kalan alanı kaplayarak metni kendi içinde tam merkeze (text-center) oturtur.
          Mera'ya ait ana renk ve Comfortaa-bold font tipi kullanılarak okunaklı marka vurgusu (tracking-wider) yapılmıştır.
        */}
        <Text className="text-2xl font-comfortaa-bold text-mera-primary dark:text-mera-accent tracking-wider text-center flex-1">
          Mera
        </Text>

        {/* 
          Sağ Taraftaki Profil Butonu:
          Dokunulabilir alan. Tıklandığında router.push ile /profile rotasına (stack benzeri ekran) geçiş yapar.
          rounded-full ile tam yuvarlak kesim elde edilir ve overflow-hidden taşan kısımları (örneğin resim) çerçeve içine hapseder. 
        */}
        <TouchableOpacity
          onPress={handleProfilePress}
          className="w-10 h-10 items-center justify-center rounded-full overflow-hidden"
          // Profil butonunun arkaplan rengini, layout'ta kullandığımız sekme çubuğu inaktif ikon rengine doğrudan eşitler
          style={{ backgroundColor: themeColors.iconInactive }}
        >
          {/* 
            Kombineli Koşullu Render (Conditional Branch):
            Kullanıcı eğer kimlik doğrulaması yapmışsa (isAuthenticated === true) VE 
            bir avatar bağlantısı (avatarUrl) geçerliyse, uzak sunucudaki kendi resmini render eder.
          */}
          {isAuthenticated && avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover" // Resmin en-boy oranını bozmadan, deforme etmeden belirlenen alana tam sığdırarak keser
            />
          ) : (
            /* 
              False/Boş Durum (Fallback):
              Kullanıcı henüz giriş yapmamışsa veya avatarı boşsa (simüle edilmiş mevcut mod), 
              #E2E8F0 (mera-neutral-200 / açık gri) renginde varsayılan bir kişi (person) simgesi gösterir.
            */
            <Ionicons name="person" size={20} color="#E2E8F0" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
