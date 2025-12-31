import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        navigate('/myprofile');
      } catch (err: any) {
        console.error('Login error:', err);
        setErrors({ general: err.message || 'Invalid username or password' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Side - Image */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center login-image-section">
          <img src={logginimage} alt="Login Illustration" className="img-fluid w-75" />
        </div>

        {/* Right Side - Login Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
          <div
            className="login-card shadow-lg rounded-4 p-5 bg-white"
            style={{ width: '100%', maxWidth: '420px' }}
          >
            <div className="text-center mb-4">
              <div className="mb-2">
                <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="fw-bold text-dark">Welcome Back</h3>
              <p className="text-muted small">Please sign in to your account</p>
            </div>

            {errors.general && (
              <div className="alert alert-danger text-center py-2" role="alert">
                {errors.general}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
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
                    className={`form-control ${
                      errors.username ? 'is-invalid' : username ? 'is-valid' : ''
                    }`}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
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
                    className={`form-control ${
                      errors.password ? 'is-invalid' : password ? 'is-valid' : ''
                    }`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i> Log In
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">
                Forgot your password?{' '}
                <a
                  href="#"
                  className="text-decoration-none text-primary fw-semibold"
                >
                  Reset it
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
