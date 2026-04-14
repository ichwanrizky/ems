"use client";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import FilterSection from "@/components/FilterSection";
import {
  AccessDepartmentProps,
  isLoadingProps,
  PegawaiLocationProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import {
  deletePegawaiLokasi,
  getPegawaiLokasi,
  getPegawaiLokasiId,
} from "../_libs/action";
import LokasiTambahanCreate from "./LokasiTambahanCreate";
import LokasiTambahanEdit from "./LokasiTambahanEdit";
import { getPegawaiByDepartment } from "../_libs/action";

type Props = {
  accessDepartment: AccessDepartmentProps;
  defaultDepartmentId: number;
};

export default function LokasiTambahanView({ accessDepartment, defaultDepartmentId }: Props) {
  const [loadingPage, setLoadingPage] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<isLoadingProps>({});
  const [alertPage, setAlertPage] = useState({ status: false, color: "", message: "", subMessage: "" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [lokasiData, setLokasiData] = useState<PegawaiLocationProps[]>([]);
  const [lokasiEdit, setLokasiEdit] = useState<PegawaiLocationProps>({} as PegawaiLocationProps);
  const [selectedDept, setSelectedDept] = useState(defaultDepartmentId || (accessDepartment[0]?.department.id ?? 0));
  const [selectedPegawai, setSelectedPegawai] = useState(0);
  const [pegawaiList, setPegawaiList] = useState<{ id: number; nama: string }[]>([]);

  useEffect(() => {
    if (alertPage.status) {
      const t = setTimeout(() => setAlertPage({ status: false, color: "", message: "", subMessage: "" }), 2000);
      return () => clearTimeout(t);
    }
  }, [alertPage]);

  useEffect(() => {
    if (selectedDept) {
      loadPegawaiList(selectedDept);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedPegawai]);

  const loadPegawaiList = async (dept_id: number) => {
    try {
      const result = await getPegawaiByDepartment(dept_id);
      if (result.status) {
        setPegawaiList(result.data);
        setSelectedPegawai(0);
      }
    } catch {}
  };

  const fetchData = async () => {
    if (!selectedDept) return;
    setLoadingPage(true);
    try {
      const result = await getPegawaiLokasi(
        selectedDept,
        selectedPegawai || undefined
      );
      if (result.status) {
        setLokasiData(result.data);
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
      const result = await getPegawaiLokasiId(id);
      if (result.status && result.data) {
        setLokasiEdit(result.data);
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
      const result = await deletePegawaiLokasi(id);
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
        <div className="col-sm-3">
          <FilterSection
            options={accessDepartment.map((item) => ({
              value: item.department.id,
              label: item.department.nama_department,
            }))}
            value={selectedDept || ""}
            onChange={(val) => setSelectedDept(val ? Number(val) : 0)}
          />
        </div>

        <div className="col-sm-3">
          <select
            className="form-select"
            value={selectedPegawai}
            onChange={(e) => setSelectedPegawai(Number(e.target.value))}
            disabled={!selectedDept}
          >
            <option value={0}>- SEMUA KARYAWAN -</option>
            {pegawaiList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>

        <div className="col-auto flex-grow-1" />

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
                  <th>KARYAWAN</th>
                  <th>NAMA LOKASI</th>
                  <th style={{ width: "35%" }}>COORDINATE</th>
                  <th style={{ width: "12%" }}>RADIUS (m)</th>
                </tr>
              </thead>
              <tbody>
                {loadingPage ? (
                  <tr>
                    <td colSpan={6} align="center">
                      <div className="spinner-border spinner-border-sm me-2" role="status" />
                      Loading...
                    </td>
                  </tr>
                ) : lokasiData.length > 0 ? (
                  lokasiData.map((item, index) => (
                    <tr key={index}>
                      <td align="center">
                        <Button
                          type="actionTable"
                          indexData={index}
                          isLoading={isLoadingAction[item.id]}
                          onEdit={() => handleGetEdit(item.id)}
                          onDelete={() => handleDelete(item.id)}
                        />
                      </td>
                      <td align="center">{index + 1}</td>
                      <td>{item.pegawai?.nama}</td>
                      <td>{item.nama_lokasi || "-"}</td>
                      <td align="center">{`${item.latitude}, ${item.longitude}`}</td>
                      <td align="center">{item.radius}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} align="center">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <LokasiTambahanCreate
          isOpen={isCreateOpen}
          pegawaiList={pegawaiList}
          defaultPegawaiId={selectedPegawai || undefined}
          onClose={() => { setIsCreateOpen(false); fetchData(); }}
        />
      )}

      {isEditOpen && lokasiEdit.id && (
        <LokasiTambahanEdit
          isOpen={isEditOpen}
          lokasiEdit={lokasiEdit}
          onClose={() => { setIsEditOpen(false); fetchData(); }}
        />
      )}
    </>
  );
}
