import Link from "next/link";

type MenuProps = {
  id: number;
  menu_group: string;
  group: null;
  parent_id: string;
  menu: { id: number; menu: string; path: string }[];
}[];

/** Ikon per menu group. Grup yang belum terdaftar memakai ikon default. */
const GROUP_ICON: Record<string, string> = {
  CONFIG: "fas fa-cogs",
  HR: "fas fa-users",
  FINANCE: "fas fa-wallet",
  KEUANGAN: "fas fa-wallet",
  SALES: "fas fa-file-invoice-dollar",
  REPORT: "fas fa-chart-line",
  MASTER: "fas fa-database",
};

const iconFor = (group: string) =>
  GROUP_ICON[group?.toUpperCase()] ?? "fas fa-th-large";

export default function DashboardSidebar({ menu }: { menu: MenuProps }) {
  return (
    <div className="dlabnav">
      <div className="dlabnav-scroll">
        <ul className="metismenu" id="menu">
          {menu.map((item, index: number) => (
            <li key={index}>
              <a className="has-arrow" href="javascript:void(0)" aria-expanded="false">
                <i className={iconFor(item.menu_group)}></i>
                <span className="nav-text">{item.menu_group}</span>
              </a>
              <ul aria-expanded="false">
                {item.menu.map((e) => (
                  <li key={e.id}>
                    <Link href={`/${e.path}`}>{e.menu}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
