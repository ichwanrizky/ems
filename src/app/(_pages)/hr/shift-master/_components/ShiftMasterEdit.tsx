"use client";

import Modal from "@/components/Modal";
import { AccessDepartmentProps, ShiftMasterProps } from "@/types";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../styles.module.css";
import { editShiftMaster } from "../_libs/action";
import { DateMinus7Format } from "@/libs/ConvertDate";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
  shiftMasterEdit: ShiftMasterProps;
};

export default function ShiftMasterEdit(props: Props) {
  const { isOpen, onClose, departmentData, shiftMasterEdit } = props;

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    id: shiftMasterEdit.id as number | null,
    department_id: shiftMasterEdit.department_id || (null as number | null),
    jam_masuk:
      DateMinus7Format(shiftMasterEdit.jam_masuk) || (null as Date | null),
    jam_pulang:
      DateMinus7Format(shiftMasterEdit.jam_pulang) || (null as Date | null),
    keterangan: shiftMasterEdit.keterangan || "",
    cond_friday: shiftMasterEdit.cond_friday || ("" as number | string),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editShiftMaster(formData as any);
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
        <label htmlFor="jam_masuk" className="form-label">
          JAM MASUK
        </label>
        <DatePicker
          id="jam_masuk"
          wrapperClassName={styles.datePicker}
          className="form-select"
          selected={formData.jam_masuk}
          onChange={(date: any) =>
            setFormData({ ...formData, jam_masuk: date })
          }
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="h:mm aa"
          timeFormat="HH:mm"
          required
          autoComplete="off"
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="jam_pulang" className="form-label">
          JAM PULANG
        </label>
        <DatePicker
          id="jam_pulang"
          wrapperClassName={styles.datePicker}
          className="form-select"
          selected={formData.jam_pulang}
          onChange={(date: any) =>
            setFormData({ ...formData, jam_pulang: date })
          }
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="h:mm aa"
          timeFormat="HH:mm"
          required
          autoComplete="off"
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="keterangan" className="form-label">
          KETERANGAN
        </label>
        <textarea
          id="keterangan"
          className="form-control text-uppercase"
          rows={5}
          onChange={(e) =>
            setFormData({ ...formData, keterangan: e.target.value })
          }
          value={formData.keterangan}
          required
        ></textarea>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="cond_friday" className="form-label">
          COND FRIDAY
        </label>
        <input
          id="cond_friday"
          type="number"
          className="form-control"
          step={1}
          min={0}
          onChange={(e) => {
            const value = e.target.value === "" ? "" : Number(e.target.value);
            setFormData({ ...formData, cond_friday: value });
          }}
          value={formData.cond_friday === "" ? "" : formData.cond_friday}
          required
        />
      </div>
    </Modal>
  );
}
