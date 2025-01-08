"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { editDepartment } from "../_libs/action";
import { DepartmentProps } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentEdit: DepartmentProps;
};

export default function DepartmentEdit(props: Props) {
  const { isOpen, onClose, departmentEdit } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [coordinate, setCoordinate] = useState(
    departmentEdit.latitude && departmentEdit.longitude
      ? `${departmentEdit.latitude}, ${departmentEdit.longitude}`
      : ""
  );

  const [formData, setFormData] = useState({
    id: departmentEdit.id || 0,
    nama_department: departmentEdit.nama_department || "",
    latitude: departmentEdit.latitude || "",
    longitude: departmentEdit.longitude || "",
    radius: departmentEdit.radius || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editDepartment(formData as any);
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

  const handleCoordinate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordinate(e.target.value);
    setFormData({
      ...formData,
      latitude: e.target.value.split(",")[0] || "",
      longitude: e.target.value.split(",")[1] || "",
    });
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
        <label htmlFor="department" className="form-label">
          DEPARTMENT
        </label>
        <input
          id="department"
          type="text"
          className="form-control text-uppercase"
          onChange={(e) =>
            setFormData({ ...formData, nama_department: e.target.value })
          }
          value={formData.nama_department}
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="coordinate" className="form-label">
          COORDINATE
        </label>
        <input
          id="coordinate"
          type="text"
          className="form-control"
          onChange={(e) => {
            handleCoordinate(e);
          }}
          value={coordinate}
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="radius" className="form-label">
          RADIUS
        </label>
        <input
          id="radius"
          type="number"
          className="form-control"
          onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
          value={formData.radius || ""}
        />
      </div>
    </Modal>
  );
}
