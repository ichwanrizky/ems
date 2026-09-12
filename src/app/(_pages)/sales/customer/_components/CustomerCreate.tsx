"use client";

import Modal from "@/components/Modal";
import { useState } from "react";
import { createCustomer, CustomerFormProps } from "../_libs/action";
import { ErrorForm, validasiCustomer } from "../_libs/skema";
import CustomerFields from "./CustomerFields";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const KOSONG: CustomerFormProps = {
  kode: "",
  nama_customer: "",
  alamat: "",
  telp: "",
  email: "",
};

export default function CustomerCreate({ isOpen, onClose }: Props) {
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState<CustomerFormProps>(KOSONG);
  const [errorForm, setErrorForm] = useState<ErrorForm>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Divalidasi di sini dulu supaya kesalahan ketik tidak perlu perjalanan ke
    // server. Server action menjalankan skema yang SAMA lagi — ini percepatan,
    // bukan gerbangnya.
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
      const result = await createCustomer(formData);
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
      modalTitle="ADD CUSTOMER"
      size="modal-lg"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <CustomerFields
        formData={formData}
        setFormData={setFormData}
        error={errorForm}
      />
    </Modal>
  );
}
