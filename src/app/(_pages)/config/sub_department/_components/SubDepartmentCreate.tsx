"use client";
import Modal from "@/components/Modal";
import React, { useEffect, useState } from "react";
import { createSubDepartment, getAtasan, getJenisIzin } from "../_libs/action";
import { AtasanProps, DepartmentProps } from "@/types";
import Select from "react-select";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: DepartmentProps[];
};

export default function SubDepartmentCreate(props: Props) {
  const { isOpen, onClose, departmentData } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [atasanData, setAtasanData] = useState([] as AtasanProps[]);
  const [jenisIzinData, setJenisIzinData] = useState(
    [] as {
      kode: string;
      jenis: string;
    }[]
  );

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [formData, setFormData] = useState({
    department: null as number | null,
    nama_sub_department: "",
    leader: null as number | null,
    supervisor: null as number | null,
    manager: null as number | null,
    akses_izin: [] as { value: string; label: string }[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  if (!isOpen) return null;

  const fetchData = async () => {
    setIsLoadingPage(true);
    try {
      const result = await getAtasan();
      const result2 = await getJenisIzin();
      if (result.status && result2.status) {
        setAtasanData(result.data as AtasanProps[]);
        setJenisIzinData(
          result2.data as [] as {
            kode: string;
            jenis: string;
          }[]
        );
      } else {
        setAlertModal({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: !result.status ? result.message : result2.message,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createSubDepartment(formData as any);
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
      modalTitle="ADD DATA"
      onClose={onClose}
      alert={alertModal}
      isLoadingModal={false}
      isLoadingSubmit={isLoadingSubmit}
      onSubmit={handleSubmit}
    >
      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          DEPT.
        </label>
        <select
          id="department"
          className="form-select"
          required
          value={formData.department || ""}
          onChange={(e) =>
            setFormData({ ...formData, department: Number(e.target.value) })
          }
        >
          <option value="">--SELECT--</option>
          {departmentData?.map((item, index) => (
            <option value={item.id} key={index}>
              {item.nama_department?.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          NAMA SUB DEPT.
        </label>
        <input
          type="text"
          id="sub_department"
          className="form-control text-uppercase"
          required
          value={formData.nama_sub_department}
          onChange={(e) =>
            setFormData({ ...formData, nama_sub_department: e.target.value })
          }
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="leader" className="form-label">
          LEADER
        </label>
        <Select
          instanceId={"leader"}
          placeholder="Select Leader"
          styles={{
            option: (styles) => ({ ...styles, color: "black" }),
          }}
          options={atasanData?.map((e) => ({
            value: e.id,
            label: e.pegawai?.nama?.toUpperCase(),
          }))}
          onChange={(e: any) => {
            setFormData({
              ...formData,
              leader: e ? e.value : null,
            });
          }}
          value={
            formData.leader
              ? atasanData
                  ?.map((e) => ({
                    value: e.id,
                    label: e.pegawai?.nama?.toUpperCase(),
                  }))
                  .find((option) => option.value === formData.leader)
              : null
          }
          isClearable
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="supervisor" className="form-label">
          SUPERVISOR
        </label>
        <Select
          instanceId={"supervisor"}
          placeholder="Select Supervisor"
          styles={{
            option: (styles) => ({ ...styles, color: "black" }),
          }}
          options={atasanData?.map((e) => ({
            value: e.id,
            label: e.pegawai?.nama?.toUpperCase(),
          }))}
          onChange={(e: any) => {
            setFormData({
              ...formData,
              supervisor: e ? e.value : null,
            });
          }}
          value={
            formData.supervisor
              ? atasanData
                  ?.map((e) => ({
                    value: e.id,
                    label: e.pegawai?.nama?.toUpperCase(),
                  }))
                  .find((option) => option.value === formData.supervisor)
              : null
          }
          isClearable
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="manager" className="form-label">
          MANAGER
        </label>
        <Select
          instanceId={"manager"}
          placeholder="Select Manager"
          styles={{
            option: (styles) => ({ ...styles, color: "black" }),
          }}
          options={atasanData?.map((e) => ({
            value: e.id,
            label: e.pegawai?.nama?.toUpperCase(),
          }))}
          onChange={(e: any) => {
            setFormData({
              ...formData,
              manager: e ? e.value : null,
            });
          }}
          value={
            formData.manager
              ? atasanData
                  ?.map((e) => ({
                    value: e.id,
                    label: e.pegawai?.nama?.toUpperCase(),
                  }))
                  .find((option) => option.value === formData.manager)
              : null
          }
          isClearable
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="akses_izin" className="form-label">
          AKSES IZIN
        </label>
        <Select
          instanceId={"akses_izin"}
          placeholder="Select Akses Izin"
          styles={{
            option: (styles) => ({ ...styles, color: "black" }),
          }}
          options={jenisIzinData?.map((e) => ({
            value: e.kode?.toUpperCase(),
            label: e.jenis?.toUpperCase(),
          }))}
          isMulti
          onChange={(e: any) => {
            setFormData({
              ...formData,
              akses_izin: e,
            });
          }}
          value={formData.akses_izin}
          isClearable
          closeMenuOnSelect={false}
        />
      </div>
    </Modal>
  );
}
