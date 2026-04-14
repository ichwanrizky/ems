import Script from "next/script";

export default function SlipThrLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link href="/assets/css/pace.min.css" rel="stylesheet" />
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
      <link href="/assets/css/bootstrap.min.css" rel="stylesheet" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css?family=Material+Icons+Outlined"
        rel="stylesheet"
      />
      <link href="/assets/css/bootstrap-extended.css" rel="stylesheet" />
      <link href="/sass/main.css" rel="stylesheet" />
      <link href="/sass/dark-theme.css" rel="stylesheet" />
      <link href="/sass/blue-theme.css" rel="stylesheet" />
      <link href="/sass/responsive.css" rel="stylesheet" />

      {children}
      <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />
    </>
  );
}
