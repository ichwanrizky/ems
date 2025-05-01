"use client";
import Modal from "@/components/Modal";
import { AccessDepartmentProps, DepartmentProps } from "@/types";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { createTanggalMerah } from "../_libs/action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
};

export default function TanggalMerahCreate(props: Props) {
  const { isOpen, onClose, departmentData } = props;
  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const [formData, setFormData] = useState({
    department: "" as number | string,
    bulan: "" as number | string,
    tahun: "" as number | string,
    tanggal: [] as {
      value: string;
      label: string;
    }[],
  });

  const [dateMonth, setDateMonth] = useState([] as string[]);

  if (!isOpen) return null;

  useEffect(() => {
    if (formData.tahun !== "" && formData.bulan !== "") {
      getTanggalMerahApi(formData.tahun, formData.bulan);
    } else {
      setFormData({ ...formData, tanggal: [] });
      setDateMonth([]);
    }
  }, [formData.bulan, formData.tahun]);

  const getTanggalMerahApi = async (
    tahun: number | string,
    bulan: number | string
  ) => {
    setIsLoadingPage(true);
    setDateMonth([]);
    setFormData({ ...formData, tanggal: [] });
    try {
      const result = await fetch(
        `https://api-harilibur.vercel.app/api?year=${tahun}&month=${bulan}`
      );

      let dates = [] as string[];

      if (result.ok) {
        const data = await result.json();
        data?.map((item: any) => {
          if (item.is_national_holiday) {
            const day = item.holiday_date.split("-")[2];
            const paddedDay = day.padStart(2, "0");
            dates.push(paddedDay);
          }
        });
      }

      const monthIndex = Number(bulan) - 1;
      const endDate = new Date(Number(tahun), Number(bulan), 0);

      const arrDateMonths = [];

      for (let day = 1; day <= endDate.getDate(); day++) {
        const date = new Date(Number(tahun), monthIndex, day);

        if (date.getDay() === 6 || date.getDay() === 0) {
          const formattedDate = `${String(date.getDate()).padStart(2, "0")}`;
          dates.push(formattedDate);

          dates = dates.filter((d) => d !== formattedDate);

          // Add the new date
          dates.push(formattedDate);
        }

        arrDateMonths.push(`${String(date.getDate()).padStart(2, "0")}`);
      }

      dates.sort((a, b) => parseInt(a) - parseInt(b));
      setDateMonth(arrDateMonths);

      setFormData({
        ...formData,
        tanggal: dates.map((e) => ({
          value: e,
          label: e,
        })),
      });
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
        const result = await createTanggalMerah(formData as any);
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
        modalTitle="ADD DATA"
        onClose={onClose}
        alert={alertModal}
        isLoadingModal={false}
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
            setFormData({ ...formData, department: e.target.value })
          }
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
        <label htmlFor="month" className="form-label">
          BULAN
        </label>
        <select
          id="month"
          className="form-select"
          required
          value={formData.bulan || ""}
          onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
        >
          <option value="">--SELECT--</option>
          {Array.from({ length: 12 }, (_, i) => {
            const monthNames = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Augustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];
            return (
              <option value={i + 1} key={i}>
                {monthNames[i]?.toUpperCase()}
              </option>
            );
          })}
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="year" className="form-label">
          TAHUN
        </label>
        <select
          id="year"
          className="form-select"
          required
          value={formData.tahun || ""}
          onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
        >
          <option value="">--SELECT--</option>
          {Array.from({ length: 3 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return year >= 2024 ? (
              <option value={year} key={i}>
                {year}
              </option>
            ) : null;
          })}
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="date_holiday" className="form-label">
          TANGGAL
        </label>
        <Select
          instanceId={"date_holiday"}
          placeholder="Select Tanggal"
          styles={{
            option: (styles) => ({ ...styles, color: "black" }),
          }}
          options={dateMonth?.map((e) => ({
            value: e,
            label: e,
          }))}
          onChange={(e: any) => {
            setFormData({
              ...formData,
              tanggal: e,
            });
          }}
          value={formData.tanggal}
          isClearable
          isMulti
          required
          closeMenuOnSelect={false}
        />
      </div>
    </Modal>
  );
}
