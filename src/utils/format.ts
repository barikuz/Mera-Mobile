/**
 * format — Uygulama genelinde kullanılan biçimlendirme yardımcıları.
 *
 * Tarih ve para birimi gibi sık tekrarlanan biçimlendirmeler
 * burada tek bir noktada tanımlanır; tüm ekranlar ve hook'lar
 * bu modülü import ederek tutarlı çıktı üretir.
 */

// ────────────────────────────────────────────────────────────────
// Para birimi
// ────────────────────────────────────────────────────────────────

/** Türk Lirası para birimi biçimleyicisi (₺1.234,56) */
export const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

/**
 * Sayısal tutarı biçimlendirilmiş TRY para birimi metnine çevirir.
 * Örnek: formatCurrency(5490) → "₺5.490,00"
 */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

// ────────────────────────────────────────────────────────────────
// Tarih
// ────────────────────────────────────────────────────────────────

/**
 * ISO 8601 tarih metnini kullanıcı dostu Türkçe biçime dönüştürür.
 * Supabase/Backend'den gelen timezone suffix'i eksik string'leri
 * otomatik olarak UTC kabul eder.
 *
 * Örnek: formatDate("2026-06-03T18:57:00Z") → "3 Haziran 2026 18:57"
 */
export function formatDate(isoString: string | null): string {
  if (!isoString) return "Tarih bilgisi yok";
  try {
    // ISO 8601 timezone suffixes: Z  |  ±HH:MM  |  ±HHMM
    const normalised =
      /Z$|[+-]\d{2}:?\d{2}$/.test(isoString.trim()) ? isoString : isoString + "Z";
    const d = new Date(normalised);
    if (Number.isNaN(d.getTime())) return "Tarih bilgisi yok";
    return d.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Tarih bilgisi yok";
  }
}
