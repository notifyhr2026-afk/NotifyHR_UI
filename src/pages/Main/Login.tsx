import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NikuHRLogo from "../../components/landing/NikuHRLogo";
import "./LoginModern.css";

const Login: React.FC = () => {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [errors, setErrors] = useState<{
username?: string;
password?: string;
general?: string;
}>({});
const [isSubmitting, setIsSubmitting] = useState(false);

const { login } = useAuth();
const navigate = useNavigate();

const validate = () => {
const err: {
username?: string;
password?: string;
} = {};


if (!username.trim()) {
  err.username = "Username is required";
}

if (!password) {
  err.password = "Password is required";
}

return err;


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

  const rawdata = localStorage.getItem("userRoles");
  const data = rawdata ? JSON.parse(rawdata) : [];

  const role =
    Array.isArray(data) && data.length > 0
      ? data[0].roleName
      : null;

  let url = "/EmployeeClock";

  switch (role) {
    case "SuperAdmin":
      url = "/sysdashboard";
      break;

    case "OrgAdmin":
      url = "/Organization";
      break;

    default:
      url = "/EmployeeClock";
  }
  navigate(url);
} catch (err: any) {
  setErrors({
    general: err.message || "Invalid username or password",
  });
} finally {
  setIsSubmitting(false);
}
};
return ( 
<div className="login-page"> 
  <div className="login-bg-shape shape-1">
    </div> 
    <div className="login-bg-shape shape-2">      
    </div>
  {/* NAVBAR */}
  {/* <nav className="login-navbar">
    <div className="container d-flex justify-content-between align-items-center">
      <Link to="/">
        <NikuHRLogo />
      </Link>    
    </div>
  </nav> */}
  {/* MAIN */}
  <main className="container login-container m-4">
    <div className="row justify-content-center w-100">
      <div className="col-xl-5 col-lg-6 col-md-8">
        {/* HEADER */}
        {/* <div className="text-center mb-4">
          <span className="landing-kicker">
            Enterprise HRMS Platform
          </span>
          <h1 className="login-title">
            Welcome to
            <span className="text-gradient"> NikuHR</span>
          </h1>
          <p className="login-description">
            Access payroll, attendance, recruitment,
            onboarding and employee management from
            one secure platform.
          </p>
        </div> */}
        {/* LOGIN CARD */}
        <div className="login-card">
          <div className="text-center mb-4">
          
              <Link to="/">
        <NikuHRLogo />
      </Link>  

            <h2 className="fw-bold mt-3">
              Sign In
            </h2>

            <p className="text-muted mb-0">
              Enter your credentials to continue
            </p>
          </div>
          {errors.general && (
            <div className="alert alert-danger">
              {errors.general}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Username
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />
              </div>

              {errors.username && (
                <div className="text-danger small mt-1">
                  {errors.username}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>
              {errors.password && (
                <div className="text-danger small mt-1">
                  {errors.password}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-lp-primary w-100 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Signing In...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </>
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            {/* <Link
              to="/forgot-password"
              className="forgot-link"
            >
              Forgot Password?
            </Link> */}
          </div>
        </div>
        {/* TRUST */}
        {/* <div className="row mt-4 g-3">
          <div className="col-4">
            <div className="stat-card">
              <h5>500+</h5>
              <small>Companies</small>
            </div>
          </div>
          <div className="col-4">
            <div className="stat-card">
              <h5>99.9%</h5>
              <small>Uptime</small>
            </div>
          </div>
          <div className="col-4">
            <div className="stat-card">
              <h5>24/7</h5>
              <small>Support</small>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  </main>
</div>
);
};

export default Login;
