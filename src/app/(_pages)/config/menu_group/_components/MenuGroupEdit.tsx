"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { editMenuGroup } from "../_libs/action";
import { MenuGroupProps } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  menuGroupEdit: MenuGroupProps;
};

export default function MenuGroupEdit(props: Props) {
  const { isOpen, onClose, menuGroupEdit } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    id: menuGroupEdit.id || 0,
    menu_group: menuGroupEdit.menu_group || "",
    urut: menuGroupEdit.urut || (null as number | null),
    group: menuGroupEdit.group || (null as boolean | null),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editMenuGroup(formData as any);
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
          value={formData.group ? "1" : "2"}
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
