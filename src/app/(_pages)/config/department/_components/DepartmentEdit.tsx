"use client";
import Modal from "@/components/Modal";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { editDepartment, getJenisIzin } from "../_libs/action";
import { DepartmentProps } from "@/types";

const Select = dynamic(() => import("react-select"), { ssr: false });

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
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [jenisIzinData, setJenisIzinData] = useState(
    [] as {
      kode: string;
      jenis: string;
    }[]
  );
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
    akses_izin_department:
      departmentEdit.akses_izin_department?.map((e) => ({
        value: e.jenis_izin.kode,
        label: e.jenis_izin.jenis,
      })) || ([] as { value: string; label: string }[]),
  });

  useEffect(() => {
    fetchData();
  }, []);

  if (!isOpen) return null;

  const fetchData = async () => {
    setIsLoadingPage(true);
    try {
      const result = await getJenisIzin();
      if (result.status) {
        setJenisIzinData(result.data);
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
      {isLoadingPage ? (
        <div className="d-flex justify-content-center">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          LOADING ...
        </div>
      ) : (
        <>
      <div className="form-group mb-3">
        <label htmlFor="department" className="form-label">
          SECTION
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

      <div className="form-group mb-3">
        <label htmlFor="akses_izin_department" className="form-label">
          AKSES IZIN
        </label>
        <Select
          instanceId={"akses_izin_department"}
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
              akses_izin_department: e,
            });
          }}
          value={formData.akses_izin_department}
          isClearable
          closeMenuOnSelect={false}
        />
        <div className="form-check mt-2">
          <input
            id="check_all_akses_izin_department"
            type="checkbox"
            className="form-check-input"
            checked={
              jenisIzinData.length > 0 &&
              formData.akses_izin_department.length === jenisIzinData.length
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                akses_izin_department: e.target.checked
                  ? jenisIzinData?.map((item) => ({
                      value: item.kode?.toUpperCase(),
                      label: item.jenis?.toUpperCase(),
                    }))
                  : [],
              })
            }
          />
          <label
            htmlFor="check_all_akses_izin_department"
            className="form-check-label"
          >
            PILIH SEMUA
          </label>
        </div>
      </div>
        </>
      )}
    </Modal>
  );
}
