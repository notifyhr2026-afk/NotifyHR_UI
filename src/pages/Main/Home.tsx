import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import NikuHRLogo from "../../components/landing/NikuHRLogo";
import HeroDashboardMockup from "../../components/landing/HeroDashboardMockup";
import AnimatedCounter from "../../components/landing/AnimatedCounter";
import FeatureShowcase from "../../components/landing/FeatureShowcase";
import {
  features,
  featureGroupIcons,
  valueProps,
  businessMetrics,
  securityFeatures,
  howItWorks,
  navLinks,
  trustLogos,
} from "../../components/landing/landingData";
import "./Home.css";

const groupedFeatures = features.reduce<Record<string, typeof features>>((acc, f) => {
  acc[f.type] = acc[f.type] || [];
  acc[f.type].push(f);
  return acc;
}, {});

const footerLinks = {
  product: [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "How it works", href: "#how-it-works" },
  ],
  company: [
    { label: "About", href: "#platform" },
    { label: "Request Demo", to: "/RequestDemo" },
    { label: "Login", to: "/login" },
  ],
  contact: [
    { label: "support@nikuhr.com", href: "mailto:support@nikuhr.com" },
    { label: "+1 (800) 555-0199", href: "tel:+18005550199" },
  ],
};

const socialLinks = [
  { icon: "bi-linkedin", href: "https://linkedin.com", label: "LinkedIn" },
  { icon: "bi-twitter-x", href: "https://twitter.com", label: "X (Twitter)" },
  { icon: "bi-youtube", href: "https://youtube.com", label: "YouTube" },
];

const Home: React.FC = () => {
  useEffect(() => {
    const navbar = document.querySelector(".landing-navbar");
    const onScroll = () => navbar?.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className="navbar navbar-expand-lg landing-navbar fixed-top" aria-label="Primary navigation">
        <div className="container">
          <Link to="/" className="navbar-brand" aria-label="NikuHR home">
            <NikuHRLogo />
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#landingNav"
            aria-controls="landingNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="landingNav">
            <ul className="navbar-nav mx-lg-auto mb-3 mb-lg-0 gap-lg-1">
              {navLinks.map((link) => (
                <li className="nav-item" key={link.href}>
                  <a className="nav-link" href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
            <div className="d-flex flex-column flex-sm-row gap-2 landing-nav-actions">
              <Link to="/RequestDemo" className="btn btn-lp-outline" aria-label="Request a demo">
                Request Demo
              </Link>
              <Link to="/login" className="btn btn-lp-primary text-white" aria-label="Login to NikuHR">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        {/* HERO */}
        <section className="landing-hero" aria-labelledby="hero-heading">
          <div className="landing-hero-bg" aria-hidden="true" />
          <div className="container position-relative">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 text-center text-lg-start">
                <span className="landing-eyebrow">
                  <span className="landing-eyebrow-dot" aria-hidden="true" />
                  Enterprise HRMS Platform
                </span>
                <h1 id="hero-heading">
                  The modern HR platform{" "}
                  <span className="text-gradient">built for scale</span>
                </h1>
                <p className="landing-hero-lead">
                  Unify onboarding, attendance, payroll, and performance in one secure system —
                  designed for HR teams that need speed, accuracy, and trust.
                </p>

                <div className="landing-hero-actions">
                  <Link to="/login" className="btn btn-lp-primary btn-lg" aria-label="Get started with NikuHR">
                    Get Started
                    <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
                  </Link>
                  <Link to="/RequestDemo" className="btn btn-lp-outline btn-lg" aria-label="Request a demo">
                    Book a Demo
                  </Link>
                </div>

                <div className="landing-trust-row">
                  {trustLogos.map((label) => (
                    <span key={label} className="landing-trust-chip">
                      <i className="bi bi-check2" aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-lg-6">
                <HeroDashboardMockup />
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM / VALUE */}
        <section className="landing-section" id="platform">
          <div className="container">
            <header className="landing-section-header">
              <span className="landing-kicker">Platform</span>
              <h2 className="landing-section-title">Everything your HR team needs</h2>
              <p className="landing-section-desc mx-auto">
                Replace fragmented tools with a single source of truth for workforce operations,
                compliance, and employee experience.
              </p>
            </header>

            <div className="row g-4">
              {valueProps.map((item) => (
                <div className="col-md-6 col-xl-3" key={item.title}>
                  <article className="lp-card lp-card-elevated h-100">
                    <span className="lp-icon" aria-hidden="true">
                      <i className={`bi ${item.icon}`} />
                    </span>
                    <h3 className="h6">{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="landing-stats-band" aria-labelledby="stats-heading">
          <div className="container">
            <header className="landing-section-header landing-section-header-light mb-4 mb-lg-5">
              <span className="landing-kicker landing-kicker-light">Impact</span>
              <h2 id="stats-heading" className="landing-section-title text-white">
                Measurable outcomes from day one
              </h2>
            </header>
            <div className="row g-4">
              {businessMetrics.map((item) => (
                <div className="col-6 col-lg-3" key={item.label}>
                  <div className="lp-stat-block">
                    <div className="lp-stat-value">
                      <AnimatedCounter value={item.number} />
                    </div>
                    <p className="lp-stat-label">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="landing-section landing-section-alt" id="how-it-works">
          <div className="container">
            <header className="landing-section-header">
              <span className="landing-kicker">Process</span>
              <h2 className="landing-section-title">Go live in four simple steps</h2>
            </header>
            <div className="row g-4 lp-steps">
              {howItWorks.map((item) => (
                <div className="col-md-6 col-lg-3" key={item.step}>
                  <article className="lp-step-card h-100">
                    <span className="lp-step-num">{item.step}</span>
                    <h3 className="h6">{item.title}</h3>
                    <p>{item.desc}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="landing-section" id="security">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-5">
                <span className="landing-kicker">Security</span>
                <h2 className="landing-section-title">
                  Enterprise-grade protection for sensitive HR data
                </h2>
                <p className="landing-section-desc">
                  NikuHR is architected for organizations that cannot compromise on privacy,
                  access control, or regulatory compliance.
                </p>
                <Link to="/RequestDemo" className="btn btn-lp-primary mt-3">
                  Talk to our team
                  <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
                </Link>
              </div>
              <div className="col-lg-7">
                <div className="row g-3">
                  {securityFeatures.map((item) => (
                    <div className="col-sm-6" key={item.title}>
                      <article className="lp-security-card h-100">
                        <span className="lp-icon lp-icon-sm" aria-hidden="true">
                          <i className={`bi ${item.icon}`} />
                        </span>
                        <h3 className="h6">{item.title}</h3>
                        <p>{item.desc}</p>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="landing-section landing-section-alt" id="features">
          <div className="container">
            <header className="landing-section-header">
              <span className="landing-kicker">Capabilities</span>
              <h2 className="landing-section-title">Complete feature suite</h2>
              <p className="landing-section-desc mx-auto">
                Explore modules across HR, attendance, payroll, and recruitment —
                all connected in one platform.
              </p>
            </header>
            <FeatureShowcase grouped={groupedFeatures} icons={featureGroupIcons} />
          </div>
        </section>

        {/* CTA */}
        <section className="landing-cta" aria-labelledby="cta-heading">
          <div className="landing-cta-bg" aria-hidden="true" />
          <div className="container position-relative">
            <div className="landing-cta-inner">
              <span className="landing-kicker landing-kicker-light">Get started</span>
              <h2 id="cta-heading">Transform HR operations with confidence</h2>
              <p>
                Join 500+ organizations using NikuHR to automate payroll, streamline attendance,
                and deliver a world-class employee experience.
              </p>
              <div className="landing-cta-actions">
                <Link to="/login" className="btn btn-light btn-lg fw-semibold" aria-label="Get started with NikuHR">
                  Start Free Trial
                </Link>
                <Link to="/RequestDemo" className="btn btn-outline-light btn-lg" aria-label="Request a demo">
                  Schedule Demo
                </Link>
              </div>
              <p className="landing-cta-note">
                <i className="bi bi-shield-check me-1" aria-hidden="true" />
                No credit card required · Enterprise onboarding available
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer">
          <div className="container">
            <div className="row g-4 g-lg-5">
              <div className="col-lg-4">
                <NikuHRLogo variant="light" className="mb-3" />
                <p className="landing-footer-desc">
                  Modern HRMS for growing enterprises. Payroll, attendance, recruitment,
                  and people operations — unified.
                </p>
                <div className="landing-social">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                    >
                      <i className={`bi ${s.icon}`} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="col-6 col-md-4 col-lg-2">
                <h3 className="landing-footer-heading">Product</h3>
                <ul className="landing-footer-links">
                  {footerLinks.product.map((l) => (
                    <li key={l.label}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-6 col-md-4 col-lg-2">
                <h3 className="landing-footer-heading">Company</h3>
                <ul className="landing-footer-links">
                  {footerLinks.company.map((l) =>
                    "to" in l ? (
                      <li key={l.label}>
                        <Link to={l.to!}>{l.label}</Link>
                      </li>
                    ) : (
                      <li key={l.label}>
                        <a href={l.href}>{l.label}</a>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="col-md-4 col-lg-4">
                <h3 className="landing-footer-heading">Contact</h3>
                <ul className="landing-footer-links">
                  {footerLinks.contact.map((l) => (
                    <li key={l.label}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <hr className="landing-footer-divider" />
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              <p className="landing-footer-copy mb-0">© 2026 NikuHR. All rights reserved.</p>
              <div className="d-flex gap-3">
                <a href="#platform" className="landing-footer-legal">Privacy</a>
                <a href="#platform" className="landing-footer-legal">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
