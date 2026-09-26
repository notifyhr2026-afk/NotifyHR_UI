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
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("niku_remembered_username") || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem("niku_remembered_username");
  });
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear errors when the user edits
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

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  };

  const handleQuickFill = (roleUsername: string) => {
    setUsername(roleUsername);
    setPassword("password123");
    setErrors({});
  };

  const validate = () => {
    const err: Pick<FieldErrors, "username" | "password"> = {};

    if (!username.trim()) {
      err.username = "Please enter your enterprise username or email";
    }

    if (!password) {
      err.password = "Please enter your account password";
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
      await login(username.trim(), password);

      // Handle Remember Me persistence
      if (rememberMe) {
        localStorage.setItem("niku_remembered_username", username.trim());
      } else {
        localStorage.removeItem("niku_remembered_username");
      }

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
            : "Invalid username or password. Please verify your credentials.";

      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split-layout">
        {/* ================= LEFT SHOWCASE PANEL ================= */}
        <section className="login-showcase-panel" aria-label="Niku HR Features and Overview">
          <div className="showcase-glow-1" aria-hidden="true" />
          <div className="showcase-glow-2" aria-hidden="true" />
          <div className="showcase-grid-texture" aria-hidden="true" />

          {/* Top Branding in Showcase */}
          <div className="showcase-top">
            <Link to="/" className="text-decoration-none" aria-label="Niku HR Home">
              <NikuHRLogo variant="light" />
            </Link>
            <div className="showcase-pill-badge">
              <span className="showcase-pill-dot" aria-hidden="true" />
              <span>Enterprise HCM Suite 3.4</span>
            </div>
          </div>

          {/* Center Showcase Narrative */}
          <div className="showcase-content">
            <h1 className="showcase-title">
              The intelligent operating system for <span className="text-gradient">modern workforce</span> management.
            </h1>
            <p className="showcase-subtitle">
              Automate payroll calculations, track real-time attendance with geofencing, manage shift schedules, and streamline talent recruitment from a unified dashboard.
            </p>

            <div className="showcase-features-list">
              <div className="showcase-feature-item">
                <div className="showcase-feature-icon-box" aria-hidden="true">
                  <i className="bi bi-cash-stack" />
                </div>
                <div className="showcase-feature-text">
                  <h4>Automated Payroll & Compliance</h4>
                  <p>Flexible salary structures, automated deductions, tax declarations, and instant payslip generation.</p>
                </div>
              </div>

              <div className="showcase-feature-item">
                <div className="showcase-feature-icon-box" aria-hidden="true">
                  <i className="bi bi-clock-history" />
                </div>
                <div className="showcase-feature-text">
                  <h4>Smart Attendance & Shift Patterns</h4>
                  <p>Geofenced clock-in/out, biometric synchronization, shift rosters, and multi-tier leave workflows.</p>
                </div>
              </div>

              <div className="showcase-feature-item">
                <div className="showcase-feature-icon-box" aria-hidden="true">
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <div className="showcase-feature-text">
                  <h4>Talent Acquisition & 360° Reviews</h4>
                  <p>Job requisition pipelines, automated candidate approvals, continuous feedback, and performance appraisals.</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="showcase-quote-card">
              <p className="showcase-quote-text">
                "Niku HR completely streamlined our multi-branch operations. Our month-end payroll reconciliation time dropped by over 80%."
              </p>
              <div className="showcase-quote-author">
                <div className="showcase-author-avatar">SC</div>
                <div className="showcase-author-info">
                  <span className="showcase-author-name">Sarah Chen</span>
                  <span className="showcase-author-role">Chief People Officer, Apex Global Enterprises</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Badges in Showcase */}
          <div className="showcase-footer">
            <div className="showcase-trust-tags">
              <span className="showcase-trust-tag">
                <i className="bi bi-shield-check" aria-hidden="true" />
                SOC 2 Type II
              </span>
              <span className="showcase-trust-tag">
                <i className="bi bi-lock" aria-hidden="true" />
                256-Bit SSL Encryption
              </span>
              <span className="showcase-trust-tag">
                <i className="bi bi-activity" aria-hidden="true" />
                99.99% Uptime SLA
              </span>
            </div>
          </div>
        </section>

        {/* ================= RIGHT AUTHENTICATION PORTAL ================= */}
        <main className="login-form-panel" id="main-content">
          {/* Top utility row */}
          <div className="form-panel-top">
            <div className="mobile-brand-logo">
              <Link to="/" className="text-decoration-none" aria-label="Niku HR Home">
                <NikuHRLogo variant="default" />
              </Link>
            </div>
            <div className="form-panel-nav">
              <span>Need enterprise access?</span>
              <Link to="/RequestDemo" id="login-request-demo-link">Request a Demo</Link>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="form-panel-content">
            <div className="form-header">
              <h2 className="form-header-title">Welcome back</h2>
              <p className="form-header-desc">
                Sign in with your enterprise credentials to access your organization workspace.
              </p>
            </div>

            {/* Quick Demo Role Pre-fills for Testing/Evaluation */}
            <div className="demo-role-box" id="demo-role-selection">
              <span className="demo-role-label">
                <i className="bi bi-lightning-charge-fill text-warning" aria-hidden="true" />
                Quick Fill Demo:
              </span>
              <div className="demo-role-chips">
                <button
                  type="button"
                  className="demo-chip-btn"
                  id="btn-quick-fill-admin"
                  onClick={() => handleQuickFill("admin")}
                  title="Fill Org Admin credentials"
                >
                  Org Admin
                </button>
                <button
                  type="button"
                  className="demo-chip-btn"
                  id="btn-quick-fill-employee"
                  onClick={() => handleQuickFill("employee1")}
                  title="Fill Employee credentials"
                >
                  Employee
                </button>
                <button
                  type="button"
                  className="demo-chip-btn text-muted"
                  id="btn-quick-clear"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setErrors({});
                  }}
                  title="Clear inputs"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* General Error Banner */}
            {errors.general && (
              <div className="login-alert login-alert-danger" role="alert" id="login-general-error">
                <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} noValidate id="login-form">
              {/* Username Field */}
              <div className="login-field-group">
                <div className="login-label-row">
                  <label htmlFor="login-username" className="login-field-label">
                    Username or Enterprise Email
                  </label>
                </div>
                <div className={`login-input-wrapper ${errors.username ? "has-error" : ""}`}>
                  <i className="bi bi-person login-input-icon" aria-hidden="true" />
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    className="login-input"
                    placeholder="e.g. jsmith or jsmith@company.com"
                    value={username}
                    autoComplete="username"
                    autoFocus={!username}
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? "login-username-error" : undefined}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearFieldError("username");
                    }}
                  />
                  {username && (
                    <button
                      type="button"
                      className="login-input-action-btn"
                      onClick={() => {
                        setUsername("");
                        clearFieldError("username");
                      }}
                      aria-label="Clear username input"
                    >
                      <i className="bi bi-x" aria-hidden="true" />
                    </button>
                  )}
                </div>
                {errors.username && (
                  <div id="login-username-error" className="field-error-msg">
                    <i className="bi bi-exclamation-circle" aria-hidden="true" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="login-field-group">
                <div className="login-label-row">
                  <label htmlFor="login-password" className="login-field-label">
                    Password
                  </label>
                  <Link to="/forgot-password" className="login-forgot-link" id="login-forgot-password-link">
                    Forgot password?
                  </Link>
                </div>
                <div className={`login-input-wrapper ${errors.password ? "has-error" : ""}`}>
                  <i className="bi bi-lock login-input-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Enter your account password"
                    value={password}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                    onKeyDown={checkCapsLock}
                    onKeyUp={checkCapsLock}
                    onBlur={() => setCapsLockActive(false)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                  />
                  <button
                    type="button"
                    className="login-input-action-btn"
                    id="btn-toggle-password-visibility"
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

                {/* Caps Lock Alert */}
                {capsLockActive && (
                  <div className="caps-lock-warning" id="caps-lock-warning-alert" role="status">
                    <i className="bi bi-capslock-fill" aria-hidden="true" />
                    <span>Caps Lock is turned ON</span>
                  </div>
                )}

                {errors.password && (
                  <div id="login-password-error" className="field-error-msg">
                    <i className="bi bi-exclamation-circle" aria-hidden="true" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="login-remember-row">
                <label className="custom-checkbox-container" htmlFor="login-remember-me">
                  <input
                    type="checkbox"
                    id="login-remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember username on this computer</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login-submit"
                className="login-submit-btn"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form Bottom Links */}
          <div className="form-panel-bottom">
            <Link to="/" className="bottom-back-link" id="link-back-to-home">
              <i className="bi bi-arrow-left" aria-hidden="true" />
              <span>Back to Homepage</span>
            </Link>
            <div className="bottom-security-badge">
              <i className="bi bi-shield-check" aria-hidden="true" />
              <span>Encrypted with TLS 1.3</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;

