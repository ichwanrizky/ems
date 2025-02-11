"use client";

import Modal from "@/components/Modal";
import { AccessDepartmentProps } from "@/types";
import { useEffect, useState } from "react";
import Select from "react-select";
import { FilterBulan } from "@/libs/FilterBulan";
import { FilterTahun } from "@/libs/FilterTahun";
import { createGaji, getPegawaiGaji } from "../_libs/action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
};

export default function GajiCreate(props: Props) {
  const { isOpen, onClose, departmentData } = props;

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
    department_id: "" as number | string,
    bulan: "" as number | string,
    tahun: "" as number | string,
    list_pegawai: [] as {
      label: string;
      value: number;
    }[],
  });

  if (!isOpen) return null;

  useEffect(() => {
    handleGetPegawai();
  }, [formData.department_id, formData.bulan, formData.tahun]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createGaji(formData as any);
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

  const handleGetPegawai = async () => {
    setPegawaiData([]);
    setFormData({
      ...formData,
      list_pegawai: [],
    });
    if (
      formData.department_id === "" ||
      formData.bulan === "" ||
      formData.tahun === ""
    ) {
      return;
    }
    setIsLoadingPage(true);
    try {
      const result = await getPegawaiGaji(
        Number(formData.department_id),
        Number(formData.bulan),
        Number(formData.tahun)
      );
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

  const handleSelectAll = () => {
    if (pegawaiData.length === formData.list_pegawai.length) {
      setFormData({
        ...formData,
        list_pegawai: [],
      });

      return;
    }

    setFormData({
      ...formData,
      list_pegawai: pegawaiData.map((item) => ({
        label: item.nama?.toUpperCase(),
        value: item.id,
      })),
    });
  };

  if (isLoadingPage) {
    return (
      <Modal
        modalTitle="ADD DATA"
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
        <select
          id="department"
          className="form-select"
          onChange={(e) => {
            setFormData({
              ...formData,
              department_id: e.target.value,
            });
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
              list_pegawai: e,
            });
          }}
          value={formData.list_pegawai}
          isClearable
          required
          isMulti
        />
        {pegawaiData.length > 0 && (
          <>
            select all{" "}
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={pegawaiData.length === formData.list_pegawai.length}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
