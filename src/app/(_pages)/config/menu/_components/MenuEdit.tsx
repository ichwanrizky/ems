"use client";
import Modal from "@/components/Modal";
import { MenuGroupProps, MenuProps } from "@/types";
import React, { useState } from "react";
import { createMenu, editMenu } from "../_libs/action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  menuGroupData: MenuGroupProps[];
  menuEdit: MenuProps;
};

export default function MenuEdit(props: Props) {
  const { isOpen, onClose, menuGroupData, menuEdit } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    id: menuEdit.id || 0,
    menu_group_id: menuEdit.menu_group_id || (null as number | null),
    menu: menuEdit.menu || "",
    urut: menuEdit.urut || (null as number | null),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editMenu(formData as any);
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
        <select
          id="menu_group"
          className="form-select"
          onChange={(e) =>
            setFormData({ ...formData, menu_group_id: Number(e.target.value) })
          }
          value={formData.menu_group_id || ""}
          required
        >
          <option value="">--SELECT--</option>
          {menuGroupData?.map((item, index) => (
            <option value={item.id} key={index}>
              {item.menu_group}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="menu" className="form-label">
          MENU
        </label>
        <input
          id="menu"
          type="text"
          className="form-control text-uppercase"
          onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
          value={formData.menu || ""}
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
    </Modal>
  );
}
