"use client";

import Alert from "@/components/Alert";
import { signIn } from "next-auth/react";
import React from "react";
import { useEffect, useState } from "react";

export default function LoginPage({ searchParams }: { searchParams: any }) {
  const [alert, setAlert] = useState({
    status: false,
    color: "",
    message: "",
    subMessage: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const callbackUrl = React.use(searchParams) as any;

  const url = callbackUrl?.callbackUrl
    ? callbackUrl.callbackUrl
    : "/auth/redirect";

  useEffect(() => {
    if (alert.status) {
      const timer = setTimeout(() => {
        setAlert({
          status: false,
          color: "",
          message: "",
          subMessage: "",
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });
      setAlert({
        status: true,
        color: res?.ok ? "success" : "danger",
        message: res?.ok ? "Success" : "Failed",
        subMessage: res?.ok ? "Login Success" : "Invalid Username or Password",
      });

      if (res?.ok) {
        window.location.href = url;
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setAlert({
        status: true,
        color: "danger",
        message: "Something went wrong",
        subMessage: "Please refresh and try again",
      });
      setIsLoading(false);
    }
  };
  return (
    <div className="auth-basic-wrapper d-flex align-items-center justify-content-center">
      <div className="container-fluid my-5 my-lg-0">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4 mx-auto">
            <div className="card rounded-4 mb-0 border-top border-4 border-primary">
              {alert.status && (
                <div className="px-3 mt-3">
                  <Alert
                    color={alert.color}
                    message={alert.message}
                    subMessage={alert.subMessage}
                  />
                </div>
              )}
              <div className="card-body p-5">
                <img src="/img/panji.png" className="mb-4" width={80} />
                <h4 className="fw-bold">PANJI JAYA</h4>
                <p className="mb-0">ENTERPRISE MANAGEMENT SYSTEMs</p>
                <div className="form-body my-5">
                  <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-12">
                      <label htmlFor="username" className="form-label">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="form-control"
                        placeholder="Enter Username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <div className="input-group" id="show_hide_password">
                        <input
                          id="password"
                          type="password"
                          className="form-control border-end-0"
                          placeholder="Enter Password"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                          required
                        />
                        <a
                          href="javascript:;"
                          className="input-group-text bg-transparent"
                        >
                          <i className="bi bi-eye-slash-fill" />
                        </a>
                      </div>
                    </div>
                    <div className="col-md-6"></div>
                    <div className="col-md-6 text-end">
                      <a href="http://wa.me/628117779914" target="_blank">
                        Forgot Password ?
                      </a>
                    </div>
                    <hr className="mt-4" />
                    <div className="col-12 mt-4">
                      <div className="d-grid">
                        {isLoading ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled
                          >
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            LOADING ...
                          </button>
                        ) : (
                          <button type="submit" className="btn btn-primary">
                            LOGIN
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
