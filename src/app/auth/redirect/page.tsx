"use client";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Redirect() {
  const { data: session, status }: any = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    } else if (status === "authenticated") {
      const path = session.user.menu[0].menu[0].path;
      redirect(`/${path}`);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">Please Wait ...</div>
      </div>
    );
  }

  return null;
}
