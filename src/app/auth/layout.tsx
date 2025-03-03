import Script from "next/script";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>EMS PJ - Login</title>
        {/*favicon*/}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* loader*/}
        <link href="/assets/css/pace.min.css" rel="stylesheet" />
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
        <link href="/sass/responsive.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script
          src="/assets/js/jquery.min.js"
          strategy="beforeInteractive"
        ></Script>
        <Script id="toggle-password-visibility" strategy="afterInteractive">
          {`
            $(document).ready(function () {
              $("#show_hide_password a").on('click', function (event) {
                event.preventDefault();
                if ($('#show_hide_password input').attr("type") == "text") {
                  $('#show_hide_password input').attr('type', 'password');
                  $('#show_hide_password i').addClass("bi-eye-slash-fill");
                  $('#show_hide_password i').removeClass("bi-eye-fill");
                } else if ($('#show_hide_password input').attr("type") == "password") {
                  $('#show_hide_password input').attr('type', 'text');
                  $('#show_hide_password i').removeClass("bi-eye-slash-fill");
                  $('#show_hide_password i').addClass("bi-eye-fill");
                }
              });
            });
          `}
        </Script>
      </body>
    </>
  );
}
