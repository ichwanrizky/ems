"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { editRoles } from "../_libs/action";
import { RolesProps } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  rolesEdit: RolesProps;
};

export default function RolesCreate(props: Props) {
  const { isOpen, onClose, rolesEdit } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    id: rolesEdit.id || 0,
    role_name: rolesEdit.role_name || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editRoles(formData as any);
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
      modalTitle="EDIT DATA"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label htmlFor="role_name" className="form-label">
          ROLE NAME
        </label>
        <input
          id="role_name"
          type="text"
          className="form-control text-uppercase"
          onChange={(e) =>
            setFormData({ ...formData, role_name: e.target.value })
          }
          value={formData.role_name}
          required
        />
      </div>
    </Modal>
  );
}
