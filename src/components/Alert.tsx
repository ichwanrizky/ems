import React from "react";

type AlertProps = {
  color: string;
  message: string;
  subMessage?: string;
};

/** Ikon garis (feather-style) yang dipakai template WorkLoad pada alert solid. */
const IKON: Record<string, React.ReactNode> = {
  success: (
    <>
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </>
  ),
  danger: (
    <>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </>
  ),
  warning: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </>
  ),
};

export default function Alert(props: AlertProps) {
  const { color, message, subMessage } = props;

  return (
    <div className={`alert alert-${color} solid alert-dismissible fade show`}>
      <div className="d-flex align-items-center">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="me-3 flex-shrink-0"
        >
          {IKON[color] ?? IKON.danger}
        </svg>
        <div>
          <strong className="d-block">{message}</strong>
          {subMessage && <span>{subMessage}</span>}
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
