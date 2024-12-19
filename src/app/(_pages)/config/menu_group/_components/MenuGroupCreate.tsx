"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { createMenuGroup } from "../_libs/action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MenuGroupCreate(props: Props) {
  const { isOpen, onClose } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    menu_group: "",
    urut: null as number | null,
    group: null as boolean | null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createMenuGroup(formData as any);
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
        <label htmlFor="menu_group" className="form-label">
          MENU GROUP
        </label>
        <input
          id="menu_group"
          type="text"
          className="form-control text-uppercase"
          onChange={(e) =>
            setFormData({ ...formData, menu_group: e.target.value })
          }
          value={formData.menu_group}
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="urut" className="form-label">
          URUT
        </label>
        <input
          id="urut"
          type="number"
          className="form-control"
          onChange={(e) =>
            setFormData({ ...formData, urut: Number(e.target.value) })
          }
          value={formData.urut || ""}
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="group" className="form-label">
          GROUP
        </label>
        <select
          id="group"
          className="form-select mb-3"
          onChange={(e) => {
            setFormData({
              ...formData,
              group: e.target.value === "1" ? true : false,
            });
          }}
          required
        >
          <option value="">--SELECT--</option>
          <option value={"1"}>TRUE</option>
          <option value={"2"}>FALSE</option>
        </select>
      </div>
    </Modal>
  );
}
