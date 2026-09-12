"use client";

import Alert from "@/components/Alert";
import ThemeToggle from "@/components/ThemeToggle";
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="authincation">
      <ThemeToggle className="theme-toggle-mengambang" />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="authincation-content">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <div className="text-center mb-4">
                      <img src="/img/panji.png" alt="PANJI JAYA" width={80} />
                      <h3 className="fw-bold mt-3 mb-1">PANJI JAYA</h3>
                      <p className="mb-0">ENTERPRISE MANAGEMENT SYSTEM</p>
                    </div>

                    {alert.status && (
                      <Alert
                        color={alert.color}
                        message={alert.message}
                        subMessage={alert.subMessage}
                      />
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="mb-1" htmlFor="username">
                          <strong>Username</strong>
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

                      <div className="mb-3">
                        <label className="mb-1" htmlFor="password">
                          <strong>Password</strong>
                        </label>
                        <div className="input-group">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="form-control border-end-0"
                            placeholder="Enter Password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                          />
                          <button
                            type="button"
                            className="input-group-text bg-transparent"
                            onClick={() => setShowPassword((tampil) => !tampil)}
                            aria-label={
                              showPassword ? "Sembunyikan password" : "Tampilkan password"
                            }
                          >
                            <i
                              className={`bi ${
                                showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end mb-3">
                        <a href="http://wa.me/628117779914" target="_blank">
                          Forgot Password ?
                        </a>
                      </div>

                      <div className="text-center">
                        {isLoading ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-block"
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
                          <button type="submit" className="btn btn-primary btn-block">
                            LOGIN
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
