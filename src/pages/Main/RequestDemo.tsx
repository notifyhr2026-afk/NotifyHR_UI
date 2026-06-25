import React, { useState } from "react";
import { Link } from "react-router-dom";
import NikuHRLogo from "../../components/landing/NikuHRLogo";
import requestDemoService from "../../services/requestDemoService";
import "../../css/RequestDemo.css";

interface FormData {
fullName: string;
mobile: string;
workEmail: string;
companyName: string;
employeeRange: string;
requirements: string;
statusId: number;
}

interface MessageState {
type: "success" | "danger" | "";
text: string;
}

const RequestDemo: React.FC = () => {
const [loading, setLoading] = useState(false);

const [message, setMessage] = useState<MessageState>({
type: "",
text: "",
});

const [formData, setFormData] = useState<FormData>({
fullName: "",
mobile: "",
workEmail: "",
companyName: "",
employeeRange: "",
requirements: "",
statusId: 1,
});

const handleChange = (
e: React.ChangeEvent<
HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>
) => {
setFormData((prev) => ({
...prev,
[e.target.name]: e.target.value,
}));


if (message.text) {
  setMessage({
    type: "",
    text: "",
  });
}


};

const validateForm = () => {
const mobileRegex = /^[0-9]{10,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;


if (formData.fullName.trim().length < 3) {
  setMessage({
    type: "danger",
    text: "Please enter a valid full name.",
  });
  return false;
}

if (!mobileRegex.test(formData.mobile.trim())) {
  setMessage({
    type: "danger",
    text: "Please enter a valid mobile number.",
  });
  return false;
}

if (!emailRegex.test(formData.workEmail.trim())) {
  setMessage({
    type: "danger",
    text: "Please enter a valid work email address.",
  });
  return false;
}

if (!formData.companyName.trim()) {
  setMessage({
    type: "danger",
    text: "Please enter your company name.",
  });
  return false;
}

if (!formData.employeeRange) {
  setMessage({
    type: "danger",
    text: "Please select employee range.",
  });
  return false;
}

return true;


};

const resetForm = () => {
  setFormData({
    fullName: "",
    mobile: "",
    workEmail: "",
    companyName: "",
    employeeRange: "",
    requirements: "",
    statusId: 1,
  });
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();


if (!validateForm()) return;

try {
  setLoading(true);

  const payload = {
    FullName: formData.fullName.trim(),
    Mobile: formData.mobile.trim(),
    WorkEmail: formData.workEmail.trim(),
    CompanyName: formData.companyName.trim(),
    EmployeeRange: formData.employeeRange,
    Requirements: formData.requirements.trim(),
    StatusId: formData.statusId,
  };

  const response =
  await requestDemoService.PostRequestDemoAsync(payload);

console.log("Response:", response);

if (
  response?.Table &&
  response.Table.length > 0 &&
  response.Table[0].RequestDemoId > 0
) {
  setMessage({
    type: "success",
    text: "Demo request submitted successfully. We'll contact you within 24 hours.",
  });

  resetForm();
} else {
  setMessage({
    type: "danger",
    text: "Unable to save demo request.",
  });
}

  resetForm();
} catch (error) {
  console.error(error);

  setMessage({
    type: "danger",
    text: "Failed to submit demo request. Please try again.",
  });
} finally {
  setLoading(false);
}


};

return ( <div className="request-demo-page">
{/* NAVBAR */} <nav className="navbar navbar-expand-lg landing-navbar fixed-top"> <div className="container"> <Link to="/" className="navbar-brand"> <NikuHRLogo /> </Link>


      <div className="d-flex gap-2">
        <Link to="/login" className="btn btn-lp-primary">
          Login
        </Link>
      </div>
    </div>
  </nav>

  {/* HERO */}
  <section className="demo-hero">
    <div className="container">
      <div className="row align-items-center g-4">
        <div className="col-lg-6">
          <span className="landing-kicker">
            Personalized Product Tour
          </span>

          <h1 className="display-4 fw-bold mb-4">
            See how <span className="text-gradient">NikuHR</span>
            <br />
            transforms HR operations
          </h1>

          <p className="lead text-muted mb-4">
            Discover how leading organizations automate payroll,
            attendance, recruitment, and employee management using one
            unified platform.
          </p>

          <div className="demo-benefits">
            <div>✓ Live platform walkthrough</div>
            <div>✓ Tailored to your business</div>
            <div>✓ Free consultation</div>
            <div>✓ No obligation</div>
          </div>
        </div>

        {/* FORM */}
        <div className="col-lg-5 offset-lg-1">
          <div className="demo-form-card">
            <div className="text-center mb-4">
              <h3 className="fw-bold">Request a Demo</h3>
              <p className="text-muted mb-0">
                We'll contact you within 24 hours.
              </p>
            </div>

            {message.text && (
              <div
                className={`alert alert-${message.type} mb-3`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  required
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile</label>
                  <input
                    required
                    type="tel"
                    name="mobile"
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Work Email</label>
                  <input
                    required
                    type="email"
                    name="workEmail"
                    className="form-control"
                    placeholder="john@company.com"
                    value={formData.workEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Company Name</label>
                <input
                  required
                  type="text"
                  name="companyName"
                  className="form-control"
                  placeholder="Your Company"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Employees</label>
                <select
                  required
                  name="employeeRange"
                  className="form-select"
                  value={formData.employeeRange}
                  onChange={handleChange}
                >
                  <option value="">Select Range</option>
                  <option value="1-25">1-25</option>
                  <option value="26-100">26-100</option>
                  <option value="101-500">101-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Requirements</label>
                <textarea
                  name="requirements"
                  className="form-control"
                  rows={3}
                  placeholder="Tell us about your HR needs..."
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>

              <button
                className="btn btn-lp-primary w-100 py-3"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Schedule Demo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* BENEFITS */}
  <section className="demo-features">
    <div className="container">
      <div className="row g-4">
        <div className="col-md-3">
          <div className="lp-card h-100">
            <i className="bi bi-lightning-charge"></i>
            <h5>Fast Setup</h5>
            <p>Get started quickly with guided onboarding.</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="lp-card h-100">
            <i className="bi bi-shield-check"></i>
            <h5>Secure</h5>
            <p>Enterprise-grade security and compliance.</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="lp-card h-100">
            <i className="bi bi-people"></i>
            <h5>Employee Experience</h5>
            <p>Empower teams with self-service workflows.</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="lp-card h-100">
            <i className="bi bi-headset"></i>
            <h5>Dedicated Support</h5>
            <p>Expert assistance whenever you need it.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>


);
};

export default RequestDemo;
