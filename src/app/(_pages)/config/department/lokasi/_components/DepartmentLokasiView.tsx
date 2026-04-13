"use client";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { DepartmentLocationProps, isLoadingProps } from "@/types";
import React, { useEffect, useState } from "react";
import {
  deleteDepartmentLocation,
  getDepartmentLocation,
  getDepartmentLocationId,
} from "../../_libs/action";
import DepartmentLokasiCreate from "./DepartmentLokasiCreate";
import DepartmentLokasiEdit from "./DepartmentLokasiEdit";

type Props = {
  departmentId: number;
  departmentName: string;
};

export default function DepartmentLokasiView({ departmentId, departmentName }: Props) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<isLoadingProps>({});
  const [alertPage, setAlertPage] = useState({ status: false, color: "", message: "", subMessage: "" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [locationData, setLocationData] = useState<DepartmentLocationProps[]>([]);
  const [locationEdit, setLocationEdit] = useState<DepartmentLocationProps>({} as DepartmentLocationProps);

  useEffect(() => {
    if (alertPage.status) {
      const t = setTimeout(() => setAlertPage({ status: false, color: "", message: "", subMessage: "" }), 2000);
      return () => clearTimeout(t);
    }
  }, [alertPage]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingPage(true);
    try {
      const result = await getDepartmentLocation(departmentId);
      if (result.status) {
        setLocationData(result.data);
      } else {
        setAlertPage({ status: true, color: "danger", message: "Failed", subMessage: result.message });
      }
    } catch {
      setAlertPage({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
    } finally {
      setLoadingPage(false);
    }
  };

  const handleGetEdit = async (id: number) => {
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await getDepartmentLocationId(id);
      if (result.status && result.data) {
        setLocationEdit(result.data);
        setIsEditOpen(true);
      } else {
        setAlertPage({ status: true, color: "danger", message: "Failed", subMessage: result.message });
      }
    } catch {
      setAlertPage({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
    } finally {
      setIsLoadingAction({ ...isLoadingAction, [id]: false });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this data?")) return;
    setIsLoadingAction({ ...isLoadingAction, [id]: true });
    try {
      const result = await deleteDepartmentLocation(id);
      if (result.status) {
        setAlertPage({ status: true, color: "success", message: "Success", subMessage: result.message });
        fetchData();
      } else {
        setAlertPage({ status: true, color: "danger", message: "Failed", subMessage: result.message });
      }
    } catch {
      setAlertPage({ status: true, color: "danger", message: "Error", subMessage: "Something went wrong, please refresh and try again" });
    } finally {
      setIsLoadingAction({ ...isLoadingAction, [id]: false });
    }
  };

  return (
    <>
      <div className="row g-3">
        <div className="col-auto flex-grow-1">
          <span className="text-muted">Department: </span>
          <strong>{departmentName}</strong>
        </div>
        <div className="col-auto">
          <Button type="createTable" onClick={() => setIsCreateOpen(true)} />
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          {alertPage.status && (
            <Alert color={alertPage.color} message={alertPage.message} subMessage={alertPage.subMessage} />
          )}

          <div className="table-responsive white-space-nowrap">
            <table className="table align-middle table-striped table-hover table-bordered">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "1%" }}></th>
                  <th style={{ width: "1%" }}>NO</th>
                  <th>NAMA LOKASI</th>
                  <th style={{ width: "35%" }}>COORDINATE</th>
                  <th style={{ width: "15%" }}>RADIUS (m)</th>
                </tr>
              </thead>
              <tbody>
                {loadingPage ? (
                  <tr>
                    <td colSpan={5} align="center">
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Loading...
                    </td>
                  </tr>
                ) : locationData.length > 0 ? (
                  locationData.map((item, index) => (
                    <tr key={index}>
                      <td align="center">
                        <Button
                          type="actionTable"
                          indexData={index}
                          isLoading={isLoadingAction[item.id!]}
                          onEdit={() => handleGetEdit(item.id!)}
                          onDelete={() => handleDelete(item.id!)}
                        />
                      </td>
                      <td align="center">{index + 1}</td>
                      <td>{item.nama_lokasi || "-"}</td>
                      <td align="center">{`${item.latitude}, ${item.longitude}`}</td>
                      <td align="center">{item.radius}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} align="center">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <DepartmentLokasiCreate
          isOpen={isCreateOpen}
          departmentId={departmentId}
          onClose={() => { setIsCreateOpen(false); fetchData(); }}
        />
      )}

      {isEditOpen && locationEdit.id && (
        <DepartmentLokasiEdit
          isOpen={isEditOpen}
          locationEdit={locationEdit}
          onClose={() => { setIsEditOpen(false); fetchData(); }}
        />
      )}
    </>
  );
}
