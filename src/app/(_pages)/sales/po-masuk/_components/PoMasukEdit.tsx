"use client";

import Modal from "@/components/Modal";
import { PoMasukProps } from "@/types";
import { useState } from "react";
import { editPoMasuk, PoMasukFormProps } from "../_libs/action";
import { ErrorForm, validasiPoMasuk } from "../_libs/skema";
import PoMasukFields from "./PoMasukFields";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  poEdit: PoMasukProps;
};

export default function PoMasukEdit({ isOpen, onClose, poEdit }: Props) {
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState<PoMasukFormProps>({
    nomor: poEdit.nomor || "",
    tanggal: poEdit.tanggal || "",
    customer_id: poEdit.customer?.id ?? "",
    quotation_id: poEdit.quotation?.id ?? null,
    perihal: poEdit.perihal || "",
    requestor: poEdit.requestor || "",
    // `?? ""` — bukan `?? 0`. PO yang memang tanpa nominal tidak boleh berubah
    // jadi "senilai nol" hanya karena barisnya pernah disunting.
    nilai: poEdit.nilai ?? "",
    currency: poEdit.currency || "IDR",
    catatan: poEdit.catatan || "",
    berkas: poEdit.berkas ?? [],
  });
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      const result = await editPoMasuk({ ...formData, id: poEdit.id });
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
      modalTitle={`EDIT PO ${poEdit.nomor}`}
      size="modal-lg"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      {/* Berkas yang dibuang di sini ikut TERHAPUS dari penyimpanan saat
          disimpan — bukan cuma dilepas kaitannya. Berkas yatim yang tidak
          dimiliki baris mana pun tidak akan pernah dicari siapa pun, dan
          membiarkannya berarti folder arsipnya tumbuh tanpa ada yang tahu isinya
          milik apa. */}
      <PoMasukFields
        formData={formData}
        setFormData={setFormData}
        error={errorForm}
      />
    </Modal>
  );
}
