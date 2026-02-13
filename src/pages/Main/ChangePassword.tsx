import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import '../../css/Login.css';
import changePassword from '../../services/Changepassword';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();


const user = JSON.parse(localStorage.getItem("user") || "null");
console.log(user)


  const validate = () => {
    const newErrors: typeof errors = {};
    if (!currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    if (!newPassword.trim()) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (confirmPassword !== newPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSuccessMessage('');

  const validationErrors = validate();
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length === 0) {
    try {
      setIsSubmitting(true);

      const payload = {
          userID: user.userID,
        organizationID: user.organizationID,
        oldPassword: currentPassword,
        password: newPassword,
          modifiedBy: "admin"

      };

      await changePassword(payload);

     await Swal.fire({
             icon: 'success',
             title: 'Password updated Successful!',
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
               navigate("/myprofile");  // 🔁 auto redirect
             }
           }).then(() => {
               navigate("/myprofile");
             });
           } 

     catch (err) {
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
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <h4 className="fw-bold text-center mb-3">
                <i className="bi bi-lock-fill me-2 text-primary"></i>Change Password
              </h4>
              <p className="text-muted small text-center mb-4">
                Update your password to keep your account secure.
              </p>

              <form noValidate onSubmit={handleSubmit}>
                {/* Current Password */}
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label fw-semibold">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : currentPassword ? 'is-valid' : ''}`}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label fw-semibold">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : newPassword ? 'is-valid' : ''}`}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : confirmPassword ? 'is-valid' : ''}`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-semibold py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat me-2"></i>Change Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
