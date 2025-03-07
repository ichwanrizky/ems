"use client";
import Modal from "@/components/Modal";
import Script from "next/script";
import React, { useState } from "react";
import { editUser } from "../_libs/action";

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

  const [formData, setFormData] = useState({
    id: userEdit?.id || 0,
    username: userEdit?.username || "",
    new_password: "",
    re_new_password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editUser(formData as any);
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

  const togglePasswordVisibility = (inputId: string, iconId: string) => {
    const passwordInput = document.getElementById(
      inputId
    ) as HTMLInputElement | null;
    const eyeIcon = document.getElementById(iconId) as HTMLElement | null;

    if (!passwordInput || !eyeIcon) return; // Ensure elements exist

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.classList.remove("bi-eye-slash-fill");
      eyeIcon.classList.add("bi-eye-fill");
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("bi-eye-fill");
      eyeIcon.classList.add("bi-eye-slash-fill");
    }
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
        <label htmlFor="nama" className="form-label">
          NAMA
        </label>
        <input
          id="telp"
          type="text"
          className="form-control"
          value={userEdit?.pegawai.nama}
          readOnly
          disabled
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="telp" className="form-label">
          TELP
        </label>
        <input
          id="telp"
          type="text"
          className="form-control"
          value={userEdit?.pegawai.telp}
          readOnly
          disabled
        />
      </div>
      <hr />

      <div className="form-group mb-3">
        <label htmlFor="username" className="form-label">
          USERNAME
        </label>
        <input
          id="username"
          type="text"
          className="form-control"
          required
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          value={formData.username}
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="new-password" className="form-label">
          NEW PASSWORD
        </label>
        <div className="input-group show-hide-password">
          <input
            id="new-password"
            type="password"
            className="form-control"
            onChange={(e) =>
              setFormData({ ...formData, new_password: e.target.value })
            }
            value={formData.new_password}
            required={formData.re_new_password.length > 0}
          />
          <a
            href="#"
            className="input-group-text bg-transparent"
            onClick={() =>
              togglePasswordVisibility("new-password", "eye-icon-1")
            }
          >
            <i id="eye-icon-1" className="bi bi-eye-slash-fill" />
          </a>
        </div>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="re-new-password" className="form-label">
          re-NEW PASSWORD
        </label>
        <div className="input-group show-hide-password">
          <input
            id="re-new-password"
            type="password"
            className="form-control"
            onChange={(e) =>
              setFormData({ ...formData, re_new_password: e.target.value })
            }
            value={formData.re_new_password}
            required={formData.new_password.length > 0}
          />
          <a
            href="#"
            className="input-group-text bg-transparent"
            onClick={() =>
              togglePasswordVisibility("re-new-password", "eye-icon-2")
            }
          >
            <i id="eye-icon-2" className="bi bi-eye-slash-fill" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
