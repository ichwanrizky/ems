"use client";
import Button from "@/components/Button";
import { AccessDepartmentProps, AccessProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import { getMasterGaji, updateMasterGaji } from "../_libs/action";
import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { NumericFormat } from "react-number-format";
import * as XLSX from "xlsx";

type MasterGajiViewProps = {
  accessDepartment: AccessDepartmentProps;
  accessMenu: AccessProps;
};

export default function MasterGajiView(props: MasterGajiViewProps) {
  const { accessDepartment, accessMenu } = props;

  const [loadingPage, setLoadingPage] = useState(true);
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

  const [selectedPegawai, setSelectedPegawai] = useState(
    [] as {
      pegawai_id: number;
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

  const handleChangeData = (
    pegawaiId: number,
    komponenId: number,
    nominal: number
  ) => {
    setMasterGajiData(
      masterGajiData.map((e) => {
        return {
          ...e,
          master_gaji_pegawai: e.master_gaji_pegawai?.map((item, index) => {
            if (item.id === komponenId && e.id === pegawaiId) {
              return {
                ...item,
                nominal: nominal,
              };
            } else {
              return {
                ...item,
                nominal: e.master_gaji_pegawai[index].nominal
                  ? e.master_gaji_pegawai[index].nominal
                  : 0,
              } as any;
            }
          }),
        };
      })
    );
  };

  const handleChangeTypeGaji = (pegawaiId: number, typeGaji: string) => {
    setMasterGajiData(
      masterGajiData.map((e) =>
        e.id === pegawaiId ? { ...e, type_gaji: typeGaji } : e
      )
    );
  };

  const handleSelectPegawai = (pegawaiId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPegawai([...selectedPegawai, { pegawai_id: pegawaiId }]);
    } else {
      setSelectedPegawai(
        selectedPegawai.filter((item) => item.pegawai_id !== pegawaiId)
      );
    }
  };

  const handleSelectAllPegawai = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedPegawai(
        masterGajiData.map((item) => ({ pegawai_id: item.id }))
      );
    } else {
      setSelectedPegawai([]);
    }
  };

  const handleSubmit = async () => {
    if (selectedPegawai.length === 0) {
      setAlertPage({
        status: true,
        color: "danger",
        message: "Failed",
        subMessage: "Please select pegawai",
      });
      return;
    }

    if (confirm("Submit this data?")) {
      setLoadingPage(true);
      try {
        const selectPegawai = selectedPegawai.map((item) => item.pegawai_id);

        const listGajiUpdated = masterGajiData.filter((item) =>
          selectPegawai.includes(item.id)
        );

        const result = await updateMasterGaji(listGajiUpdated);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          fetchData("", filter);
        } else {
          setAlertPage({
            status: true,
            color: "danger",
            message: "Failed",
            subMessage: result.message,
          });
        }
      } catch (error) {
      } finally {
        setLoadingPage(false);
        setSelectedPegawai([]);
      }
    }
  };

  const exportToExcel = async () => {
    if (confirm("Export Excel this data?")) {
      setLoadingPage(true);
      try {
        const headerTitles = [
          "NO",
          "NAMA",
          ...komponenGaji.map((item) => item.komponen?.toUpperCase()),
        ];

        const data = masterGajiData.map((item, index: number) => {
          const row: any = {
            NO: index + 1,
            NAMA: item.nama?.toUpperCase(),
          };

          komponenGaji.forEach((komponen, idx) => {
            const key = komponen.komponen?.toUpperCase(); // harus sama dengan header
            const nominal = item.master_gaji_pegawai[idx]?.nominal || 0;
            row[key] = nominal;
          });

          return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headerTitles]);
        XLSX.utils.sheet_add_json(worksheet, data, {
          skipHeader: true,
          origin: "A2",
        });
        const colWidths = headerTitles.map((title, index) => {
          const maxContentWidth = Math.max(
            ...data.map((row: any) =>
              row[title] ? row[title].toString().length : 0
            )
          );
          return { wch: Math.max(title.length, maxContentWidth) };
        });
        worksheet["!cols"] = colWidths;
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `DATA MASTER GAJI.xlsx`);
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
    }

    return;
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
            {komponenGaji.length > 0 && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => exportToExcel()}
              >
                EXPORT EXCEL
              </button>
            )}
            {accessMenu.insert && (
              <Button type="saveTable" onClick={handleSubmit} />
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
            <div
              className="table-responsive white-space-nowrap"
              style={{ maxHeight: "500px" }}
            >
              <table className="table align-middle table-striped table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th
                      className="sticky-col sticky-header"
                      style={{ width: "50px" }}
                    >
                      NO
                    </th>
                    <th
                      className="sticky-col sticky-header"
                      style={{ width: "50px" }}
                    >
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          handleSelectAllPegawai(e.target.checked)
                        }
                        checked={
                          selectedPegawai.length === masterGajiData.length
                        }
                      />
                    </th>
                    <th
                      className="sticky-col sticky-header"
                      style={{ width: "150px" }}
                    >
                      NAMA
                    </th>
                    <th className="sticky-header" style={{ width: "10%" }}>
                      PTKP
                    </th>
                    <th className="sticky-header" style={{ width: "10%" }}>
                      TIPE
                    </th>
                    {komponenGaji?.map((e, index) => (
                      <th
                        className="sticky-header"
                        key={index}
                        style={{ fontSize: "8pt", width: "20%" }}
                      >
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
                        <td className="sticky-col" align="center">
                          {index + 1}
                        </td>
                        <td className="sticky-col" align="center">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleSelectPegawai(item.id, e.target.checked)
                            }
                            checked={selectedPegawai.some(
                              (e) => e.pegawai_id === item.id
                            )}
                          />
                        </td>
                        <td className="sticky-col">
                          {item.nama?.toUpperCase()}
                        </td>
                        <td align="center">
                          {item.status_nikah?.toUpperCase()}
                        </td>
                        <td align="center">
                          <select
                            value={item.type_gaji}
                            onChange={(e) =>
                              handleChangeTypeGaji(item.id, e.target.value)
                            }
                          >
                            <option value="fix">FIX</option>
                            <option value="nonfixed">NONFIXED</option>
                          </select>
                        </td>
                        {item.master_gaji_pegawai.map((item2, index2) => (
                          <td key={index2}>
                            <NumericFormat
                              defaultValue={item2.nominal}
                              thousandSeparator=","
                              displayType="input"
                              onValueChange={(values) => {
                                handleChangeData(
                                  item.id,
                                  item2.id,
                                  Number(values.floatValue)
                                );
                              }}
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

            <style jsx>{`
              .table-responsive {
                overflow-x: auto;
              }
              .sticky-col {
                position: -webkit-sticky;
                position: sticky;
                left: 0;
                background-color: #fff;
                z-index: 10;
                color: #000;
              }
              .sticky-header {
                position: -webkit-sticky;
                position: sticky;
                top: 0;
                background-color: #fff;
                z-index: 10;
              }
              .sticky-col:nth-child(4) {
                z-index: 9; /* Adjust z-index for the last sticky column */
              }
            `}</style>
          </div>
        </div>
      </div>
    </>
  );
}
