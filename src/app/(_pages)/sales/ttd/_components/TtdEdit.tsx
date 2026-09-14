"use client";

import Modal from "@/components/Modal";
import { TtdProps } from "@/types";
import { useState } from "react";
import { editTtd, TtdFormProps, unggahGambarTtd } from "../_libs/action";
import { ErrorForm, validasiTtd } from "../_libs/skema";
import TtdFields from "./TtdFields";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ttdEdit: TtdProps;
};

export default function TtdEdit({ isOpen, onClose, ttdEdit }: Props) {
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState<Omit<TtdFormProps, "gambar_uuid">>({
    nama: ttdEdit.nama ?? "",
    jabatan: ttdEdit.jabatan ?? "",
  });
  // null = gambarnya tidak diganti. Berbeda dengan Create, di sini itu sah:
  // menyunting nama tidak mengharuskan tanda tangannya digambar ulang.
  const [gambar, setGambar] = useState<Blob | null>(null);
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const periksa = validasiTtd(formData);

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
      let uuid = "";

      if (gambar) {
        const form = new FormData();
        form.append("gambar", gambar, "ttd.png");

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

        uuid = unggah.uuid;
      }

      const result = await editTtd({
        ...formData,
        gambar_uuid: uuid,
        id: ttdEdit.id,
      });

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
      modalTitle="EDIT TANDA TANGAN"
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
        gambarAwal={
          ttdEdit.uuid ? `/api/sales/ttd/gambar/${ttdEdit.uuid}` : null
        }
        error={errorForm}
      />
    </Modal>
  );
}
