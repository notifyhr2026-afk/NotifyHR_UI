import React from "react";
import { Link } from "react-router-dom";
import NikuHRLogo from "../../components/landing/NikuHRLogo";
import "./RequestDemo.css";

const RequestDemo: React.FC = () => {
  return (
    <div className="request-demo-page">

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg landing-navbar fixed-top">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <NikuHRLogo />
          </Link>

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
          <div className="row align-items-center g-5">

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
                attendance, recruitment, and employee management using
                one unified platform.
              </p>

              <div className="demo-benefits">
                <div>✓ Live platform walkthrough</div>
                <div>✓ Tailored to your business</div>
                <div>✓ Free consultation</div>
                <div>✓ No obligation</div>
              </div>

              <div className="row mt-5 g-3">
                <div className="col-4">
                  <div className="stat-card">
                    <h3>500+</h3>
                    <span>Companies</span>
                  </div>
                </div>

                <div className="col-4">
                  <div className="stat-card">
                    <h3>99.9%</h3>
                    <span>Uptime</span>
                  </div>
                </div>

                <div className="col-4">
                  <div className="stat-card">
                    <h3>24h</h3>
                    <span>Response</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="col-lg-5 offset-lg-1">
              <div className="demo-form-card">

                <div className="text-center mb-4">
                  <h3>Request a Demo</h3>
                  <p className="text-muted mb-0">
                    We'll contact you within 24 hours.
                  </p>
                </div>

                <form>

                  <div className="mb-3">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="mb-3">
                    <label>Work Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label>Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="mb-3">
                    <label>Employees</label>
                    <select className="form-select">
                      <option>Select Range</option>
                      <option>1-25</option>
                      <option>26-100</option>
                      <option>101-500</option>
                      <option>500+</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label>Requirements</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Tell us about your HR needs..."
                    />
                  </div>

                  <button
                    className="btn btn-lp-primary w-100 py-3"
                    type="submit"
                  >
                    Schedule Demo
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