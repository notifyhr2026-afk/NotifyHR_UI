import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import NikuHRLogo from "../../components/landing/NikuHRLogo";
import "../../css/LoginModern.css";

const Login: React.FC = () => {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
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
  {/* MAIN */}
  <main className="container login-container m-4">
    <div className="row justify-content-center w-100">
      <div className="col-xl-5 col-lg-6 col-md-8">
        
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
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  />
                </button>
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
           
          </div>
        </div>
        {/* TRUST */}
       
     
      </div>
    </div>
  </main>
</div>
);
};

export default Login;
