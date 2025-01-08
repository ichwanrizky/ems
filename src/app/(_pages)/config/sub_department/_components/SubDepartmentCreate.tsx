"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { createDepartment } from "../_libs/action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DepartmentCreate(props: Props) {
  const { isOpen, onClose } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [coordinate, setCoordinate] = useState("");

  const [formData, setFormData] = useState({
    nama_department: "",
    latitude: "",
    longitude: "",
    radius: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createDepartment(formData as any);
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
      modalTitle="ADD DATA"
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
