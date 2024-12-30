"use client";
import Alert from "@/components/Alert";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/styles.module.css";
import {
  AccessDepartmentProps,
  AccessSubDepartmentProps,
  PegawaiProps,
} from "@/types";
import { editDataKaryawan } from "../_libs/action";
import { useRouter } from "next/navigation";

type DataKaryawanEditProps = {
  accessDepartment: AccessDepartmentProps;
  accessSubDepartment: AccessSubDepartmentProps;
  pegawaiData: PegawaiProps;
};

export default function DataKaryawanEditView(props: DataKaryawanEditProps) {
  const { accessDepartment, accessSubDepartment, pegawaiData } = props;
  const [alert, setAlert] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const { push } = useRouter();

  const [selectedSubDepartment, setSelectedSubDepartment] = useState(
    [] as AccessSubDepartmentProps
  );

  const [formData, setFormData] = useState({
    id: pegawaiData.id || (null as number | null),
    department_id: pegawaiData.department.id || (null as number | null),
    sub_department_id:
      pegawaiData.sub_department?.id || (null as number | null),
    panji_id: pegawaiData.panji_id || "",
    nama: pegawaiData.nama || "",
    nik_ktp: pegawaiData.nik_ktp || ("" as string | number),
    position: pegawaiData.position || "",
    tmp_lahir: pegawaiData.tmp_lahir || "",
    tgl_lahir: pegawaiData.tgl_lahir || (null as Date | null),
    jk: pegawaiData.jk || "",
    agama: pegawaiData.agama || "",
    telp: pegawaiData.telp || ("" as string | number),
    email: pegawaiData.email || "",
    alamat: pegawaiData.alamat || "",
    rt: pegawaiData.rt || "",
    rw: pegawaiData.rw || "",
    kel: pegawaiData.kel || "",
    kec: pegawaiData.kec || "",
    kota: pegawaiData.kota || "",
    kebangsaan: pegawaiData.kebangsaan || "INDONESIA",
    status_nikah: pegawaiData.status_nikah || "",
    tgl_join: null as Date | null,
    npwp: pegawaiData.npwp || "",
    jenis_bank: pegawaiData.jenis_bank || "",
    no_rek: pegawaiData.no_rek || "",
    bpjs_tk: pegawaiData.bpjs_tk || "",
    bpjs_kes: pegawaiData.bpjs_kes || "",
  });

  useEffect(() => {
    handleSelectSubDepartment(pegawaiData.department.id);
  }, []);

  const handleSelectSubDepartment = (department_id: number) => {
    const subDepartments = accessSubDepartment.filter(
      (item) => item.sub_department.department_id === department_id
    );

    setSelectedSubDepartment(subDepartments as AccessSubDepartmentProps);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirm("Submit this data?")) {
      setIsLoadingSubmit(true);
      try {
        const result = await editDataKaryawan(formData as any);
        if (result.status) {
          setAlert({
            status: true,
            color: "success",
            message: "Success",
            subMessage: result.message,
          });
          setTimeout(() => {
            push("/hr/datakaryawan");
          }, 1000);
        } else {
          setAlert({
            status: true,
            color: "danger",
            message: "Failed",
            subMessage: result.message,
          });

          setIsLoadingSubmit(false);
        }
      } catch (error) {
        setAlert({
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

  return (
    <div className="row">
      <div className="col-12 col-lg-12">
        <form onSubmit={handleSubmit}>
          <div className="card">
            {alert.status && (
              <div className="px-3 mt-3">
                <Alert
                  color={alert.color}
                  message={alert.message}
                  subMessage={alert.subMessage}
                />
              </div>
            )}

            {isLoadingPage ? (
              <div className="d-flex justify-content-center p-3">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                LOADING ...
              </div>
            ) : (
              <>
                <div
                  className="card-body"
                  style={{ overflowY: "auto", maxHeight: "65vh" }}
                >
                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="department" className="form-label">
                          DEPT.
                        </label>
                        <select
                          autoComplete="off"
                          className="form-select"
                          id="department"
                          required
                          value={formData.department_id || ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              department_id: Number(e.target.value),
                              sub_department_id: null,
                            });
                            setSelectedSubDepartment([]);
                            if (e.target.value) {
                              handleSelectSubDepartment(Number(e.target.value));
                            }
                          }}
                        >
                          <option value="">- SELECT -</option>
                          {accessDepartment?.map((item, index) => (
                            <option value={item.department.id} key={index}>
                              {item.department.nama_department}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="sub_department" className="form-label">
                          SUB DEPT.
                        </label>
                        <select
                          autoComplete="off"
                          className="form-select"
                          id="sub_department"
                          value={formData.sub_department_id || ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              sub_department_id: Number(e.target.value),
                            });
                          }}
                        >
                          <option value="">- SELECT -</option>
                          {selectedSubDepartment?.map((item, index) => (
                            <option value={item.sub_department.id} key={index}>
                              {item.sub_department.nama_sub_department}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <hr />

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-2">
                        <label htmlFor="id_karyawan" className="form-label">
                          ID KARYAWAN
                        </label>
                        <input
                          type="text"
                          id="id_karyawan"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              panji_id: e.target.value,
                            })
                          }
                          value={formData.panji_id}
                        />
                      </div>

                      <div className="col-sm-10">
                        <label htmlFor="nama_karyawan" className="form-label">
                          NAMA KARYAWAN
                        </label>
                        <input
                          type="text"
                          id="nama_karyawan"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nama: e.target.value,
                            })
                          }
                          value={formData.nama}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="nik" className="form-label">
                          NIK
                        </label>
                        <input
                          type="number"
                          id="nik"
                          autoComplete="off"
                          className="form-control"
                          onWheelCapture={(e: any) => e.target.blur()}
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nik_ktp: e.target.value,
                            })
                          }
                          value={formData.nik_ktp}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="posisi" className="form-label">
                          POSISI
                        </label>
                        <input
                          type="text"
                          id="posisi"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                          value={formData.position}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="tempat_lahir" className="form-label">
                          TEMPAT LAHIR
                        </label>
                        <input
                          type="text"
                          id="tempat_lahir"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tmp_lahir: e.target.value,
                            })
                          }
                          value={formData.tmp_lahir}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="tanggal_lahir" className="form-label">
                          TANGGAL LAHIR
                        </label>
                        <DatePicker
                          autoComplete="off"
                          id="tanggal_lahir"
                          dropdownMode="select"
                          wrapperClassName={styles.datePicker}
                          className="form-select"
                          selected={formData.tgl_lahir}
                          onChange={(date: any) =>
                            setFormData({ ...formData, tgl_lahir: date })
                          }
                          scrollableYearDropdown
                          dateFormat={"yyyy-MM-dd"}
                          showMonthDropdown
                          showYearDropdown
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="jk" className="form-label">
                          JENIS KELAMIN
                        </label>
                        <select
                          autoComplete="off"
                          className="form-select"
                          id="jk"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jk: e.target.value,
                            })
                          }
                          value={formData.jk}
                        >
                          <option value="">- SELECT -</option>
                          <option value="L">LAKI-LAKI</option>
                          <option value="P">PEREMPUAN</option>
                        </select>
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="agama" className="form-label">
                          AGAMA
                        </label>
                        <select
                          autoComplete="off"
                          className="form-select"
                          id="agama"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              agama: e.target.value,
                            })
                          }
                          value={formData.agama}
                        >
                          <option value="">- SELECT -</option>
                          <option value="Islam">Islam</option>
                          <option value="Kristen Protestan">
                            Kristen Protestan
                          </option>
                          <option value="Kristen Katolik">
                            Kristen Katolik
                          </option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="telp" className="form-label">
                          NO TELP/WA
                        </label>
                        <input
                          type="number"
                          id="telp"
                          autoComplete="off"
                          className="form-control"
                          onWheelCapture={(e: any) => e.target.blur()}
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telp: e.target.value,
                            })
                          }
                          value={formData.telp}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="email" className="form-label">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          id="email"
                          autoComplete="off"
                          className="form-control text-lowercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          value={formData.email}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="alamat " className="form-label">
                      ALAMAT
                    </label>
                    <textarea
                      autoComplete="off"
                      className="form-control"
                      rows={4}
                      id="alamat"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alamat: e.target.value,
                        })
                      }
                      value={formData.alamat}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="rt" className="form-label">
                          RT
                        </label>
                        <input
                          type="text"
                          id="rt"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rt: e.target.value,
                            })
                          }
                          value={formData.rt}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="rw" className="form-label">
                          RW
                        </label>
                        <input
                          type="text"
                          id="rw"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rw: e.target.value,
                            })
                          }
                          value={formData.rw}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="kel" className="form-label">
                          KEL.
                        </label>
                        <input
                          type="text"
                          id="kel"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              kel: e.target.value,
                            })
                          }
                          value={formData.kel}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="kec" className="form-label">
                          KEC.
                        </label>
                        <input
                          type="text"
                          id="kec"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              kec: e.target.value,
                            })
                          }
                          value={formData.kec}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="kota" className="form-label">
                          KOTA
                        </label>
                        <input
                          type="text"
                          id="kota"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              kota: e.target.value,
                            })
                          }
                          value={formData.kota}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="kebangsaan" className="form-label">
                          KEBANGSAAN
                        </label>
                        <input
                          type="text"
                          id="kebangsaan"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          disabled
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              kebangsaan: e.target.value,
                            })
                          }
                          value={formData.kebangsaan}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="status_nikah" className="form-label">
                          STATUS NIKAH
                        </label>
                        <select
                          autoComplete="off"
                          className="form-select"
                          id="status_nikah"
                          required
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status_nikah: e.target.value,
                            })
                          }
                          value={formData.status_nikah}
                        >
                          <option value="">- SELECT -</option>
                          <option value="TK">TK</option>
                          <option value="K0">K0</option>
                          <option value="K1">K1</option>
                          <option value="K2">K2</option>
                          <option value="K3">K3</option>
                          <option value="TK/0">TK/0</option>
                          <option value="TK/1">TK/1</option>
                          <option value="TK/2">TK/2</option>
                          <option value="TK/3">TK/3</option>
                        </select>
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="tanggal_join" className="form-label">
                          TANGGAL JOIN
                        </label>
                        <DatePicker
                          autoComplete="off"
                          id="tanggal_join"
                          dropdownMode="select"
                          wrapperClassName={styles.datePicker}
                          className="form-select"
                          selected={formData.tgl_join}
                          onChange={(date: any) =>
                            setFormData({ ...formData, tgl_join: date })
                          }
                          scrollableYearDropdown
                          dateFormat={"yyyy-MM-dd"}
                          showMonthDropdown
                          showYearDropdown
                          isClearable
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="npwp" className="form-label">
                      NPWP
                    </label>
                    <input
                      type="text"
                      id="npwp"
                      autoComplete="off"
                      className="form-control text-uppercase"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          npwp: e.target.value,
                        })
                      }
                      value={formData.npwp}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="jenis_bank" className="form-label">
                          JENIS BANK
                        </label>
                        <select
                          autoComplete="off"
                          className="form-select"
                          id="jenis_bank"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jenis_bank: e.target.value,
                            })
                          }
                          value={formData.jenis_bank}
                        >
                          <option value="">- SELECT -</option>
                          <option value="BRI">BRI</option>
                          <option value="MANDIRI">MANDIRI</option>
                        </select>
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="rekening" className="form-label">
                          NO REKENING
                        </label>
                        <input
                          type="text"
                          id="rekening"
                          autoComplete="off"
                          className="form-control text-uppercase"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              no_rek: e.target.value,
                            })
                          }
                          value={formData.no_rek}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="row">
                      <div className="col-sm-6">
                        <label htmlFor="bpjs_tk" className="form-label">
                          NO BPJS TK
                        </label>
                        <input
                          type="number"
                          id="rekening"
                          autoComplete="off"
                          className="form-control"
                          onWheelCapture={(e) => e.currentTarget.blur()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bpjs_tk: e.target.value,
                            })
                          }
                          value={formData.bpjs_tk}
                        />
                      </div>

                      <div className="col-sm-6">
                        <label htmlFor="bpjs_kes" className="form-label">
                          NO BPKS KES
                        </label>
                        <input
                          type="number"
                          id="bpjs_kes"
                          autoComplete="off"
                          className="form-control"
                          onWheelCapture={(e) => e.currentTarget.blur()}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bpjs_kes: e.target.value,
                            })
                          }
                          value={formData.bpjs_kes}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer py-3">
                  <a href="/config/access" className="btn btn-secondary me-2">
                    CLOSE
                  </a>

                  {isLoadingSubmit ? (
                    <button type="button" className="btn btn-success" disabled>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      LOADING ...
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success">
                      SAVE DATA
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
