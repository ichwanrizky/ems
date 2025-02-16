import React from "react";

export default function DashboardHeader({
  name,
  role_name,
}: {
  name: string;
  role_name: string;
}) {
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
              <a className="dropdown-item gap-2 py-2" href="#">
                <div className="text-center">
                  {/* Smaller Profile Image */}
                  <img
                    src="/assets/images/avatars/01.png"
                    className="rounded-circle p-1 shadow mb-2"
                    width={80}
                    height={80}
                    alt=""
                  />
                  {/* Ensure Name Wraps */}
                  <h6
                    className="user-name mb-0 fw-bold text-break"
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                    }}
                  >
                    {name}
                  </h6>

                  {/* Role Name - Smaller and Lighter */}
                  <p className="text-muted mb-1 small">{role_name}</p>
                </div>
              </a>
              <hr className="dropdown-divider" />
              <a
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                href="/auth/logout"
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
