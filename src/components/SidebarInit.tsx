"use client";

import { gayaSidebar } from "@/libs/Theme";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Perilaku navigasi template WorkLoad tanpa metisMenu/jQuery: accordion sidebar,
 * penandaan menu aktif berdasarkan URL, dan tombol hamburger.
 * metisMenu asli memodifikasi DOM yang dimiliki React, jadi sengaja tidak dipakai.
 */
export default function SidebarInit() {
  const pathname = usePathname();

  /* Ikuti lebar layar seperti settings.js bawaan template. */
  useEffect(() => {
    let gayaSekarang = "";

    const terapkan = () => {
      const gaya = gayaSidebar(window.innerWidth);
      if (gaya === gayaSekarang) return;

      /*
       * Arti `menu-toggle` berkebalikan antar gaya: di "full"/"mini" artinya
       * sidebar terlipat, di "overlay" artinya sidebar terbuka. Kalau kelasnya
       * dibawa saat gaya berganti, sidebar jadi terbuka/tertutup terbalik.
       */
      document.getElementById("main-wrapper")?.classList.remove("menu-toggle");
      document
        .querySelectorAll<HTMLElement>(".hamburger")
        .forEach((h) => h.classList.remove("is-active"));

      document.body.setAttribute("data-sidebar-style", gaya);
      gayaSekarang = gaya;
    };

    terapkan();
    window.addEventListener("resize", terapkan);
    return () => window.removeEventListener("resize", terapkan);
  }, []);

  useEffect(() => {
    const wrapper = document.getElementById("main-wrapper");
    const nav = document.getElementById("menu");
    if (!nav) return;

    const tutupSemua = () => {
      nav.querySelectorAll<HTMLLIElement>("li").forEach((li) => {
        li.classList.remove("mm-active");
      });
      nav.querySelectorAll<HTMLUListElement>("li > ul").forEach((ul) => {
        ul.classList.add("mm-collapse");
        ul.classList.remove("mm-show");
      });
      nav.querySelectorAll<HTMLAnchorElement>("a.has-arrow").forEach((a) => {
        a.setAttribute("aria-expanded", "false");
      });
    };

    const bukaMenuAktif = () => {
      const tautan = Array.from(
        nav.querySelectorAll<HTMLAnchorElement>("li a[href]:not(.has-arrow)")
      )
        .filter((a) => {
          const href = a.getAttribute("href");
          if (!href || href === "#" || href.startsWith("javascript:")) return false;
          return pathname === a.pathname || pathname.startsWith(`${a.pathname}/`);
        })
        .sort((a, b) => b.pathname.length - a.pathname.length);

      const aktif = tautan[0];
      if (!aktif) return;

      aktif.classList.add("mm-active");

      let li = aktif.closest<HTMLLIElement>("li");
      while (li) {
        li.classList.add("mm-active");

        const submenu = li.querySelector<HTMLUListElement>(":scope > ul");
        if (submenu) {
          submenu.classList.add("mm-collapse", "mm-show");
          li.querySelector<HTMLAnchorElement>(":scope > a")?.setAttribute(
            "aria-expanded",
            "true"
          );
        }

        li = li.parentElement?.closest<HTMLLIElement>("li") ?? null;
      }
    };

    const klikGrup = (event: Event) => {
      const trigger = event.currentTarget as HTMLAnchorElement;
      const li = trigger.closest<HTMLLIElement>("li");
      const submenu = li?.querySelector<HTMLUListElement>(":scope > ul");
      if (!li || !submenu) return;

      event.preventDefault();

      const buka = !submenu.classList.contains("mm-show");

      /* Accordion: tutup saudara sebaya pada level yang sama. */
      Array.from(li.parentElement?.children ?? []).forEach((el) => {
        if (el === li) return;
        el.classList.remove("mm-active");
        el.querySelectorAll<HTMLUListElement>(":scope > ul").forEach((ul) => {
          ul.classList.add("mm-collapse");
          ul.classList.remove("mm-show");
        });
        el.querySelectorAll<HTMLAnchorElement>(":scope > a.has-arrow").forEach((a) => {
          a.setAttribute("aria-expanded", "false");
        });
      });

      li.classList.toggle("mm-active", buka);
      submenu.classList.add("mm-collapse");
      submenu.classList.toggle("mm-show", buka);
      trigger.setAttribute("aria-expanded", buka ? "true" : "false");
    };

    const toggleSidebar = (event: Event) => {
      event.preventDefault();
      wrapper?.classList.toggle("menu-toggle");
      document
        .querySelectorAll<HTMLElement>(".hamburger")
        .forEach((h) => h.classList.toggle("is-active"));
    };

    /* Di layar kecil sidebar menutupi konten — tutup setelah menu dipilih. */
    const tutupSetelahPilih = () => {
      if (gayaSidebar(window.innerWidth) !== "overlay") return;
      wrapper?.classList.remove("menu-toggle");
      document
        .querySelectorAll<HTMLElement>(".hamburger")
        .forEach((h) => h.classList.remove("is-active"));
    };

    tutupSemua();
    bukaMenuAktif();

    const pemicuGrup = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("a.has-arrow")
    );
    const tombolToggle = Array.from(
      document.querySelectorAll<HTMLElement>(".nav-control")
    );
    const tautanDaun = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("li a[href]:not(.has-arrow)")
    );

    pemicuGrup.forEach((a) => a.addEventListener("click", klikGrup));
    tombolToggle.forEach((b) => b.addEventListener("click", toggleSidebar));
    tautanDaun.forEach((a) => a.addEventListener("click", tutupSetelahPilih));

    return () => {
      pemicuGrup.forEach((a) => a.removeEventListener("click", klikGrup));
      tombolToggle.forEach((b) => b.removeEventListener("click", toggleSidebar));
      tautanDaun.forEach((a) => a.removeEventListener("click", tutupSetelahPilih));
    };
  }, [pathname]);

  return null;
}
