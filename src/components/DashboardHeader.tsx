import React from "react";

export default function DashboardHeader() {
  return (
    <header className="top-header">
      <nav className="navbar navbar-expand align-items-center gap-4">
        <div className="btn-toggle">
          <a href="#">
            <i className="material-icons-outlined">menu</i>
          </a>
        </div>

        <ul className="navbar-nav gap-1 nav-right-links align-items-center ms-auto">
          <li className="nav-item dropdown">
            <a
              href="javascrpt:;"
              className="dropdown-toggle dropdown-toggle-nocaret"
              data-bs-toggle="dropdown"
            >
              <img
                src="/assets/images/avatars/01.png"
                className="rounded-circle p-1 border"
                width={45}
                height={45}
                alt=""
              />
            </a>
            <div className="dropdown-menu dropdown-user dropdown-menu-end shadow">
              <a className="dropdown-item  gap-2 py-2" href="#">
                <div className="text-center">
                  <img
                    src="/assets/images/avatars/01.png"
                    className="rounded-circle p-1 shadow mb-3"
                    width={90}
                    height={90}
                    alt=""
                  />
                  <h5 className="user-name mb-0 fw-bold">Hello, Jhon</h5>
                </div>
              </a>
              <hr className="dropdown-divider" />
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="#"
              >
                <i className="material-icons-outlined">person_outline</i>Profile
              </a>
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="#"
              >
                <i className="material-icons-outlined">local_bar</i>Setting
              </a>
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="#"
              >
                <i className="material-icons-outlined">dashboard</i>Dashboard
              </a>
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="#"
              >
                <i className="material-icons-outlined">account_balance</i>
                Earning
              </a>
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="#"
              >
                <i className="material-icons-outlined">cloud_download</i>
                Downloads
              </a>
              <hr className="dropdown-divider" />
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="#"
              >
                <i className="material-icons-outlined">power_settings_new</i>
                Logout
              </a>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
