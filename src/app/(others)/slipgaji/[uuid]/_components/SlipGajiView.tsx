"use client";
import React, { useEffect, useState } from "react";
import { getSlipGaji } from "../_libs/action";
import { SlipGajiDataProps } from "@/types";
import Alert from "@/components/Alert";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SlipGajiPdf from "@/libs/SlipGaji";

export default function SlipGajiView({ uuid }: { uuid: string }) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [slipGajiData, setSlipGajiData] = useState<SlipGajiDataProps | null>(
    null
  );

  useEffect(() => {
    fetchData(uuid);
  }, []);

  const fetchData = async (uuid: string) => {
    setLoadingPage(true);
    try {
      const result = await getSlipGaji(uuid);
      if (result.status) {
        setSlipGajiData(result.data);
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

  let totalA: number = 0;
  let totalB: number = 0;

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
                <h4 className="fw-bold">SLIP GAJI</h4>
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
              ) : slipGajiData ? (
                <div
                  className="card-body px-4"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <div className="mb-3">
                    <div className="d-flex justify-content-between fw-semibold">
                      <span>Nama:</span>
                      <span className="text-end">
                        {slipGajiData.pegawai.nama?.toUpperCase()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>Posisi:</span>
                      <span>
                        {slipGajiData.pegawai.position?.toUpperCase()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>Bulan:</span>
                      <span>{monthNames(slipGajiData.bulan)}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>Tahun:</span>
                      <span>{slipGajiData.tahun}</span>
                    </div>

                    <PDFDownloadLink
                      document={<SlipGajiPdf gajiPegawai={slipGajiData} />}
                      fileName={`Slip Gaji ${
                        slipGajiData.pegawai.nama
                      } (${monthNames(slipGajiData.bulan)} ${
                        slipGajiData.tahun
                      }).pdf`}
                    >
                      {({ loading }) =>
                        loading ? (
                          <button
                            type="button"
                            className="btn btn-success btn-sm mt-3"
                            disabled
                          >
                            <span className="spinner-border spinner-border-sm"></span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success btn-sm mt-3"
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                            Download PDF
                          </button>
                        )
                      }
                    </PDFDownloadLink>
                  </div>

                  <hr />

                  {/* INCOME */}
                  <div className="mb-3">
                    <h5 className="fw-semibold">Income</h5>
                    {slipGajiData?.gaji
                      .filter((item) => item.tipe === "penambahan")
                      .map((item, index: number) => {
                        totalA += Number(item.nominal);
                        return (
                          <div
                            className="d-flex justify-content-between"
                            style={{
                              fontSize: "10pt",
                              borderBottom: "1px solid #ccc",
                              padding: "5px 0",
                              wordWrap: "break-word",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            key={index}
                          >
                            <span
                              style={{
                                flex: 1,
                                marginRight: "70px",
                                wordBreak: "break-word",
                              }}
                            >
                              {item.komponen}
                            </span>
                            <span style={{ flexShrink: 0 }}>
                              {Number(item.nominal).toLocaleString("id-ID")}
                            </span>
                          </div>
                        );
                      })}
                    <div
                      className="d-flex justify-content-between fw-bold mt-3 p-2"
                      style={{
                        fontSize: "12pt",
                        backgroundColor: "#e6f7ff", // Light blue background
                        border: "2px solid #1890ff", // Blue border
                        borderRadius: "5px",
                        color: "#1890ff",
                      }}
                    >
                      <span>Total Income (A)</span>
                      <span style={{ color: "#1890ff" }}>
                        {totalA.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* DEDUCTION */}
                  <div className="mb-3">
                    <h5 className="fw-semibold">Deduction</h5>
                    {slipGajiData?.gaji
                      .filter((item) => item.tipe === "pengurangan")
                      .map((item, index: number) => {
                        totalB += Number(item.nominal);
                        return (
                          <div
                            className="d-flex justify-content-between"
                            style={{
                              fontSize: "10pt",
                              borderBottom: "1px solid #ccc",
                              padding: "5px 0",
                              wordWrap: "break-word",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            key={index}
                          >
                            <span
                              style={{
                                flex: 1,
                                marginRight: "70px",
                                wordBreak: "break-word",
                              }}
                            >
                              {item.komponen}
                            </span>
                            <span style={{ flexShrink: 0 }}>
                              {Number(item.nominal).toLocaleString("id-ID")}
                            </span>
                          </div>
                        );
                      })}
                    <div
                      className="d-flex justify-content-between fw-bold mt-3 p-2"
                      style={{
                        fontSize: "12pt",
                        backgroundColor: "#e6f7ff", // Light blue background
                        border: "2px solid #1890ff", // Blue border
                        borderRadius: "5px",
                        color: "#1890ff",
                      }}
                    >
                      <span>Total Deduction (B)</span>
                      <span style={{ color: "#1890ff" }}>
                        {totalB.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* TOTAL SALARY */}
                  <div className="mb-3">
                    <div
                      className="d-flex justify-content-between fw-bold mt-3 p-3"
                      style={{
                        fontSize: "14pt",
                        backgroundColor: "#f6ffed", // Light green background
                        border: "2px solid #52c41a", // Green border
                        borderRadius: "5px",
                        color: "#52c41a",
                      }}
                    >
                      <span>Total Salary</span>
                      <span style={{ color: "#52c41a" }}>
                        {(totalA - totalB).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="mb-3">
                    <h5 className="fw-semibold">Additional Info</h5>
                    {slipGajiData?.gaji
                      .filter((item) => item.tipe === "informasi")
                      .map((item, index: number) => {
                        return (
                          <div
                            className="d-flex justify-content-between"
                            style={{
                              fontSize: "10pt",
                              borderBottom: "1px solid #ccc",
                              padding: "5px 0",
                              wordWrap: "break-word",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            key={index}
                          >
                            <span
                              style={{
                                flex: 1,
                                marginRight: "70px",
                                wordBreak: "break-word",
                              }}
                            >
                              {item.komponen}
                            </span>
                            <span style={{ flexShrink: 0 }}>
                              {item.nominal}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
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

const monthNames = (month: number) => {
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

  return monthNames[month - 1];
};
