import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import NavHeader from "@/components/NavHeader";
import SidebarInit from "@/components/SidebarInit";
import { authOptions } from "@/libs/AuthOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Script from "next/script";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: any = await getServerSession(authOptions);

  if (!session) redirect("/auth/logout");

  return (
    <div id="main-wrapper" className="show">
      <NavHeader />

      <DashboardHeader
        name={session.user.name}
        role_name={session.user.role_name}
        menu={session.user.menu}
      />

      <DashboardSidebar menu={session.user.menu} />

      <div className="content-body">
        <div className="container-fluid">{children}</div>
      </div>

      <div className="footer">
        <div className="copyright">
          <p>
            <strong>PANJI JAYA</strong> &copy; {new Date().getFullYear()} &mdash;
            Enterprise Management System
          </p>
        </div>
      </div>

      {/* jQuery + Bootstrap bundle (dropdown, modal, tooltip) */}
      <Script src="/workload/vendor/global/global.min.js" strategy="afterInteractive" />
      <SidebarInit />
    </div>
  );
}
