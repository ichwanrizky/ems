import Link from "next/link";

export default function NavHeader() {
  return (
    <div className="nav-header">
      <Link href="/auth/redirect" className="brand-logo">
        <img className="logo-abbr" src="/img/panji.png" alt="PANJI JAYA" width={48} height={48} />
        <div className="brand-title">
          <h2 className="">PANJI JAYA</h2>
          <span className="brand-sub-title">Enterprise Management System</span>
        </div>
      </Link>
      <div className="nav-control">
        <div className="hamburger">
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </div>
    </div>
  );
}
