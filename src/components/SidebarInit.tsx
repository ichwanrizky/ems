"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SidebarInit() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const sidebar = document.querySelector<HTMLElement>(".sidebar-wrapper");
    const nav = document.querySelector<HTMLElement>("#sidenav");
    const toggleButtons = Array.from(
      document.querySelectorAll<HTMLElement>(".btn-toggle")
    );
    const closeButtons = Array.from(
      document.querySelectorAll<HTMLElement>(".sidebar-close")
    );

    if (!nav) return;

    const collapseAllMenus = () => {
      nav.querySelectorAll<HTMLLIElement>("li").forEach((item) => {
        item.classList.remove("mm-active");
      });

      nav.querySelectorAll<HTMLUListElement>("li > ul").forEach((submenu) => {
        submenu.classList.add("mm-collapse");
        submenu.classList.remove("mm-show");
        submenu.style.height = "";
      });

      nav.querySelectorAll<HTMLAnchorElement>("li > a").forEach((anchor) => {
        anchor.setAttribute("aria-expanded", "false");
      });
    };

    const activateCurrentMenu = () => {
      const activeLink = Array.from(
        nav.querySelectorAll<HTMLAnchorElement>("li a[href]:not(.has-arrow)")
      ).find((anchor) => {
        const href = anchor.getAttribute("href");
        return href !== "#" && anchor.pathname === pathname;
      });

      if (!activeLink) return;

      let activeItem = activeLink.closest<HTMLLIElement>("li");

      while (activeItem) {
        activeItem.classList.add("mm-active");

        const submenu = activeItem.querySelector<HTMLUListElement>(":scope > ul");
        const trigger = activeItem.querySelector<HTMLAnchorElement>(":scope > a");

        if (submenu) {
          submenu.classList.add("mm-collapse", "mm-show");
          trigger?.setAttribute("aria-expanded", "true");
        }

        const parentSubmenu = activeItem.parentElement;
        activeItem = parentSubmenu?.closest<HTMLLIElement>("li") || null;
      }
    };

    const handleMenuClick = (event: Event) => {
      const trigger = event.currentTarget as HTMLAnchorElement;
      const item = trigger.closest<HTMLLIElement>("li");
      const submenu = item?.querySelector<HTMLUListElement>(":scope > ul");

      if (!item || !submenu) return;

      event.preventDefault();

      const shouldOpen = !item.classList.contains("mm-active");
      const siblings = Array.from(
        item.parentElement?.children || []
      ) as HTMLLIElement[];

      siblings.forEach((sibling) => {
        if (sibling === item) return;

        sibling.classList.remove("mm-active");
        sibling
          .querySelectorAll<HTMLUListElement>(":scope > ul")
          .forEach((siblingSubmenu) => {
            siblingSubmenu.classList.add("mm-collapse");
            siblingSubmenu.classList.remove("mm-show");
          });
        sibling
          .querySelectorAll<HTMLAnchorElement>(":scope > a")
          .forEach((siblingTrigger) => {
            siblingTrigger.setAttribute("aria-expanded", "false");
          });
      });

      item.classList.toggle("mm-active", shouldOpen);
      submenu.classList.add("mm-collapse");
      submenu.classList.toggle("mm-show", shouldOpen);
      trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    };

    const handleToggle = (event: Event) => {
      event.preventDefault();
      body.classList.toggle("toggled");

      if (!body.classList.contains("toggled")) {
        body.classList.remove("sidebar-hovered");
      }
    };

    const handleClose = (event: Event) => {
      event.preventDefault();
      body.classList.remove("toggled", "sidebar-hovered");
    };

    const handleSidebarEnter = () => {
      if (body.classList.contains("toggled")) {
        body.classList.add("sidebar-hovered");
      }
    };

    const handleSidebarLeave = () => {
      body.classList.remove("sidebar-hovered");
    };

    collapseAllMenus();
    activateCurrentMenu();

    const menuTriggers = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("a.has-arrow")
    );

    menuTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleMenuClick);
    });

    toggleButtons.forEach((button) => {
      button.addEventListener("click", handleToggle);
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", handleClose);
    });

    sidebar?.addEventListener("mouseenter", handleSidebarEnter);
    sidebar?.addEventListener("mouseleave", handleSidebarLeave);

    return () => {
      menuTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleMenuClick);
      });

      toggleButtons.forEach((button) => {
        button.removeEventListener("click", handleToggle);
      });

      closeButtons.forEach((button) => {
        button.removeEventListener("click", handleClose);
      });

      sidebar?.removeEventListener("mouseenter", handleSidebarEnter);
      sidebar?.removeEventListener("mouseleave", handleSidebarLeave);
    };
  }, [pathname]);

  return null;
}
