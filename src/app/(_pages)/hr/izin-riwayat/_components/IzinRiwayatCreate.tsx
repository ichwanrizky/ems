"use client";
import Modal from "@/components/Modal";
import { AccessDepartmentProps, MenuGroupProps } from "@/types";
import React, { useState } from "react";
import {
  createIizin,
  getPegawaiIzin,
  getPegawaiIzinTglMerah,
} from "../_libs/action";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/styles.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
};

export default function IzinRiwayatCreate(props: Props) {
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
  const [jenisIzinData, setJenisIzinData] = useState(
    [] as {
      kode: string;
      jenis: string;
      is_jam: boolean;
    }[]
  );

  const [tglMerahData, setTglMerahData] = useState(
    [] as {
      tanggal: Date | null;
      tanggal_nomor: string;
    }[]
  );

  const [formData, setFormData] = useState({
    department_id: "" as string | number,
    pegawai_id: "" as string | number,
    jenis_izin: "" as string,
    tgl_izin: null as Date | null,
    is_jam: false,
    is_hari: false,
    jumlah_hari: 0,
    jumlah_jam: 0,
    keterangan: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createIizin(formData as any);
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
    setPegawaiData([]);
    setJenisIzinData([]);
    setTglMerahData([]);
    try {
      const result = await getPegawaiIzin(department_id);
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

  const handleGetJenis = async (pegawai_id: number) => {
    setIsLoadingPage(true);
    setJenisIzinData([]);
    setTglMerahData([]);
    try {
      const result = await getPegawaiIzinTglMerah(pegawai_id);
      if (result.status) {
        setJenisIzinData(result.data.jenis_izin);
        setTglMerahData(result.data.tgl_merah);
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

  const handleChangeJenis = async (kode: string) => {
    setFormData((prev) => ({
      ...prev,
      is_jam: false,
      is_hari: false,
      jumlah_hari: 0,
      jumlah_jam: 0,
    }));

    if (kode != "") {
      const result = jenisIzinData.find((item) => item.kode === kode);
      if (result) {
        setFormData((prev) => ({
          ...prev,
          is_jam: result.is_jam ? true : false,
          is_hari: result.is_jam ? false : true,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          is_jam: false,
          is_hari: false,
        }));
      }
    }
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
        <label htmlFor="dept" className="form-label">
          DEPT.
        </label>
        <select
          id="dept"
          className="form-select"
          onChange={(e) => {
            setFormData({
              ...formData,
              department_id: e.target.value,
              pegawai_id: "",
              jenis_izin: "",
              tgl_izin: null,
              is_jam: false,
              is_hari: false,
              jumlah_hari: 0,
              jumlah_jam: 0,
              keterangan: "",
            });
            handleGetPegawai(Number(e.target.value));
          }}
          value={formData.department_id || ""}
          required
        >
          <option value="">--SELECT--</option>
          {departmentData?.map((item, index) => (
            <option value={item.department.id} key={index}>
              {item.department.nama_department?.toUpperCase()}
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
            setJenisIzinData([]);
            setTglMerahData([]);
            setFormData({
              ...formData,
              pegawai_id: e ? e.value : null,
              jenis_izin: "",
              tgl_izin: null,
              is_jam: false,
              is_hari: false,
              jumlah_hari: 0,
              jumlah_jam: 0,
              keterangan: "",
            });
            if (e) {
              handleGetJenis(e.value);
            }
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

      <hr />

      {formData.pegawai_id && (
        <>
          <div className="form-group mb-3">
            <label htmlFor="jenis_izin" className="form-label">
              JENIS IZIN
            </label>
            <select
              id="jenis_izin"
              className="form-select"
              onChange={(e) => {
                handleChangeJenis(e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  jenis_izin: e.target.value,
                }));
              }}
              value={formData.jenis_izin}
              required
            >
              <option value="">--SELECT--</option>
              {jenisIzinData?.map((item, index) => (
                <option value={item.kode} key={index}>
                  {item.jenis?.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="tanggal_izin" className="form-label">
              TANGGAL IZIN
            </label>
            <DatePicker
              autoComplete="off"
              id="tanggal_izin"
              dropdownMode="select"
              wrapperClassName={styles.datePicker}
              className="form-select"
              selected={formData.tgl_izin}
              onChange={(date: any) =>
                setFormData({ ...formData, tgl_izin: date })
              }
              scrollableYearDropdown
              dateFormat={"yyyy-MM-dd"}
              showMonthDropdown
              showYearDropdown
              onKeyDown={(e) => {
                e.preventDefault();
              }}
              excludeDates={tglMerahData?.map(
                (item) => new Date(item.tanggal || "")
              )}
              dayClassName={(date) =>
                tglMerahData?.some(
                  (item) =>
                    new Date(item.tanggal || "").toDateString() ===
                    date.toDateString()
                )
                  ? styles.redDisabled // Apply red color class
                  : ""
              }
            />
          </div>

          {formData.is_hari && (
            <div className="form-group mb-3">
              <label htmlFor="jumlah_hari" className="form-label">
                JUMLAH HARI
              </label>
              <input
                id="jumlah_hari"
                type="text"
                className="form-control"
                required
                value={formData.jumlah_hari}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumlah_hari: Number(e.target.value),
                  })
                }
              />
            </div>
          )}

          {formData.is_jam && (
            <div className="form-group mb-3">
              <label htmlFor="jumlah_jam" className="form-label">
                JUMLAH JAM
              </label>
              <select
                id="jumlah_jam"
                className="form-select"
                value={formData.jumlah_jam?.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumlah_jam: Number(e.target.value),
                  })
                }
                required
              >
                <option value="">--SELECT--</option>
                <option value="0.5">Setengah Jam</option>
                <option value="1">1 Jam</option>
                <option value="1.5">1.5 Jam</option>
                <option value="2">2 Jam</option>
                <option value="2.5">2.5 Jam</option>
                <option value="3">3 Jam</option>
                <option value="3.5">3.5 Jam</option>
              </select>
            </div>
          )}

          <div className="form-group mb-3">
            <label htmlFor="ket" className="form-label">
              KET.
            </label>
            <textarea
              id="ket"
              rows={4}
              className="form-control"
              required
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  keterangan: e.target.value,
                })
              }
            />
          </div>
        </>
      )}
    </Modal>
  );
}
