"use client";

import { AlertProps } from "@/types";
import React, { useEffect, useState } from "react";
import Alert from "./Alert";

type ModalProps = {
  modalTitle: string;
  children: React.ReactNode;
  onClose: () => void;
  alert?: AlertProps;
  isLoadingModal?: boolean;
  isLoadingSubmit?: boolean;
  onSubmit?: any;
  /**
   * Kelas ukuran Bootstrap (`modal-lg`, `modal-xl`). Kosong = lebar default,
   * yang dipakai semua form sebelumnya — jadi menambah prop ini tidak mengubah
   * satu pun modal yang sudah ada.
   */
  size?: string;
  /** Teks tombol simpan; default "SAVE DATA". */
  submitLabel?: string;
};

export default function Modal(props: ModalProps) {
  const {
    modalTitle,
    children,
    onClose,
    alert,
    isLoadingModal,
    isLoadingSubmit,
    onSubmit,
    size,
    submitLabel,
  } = props;

  const [alertModal, setAlertModal] = useState<AlertProps | null>(
    alert || null
  );

  useEffect(() => {
    if (alert) {
      setAlertModal(alert);
    }
  }, [alert]);

  useEffect(() => {
    if (alertModal) {
      const timer = setTimeout(() => {
        setAlertModal(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alertModal]);

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="emsModalTitle"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <div
          className={`modal-dialog modal-dialog-centered ${size ?? ""}`}
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="emsModalTitle">
                  {modalTitle}
                  {isLoadingModal && (
                    <span className="spinner-border spinner-border-sm ms-2"></span>
                  )}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={onClose}
                />
              </div>

              {alertModal?.status && (
                <div className="px-4 pt-3">
                  <Alert
                    color={alertModal.color}
                    message={alertModal.message}
                    subMessage={alertModal.subMessage}
                  />
                </div>
              )}

              <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={onClose}
                  >
                    CLOSE
                  </button>

                  {isLoadingSubmit ? (
                    <button type="button" className="btn btn-primary" disabled>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      LOADING ...
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      {submitLabel ?? "SAVE DATA"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
