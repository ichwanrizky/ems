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
        aria-labelledby="exampleModalScrollableTitle"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <h5 className="modal-title" id="exampleModalScrollableTitle">
                    {modalTitle}
                    {isLoadingModal && (
                      <span className="spinner-border spinner-border-sm ms-2"></span>
                    )}
                  </h5>
                </div>

                <button
                  type="button"
                  className="primaery-menu-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <i className="material-icons-outlined">close</i>
                </button>
              </div>

              {alertModal?.status && (
                <div className="px-3 mt-3">
                  <Alert
                    color={alertModal.color}
                    message={alertModal.message}
                    subMessage={alertModal.subMessage}
                  />
                </div>
              )}

              <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
                <div className="modal-body">{children}</div>
                <div className="modal-footer border-top-1">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    CLOSE
                  </button>

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
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
