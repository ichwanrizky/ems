import Modal from "@/components/Modal";
import { AccessDepartmentProps, AccessSubDepartmentProps } from "@/types";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/styles.module.css";
import { createOt, getPegawaiOt } from "../_libs/action";
import Select from "react-select";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData: AccessDepartmentProps;
  subDepartmentData: AccessSubDepartmentProps;
};

export default function OTPengajuanCreate(props: Props) {
  const { isOpen, onClose, departmentData, subDepartmentData } = props;

  const [alertModal, setAlertModal] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const [formData, setFormData] = useState({
    department_id: departmentData[0].department.id as string | number,
    sub_department_id: "" as string | number,
    list_pegawai: [] as {
      label: string;
      value: number;
    }[],
    tgl_ot: null as Date | null,
    jam_awal: null as Date | null,
    jam_akhir: null as Date | null,
    job_desc: "",
    remarks: "",
  });

  const [selectedSubDepartment, setSelectedSubDepartment] = useState(
    subDepartmentData.filter(
      (item) =>
        item.sub_department.department_id === departmentData[0].department.id
    ) as AccessSubDepartmentProps
  );

  const [pegawaiData, setPegawaiData] = useState(
    [] as {
      id: number;
      nama: string;
    }[]
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createOt(formData as any);
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

  const handleGetPegawai = async (sub_department_id: number) => {
    setIsLoadingPage(true);
    try {
      const result = await getPegawaiOt(sub_department_id);
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
        label: item.nama,
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
              sub_department_id: "",
              list_pegawai: [],
            });

            setSelectedSubDepartment([]);
            setPegawaiData([]);
            if (e.target.value) {
              const subDepartments = subDepartmentData.filter(
                (item) =>
                  item.sub_department.department_id === Number(e.target.value)
              );

              setSelectedSubDepartment(
                subDepartments as AccessSubDepartmentProps
              );
            }
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
        <label htmlFor="dept" className="form-label">
          SUB DEPT.
        </label>
        <select
          id="sub_dept"
          className="form-select"
          onChange={(e) => {
            setFormData({
              ...formData,
              sub_department_id: e.target.value,
            });

            setPegawaiData([]);
            if (e.target.value) {
              handleGetPegawai(Number(e.target.value));
            }
          }}
          value={formData.sub_department_id || ""}
          required
        >
          <option value="">--SELECT--</option>
          {selectedSubDepartment?.map((item, index) => (
            <option value={item.sub_department.id} key={index}>
              {item.sub_department.nama_sub_department?.toUpperCase()}
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

      <div className="form-group mb-3">
        <label htmlFor="tanggal_izin" className="form-label">
          TANGGAL OT
        </label>
        <DatePicker
          autoComplete="off"
          id="tanggal_izin"
          dropdownMode="select"
          wrapperClassName={styles.datePicker}
          className="form-select"
          selected={formData.tgl_ot}
          onChange={(date: any) => setFormData({ ...formData, tgl_ot: date })}
          scrollableYearDropdown
          dateFormat={"yyyy-MM-dd"}
          showMonthDropdown
          showYearDropdown
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="jam_awal" className="form-label">
          JAM AWAL
        </label>
        <DatePicker
          autoComplete="off"
          id="jam_awal"
          dropdownMode="select"
          wrapperClassName={styles.datePicker}
          className="form-select"
          selected={formData.jam_awal}
          onChange={(date: any) => setFormData({ ...formData, jam_awal: date })}
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={10}
          timeCaption="Time"
          timeFormat="HH:mm"
          dateFormat="HH:mm"
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="jam_akhir" className="form-label">
          JAM AKHIR
        </label>
        <DatePicker
          autoComplete="off"
          id="jam_akhir"
          dropdownMode="select"
          wrapperClassName={styles.datePicker}
          className="form-select"
          selected={formData.jam_akhir}
          onChange={(date: any) =>
            setFormData({ ...formData, jam_akhir: date })
          }
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={10}
          timeCaption="Time"
          timeFormat="HH:mm"
          dateFormat="HH:mm"
          required
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="job_desc" className="form-label">
          JOB DESC
        </label>
        <input
          type="text"
          id="job_desc"
          className="form-control text-uppercase"
          value={formData.job_desc || ""}
          onChange={(e) =>
            setFormData({ ...formData, job_desc: e.target.value })
          }
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="remarks" className="form-label">
          REMARKS
        </label>
        <input
          type="text"
          id="remarks"
          className="form-control text-uppercase"
          value={formData.remarks || ""}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
        />
      </div>
    </Modal>
  );
}
