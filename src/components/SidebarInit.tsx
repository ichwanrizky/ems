"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SidebarInit() {
  const pathname = usePathname();

  useEffect(() => {
    const init = () => {
      const win = window as any;
      const $ = win.$;
      if (!$ || !$.fn?.metisMenu) return false;

      // Init metisMenu
      const $nav = $("#sidenav");
      if (!$nav.length) return false;
      try { $nav.metisMenu("dispose"); } catch (_) {}
      $nav.metisMenu();

      // Sidebar toggle — namespaced to prevent double-binding
      $(".btn-toggle")
        .off("click.sidebar")
        .on("click.sidebar", function () {
          if ($("body").hasClass("toggled")) {
            $("body").removeClass("toggled");
            $(".sidebar-wrapper").off("mouseenter.sidebar mouseleave.sidebar");
          } else {
            $("body").addClass("toggled");
            $(".sidebar-wrapper")
              .on("mouseenter.sidebar", function () {
                $("body").addClass("sidebar-hovered");
              })
              .on("mouseleave.sidebar", function () {
                $("body").removeClass("sidebar-hovered");
              });
          }
        });

      // Sidebar close button
      $(".sidebar-close")
        .off("click.sidebar")
        .on("click.sidebar", function () {
          $("body").removeClass("toggled");
          $(".sidebar-wrapper").off("mouseenter.sidebar mouseleave.sidebar");
        });

      // Mark active menu item based on current URL
      const currentHref = window.location.href;
      let $active = $(".metismenu li a")
        .filter(function (this: HTMLAnchorElement) {
          return this.href === currentHref;
        })
        .parent()
        .addClass("mm-active");

      while ($active.is("li")) {
        $active = $active
          .parent("ul")
          .addClass("mm-show")
          .parent("li")
          .addClass("mm-active");
      }

      return true;
    };

    // Scripts load afterInteractive — poll until jQuery + metisMenu are ready
    let attempts = 0;
    const interval = setInterval(() => {
      if (init() || ++attempts >= 30) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
