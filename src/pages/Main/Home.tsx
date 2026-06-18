import React from "react";
import { Link } from "react-router-dom";
import notifyhr_logo1 from "../../img/Logo-blue.png";

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
        className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm"
        aria-label="Primary navigation"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img
              src={notifyhr_logo1}
              alt="NikuHR logo"
              style={{ height: "55px", width: "auto" }}
            />
          </Link>

          <div className="d-flex gap-2">
            <Link to="/RequestDemo" className="btn btn-outline-primary fw-semibold" aria-label="Request a demo">
              Request Demo
            </Link>
            <Link to="/login" className="btn btn-primary text-white fw-semibold" aria-label="Login to NikuHR">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 72 }}>
        {/* HERO */}
        <section
          className="text-white"
          aria-labelledby="hero-heading"
          style={{
            background: "linear-gradient(135deg, #1e73be, #0d47a1)",
          }}
        >
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-7 text-center text-lg-start">
                <h1 id="hero-heading" className="fw-bold display-5 mb-3">
                  Build a modern HR experience for your team
                </h1>
                <p className="lead opacity-85 mb-4">
                  Accelerate employee onboarding, attendance, payroll, and performance with one secure platform.
                </p>

                <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-lg-start gap-2 mb-4">
                  <Link to="/login" className="btn btn-light btn-lg px-5 fw-semibold" aria-label="Get started with NikuHR">
                    Get Started
                  </Link>
                  <a href="#features" className="btn btn-outline-light btn-lg px-4" aria-label="View NikuHR features">
                    View Features
                  </a>
                </div>

                <div className="d-flex flex-column flex-sm-row flex-wrap align-items-center justify-content-center justify-content-lg-start gap-2">
                  {['Automation', 'Compliance', 'Real-time Insights'].map((label) => (
                    <span key={label} className="badge bg-white text-primary py-2 px-3 rounded-pill shadow-sm">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-lg-5 mt-4 mt-lg-0">
                <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-4 p-4 text-center shadow-lg">
                  <h2 className="h5 fw-bold text-white mb-3">Trusted by HR teams worldwide</h2>
                  <p className="small opacity-85 mb-4">
                    A unified HR suite for fast-growing teams, with strong security and simple workflows.
                  </p>
                  <div className="row g-3">
                    {[
                      { value: '99.9%', label: 'Platform uptime' },
                      { value: '70%', label: 'Less manual work' },
                      { value: '50%', label: 'Faster hiring process' },
                    ].map((item) => (
                      <div key={item.label} className="col-4">
                        <div className="p-3 bg-white bg-opacity-10 rounded-3">
                          <strong className="d-block fs-5 text-white">{item.value}</strong>
                          <span className="small text-white-50">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* VALUE PROPOSITION */}
<section className="py-5 bg-white">
  <div className="container text-center">
    <h2 className="fw-bold mb-3">
      Built for Growing Companies
    </h2>
    <p className="text-muted mb-5">
      NikuHR is designed to eliminate manual HR operations and bring automation,
      accuracy, and visibility to your workforce management.
    </p>

    <div className="row g-4">
      {[
        {
          title: "Reduce HR Workload",
          desc: "Automate payroll, attendance, and documentation to save up to 70% administrative time."
        },
        {
          title: "Increase Accuracy",
          desc: "Eliminate manual errors in salary processing and compliance reporting."
        },
        {
          title: "Improve Employee Experience",
          desc: "Self-service access for payslips, leave requests, and performance tracking."
        }
      ].map((item, index) => (
        <div className="col-md-4" key={index}>
          <div className="p-4 border rounded shadow-sm h-100">
            <h6 className="fw-bold text-primary">{item.title}</h6>
            <p className="small text-muted mb-0">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
{/* BUSINESS IMPACT */}
<section className="py-5 bg-light">
  <div className="container text-center">
    <h2 className="fw-bold mb-5">Driving Measurable Results</h2>

    <div className="row g-4">
      {[
        { number: "70%", label: "Reduction in Manual Work" },
        { number: "99.9%", label: "Payroll Accuracy" },
        { number: "50%", label: "Faster Hiring Process" },
        { number: "500+", label: "Growing Organizations" }
      ].map((item, index) => (
        <div className="col-md-3" key={index}>
          <div className="p-4 bg-white shadow-sm rounded h-100">
            <h3 className="fw-bold text-primary">{item.number}</h3>
            <p className="small text-muted mb-0">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
{/* SECURITY */}
<section className="py-5 bg-white">
  <div className="container">
    <div className="row align-items-center">
      <div className="col-lg-6">
        <h2 className="fw-bold text-primary mb-3">
          Enterprise-Grade Security
        </h2>
        <p className="text-muted">
          We prioritize data security and compliance. NikuHR is built with
          modern encryption standards, secure authentication, and role-based access control.
        </p>
        <ul className="list-unstyled mt-3">
          <li>✔ Role-Based Access Control</li>
          <li>✔ Secure Cloud Infrastructure</li>
          <li>✔ Data Encryption</li>
          <li>✔ Compliance-Ready Payroll</li>
        </ul>
      </div>
      <div className="col-lg-6">
        <div className="p-4 bg-light rounded shadow-sm text-center">
          <h5 className="fw-bold">Your Data, Fully Protected</h5>
          <p className="small text-muted mb-0">
            Enterprise security standards ensure complete protection of employee records and payroll information.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ABOUT / HRM PROJECT DESCRIPTION */}
<section className="py-5 bg-white">
  <div className="container">
    <div className="row align-items-center">
      <div className="col-lg-6">
        <h2 className="fw-bold mb-3 text-primary">
          About NikuHR – Complete HRM Solution
        </h2>
        <p className="text-muted">
          NikuHR is a modern Human Resource Management (HRM) system designed
          to simplify and automate HR operations for growing organizations.
          It integrates employee management, payroll, attendance tracking,
          recruitment, and performance management into one unified platform.
        </p>
        <p className="text-muted">
          Our mission is to eliminate manual HR processes and empower businesses
          with real-time insights, automation, and seamless workforce management.
        </p>
        <ul className="list-unstyled mt-3">
          <li>✔ Centralized Employee Database</li>
          <li>✔ Automated Payroll & Compliance</li>
          <li>✔ Smart Attendance & Leave Tracking</li>
          <li>✔ End-to-End Recruitment Workflow</li>
        </ul>
      </div>
      <div className="col-lg-6 text-center">
        <div className="p-4 bg-light rounded shadow-sm">
          <h5 className="fw-bold text-secondary">Project Vision</h5>
          <p className="small text-muted mb-0">
            To deliver a scalable, secure, and intelligent HR ecosystem
            that enhances productivity and employee experience.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
{/* WHY CHOOSE US */}
<section className="py-5 bg-light">
  <div className="container text-center">
    <h2 className="fw-bold mb-5">Why Choose NikuHR?</h2>

    <div className="row g-4">
      {[
        { title: "User Friendly", desc: "Simple and intuitive interface for HR teams." },
        { title: "Secure & Reliable", desc: "Enterprise-level data security and privacy." },
        { title: "Scalable", desc: "Supports startups to large enterprises." },
        { title: "Automation Ready", desc: "Reduces manual HR workload by 70%." }
      ].map((item, index) => (
        <div className="col-md-6 col-lg-3" key={index}>
          <div className="p-4 bg-white shadow-sm rounded h-100">
            <h6 className="fw-bold text-primary">{item.title}</h6>
            <p className="small text-muted mb-0">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
{/* HOW IT WORKS */}
<section className="py-5 bg-white">
  <div className="container text-center">
    <h2 className="fw-bold mb-5">How NikuHR Works</h2>

    <div className="row g-4">
      {[
        { step: "1", title: "Setup Organization", desc: "Add departments, roles & policies." },
        { step: "2", title: "Add Employees", desc: "Manage employee profiles & documents." },
        { step: "3", title: "Track & Manage", desc: "Monitor attendance, payroll & performance." },
        { step: "4", title: "Analyze & Improve", desc: "Use reports to drive business decisions." }
      ].map((item, index) => (
        <div className="col-md-3" key={index}>
          <div className="p-4 border rounded h-100">
            <h3 className="text-primary fw-bold">{item.step}</h3>
            <h6 className="fw-semibold">{item.title}</h6>
            <p className="small text-muted mb-0">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
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
        
        {/* FOOTER */}
        <footer className="text-white py-4 text-center" style={{ backgroundColor: "#0647a7" }}>
          <p className="fw-semibold mb-1">NikuHR © 2026 All Rights Reserved</p>
          <small className="text-white">
            HR • Payroll • Attendance • Recruitment
          </small>
        </footer>
      </main>
    </>
  );
};

export default Home;
