"use client";
import Link from "next/link";
import React from "react";

type MenuProps = {
  id: number;
  menu_group: string;
  group: null;
  parent_id: string;
  menu: { id: number; menu: string; path: string }[];
}[];

export default function DashboardSidebar({ menu }: { menu: MenuProps }) {
  return (
    <aside className="sidebar-wrapper" data-simplebar="true">
      <div className="sidebar-header">
        <div className="logo-icon">
          <img src="/assets/images/logo-icon.png" className="logo-img" alt="" />
        </div>
        <div className="logo-name flex-grow-1">
          <h5 className="mb-0">Maxton</h5>
        </div>
        <div className="sidebar-close">
          <span className="material-icons-outlined">close</span>
        </div>
      </div>
      <div className="sidebar-nav">
        <ul className="metismenu" id="sidenav">
          {menu.map((item, index: number) => (
            <li key={index}>
              <a href="#" className="has-arrow">
                <div className="parent-icon">
                  <i className="material-icons-outlined">home</i>
                </div>
                <div className="menu-title">{item.menu_group}</div>
              </a>
              <ul>
                {item.menu.map((e) => (
                  <li key={e.id}>
                    <Link href={`/${e.path}`}>
                      <i className="material-icons-outlined">arrow_right</i>
                      {e.menu}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
