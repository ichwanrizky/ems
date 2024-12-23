import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { authOptions } from "@/libs/AuthOptions";
import { getServerSession } from "next-auth/next";
import Script from "next/script";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: any = await getServerSession(authOptions);
  console.log("🚀 ~ session:", session);

  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>EMS PJ | Dashboard</title>
        {/*favicon*/}
        <link
          rel="icon"
          href="/assets/images/favicon-32x32.png"
          type="image/png"
        />
        {/* loader*/}
        <link href="/assets/css/pace.min.css" rel="stylesheet" />
        <Script src="/assets/js/pace.min.js"></Script>
        {/*plugins*/}
        <link
          href="/assets/plugins/perfect-scrollbar/css/perfect-scrollbar.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="/assets/plugins/metismenu/metisMenu.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="/assets/plugins/metismenu/mm-vertical.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="/assets/plugins/simplebar/css/simplebar.css"
        />
        {/*bootstrap css*/}
        <link href="/assets/css/bootstrap.min.css" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
        {/*main css*/}
        <link href="/assets/css/bootstrap-extended.css" rel="stylesheet" />
        <link href="/sass/main.css" rel="stylesheet" />
        <link href="/sass/dark-theme.css" rel="stylesheet" />
        <link href="/sass/blue-theme.css" rel="stylesheet" />
        <link href="/sass/semi-dark.css" rel="stylesheet" />
        <link href="/sass/bordered-theme.css" rel="stylesheet" />
        <link href="/sass/responsive.css" rel="stylesheet" />
      </head>
      <body>
        <DashboardSidebar />
        <DashboardHeader />
        <main className="main-wrapper">{children}</main>

        <div className="overlay btn-toggle"></div>

        <footer className="page-footer">
          <p className="mb-0">Copyright © 2024. All right reserved.</p>
        </footer>

        {/* Bootstrap JS */}
        <Script src="/assets/js/bootstrap.bundle.min.js"></Script>

        {/* jQuery - Load first, defer to ensure DOM is ready */}
        <Script src="/assets/js/jquery.min.js"></Script>

        {/* Plugins - Load after jQuery, defer to ensure DOM is ready */}
        <Script src="/assets/plugins/perfect-scrollbar/js/perfect-scrollbar.js"></Script>
        <Script src="/assets/plugins/metismenu/metisMenu.min.js"></Script>
        <Script src="/assets/plugins/simplebar/js/simplebar.min.js"></Script>

        {/* Main JS - Load last, defer to ensure DOM is ready */}
        <Script src="/assets/js/main.js" defer></Script>
      </body>
    </>
  );
}
