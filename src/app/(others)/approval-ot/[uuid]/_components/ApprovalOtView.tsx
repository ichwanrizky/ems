"use client";

import React, { useEffect, useState } from "react";
import { approvalOtByUuid, getApprovalOt } from "../_libs/action";
import Alert from "@/components/Alert";
import { DisplayFullDate, DisplayHour } from "@/libs/DisplayDate";
import { ApprovalOvertimeProps } from "@/types";

const STATUS_LABEL: Record<number, { label: string; color: string }> = {
  0: { label: "MENUNGGU APPROVAL", color: "warning" },
  1: { label: "DISETUJUI", color: "success" },
  2: { label: "DITOLAK", color: "danger" },
};

export default function ApprovalOtView({ uuid }: { uuid: string }) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [alertPage, setAlertPage] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });

  const [approvalData, setApprovalData] =
    useState<ApprovalOvertimeProps | null>(null);

  useEffect(() => {
    fetchData(uuid);
  }, []);

  const fetchData = async (uuid: string) => {
    setLoadingPage(true);
    try {
      const result = await getApprovalOt(uuid);
      if (result.status && result.data) {
        setApprovalData(result.data);
      } else {
        setApprovalData(null);
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

  // Approval hanya lewat klik tombol (bukan saat link dibuka), supaya
  // preview link WA/email tidak ikut meng-approve.
  const handleApproval = async (status: number) => {
    const text =
      status === 1 ? "Setujui pengajuan OT ini?" : "Tolak pengajuan OT ini?";
    if (!confirm(text)) return;

    setIsLoadingSubmit(true);
    try {
      const result = await approvalOtByUuid(uuid, status);
      setAlertPage({
        status: true,
        color: result.status ? "success" : "danger",
        message: result.status ? "Success" : "Failed",
        subMessage: result.message,
      });
      await fetchData(uuid);
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
  };

  const statusInfo = approvalData ? STATUS_LABEL[approvalData.status] : null;

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
                <h4 className="fw-bold">APPROVAL PENGAJUAN OT</h4>
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
              ) : approvalData ? (
                <>
                  <div
                    className="card-body px-4"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <table className="table table-bordered align-middle mb-0">
                      <tbody>
                        <tr>
                          <th style={{ width: "35%" }}>DEPT.</th>
                          <td>
                            {approvalData.department.nama_department?.toUpperCase()}
                          </td>
                        </tr>
                        <tr>
                          <th>SUB DEPT.</th>
                          <td>
                            {approvalData.sub_department.nama_sub_department?.toUpperCase()}
                          </td>
                        </tr>
                        <tr>
                          <th>TANGGAL</th>
                          <td>
                            {new Date(approvalData.tanggal)
                              .toLocaleString("id-ID", DisplayFullDate)
                              .replaceAll(".", ":")}
                          </td>
                        </tr>
                        <tr>
                          <th>JAM</th>
                          <td>
                            {new Date(approvalData.jam_from)
                              .toLocaleString("id-ID", DisplayHour)
                              .replaceAll(".", ":")}
                            {" - "}
                            {new Date(approvalData.jam_to)
                              .toLocaleString("id-ID", DisplayHour)
                              .replaceAll(".", ":")}
                          </td>
                        </tr>
                        <tr>
                          <th>NAMA</th>
                          <td>
                            {approvalData.pengajuan_overtime_pegawai.map((e) => (
                              <React.Fragment key={e.pegawai.id}>
                                * {e.pegawai.nama?.toUpperCase()}
                                <br />
                              </React.Fragment>
                            ))}
                          </td>
                        </tr>
                        <tr>
                          <th>JOB DESK</th>
                          <td>{approvalData.job_desc?.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <th>REMARK</th>
                          <td>{approvalData.remark?.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <th>STATUS</th>
                          <td>
                            {statusInfo && (
                              <span className={`badge bg-${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            )}
                            {approvalData.status !== 0 && (
                              <div className="mt-1 small">
                                {approvalData.approve_via_link
                                  ? "LINK APPROVAL"
                                  : approvalData.user?.name?.toUpperCase()}
                                {approvalData.approve_date && (
                                  <>
                                    <br />
                                    {new Date(approvalData.approve_date)
                                      .toLocaleString("id-ID", DisplayFullDate)
                                      .replaceAll(".", ":")}{" "}
                                    {new Date(approvalData.approve_date)
                                      .toLocaleString("id-ID", DisplayHour)
                                      .replaceAll(".", ":")}
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {approvalData.status === 0 && (
                    <div className="card-footer p-4 d-flex justify-content-end gap-2">
                      {isLoadingSubmit ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
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
                        <>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleApproval(2)}
                          >
                            TOLAK
                          </button>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => handleApproval(1)}
                          >
                            SETUJUI
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
