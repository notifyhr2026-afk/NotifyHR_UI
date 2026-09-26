import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NikuHRLogo from '../../components/landing/NikuHRLogo';
import '../../css/LoginModern.css';

interface SampleAccount {
  email: string;
  username: string;
  role: string;
  maskedPhone: string;
}

const SAMPLE_ACCOUNTS: SampleAccount[] = [
  {
    email: 'admin@nikuhrm.com',
    username: 'admin',
    role: 'Global Super Administrator',
    maskedPhone: '+1 (•••) •••-4829',
  },
  {
    email: 'hr.manager@nikuhrm.com',
    username: 'hr_manager',
    role: 'Human Resources Lead',
    maskedPhone: '+1 (•••) •••-8192',
  },
  {
    email: 'finance.lead@nikuhrm.com',
    username: 'payroll_admin',
    role: 'Payroll & Compensation Officer',
    maskedPhone: '+1 (•••) •••-3310',
  },
  {
    email: 'alex.chen@nikuhrm.com',
    username: 'employee_user',
    role: 'Staff Engineer',
    maskedPhone: '+1 (•••) •••-9041',
  },
];

type Step = 'REQUEST' | 'OTP' | 'RESET_PASSWORD' | 'SUCCESS';

const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('admin@nikuhrm.com');
  const [currentStep, setCurrentStep] = useState<Step>('REQUEST');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'sms'>('email');

  // Verification code state (6 digits)
  const [otpCode, setOtpCode] = useState(['4', '8', '2', '9', '1', '0']);
  const [otpError, setOtpError] = useState('');

  // New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Status flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'info' | 'success' | 'warning'; text: string } | null>({
    type: 'info',
    text: 'Self-service account recovery demo mode enabled with prefilled test accounts.',
  });

  // Masked target for preview
  const activeAccount = SAMPLE_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === identifier.toLowerCase() ||
      acc.username.toLowerCase() === identifier.toLowerCase()
  ) || {
    email: identifier.includes('@') ? identifier : `${identifier}@enterprise.domain`,
    username: identifier,
    role: 'Enterprise Member',
    maskedPhone: '+1 (•••) •••-8822',
  };

  const handleSelectSample = (acc: SampleAccount) => {
    setIdentifier(acc.email);
    setAlertMessage({
      type: 'info',
      text: `Selected ${acc.role} (${acc.email}). Ready to test reset flow.`,
    });
  };

  // Step 1: Request reset link / OTP
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setAlertMessage({ type: 'warning', text: 'Please enter your corporate email or username.' });
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep('OTP');
      setAlertMessage({
        type: 'success',
        text: `A 6-digit verification code has been dispatched to ${
          deliveryMethod === 'email' ? activeAccount.email : activeAccount.maskedPhone
        } (Sample: 482910).`,
      });
    }, 600);
  };

  // Step 2: Validate OTP
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpCode];
    updated[index] = val;
    setOtpCode(updated);
    setOtpError('');

    // Auto-focus next box if digit entered
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // For demonstration, accept 482910 or any valid 6-digit code
      setCurrentStep('RESET_PASSWORD');
      setAlertMessage({
        type: 'success',
        text: 'Identity verified successfully. Please choose a strong new password.',
      });
    }, 600);
  };

  // Step 3: Set new password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep('SUCCESS');
      setAlertMessage({
        type: 'success',
        text: 'Your password has been updated securely. You can now sign in.',
      });
    }, 700);
  };

  return (
    <div className="login-page">
      <div className="login-split-layout">
        {/* LEFT SHOWCASE PANEL */}
        <div className="login-showcase-panel">
          <div className="showcase-glow-1" />
          <div className="showcase-glow-2" />

          {/* Header Brand */}
          <div className="showcase-header">
            <NikuHRLogo variant="light" />
            <span className="showcase-badge">
              <span className="showcase-badge-dot" />
              Identity & Access Security
            </span>
          </div>

          {/* Hero Pitch */}
          <div className="showcase-hero">
            <h1 className="showcase-hero-title">
              Self-Service <span className="text-gradient">Password Recovery</span>
            </h1>
            <p className="showcase-hero-desc">
              Reset access to your enterprise workspace with zero administrative delays. Protected
              by multi-factor identity validation and organizational security policies.
            </p>

            {/* Feature Cards */}
            <div className="showcase-features-grid">
              <div className="showcase-feature-card">
                <div className="feature-card-icon-wrap icon-cyan">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                </div>
                <div className="feature-card-title">Zero-Trust Verification</div>
                <div className="feature-card-desc">
                  Temporary time-based tokens and encrypted reset dispatches.
                </div>
              </div>

              <div className="showcase-feature-card">
                <div className="feature-card-icon-wrap icon-emerald">
                  <i className="bi bi-key-fill" aria-hidden="true" />
                </div>
                <div className="feature-card-title">Enterprise Password Rules</div>
                <div className="feature-card-desc">
                  Enforces complexity requirements, history locks, and single-session invalidation.
                </div>
              </div>
            </div>
          </div>

          {/* Showcase Footer */}
          <div className="showcase-footer">
            <div className="showcase-footer-item">
              <i className="bi bi-lock-fill text-indigo-400" aria-hidden="true" />
              <span>TLS 1.3 End-to-End Encrypted</span>
            </div>
            <div className="showcase-footer-item">
              <i className="bi bi-patch-check-fill text-cyan-400" aria-hidden="true" />
              <span>SOC2 Type II & ISO 27001 Compliant</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="login-form-panel">
          {/* Top Bar */}
          <div className="form-panel-topbar">
            <div className="mobile-brand-wrapper">
              <NikuHRLogo variant="default" />
            </div>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <span className="text-muted small">Remember your password?</span>
              <Link to="/login" className="btn btn-sm btn-outline-primary fw-medium px-3 rounded-2">
                Sign In
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="form-panel-content">
            {/* Header */}
            <div className="form-header">
              <div className="d-flex align-items-center gap-2 mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                  style={{ width: 36, height: 36, background: 'rgba(79, 70, 229, 0.1)' }}
                >
                  <i className="bi bi-shield-lock-fill fs-5" />
                </div>
                <span className="badge bg-light text-primary border fw-semibold font-monospace px-2 py-1">
                  SECURE RECOVERY
                </span>
              </div>

              <h2 className="form-header-title">
                {currentStep === 'REQUEST' && 'Recover Account'}
                {currentStep === 'OTP' && 'Verify Identity'}
                {currentStep === 'RESET_PASSWORD' && 'Create New Password'}
                {currentStep === 'SUCCESS' && 'Password Updated'}
              </h2>
              <p className="form-header-desc">
                {currentStep === 'REQUEST' &&
                  'Enter your verified enterprise email or username to initiate password reset.'}
                {currentStep === 'OTP' &&
                  `Enter the 6-digit confirmation code delivered to your ${deliveryMethod}.`}
                {currentStep === 'RESET_PASSWORD' &&
                  'Choose a strong password with at least 8 characters including letters and symbols.'}
                {currentStep === 'SUCCESS' &&
                  'Your enterprise credentials have been reset successfully. You may now log in.'}
              </p>
            </div>

            {/* Demo Sample Accounts Quick Fill */}
            {currentStep === 'REQUEST' && (
              <div className="demo-role-box mb-4" id="sample-accounts-box">
                <span className="demo-role-label">
                  <i className="bi bi-lightning-charge-fill text-warning" aria-hidden="true" />
                  Quick Sample Roles:
                </span>
                <div className="demo-role-buttons">
                  {SAMPLE_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      className={`demo-role-chip ${identifier === acc.email ? 'active' : ''}`}
                      onClick={() => handleSelectSample(acc)}
                    >
                      {acc.username} ({acc.role.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Alert Banner */}
            {alertMessage && (
              <div
                className={`alert alert-${
                  alertMessage.type === 'info'
                    ? 'primary'
                    : alertMessage.type === 'success'
                    ? 'success'
                    : 'warning'
                } border-0 shadow-sm rounded-3 p-3 mb-4 d-flex align-items-start gap-2`}
                role="alert"
                style={{ fontSize: '0.88rem' }}
              >
                <i
                  className={`bi ${
                    alertMessage.type === 'success'
                      ? 'bi-check-circle-fill text-success'
                      : alertMessage.type === 'warning'
                      ? 'bi-exclamation-triangle-fill text-warning'
                      : 'bi-info-circle-fill text-primary'
                  } fs-5 flex-shrink-0 mt-n1`}
                />
                <div>{alertMessage.text}</div>
              </div>
            )}

            {/* STEP 1: REQUEST FORM */}
            {currentStep === 'REQUEST' && (
              <form onSubmit={handleRequestSubmit} className="login-form">
                <div className="login-field-group">
                  <label htmlFor="recovery-identifier" className="login-field-label">
                    Work Email or Username <span className="text-danger">*</span>
                  </label>
                  <div className="login-input-wrapper">
                    <i className="bi bi-envelope login-input-icon" aria-hidden="true" />
                    <input
                      id="recovery-identifier"
                      type="text"
                      className="login-input"
                      placeholder="e.g. name@company.com or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-text text-muted small mt-1">
                    System will send a verification challenge to your registered contact channel.
                  </div>
                </div>

                {/* Delivery Channel Radio */}
                <div className="login-field-group">
                  <label className="login-field-label">Dispatch Method</label>
                  <div className="d-flex gap-3 mt-1">
                    <label
                      className={`flex-fill p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                        deliveryMethod === 'email'
                          ? 'border-primary bg-primary bg-opacity-10 text-primary fw-semibold'
                          : 'bg-light text-muted'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="email"
                        checked={deliveryMethod === 'email'}
                        onChange={() => setDeliveryMethod('email')}
                        className="form-check-input mt-0"
                      />
                      <i className="bi bi-envelope-at" />
                      <span className="small">Corporate Email</span>
                    </label>

                    <label
                      className={`flex-fill p-2 rounded-3 border d-flex align-items-center gap-2 cursor-pointer ${
                        deliveryMethod === 'sms'
                          ? 'border-primary bg-primary bg-opacity-10 text-primary fw-semibold'
                          : 'bg-light text-muted'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="sms"
                        checked={deliveryMethod === 'sms'}
                        onChange={() => setDeliveryMethod('sms')}
                        className="form-check-input mt-0"
                      />
                      <i className="bi bi-phone" />
                      <span className="small">SMS to Phone</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                  id="send-recovery-btn"
                >
                  {isSubmitting ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Sending Verification...
                    </span>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span>Send Recovery Code</span>
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {currentStep === 'OTP' && (
              <form onSubmit={handleVerifyOtp} className="login-form">
                <div className="login-field-group">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="login-field-label mb-0">Enter 6-Digit Code</label>
                    <span className="badge bg-light text-muted border font-monospace">
                      Default: 482910
                    </span>
                  </div>

                  <div className="d-flex justify-content-between gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="form-control text-center fw-bold fs-4 py-2 border rounded-3"
                        style={{ width: '48px', height: '52px' }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="field-error-msg mt-2 text-danger small">
                      <i className="bi bi-exclamation-circle me-1" />
                      {otpError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                  id="verify-otp-btn"
                >
                  {isSubmitting ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Validating Code...
                    </span>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span>Verify Code & Proceed</span>
                      <i className="bi bi-check-lg" aria-hidden="true" />
                    </span>
                  )}
                </button>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-link text-muted p-0 text-decoration-none small"
                    onClick={() => setCurrentStep('REQUEST')}
                  >
                    <i className="bi bi-arrow-left me-1" /> Change Email
                  </button>
                  <button
                    type="button"
                    className="btn btn-link text-primary p-0 text-decoration-none small fw-semibold"
                    onClick={() => {
                      setOtpCode(['4', '8', '2', '9', '1', '0']);
                      setAlertMessage({
                        type: 'info',
                        text: 'New verification code dispatched (Sample: 482910).',
                      });
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {currentStep === 'RESET_PASSWORD' && (
              <form onSubmit={handleResetPassword} className="login-form">
                {/* New Password */}
                <div className="login-field-group">
                  <label htmlFor="new-password" className="login-field-label">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <div className="login-input-wrapper">
                    <i className="bi bi-lock login-input-icon" aria-hidden="true" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="login-input"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="login-input-action-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="login-field-group">
                  <label htmlFor="confirm-password" className="login-field-label">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <div className="login-input-wrapper">
                    <i className="bi bi-lock-fill login-input-icon" aria-hidden="true" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="login-input"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="login-input-action-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="field-error-msg text-danger small mb-3">
                    <i className="bi bi-exclamation-circle me-1" />
                    {passwordError}
                  </div>
                )}

                {/* Password Strength Checklist */}
                <div className="p-3 rounded-3 bg-light border mb-3">
                  <div className="fw-semibold small text-dark mb-2">Password Requirements:</div>
                  <ul className="list-unstyled mb-0 small text-muted">
                    <li className="d-flex align-items-center gap-2 mb-1">
                      <i
                        className={`bi ${
                          newPassword.length >= 8
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        }`}
                      />
                      <span>At least 8 characters in length</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <i
                        className={`bi ${
                          newPassword && newPassword === confirmPassword
                            ? 'bi-check-circle-fill text-success'
                            : 'bi-circle text-muted'
                        }`}
                      />
                      <span>Passwords match precisely</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSubmitting}
                  id="reset-password-submit-btn"
                >
                  {isSubmitting ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Updating Password...
                    </span>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span>Update Password</span>
                      <i className="bi bi-shield-check" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS */}
            {currentStep === 'SUCCESS' && (
              <div className="text-center py-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center text-success mb-3"
                  style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.12)' }}
                >
                  <i className="bi bi-check-circle-fill fs-1" />
                </div>
                <h4 className="fw-bold text-dark mb-2">Password Successfully Reset</h4>
                <p className="text-muted small mb-4">
                  Your credentials have been securely updated. You can now access your account with
                  the new password.
                </p>
                <Link
                  to="/login"
                  className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                  id="back-to-login-btn"
                >
                  <span>Proceed to Sign In</span>
                  <i className="bi bi-arrow-right" />
                </Link>
              </div>
            )}

            {/* Footer Support Notice */}
            <div className="form-panel-footer mt-4 pt-3 border-top text-center text-muted small">
              Need assistance? Contact your organization administrator or{' '}
              <a href="mailto:support@nikuhrm.com" className="text-primary text-decoration-none">
                support@nikuhrm.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
