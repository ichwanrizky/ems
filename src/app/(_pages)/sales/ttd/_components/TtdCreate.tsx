"use client";

import Modal from "@/components/Modal";
import { useState } from "react";
import { createTtd, TtdFormProps, unggahGambarTtd } from "../_libs/action";
import { ErrorForm, validasiTtd } from "../_libs/skema";
import TtdFields from "./TtdFields";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const KOSONG: Omit<TtdFormProps, "gambar_uuid"> = {
  nama: "",
  jabatan: "",
};

export default function TtdCreate({ isOpen, onClose }: Props) {
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState(KOSONG);
  const [gambar, setGambar] = useState<Blob | null>(null);
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Divalidasi di sini dulu supaya kesalahan ketik tidak perlu perjalanan ke
    // server. Server action menjalankan skema yang SAMA lagi — ini percepatan,
    // bukan gerbangnya.
    const periksa = validasiTtd(formData);
    const error: ErrorForm = periksa.sukses ? {} : periksa.error;

    if (!gambar) {
      error.gambar = "Tanda tangan wajib digambar atau diunggah";
    }

    if (Object.keys(error).length > 0) {
      setErrorForm(error);
      setAlertModal({
        status: true,
        color: "danger",
        message: "Periksa kembali isian form",
        subMessage: "",
      });
      return;
    }

    setErrorForm({});

    if (!confirm("Submit this data?")) return;

    setIsLoadingSubmit(true);
    try {
      // Gambarnya lebih dulu: barisnya baru boleh lahir kalau berkasnya sudah
      // benar-benar ada di penyimpanan. Urutan sebaliknya menghasilkan tanda
      // tangan tanpa gambar setiap kali unggahannya gagal.
      const form = new FormData();
      form.append("gambar", gambar as Blob, "ttd.png");

      const unggah = await unggahGambarTtd(form);

      if (!unggah.status || !unggah.uuid) {
        setAlertModal({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: unggah.message,
        });
        setIsLoadingSubmit(false);
        return;
      }

      const result = await createTtd({ ...formData, gambar_uuid: unggah.uuid });

      if (result.status) {
        setAlertModal({
          status: true,
          color: "success",
          message: "Success",
          subMessage: result.message,
        });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        if (result.error) setErrorForm(result.error);
        setAlertModal({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
        setIsLoadingSubmit(false);
      }
    } catch (error) {
      setAlertModal({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
      setIsLoadingSubmit(false);
    }
  };

  return (
    <Modal
      modalTitle="ADD TANDA TANGAN"
      size="modal-lg"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <TtdFields
        formData={formData}
        setFormData={setFormData}
        onGambar={setGambar}
        error={errorForm}
      />
    </Modal>
  );
}
