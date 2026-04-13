"use client";
import Modal from "@/components/Modal";
import React, { useState } from "react";
import { createDepartmentLocation } from "../../_libs/action";

type Props = {
  isOpen: boolean;
  departmentId: number;
  onClose: () => void;
};

export default function DepartmentLokasiCreate(props: Props) {
  const { isOpen, departmentId, onClose } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [coordinate, setCoordinate] = useState("");
  const [formData, setFormData] = useState({
    nama_lokasi: "",
    latitude: "",
    longitude: "",
    radius: "",
    department_id: departmentId,
  });

  if (!isOpen) return null;

  const handleCoordinate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCoordinate(val);
    setFormData({
      ...formData,
      latitude: val.split(",")[0]?.trim() || "",
      longitude: val.split(",")[1]?.trim() || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm("Submit this data?")) return;
    setIsLoadingSubmit(true);
    try {
      const result = await createDepartmentLocation(formData as any);
      if (result.status) {
        setAlertModal({ status: true, color: "success", message: "Success", subMessage: result.message });
        setTimeout(() => onClose(), 1000);
      } else {
        setAlertModal({ status: true, color: "danger", message: "Failed", subMessage: result.message });
        setIsLoadingSubmit(false);
      }
    } catch {
      setAlertModal({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
      setIsLoadingSubmit(false);
    }
  };

  return (
    <Modal
      modalTitle="ADD LOKASI"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label htmlFor="nama_lokasi" className="form-label">NAMA LOKASI</label>
        <input
          id="nama_lokasi"
          type="text"
          className="form-control text-uppercase"
          onChange={(e) => setFormData({ ...formData, nama_lokasi: e.target.value })}
          value={formData.nama_lokasi}
          placeholder="Contoh: Gedung A, Parkiran, dll"
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="coordinate" className="form-label">COORDINATE</label>
        <input
          id="coordinate"
          type="text"
          className="form-control"
          onChange={handleCoordinate}
          value={coordinate}
          placeholder="-6.123456, 106.123456"
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="radius" className="form-label">RADIUS (meter)</label>
        <input
          id="radius"
          type="number"
          className="form-control"
          onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
          value={formData.radius}
          required
        />
      </div>
    </Modal>
  );
}
