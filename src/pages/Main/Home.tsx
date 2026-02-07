import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/notifyhr-logo.svg";
import notifyhr_logo1 from "../../img/NotifyHR_Logo1.png";

const features = [
  // HR
  { name: "Employee Management", type: "HR", desc: "Maintain employee personal and job records." },
  { name: "Organizational Management", type: "HR", desc: "Departments, roles, designations, reporting." },
  { name: "Document Management", type: "HR", desc: "Secure storage for employee documents." },
  { name: "Asset Management", type: "HR", desc: "Track company assets assigned to employees." },
  { name: "Background Verification", type: "HR", desc: "Verify employee identity and history." },
  { name: "Performance Management", type: "HR", desc: "Goals, reviews, and appraisals." },
  { name: "Policy Management", type: "HR", desc: "HR policies and compliance." },
  { name: "Reports & Analytics", type: "HR", desc: "Real-time HR dashboards." },
  { name: "Helpdesk & Ticketing", type: "HR", desc: "Employee queries with SLA tracking." },

  // Attendance
  { name: "Attendance Management", type: "Attendance", desc: "Daily attendance tracking." },
  { name: "Shift Management", type: "Attendance", desc: "Day, night, rotating shifts." },
  { name: "Overtime Management", type: "Attendance", desc: "Automatic OT calculation." },
  { name: "Holiday Calendar", type: "Attendance", desc: "Location-based holidays." },
  { name: "Leave Integration", type: "Attendance", desc: "Attendance synced with leave." },

  // Payroll
  { name: "Payroll Management", type: "Payroll", desc: "Accurate monthly payroll." },
  { name: "Tax & Compliance", type: "Payroll", desc: "Statutory compliance & taxes." },
  { name: "Salary Structure", type: "Payroll", desc: "Allowances & deductions." },
  { name: "Payslip Management", type: "Payroll", desc: "Digital payslips." },
  { name: "Payroll Reports", type: "Payroll", desc: "Statutory & salary reports." },

  // Recruitment
  { name: "Recruitment Management", type: "Recruitment", desc: "Hiring workflows." },
  { name: "Candidate Management", type: "Recruitment", desc: "Track resumes & status." },
  { name: "Interview Management", type: "Recruitment", desc: "Schedule & feedback." },
  { name: "Onboarding", type: "Recruitment", desc: "Joining & induction." },
  { name: "Offer Management", type: "Recruitment", desc: "Digital offer letters." }
];

const groupedFeatures = features.reduce((acc: any, f) => {
  acc[f.type] = acc[f.type] || [];
  acc[f.type].push(f);
  return acc;
}, {});

const Home: React.FC = () => {
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
            <Link to="/RequestDemo" className="btn btn-light text-primary fw-semibold">
              Request Demo
            </Link>
            <Link to="/login" className="btn btn-light text-primary fw-semibold">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: 72 }}>
        {/* HERO */}
        <section
          className="text-white text-center"
          style={{
            background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))"
          }}
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
            <h2 className="text-center fw-bold mb-5">
              Complete Feature Suite
            </h2>

            {Object.entries(groupedFeatures).map(([type, items]: any) => (
              <div key={type} className="mb-5">
                <h5 className="fw-bold text-primary mb-3">{type}</h5>
                <div className="row g-3">
                  {items.map((f: any, i: number) => (
                    <div className="col-md-6 col-lg-4" key={i}>
                      <div className="p-3 bg-white border rounded h-100 feature-card">
                        <h6 className="fw-semibold">{f.name}</h6>
                        <p className="small text-muted mb-0">{f.desc}</p>
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
            <h2 className="text-center fw-bold mb-4">Pricing Plans</h2>
            <div className="row g-4">
              {[
                { name: "Basic", price: "Free", users: "25 Employees" },
                { name: "Standard", price: "$99", users: "100 Employees", popular: true },
                { name: "Pro", price: "$199", users: "500 Employees" },
                { name: "Enterprise", price: "$499", users: "1000+ Employees" }
              ].map((p, i) => (
                <div className="col-md-3" key={i}>
                  <div className={`card text-center h-100 shadow-sm ${p.popular ? "border-primary" : ""}`}>
                    <div className="card-body">
                      {p.popular && <span className="badge bg-success mb-2">Most Popular</span>}
                      <h5 className="fw-bold">{p.name}</h5>
                      <h2 className="text-primary my-3">{p.price}</h2>
                      <p className="text-muted">{p.users}</p>
                      <Link to="/login" className="btn btn-brand w-100">
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
        <footer className="text-white py-4 text-center" style={{ backgroundColor: "#0647a7" }}>
          <p className="fw-semibold mb-1">NotifyHR © 2026 All Rights Reserved</p>
          <small className="text-white">
            HR • Payroll • Attendance • Recruitment
          </small>
        </footer>
      </div>
    </>
  );
};

export default Home;
