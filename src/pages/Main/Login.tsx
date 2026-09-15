import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NikuHRLogo from "../../components/landing/NikuHRLogo";
import "../../css/LoginModern.css";

type FieldErrors = {
  username?: string;
  password?: string;
  general?: string;
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const clearFieldError = (field: "username" | "password") => {
    setErrors((prev) => {
      if (!prev[field] && !prev.general) return prev;
      const next = { ...prev, [field]: undefined };
      if (field === "username" || field === "password") {
        next.general = undefined;
      }
      return next;
    });
  };

  const validate = () => {
    const err: Pick<FieldErrors, "username" | "password"> = {};

    if (!username.trim()) {
      err.username = "Username is required";
    }

    if (!password) {
      err.password = "Password is required";
    }

    return err;
  };

  const resolvePostLoginUrl = () => {
    const rawdata = localStorage.getItem("userRoles");
    const data = rawdata ? JSON.parse(rawdata) : [];
    const role =
      Array.isArray(data) && data.length > 0 ? data[0].roleName : null;

    switch (role) {
      case "SuperAdmin":
        return "/sysdashboard";
      case "OrgAdmin":
        return "/Organization";
      default:
        return "/EmployeeClock";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);
      navigate(resolvePostLoginUrl());
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Invalid username or password";

      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shape shape-1" aria-hidden="true" />
      <div className="login-bg-shape shape-2" aria-hidden="true" />

      <main className="container login-container w-100">
        <div className="row justify-content-center w-100">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <div className="login-card">
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none" aria-label="Back to NikuHR home">
                  <NikuHRLogo />
                </Link>

                <h1 className="login-heading fw-bold mt-3">Sign In</h1>
                <p className="text-muted mb-0">
                  Enter your credentials to continue
                </p>
              </div>

              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="login-username" className="form-label fw-semibold">
                    Username
                  </label>
                  <div
                    className={`input-group ${errors.username ? "is-invalid" : ""}`}
                  >
                    <span className="input-group-text">
                      <i className="bi bi-person" aria-hidden="true" />
                    </span>
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      className="form-control"
                      placeholder="Enter username"
                      value={username}
                      autoComplete="username"
                      autoFocus
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? "login-username-error" : undefined}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        clearFieldError("username");
                      }}
                    />
                  </div>
                  {errors.username && (
                    <div id="login-username-error" className="text-danger small mt-1">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="login-password" className="form-label fw-semibold">
                    Password
                  </label>
                  <div
                    className={`input-group ${errors.password ? "is-invalid" : ""}`}
                  >
                    <span className="input-group-text">
                      <i className="bi bi-lock" aria-hidden="true" />
                    </span>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter password"
                      value={password}
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "login-password-error" : undefined}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError("password");
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <div id="login-password-error" className="text-danger small mt-1">
                      {errors.password}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-lp-primary w-100 py-2"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2" aria-hidden="true" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="login-footer-links">
                <Link to="/" className="login-footer-link">
                  <i className="bi bi-arrow-left me-1" aria-hidden="true" />
                  Back to Home
                </Link>
                <span className="login-footer-sep" aria-hidden="true">
                  ·
                </span>
                <Link to="/RequestDemo" className="login-footer-link">
                  Request Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
