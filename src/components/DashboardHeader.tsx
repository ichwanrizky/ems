"use client";

import { usePathname } from "next/navigation";
import React from "react";
import ThemeToggle from "./ThemeToggle";

type MenuProps = {
  id: number;
  menu_group: string;
  group: null;
  parent_id: string;
  menu: { id: number; menu: string; path: string }[];
}[];

export default function DashboardHeader({
  name,
  role_name,
  menu = [],
}: {
  name: string;
  role_name: string;
  menu?: MenuProps;
}) {
  const pathname = usePathname();

  /* Judul header diambil dari menu yang path-nya paling cocok dengan URL sekarang. */
  const title = React.useMemo(() => {
    const kandidat = menu
      .flatMap((group) => group.menu)
      .filter((item) => pathname === `/${item.path}` || pathname.startsWith(`/${item.path}/`))
      .sort((a, b) => b.path.length - a.path.length);

    return kandidat[0]?.menu ?? "Dashboard";
  }, [menu, pathname]);

  const inisial = (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase();

  return (
    <div className="header border-bottom">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div className="dashboard_bar">{title}</div>
            </div>

            <ul className="navbar-nav header-right">
              <li className="nav-item d-flex align-items-center">
                <ThemeToggle />
              </li>

              <li className="nav-item dropdown header-profile">
                <a
                  className="nav-link"
                  href="javascript:void(0);"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <span className="avatar-inisial">{inisial}</span>
                  <div className="header-info ms-3">
                    <span className="fs-16 font-w500">{name}</span>
                    <small className="fs-12 font-w400 d-block">{role_name}</small>
                  </div>
                </a>

                <div className="dropdown-menu dropdown-menu-end">
                  <div className="px-3 py-2 border-bottom">
                    <h6 className="mb-0 text-break">{name}</h6>
                    <small className="text-muted">{role_name}</small>
                  </div>
                  <a href="/auth/logout" className="dropdown-item ai-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-danger"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span className="ms-2">Logout</span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
