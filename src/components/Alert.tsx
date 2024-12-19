import React from "react";

type AlertProps = {
  color: string;
  message: string;
  subMessage?: string;
};

export default function Alert(props: AlertProps) {
  const { color, message, subMessage } = props;

  return (
    <div
      className={`alert alert-${color} border-0 bg-${color} alert-dismissible fade show`}
    >
      <div className="d-flex align-items-center">
        <div className="font-35 text-white">
          <span className="material-icons-outlined fs-2">
            {color === "success" ? "check_circle" : "report_gmailerrorred"}
          </span>
        </div>
        <div className="ms-3">
          <h6 className="mb-0 text-white">{message}</h6>
          <div className="text-white">{subMessage}</div>
        </div>
      </div>
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      />
    </div>
  );
}
