"use client";
import Button from "@/components/Button";
import { AccessDepartmentProps, AccessProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import { getMasterGaji } from "../_libs/action";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { NumericFormat } from "react-number-format";

type MasterGajiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function MasterGajiView(props: MasterGajiViewProps) {
  const { accessDepartment, accessMenu } = props;

  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<isLoadingProps>({});
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    department:
      accessDepartment[0].department.id?.toString() || ("" as string | number),
  });

  const [komponenGaji, setKomponenGaji] = useState(
    [] as {
      id: number;
      komponen: string;
    }[]
  );

  const [masterGajiData, setMasterGajiData] = useState(
    [] as {
      id: number;
      nama: string;
      status_nikah: string;
      type_gaji: string;
      master_gaji_pegawai: {
        id: number;
        nominal: number;
        komponen: {
          id: number;
          komponen: string;
        };
      }[];
    }[]
  );

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

  useEffect(() => {
    fetchData(debouncedSearchTerm, filter);
  }, [debouncedSearchTerm, filter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchData = async (
    search: string,
    filter: {
      department: string | number;
    }
  ) => {
    setLoadingPage(true);
    try {
      const result = await getMasterGaji(search, filter);
      if (result.status) {
        setKomponenGaji(result.komponen);
        setMasterGajiData(result.data);
      } else {
        setAlertPage({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
      }
    } catch (error) {
      setAlertPage({
        status: true,
        color: "danger",
        message: "Error",
        subMessage: "Something went wrong, please refresh and try again",
      });
    } finally {
      setLoadingPage(false);
    }
  };

  return (
    <>
      <div className="row g-3">
        <div className="col-auto">
          <div className="position-relative">
            <input
              className="form-control px-5"
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
            <span className="material-icons-outlined position-absolute ms-3 translate-middle-y start-0 top-50 fs-5">
              search
            </span>
          </div>
        </div>
        <div className="col-auto flex-grow-1 overflow-auto">
          <div className="btn-group position-static">
            <select
              className="form-select"
              onChange={(e) =>
                setFilter({ ...filter, department: e.target.value })
              }
              value={filter.department}
            >
              <option value="">-- DEPT --</option>
              {accessDepartment?.map((item, index: number) => (
                <option value={item.department.id} key={index}>
                  {item.department.nama_department}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-auto flex-grow-1 overflow-auto"></div>

        <div className="col-auto">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            {accessMenu.insert && (
              <Button
                type="createTable"
                // onClick={() => setIsCreateOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          {alertPage.status && (
            <Alert
              color={alertPage.color}
              message={alertPage.message}
              subMessage={alertPage.subMessage}
            />
          )}

          <div className="customer-table">
            <div className="table-responsive white-space-nowrap">
              <table className="table align-middle table-striped table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "1%" }}>NO</th>
                    <th style={{ width: "1%" }}></th>
                    <th>NAMA</th>
                    <th style={{ width: "10%" }}>PTKP</th>
                    <th style={{ width: "10%" }}>TIPE</th>
                    {komponenGaji?.map((e, index) => (
                      <th key={index} style={{ fontSize: "8pt", width: "20%" }}>
                        {e.komponen?.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPage ? (
                    <tr>
                      <td colSpan={5 + komponenGaji?.length} align="center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                      </td>
                    </tr>
                  ) : masterGajiData.length > 0 ? (
                    masterGajiData.map((item, index) => (
                      <tr key={index}>
                        <td align="center">{index + 1}</td>
                        <td align="center"></td>
                        <td>{item.nama?.toUpperCase()}</td>
                        <td align="center">
                          {item.status_nikah?.toUpperCase()}
                        </td>
                        <td align="center">{item.type_gaji}</td>
                        {item.master_gaji_pegawai.map((item2, index2) => (
                          <td key={index2}>
                            <NumericFormat
                              defaultValue={item2.nominal}
                              thousandSeparator=","
                              displayType="input"
                              onValueChange={(e) => {}}
                              onFocus={(e) =>
                                e.target.value === "0" && (e.target.value = "")
                              }
                              onBlur={(e) =>
                                e.target.value === "" && (e.target.value = "0")
                              }
                              onWheel={(e: any) => e.target.blur()}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5 + komponenGaji?.length} align="center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={1}
                totalPage={1}
                maxPagination={1}
                setCurrentPage={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
