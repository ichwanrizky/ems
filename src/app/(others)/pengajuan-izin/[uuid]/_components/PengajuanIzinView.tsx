"use client";

import React, { useEffect, useState } from "react";
import { createPengajuanIzin, getRequestPengajuanIziun } from "../_libs/action";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/styles.module.css";
import Alert from "@/components/Alert";

export default function PengajuanIzinView({ uuid }: { uuid: string }) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [successSubmit, setSuccessSubmit] = useState(false);

  const [pengajuanIzinData, setPengajuanIzinData] = useState<{
    pegawai: {
      id: number;
      nama: string;
      department: {
        id: number;
        nama_department: string;
      };
      sub_department: {
        id: number | null;
        nama_sub_department: string | null;
      };
    };
    jenis_izin: {
      kode: string;
      jenis: string;
      is_jam: boolean;
    }[];
    tgl_merah: {
      tanggal: Date | null;
      tanggal_nomor: string;
    }[];
  } | null>(null);

  const [formData, setFormData] = useState({
    uuid: uuid,
    department_id: "" as string | number,
    pegawai_id: "" as string | number,
    jenis_izin: "" as string,
    tgl_izin: null as Date | null,
    is_jam: false,
    is_hari: false,
    jumlah_hari: 0,
    jumlah_jam: 0,
    keterangan: "",
    mc_base64: "",
  });

  useEffect(() => {
    fetchData(uuid);
  }, []);

  const fetchData = async (uuid: string) => {
    setLoadingPage(true);
    try {
      const result = await getRequestPengajuanIziun(uuid);
      if (result.status) {
        setPengajuanIzinData(result.data);
        setFormData({
          ...formData,
          department_id: result.data.pegawai.department.id.toString(),
          pegawai_id: result.data.pegawai.id.toString(),
        });
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

  const handleChangeJenis = async (kode: string) => {
    setFormData((prev) => ({
      ...prev,
      is_jam: false,
      is_hari: false,
      jumlah_hari: 0,
      jumlah_jam: 0,
    }));

    if (kode != "") {
      const result = pengajuanIzinData?.jenis_izin.find(
        (item) => item.kode === kode
      );
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

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const allowedExtensions = ["png", "jpg", "jpeg"];

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Only PNG, JPG, and JPEG files are allowed.");
        event.target.value = "";
        return;
      }

      const fileSize = file.size / 1024;
      if (fileSize > 2048) {
        alert("Maximum file size is 2MB.");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          mc_base64: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await createPengajuanIzin(formData as any);
        if (result.status) {
          setAlertPage({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          setSuccessSubmit(true);
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
        setIsLoadingSubmit(false);
      }
    }

    return;
  };

  if (successSubmit) {
    return (
      <div className="auth-basic-wrapper d-flex align-items-center justify-content-center">
        <div className="container-fluid my-5 my-lg-0">
          <div className="row">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4 mx-auto">
              <div className="card rounded-4 mb-0 border-top border-4 border-primary">
                <div className="card-body">
                  <Alert
                    color={"success"}
                    message={"Success"}
                    subMessage={
                      "Pengajuan berhasil dilakukan silahkan lihat status di dalam aplikasi ."
                    }
                  />
                </div>
                <div className="card-header p-4 text-center">
                  <h4 className="fw-bold">FORM PENGAJUAN IZIN</h4>
                </div>
                <div className="card-body px-4 text-center"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-basic-wrapper d-flex align-items-center justify-content-center">
      <div className="container-fluid my-5 my-lg-0">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4 mx-auto">
            <div className="card rounded-4 mb-0 border-top border-4 border-primary">
              {alertPage.status && (
                <div className="card-body">
                  <Alert
                    color={alertPage.color}
                    message={alertPage.message}
                    subMessage={alertPage.subMessage}
                  />
                </div>
              )}
              <div className="card-header p-4 text-center">
                <h4 className="fw-bold">FORM PENGAJUAN IZIN</h4>
              </div>

              {loadingPage ? (
                <div className="card-body px-4 text-center">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading...
                </div>
              ) : pengajuanIzinData ? (
                <>
                  <form onSubmit={handleSubmit}>
                    <div
                      className="card-body px-4"
                      style={{ maxHeight: "70vh", overflowY: "auto" }}
                    >
                      <div className="form-group mb-3">
                        <label htmlFor="dept" className="form-label">
                          DEPT.
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          disabled
                          value={
                            pengajuanIzinData?.pegawai.department.nama_department?.toUpperCase() ||
                            ""
                          }
                        />
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="dept" className="form-label">
                          NAMA
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          disabled
                          value={
                            pengajuanIzinData?.pegawai.nama?.toUpperCase() || ""
                          }
                        />
                      </div>

                      <hr />

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
                          {pengajuanIzinData?.jenis_izin?.map((item, index) => (
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
                          excludeDates={pengajuanIzinData?.tgl_merah?.map(
                            (item) => new Date(item.tanggal || "")
                          )}
                          dayClassName={(date) =>
                            pengajuanIzinData?.tgl_merah?.some(
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

                      {formData.jenis_izin === "S" && (
                        <div className="form-group mb-3">
                          <label htmlFor="mc" className="form-label">
                            UPLOAD MC
                          </label>
                          <input
                            id="mc"
                            type="file"
                            className="form-control"
                            onChange={(e) => handleFileChange(e)}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="card-footer p-4  d-flex justify-content-end">
                      {isLoadingSubmit ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          disabled
                        >
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          LOADING ...
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-success">
                          SUBMIT DATA
                        </button>
                      )}
                    </div>
                  </form>
                </>
              ) : (
                <div className="card-body px-4 text-center"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
