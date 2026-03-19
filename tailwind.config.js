/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mera: {
          primary: '#192655',   // Ana Renk
          accent: '#E1AA74',    // Vurgu Rengi

          // Nötr Tonlar (Metinler, Kenarlıklar ve Arka Planlar için)
          neutral: {
            100: '#F8FAFC', // Uygulama ana arka planı (Çok açık gri)
            200: '#E2E8F0', // Kart kenarlıkları (Border) ve ayırıcı çizgiler
            500: '#64748B', // Alt metinler, tarihler ve pasif ikonlar
            900: '#0F172A', // Ana başlıklar ve temel okuma metinleri (Neredeyse siyah)
            950: '#0F162A', // Karanlık mod uygulama arka planı (Derin lacivert-siyah)
          },

          // Durum Renkleri (Geri bildirimler için)
          status: {
            success: '#10B981', // Başarılı işlemler (Örn: Kayıt başarılı)
            error: '#EF4444',   // Hatalar (Örn: Yanlış şifre)
            warning: '#F59E0B', // Uyarılar (Örn: Fırtına beklentisi)
            info: '#3B82F6',    // Bilgilendirmeler (Örn: Yeni güncelleme)
          }
        }

      },
      fontFamily: {
        inter: ["Inter-Regular"],
        "inter-semibold": ["Inter-SemiBold"],
        "inter-bold": ["Inter-Bold"],
      }
    },
  },
  plugins: [],
}