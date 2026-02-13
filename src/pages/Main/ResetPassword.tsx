import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import '../../css/Login.css';
import resetImage from '../../assets/ResetPassword.png'; // add a suitable image (or reuse Login.png)
import { useSearchParams } from "react-router-dom";
import changePassword from '../../services/Changepassword';
import Swal from 'sweetalert2';

const ResetPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  //const { resetPassword } = useAuth(); // you'll need to add this function in AuthContext
  const navigate = useNavigate();
const [searchParams] = useSearchParams();

const userID = searchParams.get("userId");
const organizationID = searchParams.get("orgId");

const parsedUserId = Number(userID);
const parsedOrgId = Number(organizationID);
const [successMessage, setSuccessMessage] = useState('');

  const {  logout } = useAuth();



  // --- Validation ---
  const validate = () => {
    const newErrors: { oldPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (!oldPassword) newErrors.oldPassword = 'Current password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (confirmPassword !== newPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  // --- Handle Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      setSuccessMessage('');

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsSubmitting(true);
        const payload = {
          userID: parsedUserId,
        organizationID: parsedOrgId,
        oldPassword: oldPassword,
        password: newPassword,
          modifiedBy: "Admin"

      };

      await changePassword(payload);

      await Swal.fire({
        icon: 'success',
        title: 'Password Reset Successful!',
        text: 'Please login again with your new password.',
        confirmButtonColor: '#3085d6',
        heightAuto: false, 
        width: 380,
        customClass: {
          popup: "custom-swal-popup"
        },
        showConfirmButton: false,   // ❌ remove OK button
        timer: 2500,                // ⏱ 3 seconds
        timerProgressBar: true,     // optional progress bar
        allowOutsideClick: false,
        allowEscapeKey: false,
        scrollbarPadding: false,
        didClose: () => {
                logout()
          navigate("/login");  // 🔁 auto redirect
        }
      }).then(() => {
              logout()
          navigate("/login");
        });
        //await resetPassword(oldPassword, newPassword);
      } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Password Reset Failed',
        text: 'Invalid current password or request failed.',
      });
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
          <img src={resetImage} alt="Reset Password Illustration" className="img-fluid w-75" />
        </div>

        {/* Right Side - Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
          <div className="login-card shadow-lg rounded-4 p-5 bg-white" style={{ width: '100%', maxWidth: '420px' }}>
            <div className="text-center mb-4">
              <div className="mb-2">
                <i className="bi bi-key-fill text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h3 className="fw-bold text-dark">Reset Password</h3>
              <p className="text-muted small">Please change your password to continue</p>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              {/* Old Password */}
              <div className="mb-3">
                <label htmlFor="oldPassword" className="form-label fw-semibold">Current Password</label>
                <div className="input-group has-validation">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    id="oldPassword"
                    className={`form-control ${errors.oldPassword ? 'is-invalid' : oldPassword ? 'is-valid' : ''}`}
                    placeholder="Enter your current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  {errors.oldPassword && <div className="invalid-feedback">{errors.oldPassword}</div>}
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label fw-semibold">New Password</label>
                <div className="input-group has-validation">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-shield-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    id="newPassword"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : newPassword ? 'is-valid' : ''}`}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
                <div className="input-group has-validation">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-check2-circle"></i>
                  </span>
                  <input
                    type="password"
                    id="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : confirmPassword ? 'is-valid' : ''}`}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat me-2"></i> Reset Password
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">
                Remembered your password?{' '}
                <a href="/login" className="text-decoration-none text-primary fw-semibold">Back to Login</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
