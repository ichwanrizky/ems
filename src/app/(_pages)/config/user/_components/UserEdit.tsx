"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userEdit:
    | {
        id: number;
        username: string;
        pegawai: {
          id: number;
          nama: string;
          telp: string;
        };
      }
    | null
    | undefined;
};

export default function UserEdit(props: Props) {
  const { isOpen, onClose, userEdit } = props;

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  return (
    <Modal
      modalTitle="EDIT DATA"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      //   onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label htmlFor="nama" className="form-label">
          NAMA
        </label>
        <input type="text" value={userEdit?.pegawai.nama} />
      </div>
    </Modal>
  );
}
