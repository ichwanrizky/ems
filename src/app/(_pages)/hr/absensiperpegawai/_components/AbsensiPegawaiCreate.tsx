"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { createAbsensiPerpegawai } from "../_libs/action";
import { isLoadingProps } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  pegawai: {
    id: number;
    nama: string;
  };
};

export default function AbsensiPegawaiCreate(props: Props) {
  const { isOpen, onClose, date, pegawai } = props;

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    date: date,
    pegawai_id: pegawai.id,
    absen_masuk: "" as string,
    absen_pulang: "" as string,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createAbsensiPerpegawai(formData as any);
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
    }

    return;
  };

  return (
    <Modal
      modalTitle="ADD DATA"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label htmlFor="date" className="form-label">
          TANGGAL ABSEN
        </label>
        <input type="text" className="form-control" disabled value={date} />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="pegawai" className="form-label">
          PEGAWAI
        </label>
        <input
          type="text"
          className="form-control"
          disabled
          value={pegawai.nama}
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="absen_masuk" className="form-label">
          ABSEN MASUK
        </label>
        <input
          type="time"
          className="form-control"
          step="1"
          value={formData.absen_masuk || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              absen_masuk: e.target.value,
            });
          }}
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="absen_pulang" className="form-label">
          ABSEN PULANG
        </label>
        <input
          type="time"
          className="form-control"
          step="1"
          value={formData.absen_pulang || ""}
          onChange={(e) => {
            setFormData({
              ...formData,
              absen_pulang: e.target.value,
            });
          }}
        />
      </div>
    </Modal>
  );
}
