/**
 * Tema dan gaya sidebar template WorkLoad — keduanya cuma atribut `data-*` pada
 * <body>, dan style.css template yang mengerjakan sisanya. Di template aslinya
 * ini ditangani `js/settings.js`; di sini dikumpulkan supaya skrip pra-render
 * dan komponen React memakai sumber yang sama.
 */

export type Tema = "light" | "dark";

/** Kunci localStorage untuk pilihan tema pengguna. */
export const KUNCI_TEMA = "ems-tema";

export const ATRIBUT_TEMA = "data-theme-version";

/** Ambang batas gaya sidebar, mengikuti manageResponsiveSidebar bawaan template. */
export const gayaSidebar = (lebar: number): "overlay" | "mini" | "full" =>
  lebar < 768 ? "overlay" : lebar < 1200 ? "mini" : "full";

export const temaSekarang = (): Tema =>
  document.body.getAttribute(ATRIBUT_TEMA) === "dark" ? "dark" : "light";

export const terapkanTema = (tema: Tema) => {
  document.body.setAttribute(ATRIBUT_TEMA, tema);
  try {
    localStorage.setItem(KUNCI_TEMA, tema);
  } catch {
    /* localStorage bisa ditolak di mode privat — temanya tetap berganti. */
  }
};

/**
 * Dijalankan sebagai skrip inline di awal <body>, sebelum paint pertama, supaya
 * tidak ada kedipan tema terang dulu lalu gelap. Tema tersimpan menang; kalau
 * belum pernah memilih, ikut preferensi sistem.
 */
export const SKRIP_TEMA = `(function(){
var b=document.body,t;
try{t=localStorage.getItem(${JSON.stringify(KUNCI_TEMA)})}catch(e){}
if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}
b.setAttribute(${JSON.stringify(ATRIBUT_TEMA)},t);
var w=window.innerWidth;
b.setAttribute("data-sidebar-style",w<768?"overlay":w<1200?"mini":"full");
})();`;
