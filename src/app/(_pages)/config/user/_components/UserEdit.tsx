"use client";
import Modal from "@/components/Modal";
import Script from "next/script";
import React, { useEffect, useState } from "react";
import { editUser } from "../_libs/action";
import { getRoles } from "../../roles/_libs/action";
import { RolesProps } from "@/types";

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
        roles: {
          id: number;
          role_name: string;
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
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [rolesData, setRolesData] = useState([] as RolesProps[]);

  const [formData, setFormData] = useState({
    id: userEdit?.id || 0,
    role_id: userEdit?.roles?.id || (null as number | null),
    username: userEdit?.username || "",
    new_password: "",
    re_new_password: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  if (!isOpen) return null;

  const fetchRoles = async () => {
    setIsLoadingPage(true);
    try {
      const result = await getRoles();
      if (result.status) {
        setRolesData(result.data as RolesProps[]);
      } else {
        setAlertModal({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
      }
    } catch (error) {
      setAlertModal({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
    } finally {
      setIsLoadingPage(false);
    }
  };

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

  if (isLoadingPage) {
    return (
      <Modal
        modalTitle="EDIT DATA"
        onClose={onClose}
        alert={alertModal}
        isLoadingModal={false}
        isLoadingSubmit={isLoadingSubmit}
        onSubmit={handleSubmit}
      >
        <div className="d-flex justify-content-center">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          LOADING ...
        </div>
      </Modal>
    );
  }

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
        <label htmlFor="role" className="form-label">
          ROLE
        </label>
        <select
          id="role"
          className="form-select"
          value={formData.role_id || ""}
          onChange={(e) =>
            setFormData({ ...formData, role_id: Number(e.target.value) })
          }
        >
          <option value="">--SELECT--</option>
          {rolesData?.map((item, index) => (
            <option value={item.id} key={index}>
              {item.role_name?.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

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
function setRolesData(arg0: RolesProps[]) {
  throw new Error("Function not implemented.");
}
