import React from "react";
import { Link } from "react-router-dom";

const features = [
  // HR
  { name: "Employee Management", type: "HR", desc: "Maintain employee personal, job, and employment records in one place." },
  { name: "Organizational Management", type: "HR", desc: "Define departments, roles, designations, and reporting structures." },
  { name: "Document Management", type: "HR", desc: "Securely store and manage employee documents and letters." },
  { name: "Asset Management", type: "HR", desc: "Track company assets assigned to employees with return history." },
  { name: "Background Verification (BGV)", type: "HR", desc: "Verify employee identity, education, and employment background." },
  { name: "Performance Management", type: "HR", desc: "Manage goals, reviews, ratings, and appraisal cycles." },
  { name: "Policy Management", type: "HR", desc: "Create and enforce HR policies like leave, attendance, and conduct." },
  { name: "Reports & Analytics", type: "HR", desc: "Generate real-time HR dashboards and compliance reports." },
  { name: "Helpdesk & Ticketing", type: "HR", desc: "Handle employee queries and requests with SLA tracking." },

  // Attendance
  { name: "Attendance Management", type: "Attendance", desc: "Track daily attendance using manual or automated methods." },
  { name: "Shift Management", type: "Attendance", desc: "Create and assign day, night, and rotating work shifts." },
  { name: "Overtime Management", type: "Attendance", desc: "Automatically calculate overtime based on attendance rules." },
  { name: "Holiday Calendar", type: "Attendance", desc: "Manage organization-wide and location-specific holidays." },
  { name: "Leave Integration", type: "Attendance", desc: "Sync attendance with leave requests and approvals." },

  // Payroll
  { name: "Payroll Management", type: "Payroll", desc: "Process monthly payroll with accurate salary calculations." },
  { name: "Tax & Compliance", type: "Payroll", desc: "Ensure statutory compliance and tax deductions." },
  { name: "Salary Structure", type: "Payroll", desc: "Define salary components including allowances and deductions." },
  { name: "Payslip Management", type: "Payroll", desc: "Generate and distribute digital payslips to employees." },
  { name: "Payroll Reports", type: "Payroll", desc: "Download payroll summaries and statutory reports." },

  // Recruitment
  { name: "Recruitment Management", type: "Recruitment", desc: "Manage hiring requests and recruitment workflows." },
  { name: "Candidate Management", type: "Recruitment", desc: "Track candidate profiles, resumes, and application status." },
  { name: "Interview Management", type: "Recruitment", desc: "Schedule interviews and capture interviewer feedback." },
  { name: "Onboarding", type: "Recruitment", desc: "Manage joining formalities and induction activities." },
  { name: "Offer Management", type: "Recruitment", desc: "Create, approve, and issue digital offer letters." }
];

// Group features by type
const groupedFeatures = features.reduce((acc: any, feature) => {
  acc[feature.type] = acc[feature.type] || [];
  acc[feature.type].push(feature);
  return acc;
}, {});

const Home: React.FC = () => {
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow fixed-top">
        <div className="container">
          <span className="navbar-brand fw-bold fs-4">Notify HR</span>
          <div className="d-flex gap-2">
            <Link to="/RequestDemo" className="btn btn-outline-light">
              Request Demo
            </Link>
            <Link to="/login" className="btn btn-light text-primary fw-semibold">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: "70px" }}>
        {/* HERO */}
        <section
          className="text-white text-center"
          style={{ background: "linear-gradient(135deg, #0d6efd, #dc3545)" }}
        >
          <div className="container py-5">
            <h1 className="fw-bold display-5 mb-3">
              Smart HR, Payroll & Workforce Management
            </h1>
            <p className="lead opacity-75 mb-4">
              One powerful platform to manage employees, payroll, attendance, and recruitment.
            </p>

            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn btn-light btn-lg px-5 fw-semibold">
                Get Started
              </Link>
              <a href="#features" className="btn btn-outline-light btn-lg px-4">
                View Features
              </a>
            </div>

            <p className="small mt-4 opacity-75">
              Trusted by 500+ growing organizations
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-5 bg-light">
          <div className="container">
            <h2 className="text-center fw-bold mb-2">
              <i className="bi bi-grid-fill me-2 text-primary"></i>
              Complete Feature Suite
            </h2>
            <p className="text-center text-muted mb-5">
              Designed to scale with organizations of any size
            </p>

            {Object.entries(groupedFeatures).map(([type, items]: any) => (
              <div key={type} className="mb-5">
                <h5 className="fw-bold text-primary mb-3">{type}</h5>
                <div className="row g-3">
                  {items.map((feature: any, index: number) => (
                    <div className="col-md-6 col-lg-4" key={index}>
                      <div className="p-3 border rounded h-100 feature-card bg-white">
                        <div className="d-flex">
                          <i className="bi bi-check-circle-fill text-primary fs-4 me-3"></i>
                          <div>
                            <h6 className="fw-semibold mb-1">{feature.name}</h6>
                            <p className="small text-muted mb-0">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="py-5">
          <div className="container">
            <h2 className="text-center fw-bold mb-4">
              <i className="bi bi-currency-dollar me-2 text-primary"></i>
              Pricing Plans
            </h2>

            <div className="row g-4">
              {[
                { name: "Basic", price: "Free", users: "25 Employees" },
                { name: "Standard", price: "$99", users: "100 Employees", popular: true },
                { name: "Pro", price: "$199", users: "500 Employees" },
                { name: "Enterprise", price: "$499", users: "1000+ Employees" }
              ].map((plan, index) => (
                <div className="col-md-3" key={index}>
                  <div className={`card text-center h-100 shadow-sm ${plan.popular ? "border-primary" : ""}`}>
                    <div className="card-body">
                      {plan.popular && (
                        <span className="badge bg-success mb-2">Most Popular</span>
                      )}
                      <h5 className="fw-bold">{plan.name}</h5>
                      <h2 className="text-primary my-3">{plan.price}</h2>
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
        <footer className="bg-dark text-white py-4">
          <div className="container text-center">
            <p className="fw-semibold mb-1">Notify HR</p>
            <small className="text-muted">
              HR • Payroll • Attendance • Recruitment
            </small>
          </div>
        </footer>
      </div>

      {/* HOVER STYLES */}
      <style>
        {`
          .feature-card {
            transition: all 0.2s ease;
          }
          .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          }
          .card:hover {
            transform: scale(1.03);
            transition: 0.2s ease;
          }
        `}
      </style>
    </>
  );
};

export default Home;
