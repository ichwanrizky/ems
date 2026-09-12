"use client";

import React, { useEffect, useRef } from "react";

/**
 * Textarea yang tingginya mengikuti isinya.
 *
 * ## Kenapa ada
 *
 * Teks di dalam `<textarea>` SELALU mulai dari atas — tidak ada
 * `vertical-align` yang bisa menengahkannya, berbeda dengan `<input>` yang
 * teksnya selalu di tengah kotaknya. Jadi textarea ber-`rows` tetap selalu
 * terlihat "teksnya nempel di atas" dengan ruang kosong menganga di bawah,
 * apalagi di template ini yang inputnya dipatok setinggi 3.5rem.
 *
 * Satu-satunya cara membuatnya terbaca rata tengah adalah menghapus ruang
 * kosongnya: kotaknya dibuat sepas isinya. Saat isinya satu baris, tingginya
 * sama dengan `<input>` di sebelahnya dan — karena padding atas dan bawahnya
 * dihitung simetris di `ems.css` — barisnya jatuh persis di tengah. Saat isinya
 * bertambah, kotaknya ikut tumbuh, jadi tidak pernah ada ruang sisa untuk
 * dipersoalkan.
 *
 * ## Catatan
 *
 * - Tingginya disetel lewat `style.height` inline, jadi `rows` tidak dipakai
 *   sebagai pengatur tinggi — lantainya `min-height` di `.textarea-auto`.
 * - `height: auto` dulu sebelum membaca `scrollHeight`; tanpa itu kotak yang
 *   sudah telanjur tinggi tidak pernah bisa menyusut lagi saat teksnya dihapus.
 * - Komponennya selalu dirender saat terlihat (modal kita `return null` ketika
 *   tertutup), jadi `scrollHeight` tidak pernah terbaca 0 karena `display:none`.
 */
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", value, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const sesuaikan = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";

    // `scrollHeight` = isi + padding, TANPA border. Bootstrap menyetel
    // `box-sizing: border-box` secara global, sehingga `height` yang kita pasang
    // sudah termasuk border — memakai scrollHeight apa adanya menyisakan kotak
    // yang kurang setebal bordernya, dan karena overflow-nya disembunyikan
    // baris terakhir terpotong tipis. Jadi tebal bordernya ditambahkan kembali.
    const gaya = window.getComputedStyle(el);
    const border =
      parseFloat(gaya.borderTopWidth) + parseFloat(gaya.borderBottomWidth);

    el.style.height = `${el.scrollHeight + (Number.isFinite(border) ? border : 0)}px`;
  };

  // Ikut nilai, bukan cuma sekali saat mount: mode edit memuat isinya belakangan,
  // dan reset form mengosongkannya tanpa ada event input sama sekali.
  useEffect(() => {
    if (ref.current) sesuaikan(ref.current);
  }, [value]);

  return (
    <textarea
      {...rest}
      ref={ref}
      className={`form-control textarea-auto ${className}`.trim()}
      value={value}
      rows={1}
      onInput={(e) => sesuaikan(e.currentTarget)}
    />
  );
}
