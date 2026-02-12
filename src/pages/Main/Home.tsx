import React from "react";
import { Link } from "react-router-dom";
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
        {/* VALUE PROPOSITION */}
<section className="py-5 bg-white">
  <div className="container text-center">
    <h2 className="fw-bold mb-3">
      Built for Growing Companies
    </h2>
    <p className="text-muted mb-5">
      NotifyHR is designed to eliminate manual HR operations and bring automation,
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
          We prioritize data security and compliance. NotifyHR is built with
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
          About NotifyHR – Complete HRM Solution
        </h2>
        <p className="text-muted">
          NotifyHR is a modern Human Resource Management (HRM) system designed
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
    <h2 className="fw-bold mb-5">Why Choose NotifyHR?</h2>

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
    <h2 className="fw-bold mb-5">How NotifyHR Works</h2>

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
        {/* TESTIMONIAL */}
{/* TESTIMONIALS */}
<section className="py-5 bg-light">
  <div className="container">
    <h2 className="fw-bold text-center mb-5">What Our Clients Say</h2>

    <div
      id="testimonialCarousel"
      className="carousel slide"
      data-bs-ride="carousel"
    >
      {/* Indicators */}
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target="#testimonialCarousel"
          data-bs-slide-to="0"
          className="active"
        ></button>
        <button
          type="button"
          data-bs-target="#testimonialCarousel"
          data-bs-slide-to="1"
        ></button>
        <button
          type="button"
          data-bs-target="#testimonialCarousel"
          data-bs-slide-to="2"
        ></button>
      </div>

      {/* Slides */}
      <div className="carousel-inner">

        <div className="carousel-item active">
          <div className="col-lg-8 mx-auto">
            <div className="p-5 bg-white shadow rounded text-center">
              <p className="fst-italic text-muted mb-4">
                "NotifyHR transformed our HR operations. Payroll processing time
                reduced by 60% and attendance management became completely seamless."
              </p>
              <h6 className="fw-bold mb-0 text-primary">Anita Sharma</h6>
              <small className="text-muted">HR Director, Tech Solutions Pvt Ltd</small>
            </div>
          </div>
        </div>

        <div className="carousel-item">
          <div className="col-lg-8 mx-auto">
            <div className="p-5 bg-white shadow rounded text-center">
              <p className="fst-italic text-muted mb-4">
                "The automation features saved our HR team countless hours every month.
                The system is simple, secure, and powerful."
              </p>
              <h6 className="fw-bold mb-0 text-primary">Rahul Mehta</h6>
              <small className="text-muted">Operations Head, Nexa Manufacturing</small>
            </div>
          </div>
        </div>

        <div className="carousel-item">
          <div className="col-lg-8 mx-auto">
            <div className="p-5 bg-white shadow rounded text-center">
              <p className="fst-italic text-muted mb-4">
                "From recruitment to payroll, everything is centralized.
                NotifyHR helped us scale our startup efficiently."
              </p>
              <h6 className="fw-bold mb-0 text-primary">Priya Verma</h6>
              <small className="text-muted">Founder, BrightTech Startup</small>
            </div>
          </div>
        </div>

      </div>

      {/* Controls */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#testimonialCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon bg-primary rounded-circle p-3"></span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#testimonialCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon bg-primary rounded-circle p-3"></span>
      </button>
    </div>
  </div>
</section>


{/* FINAL CTA */}
<section
  className="py-5 text-white text-center"
  style={{
    background: "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))"
  }}
>
  <div className="container">
    <h2 className="fw-bold mb-3">
      Ready to Transform Your HR Operations?
    </h2>
    <p className="opacity-75 mb-4">
      Join hundreds of companies already using NotifyHR to simplify workforce management.
    </p>
    <Link to="/RequestDemo" className="btn btn-light btn-lg px-5 fw-semibold">
      Request Free Demo
    </Link>
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
