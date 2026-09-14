"use client";

import Modal from "@/components/Modal";
import { useState } from "react";
import { createPoMasuk, PoMasukFormProps } from "../_libs/action";
import { ErrorForm, validasiPoMasuk } from "../_libs/skema";
import PoMasukFields from "./PoMasukFields";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/** Tanggal hari ini sebagai "YYYY-MM-DD" memakai komponen LOKAL (WIB). */
const hariIni = () => {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
};

const KOSONG = (): PoMasukFormProps => ({
  nomor: "",
  tanggal: hariIni(),
  customer_id: "",
  quotation_id: null,
  perihal: "",
  requestor: "",
  // "" dan bukan 0: PO tanpa nominal itu hal biasa, dan nol yang dipaksakan
  // terbaca sebagai "PO senilai nol" di daftar.
  nilai: "",
  currency: "IDR",
  catatan: "",
  berkas: [],
});

export default function PoMasukCreate({ isOpen, onClose }: Props) {
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState<PoMasukFormProps>(KOSONG);
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Divalidasi di sini dulu supaya kesalahan ketik tidak perlu perjalanan ke
    // server. Server action menjalankan skema yang SAMA lagi — ini percepatan,
    // bukan gerbangnya.
    const periksa = validasiPoMasuk(formData);

    if (!periksa.sukses) {
      setErrorForm(periksa.error);
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
      const result = await createPoMasuk(formData);
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
      modalTitle="ADD PO MASUK"
      size="modal-lg"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <PoMasukFields
        formData={formData}
        setFormData={setFormData}
        error={errorForm}
      />
    </Modal>
  );
}
