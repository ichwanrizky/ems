"use client";
import { AccessDepartmentProps, AccessSubDepartmentProps } from "@/types";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/styles.module.css";
import { DateNowFormat } from "@/libs/DateFormat";

type AbsensiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessSubDepartment: AccessSubDepartmentProps;
};

export default function AbsensiView(props: AbsensiViewProps) {
  const { accessDepartment, accessSubDepartment } = props;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setHours(currentDate.getHours() + 7);

  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [selectedSubDepartment, setSelectedSubDepartment] = useState(
    accessSubDepartment.filter(
      (e) =>
        e.sub_department.department_id === accessDepartment[0].department.id
    ) || ([] as AccessSubDepartmentProps)
  );
  const [filter, setFilter] = useState({
    department: accessDepartment[0].department.id || "",
    sub_department: "",
    date: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    if (alertPage.status) {
      const timer = setTimeout(() => {
        setAlertPage({
          status: false,
          color: "",
          message: "",
          subMessage: "",
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alertPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <>
      <div className="row g-3">
        <div className="col-auto">
          <div className="position-relative">
            <input
              className="form-control px-5"
              type="search"
              placeholder="Search"
              //   value={searchTerm}
              //   onChange={handleSearch}
            />
            <span className="material-icons-outlined position-absolute ms-3 translate-middle-y start-0 top-50 fs-5">
              search
            </span>
          </div>
        </div>
        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <DatePicker
              autoComplete="off"
              id="tanggal_lahir"
              dropdownMode="select"
              wrapperClassName={styles.datePicker}
              className="form-select"
              selected={new Date()}
              //   onChange={(date: any) =>
              //     setFormData({ ...formData, tgl_lahir: date })
              //   }
              scrollableYearDropdown
              dateFormat={"yyyy-MM-dd"}
              showMonthDropdown
              showYearDropdown
              onKeyDown={(e) => {
                e.preventDefault();
              }}
            />

            <select
              className="form-select me-2 ms-2"
              onChange={(e) => {
                setFilter({ ...filter, department: e.target.value });

                setSelectedSubDepartment([]);
                if (e.target.value) {
                  const subDepartments = accessSubDepartment.filter(
                    (item) =>
                      item.sub_department.department_id ===
                      Number(e.target.value)
                  );

                  setSelectedSubDepartment(
                    subDepartments as AccessSubDepartmentProps
                  );
                }
              }}
            >
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
            </select>

            <select
              className="form-select me-2"
              onChange={(e) => {
                setFilter({ ...filter, sub_department: e.target.value });
              }}
            >
              <option value="">-- SUB DEPT --</option>
              {selectedSubDepartment?.map((item, index: number) => (
                <option value={item.sub_department.id} key={index}>
                  {item.sub_department.nama_sub_department}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-auto"></div>
      </div>

      <div></div>
    </>
  );
}
