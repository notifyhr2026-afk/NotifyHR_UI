import React from "react";

const HeroDashboardMockup: React.FC = () => (
  <div className="hero-mockup" aria-hidden="true">
    <div className="hero-mockup-glow" />
    <div className="hero-mockup-window">
      <div className="hero-mockup-toolbar">
        <span className="hero-mockup-dot" />
        <span className="hero-mockup-dot" />
        <span className="hero-mockup-dot" />
        <span className="hero-mockup-toolbar-title">NikuHR Dashboard</span>
      </div>
      <div className="hero-mockup-body">
        <aside className="hero-mockup-sidebar">
          {["Overview", "People", "Payroll", "Reports"].map((item, i) => (
            <div key={item} className={`hero-mockup-nav-item${i === 0 ? " active" : ""}`}>
              <span className="hero-mockup-nav-icon" />
              {item}
            </div>
          ))}
        </aside>
        <div className="hero-mockup-main">
          <div className="hero-mockup-stats">
            {[
              { label: "Headcount", value: "248" },
              { label: "On leave", value: "12" },
              { label: "Open roles", value: "8" },
            ].map((s) => (
              <div key={s.label} className="hero-mockup-stat">
                <span className="hero-mockup-stat-label">{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
          <div className="hero-mockup-chart">
            <div className="hero-mockup-chart-header">
              <span>Attendance trend</span>
              <span className="hero-mockup-badge">+12%</span>
            </div>
            <div className="hero-mockup-bars">
              {[42, 58, 45, 72, 65, 80, 74].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="hero-mockup-table">
            {[
              { name: "Sarah Chen", dept: "Engineering", status: "Active" },
              { name: "James Okoro", dept: "Finance", status: "On leave" },
            ].map((row) => (
              <div key={row.name} className="hero-mockup-row">
                <span className="hero-mockup-avatar" />
                <span>{row.name}</span>
                <span className="text-muted">{row.dept}</span>
                <span className={`hero-mockup-status${row.status === "Active" ? " ok" : ""}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="hero-mockup-float hero-mockup-float-1">
      <i className="bi bi-shield-check" />
      <span>SOC 2 Ready</span>
    </div>
    <div className="hero-mockup-float hero-mockup-float-2">
      <i className="bi bi-graph-up-arrow" />
      <span>99.9% uptime</span>
    </div>
  </div>
);

export default HeroDashboardMockup;
