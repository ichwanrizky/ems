"use client";
import Modal from "@/components/Modal";
import { PegawaiLocationProps } from "@/types";
import React, { useState } from "react";
import { editPegawaiLokasi } from "../_libs/action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  lokasiEdit: PegawaiLocationProps;
};

export default function LokasiTambahanEdit(props: Props) {
  const { isOpen, onClose, lokasiEdit } = props;
  const [alertModal, setAlertModal] = useState({ status: false, color: "", message: "", subMessage: "" });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [coordinate, setCoordinate] = useState(
    lokasiEdit.latitude && lokasiEdit.longitude
      ? `${lokasiEdit.latitude}, ${lokasiEdit.longitude}`
      : ""
  );
  const [formData, setFormData] = useState({
    id: lokasiEdit.id,
    nama_lokasi: lokasiEdit.nama_lokasi || "",
    latitude: lokasiEdit.latitude || "",
    longitude: lokasiEdit.longitude || "",
    radius: lokasiEdit.radius || "",
    pegawai_id: lokasiEdit.pegawai_id,
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
      const result = await editPegawaiLokasi(formData as any);
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
      modalTitle="EDIT LOKASI TAMBAHAN"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label className="form-label">KARYAWAN</label>
        <input
          type="text"
          className="form-control"
          value={lokasiEdit.pegawai?.nama || ""}
          disabled
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="nama_lokasi" className="form-label">NAMA LOKASI</label>
        <input
          id="nama_lokasi"
          type="text"
          className="form-control text-uppercase"
          onChange={(e) => setFormData({ ...formData, nama_lokasi: e.target.value })}
          value={formData.nama_lokasi}
          placeholder="Contoh: Rumah, Cabang B, dll"
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
