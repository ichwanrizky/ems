"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Papan tanda tangan: coret di canvas ATAU unggah pindaian.
 *
 * Keduanya berakhir sebagai Blob PNG yang identik bentuknya, jadi pemanggilnya
 * cuma mengenal satu hal — "gambar tanda tangan yang siap diunggah". Backend
 * yang kemudian membuang latar terangnya dan memangkasnya ke coretan (lihat
 * Support\TandaTangan), sekali saat disimpan, bukan di setiap tempat yang
 * menampilkannya.
 *
 * ## Kenapa coretan disimpan sebagai daftar titik, bukan langsung di canvas
 *
 * Canvas itu piksel: begitu digambar, tidak ada cara membatalkan satu goresan
 * tanpa menyimpan salinan seluruh gambar sebelum tiap goresan. Menyimpan
 * titiknya membuat UNDO cuma membuang elemen terakhir lalu menggambar ulang —
 * dan sekaligus menyelesaikan masalah kedua: canvas yang berubah lebar (ganti
 * orientasi ponsel, sidebar dibuka) kehilangan isinya, sementara daftar titik
 * bisa digambar ulang di ukuran berapa pun.
 *
 * ## Kenapa Pointer Events, bukan mouse + touch terpisah
 *
 * Satu himpunan event untuk mouse, jari, dan pena. Menanganinya terpisah
 * berarti garis ganda di perangkat yang mengirim keduanya — dan justru
 * perangkat itu (laptop layar sentuh) yang paling mungkin dipakai orang untuk
 * menandatangani.
 */

type Titik = { x: number; y: number };

type Props = {
  /** Dipanggil setiap gambarnya berubah. null = kosong / dibatalkan. */
  onChange: (blob: Blob | null) => void;
  /**
   * URL gambar yang sudah tersimpan, untuk mode edit. Ditampilkan sebagai
   * pratinjau sampai orang memilih menggambar ulang atau mengunggah baru —
   * menyunting nama tidak mengharuskan tanda tangannya digambar ulang.
   */
  awal?: string | null;
  error?: string;
};

/** Tinggi papan dalam px CSS. Lebarnya mengikuti lebar induknya. */
const TINGGI = 180;

/** Batas unggah, sama dengan yang ditegakkan backend. */
const MAKS_BYTE = 4 * 1024 * 1024;

/**
 * PNG dan JPG saja — sengaja tanpa WEBP.
 *
 * Build GD di image backend tidak membawa `imagecreatefromwebp`, jadi WEBP yang
 * lolos dari sini akan gagal di server, bukan di form. Menawarkannya di sini
 * cuma memindahkan kegagalannya ke tempat yang lebih jauh dari orangnya.
 */
const TIPE_DITERIMA = ["image/png", "image/jpeg"];

export default function TtdPad({ onChange, awal = null, error }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wadahRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  /** Semua goresan; tiap goresan sederet titik dalam px CSS. */
  const goresanRef = useRef<Titik[][]>([]);
  const sedangRef = useRef<Titik[] | null>(null);

  // Mode tampilan. "awal" = masih memakai gambar tersimpan (edit), "gambar" =
  // canvas, "unggah" = berkas yang dipilih orang.
  const [mode, setMode] = useState<"awal" | "gambar" | "unggah">(
    awal ? "awal" : "gambar"
  );
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [namaBerkas, setNamaBerkas] = useState("");
  const [gagal, setGagal] = useState("");
  const [adaCoretan, setAdaCoretan] = useState(false);

  /** Objek URL pratinjau dibebaskan saat diganti — kalau tidak, ia bocor. */
  useEffect(() => {
    return () => {
      if (pratinjau) URL.revokeObjectURL(pratinjau);
    };
  }, [pratinjau]);

  /**
   * Samakan ukuran backing store canvas dengan ukuran tampilnya dikali rasio
   * piksel layar, lalu gambar ulang seluruh goresan.
   *
   * Tanpa perkalian itu, garis terlihat kabur di layar beresolusi tinggi —
   * termasuk di hampir semua ponsel, yang justru perangkat paling wajar untuk
   * menandatangani dengan jari.
   */
  const gambarUlang = useCallback(() => {
    const canvas = canvasRef.current;
    const wadah = wadahRef.current;

    if (!canvas || !wadah) return;

    const lebar = wadah.clientWidth || 1;
    const rasio = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(lebar * rasio)) {
      canvas.width = Math.round(lebar * rasio);
      canvas.height = Math.round(TINGGI * rasio);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(rasio, 0, 0, rasio, 0, 0);
    // Bukan diisi putih: latar transparan itu yang dicetak menumpang garis
    // nama di PDF. Kotak putih akan menutupi garis itu.
    ctx.clearRect(0, 0, lebar, TINGGI);

    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const semua = sedangRef.current
      ? [...goresanRef.current, sedangRef.current]
      : goresanRef.current;

    for (const goresan of semua) {
      if (goresan.length === 0) continue;

      ctx.beginPath();

      if (goresan.length === 1) {
        // Satu ketukan tanpa geser tetap harus meninggalkan bekas — titik di
        // atas "i" sering begitu.
        ctx.arc(goresan[0].x, goresan[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#1a1a1a";
        ctx.fill();
        continue;
      }

      ctx.moveTo(goresan[0].x, goresan[0].y);
      for (let i = 1; i < goresan.length; i++) {
        ctx.lineTo(goresan[i].x, goresan[i].y);
      }
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    gambarUlang();

    const wadah = wadahRef.current;
    if (!wadah || typeof ResizeObserver === "undefined") return;

    const pengamat = new ResizeObserver(() => gambarUlang());
    pengamat.observe(wadah);

    return () => pengamat.disconnect();
  }, [gambarUlang, mode]);

  /** Kirim isi canvas ke pemanggil sebagai PNG. */
  const kirimCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || goresanRef.current.length === 0) {
      onChange(null);
      return;
    }

    canvas.toBlob((blob) => onChange(blob), "image/png");
  }, [onChange]);

  const posisi = (e: React.PointerEvent<HTMLCanvasElement>): Titik => {
    const kotak = e.currentTarget.getBoundingClientRect();

    return { x: e.clientX - kotak.left, y: e.clientY - kotak.top };
  };

  const mulai = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Tombol kanan/tengah tidak menggambar apa pun.
    if (e.button !== 0 && e.pointerType === "mouse") return;

    // Pointer dikunci ke canvas supaya goresan tidak putus saat jari atau
    // kursor melewati tepinya — tanpa ini, tanda tangan yang agak lebar
    // terpotong di tengah tanpa sebab yang terlihat.
    e.currentTarget.setPointerCapture(e.pointerId);

    setGagal("");
    sedangRef.current = [posisi(e)];
    gambarUlang();
  };

  const geser = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!sedangRef.current) return;

    sedangRef.current.push(posisi(e));
    gambarUlang();
  };

  const selesai = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!sedangRef.current) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    goresanRef.current = [...goresanRef.current, sedangRef.current];
    sedangRef.current = null;

    setAdaCoretan(true);
    gambarUlang();
    kirimCanvas();
  };

  const bersihkan = () => {
    goresanRef.current = [];
    sedangRef.current = null;
    setAdaCoretan(false);
    gambarUlang();
    onChange(null);
  };

  const batalkanSatu = () => {
    goresanRef.current = goresanRef.current.slice(0, -1);
    setAdaCoretan(goresanRef.current.length > 0);
    gambarUlang();
    kirimCanvas();
  };

  const pilihBerkas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const berkas = e.target.files?.[0];

    // Input dikosongkan supaya memilih berkas yang SAMA dua kali tetap memicu
    // change — kalau tidak, mencoba ulang setelah pesan galat tidak bereaksi.
    e.target.value = "";

    if (!berkas) return;

    if (!TIPE_DITERIMA.includes(berkas.type)) {
      setGagal("Gambar harus PNG atau JPG");
      return;
    }

    if (berkas.size > MAKS_BYTE) {
      setGagal("Ukuran gambar maksimal 4 MB");
      return;
    }

    setGagal("");
    setNamaBerkas(berkas.name);
    setPratinjau(URL.createObjectURL(berkas));
    setMode("unggah");
    onChange(berkas);
  };

  const kembaliMenggambar = () => {
    setPratinjau(null);
    setNamaBerkas("");
    setGagal("");
    setMode("gambar");
    // Goresan sebelumnya sengaja dipertahankan: orang yang salah pilih berkas
    // dan kembali ke canvas tidak kehilangan tanda tangan yang sudah dibuat.
    onChange(null);
    if (goresanRef.current.length > 0) {
      // Dikirim setelah canvas dipasang ulang oleh render berikutnya.
      setTimeout(kirimCanvas, 0);
    }
  };

  const pesanGagal = gagal || error;

  return (
    <div className="form-group mb-3">
      <label className="form-label">TANDA TANGAN</label>

      {mode === "awal" && (
        <div
          className={`border rounded p-3 text-center${
            pesanGagal ? " border-danger" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={awal ?? ""}
            alt="Tanda tangan tersimpan"
            style={{ maxHeight: TINGGI - 40, maxWidth: "100%" }}
          />
          <div className="text-muted small mt-2">
            Tanda tangan tersimpan. Biarkan apa adanya kalau tidak ingin diubah.
          </div>
        </div>
      )}

      {mode === "gambar" && (
        <div
          ref={wadahRef}
          className={`border rounded bg-light position-relative${
            pesanGagal ? " border-danger" : ""
          }`}
          style={{ height: TINGGI }}
        >
          {!adaCoretan && (
            <div
              className="position-absolute top-50 start-50 translate-middle text-muted small pe-none"
              style={{ userSelect: "none" }}
            >
              Tanda tangan di sini
            </div>
          )}

          <canvas
            ref={canvasRef}
            onPointerDown={mulai}
            onPointerMove={geser}
            onPointerUp={selesai}
            onPointerCancel={selesai}
            style={{
              width: "100%",
              height: TINGGI,
              display: "block",
              cursor: "crosshair",
              // Tanpa ini, menggeser jari di atas canvas menggulung halaman
              // alih-alih menggambar.
              touchAction: "none",
            }}
          />
        </div>
      )}

      {mode === "unggah" && pratinjau && (
        <div
          className={`border rounded p-3 text-center${
            pesanGagal ? " border-danger" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pratinjau}
            alt="Pratinjau tanda tangan"
            style={{ maxHeight: TINGGI - 40, maxWidth: "100%" }}
          />
          <div className="text-muted small mt-2 text-break">{namaBerkas}</div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mt-2">
        {mode === "gambar" ? (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={batalkanSatu}
              disabled={!adaCoretan}
            >
              <i className="fas fa-undo me-1" /> Undo
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={bersihkan}
              disabled={!adaCoretan}
            >
              <i className="fas fa-eraser me-1" /> Bersihkan
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={kembaliMenggambar}
          >
            <i className="fas fa-pen me-1" /> Gambar sendiri
          </button>
        )}

        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => fileRef.current?.click()}
        >
          <i className="fas fa-upload me-1" /> Unggah gambar
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="d-none"
          onChange={pilihBerkas}
        />
      </div>

      {pesanGagal ? (
        <div className="invalid-feedback d-block">{pesanGagal}</div>
      ) : (
        <small className="text-muted">
          Latar terang dibuang otomatis, jadi pindaian di atas kertas putih
          boleh langsung diunggah.
        </small>
      )}
    </div>
  );
}
