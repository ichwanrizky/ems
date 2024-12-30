import React from "react";

type ButtonProps = {
  children?: React.ReactNode;
  type: string;
  disabled?: boolean;
  isLoading?: boolean;
  indexData?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function Button(props: ButtonProps) {
  const {
    children,
    type,
    disabled,
    isLoading,
    indexData,
    onClick,
    onEdit,
    onDelete,
  } = props;
  switch (type) {
    case "actionTable":
      return isLoading ? (
        <button
          className="btn btn-sm btn-filter dropdown-toggle dropdown-toggle-nocaret"
          type="button"
          disabled
        >
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        </button>
      ) : (
        <div className="dropdown">
          <button
            id={`dropdownMenuButton-${indexData}`}
            className="btn btn-sm btn-filter dropdown-toggle dropdown-toggle-nocaret"
            type="button"
            data-bs-toggle="dropdown"
            data-bs-display="static"
            aria-expanded="false"
          >
            <i className="bi bi-three-dots" />
          </button>
          <ul
            className="dropdown-menu"
            aria-labelledby={`dropdownMenuButton-${indexData}`}
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              zIndex: 1050,
            }}
          >
            <li>
              <button type="button" className="dropdown-item" onClick={onEdit}>
                <i className="bi bi-pencil me-2"></i>
                EDIT
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item text-danger"
                onClick={onDelete}
              >
                <i className="bi bi-trash me-2"></i>
                DELETE
              </button>
            </li>
          </ul>
        </div>
      );

    case "createTable":
      return isLoading ? (
        <button className="btn btn-primary px-4" type="button" disabled>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          LOADING ...
        </button>
      ) : (
        <button
          className="btn btn-primary px-4"
          type="button"
          onClick={onClick}
        >
          <i className="bi bi-plus-lg me-2" />
          ADD DATA
        </button>
      );
  }

  return null;
}
