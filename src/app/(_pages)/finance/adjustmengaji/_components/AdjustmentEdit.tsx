"use client";

import Modal from "@/components/Modal";
import { AccessDepartmentProps, AdjustmentProps } from "@/types";
import { useEffect, useState } from "react";
import { editAdjustment, getPegawaiAdjustment } from "../_libs/action";
import Select from "react-select";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import { NumericFormat } from "react-number-format";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
  adjustmentEdit: AdjustmentProps;
};

export default function AdjustmentEdit(props: Props) {
  const { isOpen, onClose, departmentData, adjustmentEdit } = props;

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const [pegawaiData, setPegawaiData] = useState(
    [] as {
      id: number;
      nama: string;
    }[]
  );
  const [formData, setFormData] = useState({
    id: adjustmentEdit.id || (null as number | null),
    department_id: adjustmentEdit.department_id || ("" as number | string),
    pegawai_id: adjustmentEdit.pegawai.id || ("" as number | string),
    bulan: adjustmentEdit.bulan || ("" as number | string),
    tahun: adjustmentEdit.tahun || ("" as number | string),
    jenis: adjustmentEdit.jenis || "",
    nominal: adjustmentEdit.nominal || ("" as number | string),
    keterangan: adjustmentEdit.keterangan || "",
  });

  if (!isOpen) return null;

  useEffect(() => {
    handleGetPegawai(Number(formData.department_id));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editAdjustment(formData as any);
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

  const handleGetPegawai = async (department_id: number) => {
    setIsLoadingPage(true);
    try {
      const result = await getPegawaiAdjustment(department_id);
      if (result.status) {
        setPegawaiData(result.data);
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
        <label htmlFor="department" className="form-label">
          DEPARTMENT
        </label>
        <select
          id="department"
          className="form-select"
          onChange={(e) => {
            setFormData({
              ...formData,
              department_id: e.target.value,
              pegawai_id: "",
            });
            setPegawaiData([]);
            if (e.target.value !== "") {
              handleGetPegawai(Number(e.target.value));
            }
          }}
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
        <label htmlFor="pegawai" className="form-label">
          PEGAWAI
        </label>
        <Select
          instanceId={"pegawai"}
          placeholder="Select Pegawai"
          styles={{
            option: (styles) => ({ ...styles, color: "black" }),
          }}
          options={pegawaiData?.map((e) => ({
            value: e.id,
            label: e.nama?.toUpperCase(),
          }))}
          onChange={(e: any) => {
            setFormData({
              ...formData,
              pegawai_id: e.value,
            });
          }}
          value={
            formData.pegawai_id
              ? pegawaiData
                  ?.map((e) => ({
                    value: e.id,
                    label: e.nama?.toUpperCase(),
                  }))
                  .find((option) => option.value === formData.pegawai_id)
              : null
          }
          isClearable
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="bulan" className="form-label">
          BULAN
        </label>
        <select
          className="form-select"
          id="bulan"
          required
          onChange={(e) => {
            setFormData({ ...formData, bulan: e.target.value });
          }}
          value={formData.bulan || ""}
        >
          <option value="">--SELECT--</option>
          <FilterBulan />
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="tahun" className="form-label">
          TAHUN
        </label>
        <select
          className="form-select"
          id="tahun"
          required
          onChange={(e) => {
            setFormData({ ...formData, tahun: e.target.value });
          }}
          value={formData.tahun || ""}
        >
          <option value="">--SELECT--</option>
          <FilterTahun />
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="jenis" className="form-label">
          JENIS
        </label>
        <select
          className="form-select"
          id="jenis"
          required
          onChange={(e) => {
            setFormData({ ...formData, jenis: e.target.value });
          }}
          value={formData.jenis || ""}
        >
          <option value="">--SELECT--</option>
          <option value="penambahan">PENAMBAHAN / PROJECT</option>
          <option value="pengurangan">PENGURANGAN</option>
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="nominal" className="form-label">
          NOMINAL
        </label>
        <NumericFormat
          id="nominal"
          defaultValue={formData.nominal}
          className="form-control"
          thousandSeparator=","
          displayType="input"
          onValueChange={(values) => {
            setFormData({ ...formData, nominal: Number(values.floatValue) });
          }}
          onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
          onBlur={(e) => e.target.value === "" && (e.target.value = "0")}
          onWheel={(e: any) => e.target.blur()}
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="keterangan" className="form-label">
          KETERANGAN
        </label>
        <textarea
          id="keterangan"
          className="form-control"
          rows={3}
          onChange={(e) => {
            setFormData({ ...formData, keterangan: e.target.value });
          }}
          value={formData.keterangan || ""}
          required
        ></textarea>
      </div>
    </Modal>
  );
}
