"use client";

import Modal from "@/components/Modal";
import { AccessDepartmentProps } from "@/types";
import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
};

export default function ShiftMasterCrete(props: Props) {
  const { isOpen, onClose, departmentData } = props;

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    department_id: null as number | null,
    jam_masuk: "" as any,
    jam_pulang: "" as any,
    keterangan: "" as any,
    cond_friday: "" as any,
  });

  if (!isOpen) return null;

  return (
    <Modal
      modalTitle="ADD DATA"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      //   onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          DEPARTMENT
        </label>
        <select
          id="department"
          className="form-select"
          onChange={(e) =>
            setFormData({ ...formData, department_id: Number(e.target.value) })
          }
          value={formData.department_id || ""}
          required
        >
          <option value="">--SELECT--</option>
          {departmentData?.map((item, index: number) => (
            <option value={item.department.id} key={index}>
              {item.department.nama_department}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          JAM MASUK
        </label>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          JAM PULANG
        </label>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          COND FRIDAY
        </label>
      </div>
    </Modal>
  );
}
