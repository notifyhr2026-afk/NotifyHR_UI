import React from "react";
import { Link } from "react-router-dom";
import notifyhr_logo1 from "../../img/NotifyHR_Logo1.png";

const RequestDemo: React.FC = () => {
  return (
    <>
      {/* NAVBAR */}
     <nav
        className="navbar navbar-expand-lg navbar-dark fixed-top shadow"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img src={notifyhr_logo1} alt="NotifyHR Logo" className="app-logo" />
            {/* <span className="fw-bold fs-5 text-white">NotifyHR</span> */}
          </Link>

          <div className="d-flex gap-2">           
            <Link to="/login" className="btn btn-light text-primary fw-semibold">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: "70px" }}>
        {/* HERO */}
        <section
          className="text-white"
          style={{ background: "linear-gradient(135deg, rgb(13, 110, 253), rgb(242 16 16))" }}
        >
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <h1 className="fw-bold mb-3">
                  See Notify HR in Action
                </h1>
                <p className="lead opacity-75">
                  Book a personalized demo and discover how Notify HR simplifies
                  HR, payroll, attendance, and recruitment for your organization.
                </p>

                <ul className="list-unstyled mt-4">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill me-2 text-warning"></i>
                    Live product walkthrough
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill me-2 text-warning"></i>
                    Tailored to your business needs
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill me-2 text-warning"></i>
                    No obligation, completely free
                  </li>
                </ul>
              </div>

              {/* FORM CARD */}
              <div className="col-lg-5 offset-lg-1">
                <div className="card shadow-lg border-0">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3 text-center">
                      Request a Free Demo
                    </h5>

                    <form>
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your name"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Work Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@company.com"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your organization"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Number of Employees</label>
                        <select className="form-select" required>
                          <option value="">Select</option>
                          <option>1 – 25</option>
                          <option>26 – 100</option>
                          <option>101 – 500</option>
                          <option>500+</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          What are you looking for?
                        </label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="HR, Payroll, Attendance, Recruitment..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100 fw-semibold"
                      >
                        Request Demo
                      </button>

                      <p className="small text-muted text-center mt-3 mb-0">
                        We usually respond within 24 hours
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST / FOOTER */}
        <section className="py-4 bg-light">
          <div className="container text-center">
            <p className="mb-1 fw-semibold">
              Trusted by 500+ organizations
            </p>
            <small className="text-muted">
              Secure • Scalable • Cloud-based HR platform
            </small>
          </div>
        </section>
      </div>

      {/* HOVER & FOCUS STYLES */}
      <style>
        {`
          .form-control:focus,
          .form-select:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.15rem rgba(13,110,253,.25);
          }

          button.btn-primary:hover {
            transform: translateY(-1px);
            transition: 0.2s ease;
          }
        `}
      </style>
    </>
  );
};

export default RequestDemo;
