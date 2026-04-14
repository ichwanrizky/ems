"use client";
import Alert from "@/components/Alert";
import React, { useEffect, useState } from "react";
import { getSlipThr, SlipThrDataProps } from "../_libs/action";
import SlipThrPdf from "@/libs/SlipThr";
import { PDFDownloadLink } from "@react-pdf/renderer";

const monthNames = (month: number) => {
  const names = [
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
  return names[month - 1];
};

export default function SlipThrView({ uuid }: { uuid: string }) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [data, setData] = useState<SlipThrDataProps | null>(null);

  useEffect(() => {
    fetchData(uuid);
  }, [uuid]);

  const fetchData = async (uuid: string) => {
    setLoadingPage(true);
    try {
      const result = await getSlipThr(uuid);
      if (result.status) {
        setData(result.data);
      } else {
        setAlertPage({
          status: true,
          color: "danger",
          message: "Failed",
          subMessage: result.message,
        });
      }
    } catch {
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
                <h4 className="fw-bold">SLIP THR</h4>
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
              ) : data ? (
                <div
                  className="card-body px-4"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <div className="mb-3">
                    <div className="d-flex justify-content-between fw-semibold">
                      <span>Nama:</span>
                      <span className="text-end">
                        {data.pegawai.nama?.toUpperCase()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>Posisi:</span>
                      <span>{data.pegawai.position?.toUpperCase()}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>Bulan:</span>
                      <span>{monthNames(data.bulan)}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-semibold mt-2">
                      <span>Tahun:</span>
                      <span>{data.tahun}</span>
                    </div>

                    <PDFDownloadLink
                      document={<SlipThrPdf data={data} />}
                      fileName={`Slip THR ${data.pegawai.nama} (${monthNames(
                        data.bulan
                      )} ${data.tahun}).pdf`}
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

                  <div className="mb-3">
                    <h5 className="fw-semibold">Income</h5>
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
                    >
                      <span
                        style={{
                          flex: 1,
                          marginRight: "70px",
                          wordBreak: "break-word",
                        }}
                      >
                        THR
                      </span>
                      <span style={{ flexShrink: 0 }}>
                        {data.thr.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between fw-bold mt-3 p-2"
                      style={{
                        fontSize: "12pt",
                        backgroundColor: "#e6f7ff",
                        border: "2px solid #1890ff",
                        borderRadius: "5px",
                        color: "#1890ff",
                      }}
                    >
                      <span>Total THR (A)</span>
                      <span>{data.thr.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="fw-semibold">Deduction</h5>
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
                    >
                      <span
                        style={{
                          flex: 1,
                          marginRight: "70px",
                          wordBreak: "break-word",
                        }}
                      >
                        PPH21
                      </span>
                      <span style={{ flexShrink: 0 }}>
                        {data.pph21.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div
                      className="d-flex justify-content-between fw-bold mt-3 p-2"
                      style={{
                        fontSize: "12pt",
                        backgroundColor: "#e6f7ff",
                        border: "2px solid #1890ff",
                        borderRadius: "5px",
                        color: "#1890ff",
                      }}
                    >
                      <span>Total Deduction (B)</span>
                      <span>{data.pph21.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div
                      className="d-flex justify-content-between fw-bold mt-3 p-3"
                      style={{
                        fontSize: "14pt",
                        backgroundColor: "#f6ffed",
                        border: "2px solid #52c41a",
                        borderRadius: "5px",
                        color: "#52c41a",
                      }}
                    >
                      <span>Total THR</span>
                      <span>{data.net_thr.toLocaleString("id-ID")}</span>
                    </div>
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
