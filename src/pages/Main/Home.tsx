import React from "react";
import { Link } from "react-router-dom";

const features = [
  // HR
  { name: "Employee Management", type: "HR" },
  { name: "Organizational Management", type: "HR" },
  { name: "Document Management", type: "HR" },
  { name: "Asset Management", type: "HR" },
  { name: "Background Verification (BGV)", type: "HR" },
  { name: "Performance Management", type: "HR" },
  { name: "Policy Management", type: "HR" },
  { name: "Reports & Analytics", type: "HR" },
  { name: "Helpdesk & Ticketing", type: "HR" },
  { name: "Feature & Plan Management", type: "HR" },

  // Attendance
  { name: "Attendance Management", type: "Attendance" },
  { name: "Shift Management", type: "Attendance" },
  { name: "Overtime Management", type: "Attendance" },
  { name: "Holiday Calendar", type: "Attendance" },
  { name: "Leave Integration", type: "Attendance" },

  // Payroll
  { name: "Payroll Management", type: "Payroll" },
  { name: "Tax & Compliance", type: "Payroll" },
  { name: "Payroll Add-ons", type: "Payroll" },
  { name: "Salary Structure", type: "Payroll" },
  { name: "Payslip Management", type: "Payroll" },
  { name: "Payroll Reports", type: "Payroll" },
  { name: "Timesheet Management", type: "Payroll" },

  // Recruitment
  { name: "Recruitment Management", type: "Recruitment" },
  { name: "Candidate Management", type: "Recruitment" },
  { name: "Interview Management", type: "Recruitment" },
  { name: "Onboarding", type: "Recruitment" },
  { name: "Offer Management", type: "Recruitment" }
];

const Home: React.FC = () => {
  return (
    <>
      {/* FIXED HEADER */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow fixed-top">
        <div className="container">
          <span className="navbar-brand fw-bold fs-4">
            HRMS Pro
          </span>
          <Link to="/login" className="btn btn-outline-light">
            Login
          </Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div style={{ paddingTop: "65px" }}>
        {/* HERO SECTION */}
        <section
          className="text-white"
          style={{
            background: "linear-gradient(135deg, rgb(13, 110, 253), rgb(202 10 91))"
          }}
        >
          <div className="container py-5 text-center">
            <h1 className="fw-bold display-5 mb-3">
              Smart HR, Payroll & Workforce Management
            </h1>
            <p className="lead mb-4 opacity-75">
              Automate HR operations, payroll, attendance,
              and recruitment in one secure platform.
            </p>
            <Link to="/login" className="btn btn-light btn-lg px-5 fw-semibold">
              Get Started
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-5 bg-light">
          <div className="container">
            <h2 className="text-center fw-bold mb-2">
              Complete Feature Suite
            </h2>
            <p className="text-center text-muted mb-4">
              Designed for HR teams, managers, and enterprises
            </p>

            <div
              className="bg-white rounded shadow-sm p-4"
              style={{
                maxHeight: "420px",
                overflowY: "auto"
              }}
            >
              <div className="row g-3">
                {features.map((feature, index) => (
                  <div className="col-md-6 col-lg-4" key={index}>
                    <div
                      className="d-flex align-items-start p-3 border rounded h-100 feature-card"
                      style={{
                        backgroundColor: "#fafafa",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <i className="bi bi-check-circle-fill text-primary fs-4 me-3"></i>
                      <div>
                        <h6 className="fw-semibold mb-1">
                          {feature.name}
                        </h6>
                        <span className="badge bg-secondary-subtle text-dark">
                          {feature.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-5">
          <div className="container">
            <h2 className="text-center fw-bold mb-4">
              Pricing Plans
            </h2>
            <div className="row g-4">
              {[
                { name: "Basic", price: "Free", users: "25 Employees" },
                { name: "Standard", price: "$99", users: "100 Employees" },
                { name: "Pro", price: "$199", users: "500 Employees" },
                { name: "Enterprise", price: "$499", users: "1000+ Employees" }
              ].map((plan, index) => (
                <div className="col-md-3" key={index}>
                  <div className="card text-center shadow-sm h-100 border-0">
                    <div className="card-body">
                      <h5 className="fw-bold">{plan.name}</h5>
                      <h2 className="my-3 text-primary">
                        {plan.price}
                      </h2>
                      <p className="text-muted">{plan.users}</p>
                      <Link to="/login" className="btn btn-primary w-100">
                        Choose Plan
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-dark text-white py-3">
          <div className="container text-center">
            <small>
              © {new Date().getFullYear()} HRMS Pro. All rights reserved.
            </small>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
