"use client";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const { data: session, status }: any = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    } else if (status === "authenticated") {
      signOut({ redirect: true, callbackUrl: "/auth/login" });
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
