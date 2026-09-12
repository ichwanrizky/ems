"use client";

import Modal from "@/components/Modal";
import { CustomerProps } from "@/types";
import { useState } from "react";
import { CustomerFormProps, editCustomer } from "../_libs/action";
import { ErrorForm, validasiCustomer } from "../_libs/skema";
import CustomerFields from "./CustomerFields";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  customerEdit: CustomerProps;
};

export default function CustomerEdit({ isOpen, onClose, customerEdit }: Props) {
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState<CustomerFormProps>({
    kode: customerEdit.kode || "",
    nama_customer: customerEdit.nama_customer || "",
    alamat: customerEdit.alamat || "",
    telp: customerEdit.telp || "",
    email: customerEdit.email || "",
  });
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const periksa = validasiCustomer(formData);

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
      const result = await editCustomer({ ...formData, id: customerEdit.id });
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
      modalTitle="EDIT CUSTOMER"
      size="modal-lg"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      {/* Kode lama sudah ada dan dipakai dokumen, jadi tidak pernah dikunci. */}
      <CustomerFields
        formData={formData}
        setFormData={setFormData}
        error={errorForm}
        kodeTerbuka
      />
    </Modal>
  );
}
