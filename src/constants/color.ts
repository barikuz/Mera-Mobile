// Mera tasarım sistemi renk token'ları (tailwind.config.js dosyasıyla birebir uyumludur)
export const COLORS = {
  // Açık (Light) tema renkleri
  light: {
    tabBarBackground: "#F8FAFC", // Uygulama zemin arka plan rengi (mera-neutral-100)
    tabBarBorder: "#E2E8F0", // Sekme çubuğu üst sınır çizgisi (mera-neutral-200)
    iconActive: "#192655", // Aktif (seçili) sekme ikonu rengi (mera-primary)
    iconInactive: "#64748B", // Pasif (seçili olmayan) sekme ikonu rengi (mera-neutral-500)
    labelActive: "#192655", // Aktif sekme metni rengi
    labelInactive: "#64748B", // Pasif sekme metni rengi
  },
  // Karanlık (Dark) tema renkleri
  dark: {
    tabBarBackground: "#0F162A", // Karanlık mod uygulama zemin rengi (mera-neutral-950)
    tabBarBorder: "#1E2A45", // Keskinliği azaltmak ve derinlik katmak adına arka plandan çok hafif daha açık bir ton
    iconActive: "#E1AA74", // Aktif sekme ikonu rengi (Koyu lacivert üzerinde dikkat çeken sıcak vurgu rengi - mera-accent)
    iconInactive: "#64748B", // Pasif sekme ikonu rengi (mera-neutral-500)
    labelActive: "#E1AA74", // Aktif sekme metni rengi
    labelInactive: "#64748B", // Pasif sekme metni rengi
  },
} as const;
