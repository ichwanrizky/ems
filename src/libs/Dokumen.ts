/**
 * Helper bersama dokumen Sales — quotation, PO masuk, PO keluar.
 *
 * ## Kenapa di `libs/`, bukan di `_libs/` masing-masing modul
 *
 * Keduanya sudah pernah digandakan sekali dan itu mahal. Sebelum modul
 * quotation dirapikan, TIGA komponen memegang salinan `Intl.NumberFormat`-nya
 * sendiri yang sama persis dan semuanya mengunci `"IDR"` — begitu mata uang
 * berhenti selalu rupiah, yang terlewat mencetak "Rp" di atas angka dolar tanpa
 * ada yang menyadarinya. Salinannya lalu dipusatkan ke satu fungsi di dalam
 * modul quotation.
 *
 * Sekarang modul PO butuh keduanya juga. Menyalin `uang()` ke `_libs/skema.ts`
 * milik PO akan mengulang persis kesalahan yang sama, cuma satu tingkat lebih
 * tinggi: dua modul dengan dua salinan, dan perbaikan di satu tempat tidak
 * pernah sampai ke tempat lain.
 *
 * `sales/quotation/_libs/skema.ts` MENERUSKAN keduanya (`export { uang }`), jadi
 * komponen yang sudah ada tidak perlu diubah dan tidak ada dua jalan impor yang
 * harus dipilih.
 *
 * Sengaja bukan `"server-only"` maupun `"use server"`: ini fungsi murni tanpa
 * akses apa pun, dipakai komponen client (`QuotationForm`, `PoKeluarForm`)
 * maupun server action.
 */

/**
 * Locale mengikuti mata uang, bukan selalu id-ID: "US$ 1.250,50" gaya Indonesia
 * salah baca sejuta kali lipat bagi pembaca yang memang memakai dolar.
 */
const LOCALE: Record<string, string> = {
  IDR: "id-ID",
  USD: "en-US",
  SGD: "en-SG",
};

/**
 * Nominal beserta mata uangnya — satu-satunya pemformat uang di modul Sales.
 *
 * Jangan membuat `Intl.NumberFormat` sendiri di komponen; lihat catatan di atas.
 */
export const uang = (nilai: number, currency: string = "IDR") => {
  const kode = (currency || "IDR").toUpperCase();
  const n = Number.isFinite(nilai) ? nilai : 0;

  return new Intl.NumberFormat(LOCALE[kode] ?? "en-US", {
    style: "currency",
    currency: kode,
    // Pecahan ditampilkan hanya kalau memang ada. Dokumen rupiah hampir selalu
    // bulat, dan ",00" di tiap baris cuma kebisingan; dokumen dolar justru
    // sering bersen, dan membulatkannya menyembunyikan selisih.
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
};

/**
 * Nomor dokumen → segmen URL: `001/QUO/PJ/IX/2026` → `001-QUO-PJ-IX-2026`.
 *
 * Dipakai untuk tautan PDF, yang dikunci nomor dan bukan id karena tautannya
 * terlihat orang — muncul di address bar, disalin ke chat, jadi nama berkas
 * unduhan.
 *
 * Garis miringnya diganti strip, BUKAN di-`encodeURIComponent`: `%2F` di dalam
 * path ditolak sebagian proxy dan dinormalkan sebagian yang lain, jadi tautannya
 * akan hidup-mati tergantung apa yang berdiri di depan aplikasi. Backend
 * mencocokkan ke arah sebaliknya (`REPLACE`), jadi penggantian ini tidak perlu
 * bisa dibalik.
 *
 * SPASI ikut jadi strip, bukan dibuang. Empat nomor quotation hasil impor
 * sistempanji memuat spasi di segmen kode customer (`PJ-Q-BRI KCP-24-0068`);
 * membuangnya menghasilkan `PJ-Q-BRIKCP-…` yang tidak cocok dengan `REPLACE` di
 * backend, dan keempat dokumen itu tidak akan pernah bisa dicetak.
 */
export const nomorKeSlug = (nomor: string) =>
  nomor
    .trim()
    .replace(/[/\s]+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "");
