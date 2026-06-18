import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import '../../css/Login.css';
import logginimage from '../../assets/Login.png';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsSubmitting(true);
        await login(username, password);
        const rawdata: any = localStorage.getItem('userRoles');
        var url = '/myprofile';
        const data = rawdata ? JSON.parse(rawdata) : [];

        console.log('User roles from localStorage:', data);
        const role = Array.isArray(data) && data.length > 0
          ? data[0].roleName
          : null;

        switch (role != undefined && role != null && role) {
          case "SuperAdmin":
            url = "/sysdashboard";
            break;
          case "OrgAdmin":
            url = "/Organization";          //  url = "/dashboard";
            break;
          default:
            url = "/EmployeeClock";
            //url = "/employeedashboard";
            //url = "/employee-connect";
        }
        navigate(url);
      } catch (err: any) {
        console.error('Login error:', err);
        setErrors({ general: err.message || 'Invalid username or password' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="container-fluid min-vh-100 bg-light" role="main">
      <div className="row g-0 h-100 align-items-center">
        {/* Left Side - Image */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary bg-opacity-10">
          <img
            src={logginimage}
            alt="Illustration showing secure login for HR software"
            className="img-fluid"
            style={{ maxWidth: '420px' }}
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center py-5">
          <div
            className="login-card shadow-lg rounded-4 p-4 p-md-5 bg-white"
            style={{ width: '100%', maxWidth: '440px' }}
          >
            <div className="text-center mb-4">
              <div className="mb-3">
                <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '3rem' }} aria-hidden="true"></i>
              </div>
              <h1 id="login-heading" className="h3 fw-bold text-dark">
                Welcome Back
              </h1>
              <p className="text-muted mb-0">
                Please sign in to your account.
              </p>
            </div>

            {errors.general && (
              <div
                className="alert alert-danger text-center py-2"
                role="alert"
                aria-live="assertive"
                id="login-error"
              >
                {errors.general}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit} aria-labelledby="login-heading" aria-describedby={errors.general ? 'login-error' : undefined}>
              {/* Username Field */}
              <div className="mb-3">
                <label htmlFor="username" className="form-label fw-semibold">
                  Username
                </label>
                <div className="input-group has-validation">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-person-fill"></i>
                  </span>
                      <input
                    type="text"
                    id="username"
                    className={`form-control ${errors.username ? 'is-invalid' : username ? 'is-valid' : ''}`}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    autoFocus
                  />
                  {errors.username && (
                    <div className="invalid-feedback" id="username-error">
                      {errors.username}
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <div className="input-group has-validation">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    id="password"
                    className={`form-control ${errors.password ? 'is-invalid' : password ? 'is-valid' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <div className="invalid-feedback" id="password-error">
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i> Log In
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">
                Forgot your password?{' '}
                <Link
                  to="/forgot-password"
                  className="text-decoration-none text-primary fw-semibold"
                  aria-label="Go to password reset page"
                >
                  Reset it
                </Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
