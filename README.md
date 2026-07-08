# Mera — Mobil Balıkçılık Asistanı

**Mera**, hem amatör hem de profesyonel balıkçılar için tasarlanmış, yapay zeka destekli bir dijital balıkçılık asistanıdır. Kullanıcıların avlanma süreçlerini uçtan uca optimize etmelerini sağlar: akıllı mera önerileri, kişiselleştirilmiş ekipman tavsiyeleri, anlık hava durumu uyarıları, av istatistikleri, interaktif harita keşfi ve dahili bir e-ticaret mağazası tek bir mobil uygulama altında sunulur.

Bu repo, **Expo (React Native)** ile geliştirilmiş olan mobil istemcinin kaynak kodunu içerir. Uygulama, Nest.js tabanlı ortak bir arka uçtan (backend) beslenir.

> **Sürüm:** 1.0.0 — İlk kararlı sürüm APK olarak dağıtıma sunulmuştur.

---

## ✨ Özellikler

| Modül                         | Açıklama                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 📍 **Akıllı Mera Önerileri**  | Bölgeye, hava koşullarına ve mevsime göre AI destekli avlak noktası önerileri.                               |
| 🎣 **Ekipman Tavsiyesi**      | Hedef balık, mera ve avlanma stiline göre en uygun kamış-makine-yem setini oluşturur.                        |
| 🧠 **Teknik İpuçları**        | Av taktikleri, en verimli zamanlar, düğüm/takım önerileri ve uzman ipuçları.                                 |
| ⛅ **Hava Durumu & Güvenlik** | Hiper-yerel anlık hava durumu tahminleri ve balıkçı güvenliği uyarıları.                                     |
| 📊 **Av İstatistikleri**      | Tür, boyut, ağırlık ve konum bilgileriyle kişisel av geçmişi kaydı ve görselleştirme.                        |
| 🗺️ **İnteraktif Mera Keşfi**  | Harita üzerinde meraların görselleştirilmesi ve detaylı bilgi kartları.                                      |
| 🛒 **Dahili Mağaza**          | Balıkçılık malzemelerinin listelendiği, sepet yönetimi ve ödeme entegrasyonlu tek satıcılı e-ticaret bölümü. |
| 🌓 **Açık / Koyu Mod**        | Sistem temasına bağlı otomatik tema desteği.                                                                 |

---

## 🏗️ Teknoloji Yığını

### Ön Yüz (Frontend)

- **[Expo SDK 55](https://expo.dev/)** — React Native 0.83 üzerine kurulu çapraz platform çerçevesi
- **[NativeWind 2](https://www.nativewind.dev/)** — Tailwind CSS 3 → React Native stil köprüsü
- **[TanStack React Query 5](https://tanstack.com/query)** — Veri çekme ve önbellekleme
- **[Zustand 5](https://zustand-demo.pmnd.rs/)** — Sepet, auth ve asistan durum yönetimi
- **[Google Fonts](https://fonts.google.com/)** — Inter (gövde), Comfortaa (marka yazı tipi)

### Arka Uç (Backend)

- **[NestJS](https://nestjs.com/)** — Modüler REST API (ayrı repo)

### Veritabanı ve Altyapı

- **[Supabase](https://supabase.com/)** — PostgreSQL, Auth, Storage
- **[OpenWeather API](https://openweathermap.org/api/one-call-3)** — One Call API 3.0 (hiper-yerel hava durumu)
- **[Google Maps Platform](https://developers.google.com/maps)** — Harita ve konum belirleme hizmetleri
- **[Google Gemini API](https://ai.google.dev/)** — Yapay zeka motoru
- **[iyzico](https://dev.iyzipay.com/)** — Ödeme altyapısı

### Derleme ve Dağıtım

- **[EAS Build](https://docs.expo.dev/build/introduction/)** — Bulut tabanlı APK / AAB derleme (preview profili)
- **[ESLint 9](https://eslint.org/)** — eslint-config-expo ile kod kalitesi kontrolü

---

## 📂 Proje Yapısı

```
Mera-Mobile/
├── assets/images/             # Uygulama ikonu, splash ekranı, favicon
├── lib/
│   └── supabase.ts            # Supabase istemci yapılandırması
├── src/
│   ├── app/                   # Expo Router sayfaları (dosya tabanlı yönlendirme)
│   │   ├── _layout.tsx        # Kök layout (tab navigasyonu, font yükleme, auth guard)
│   │   ├── index.tsx          # Ana ekran (dashboard)
│   │   ├── login.tsx          # Giriş sayfası
│   │   ├── register.tsx       # Kayıt sayfası
│   │   ├── shop.tsx           # Mağaza ürün kataloğu
│   │   ├── cart.tsx           # Alışveriş sepeti
│   │   ├── checkout.tsx       # Ödeme akışı
│   │   ├── orders.tsx         # Sipariş geçmişi
│   │   ├── profile.tsx        # Profil, av istatistikleri ve siparişler
│   │   ├── add-catch.tsx      # Av kaydı ekleme formu
│   │   └── assistant/         # AI Asistan modülü
│   │       ├── _layout.tsx
│   │       ├── index.tsx              # Asistan ana menüsü
│   │       ├── spot-recommendation.tsx  # Mera önerisi
│   │       ├── gear-recommendation.tsx  # Ekipman tavsiyesi
│   │       └── technique-tips.tsx       # Teknik ipuçları
│   ├── components/
│   │   ├── ui/                # 32 adet yeniden kullanılabilir UI bileşeni
│   │   ├── themed-text.tsx    # Tema uyumlu metin bileşeni
│   │   └── themed-view.tsx    # Tema uyumlu görünüm bileşeni
│   ├── constants/             # Renk, harita ve tema sabitleri
│   ├── hooks/                 # 16 adet özel React hook (veri çekme, konum, hava durumu vb.)
│   ├── store/                 # Zustand depoları (auth, cart, assistant)
│   ├── utils/                 # Yardımcı fonksiyonlar (format)
│   └── global.css             # CSS değişkenleri (web çıktısı)
├── app.config.js              # Expo uygulama yapılandırması
├── babel.config.js            # Babel — NativeWind eklentisi
├── eas.json                   # EAS Build profilleri
├── tailwind.config.js         # Tailwind / NativeWind tema tanımları
├── tsconfig.json              # TypeScript yapılandırması (strict, path aliases)
├── .env.example               # Ortam değişkenleri şablonu
└── package.json
```

---

## 🚀 Kurulum ve Çalıştırma

### 1. Depoyu Klonlayın

```bash
git clone <repo-url>
cd Mera-Mobile
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

Kök dizindeki `.env.example` dosyasını kopyalayarak `.env` dosyası oluşturun ve kendi değerlerinizi girin:

```bash
cp .env.example .env
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npx expo start
```

Terminaldeki QR kodu telefondaki Expo Go uygulaması ile tarayarak ya da `a` tuşuna basarak Android Emulator üzerinde uygulamayı açabilirsiniz.

---

## 📦 APK Derleme (EAS Build)

Proje, **EAS Build** ile APK olarak derlenmektedir. `eas.json` dosyasında üç profil tanımlıdır:

| Profil        | Amaç                                   | Dağıtım                       |
| ------------- | -------------------------------------- | ----------------------------- |
| `development` | Dev client ile geliştirme              | Dahili (`internal`)           |
| `preview`     | Test amaçlı APK çıktısı                | Dahili (`internal`) — **APK** |
| `production`  | Mağaza yayını (otomatik sürüm artırma) | Mağaza                        |

### APK Oluşturma

```bash
# EAS CLI yüklü değilse:
npm install -g eas-cli

# Expo hesabına giriş:
eas login

# Preview profili ile APK derle:
eas build --profile preview --platform android
```

Derleme tamamlandığında Expo dashboard üzerinden `.apk` dosyasını indirebilirsiniz.

> **Not:** Preview profili `production` ortam değişkenlerini kullanır (`"environment": "production"`). Derleme öncesi tüm ortam değişkenlerinin EAS Secrets veya `.env` üzerinden sağlandığından emin olun.

---

## 🔗 İlgili Projeler

| Proje            | Açıklama                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| **Mera Backend** | Nest.js tabanlı REST API — AI, mağaza, hava durumu ve ödeme servisleri |
| **Mera Web**     | Next.js tabanlı web istemcisi                                          |

---

## 📝 Lisans

Bu proje özel bir lisans altındadır (UNLICENSED).
