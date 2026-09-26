import React from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from "recharts";
import "../../css/Dashboard.css";

const EmployeeDashboard: React.FC = () => {

  const stats = {
    attendance: 92,
    leavesTaken: 6,
    pendingLeaves: 2,
    tasksCompleted: 18,
    performanceScore: 82,
  };

  const attendanceTrend = [
    { month: "Jan", value: 90 },
    { month: "Feb", value: 88 },
    { month: "Mar", value: 85 },
    { month: "Apr", value: 91 },
    { month: "May", value: 89 },
    { month: "Jun", value: 92 },
  ];

  const monthlyLeaves = [
    { month: "Jan", leaves: 1 },
    { month: "Feb", leaves: 0 },
    { month: "Mar", leaves: 2 },
    { month: "Apr", leaves: 1 },
    { month: "May", leaves: 1 },
    { month: "Jun", leaves: 1 },
  ];

  const tasksData = [
    { name: "Completed", value: 18 },
    { name: "Pending", value: 6 },
  ];

  const workHours = [
    { day: "Mon", hours: 8 },
    { day: "Tue", hours: 9 },
    { day: "Wed", hours: 7 },
    { day: "Thu", hours: 8 },
    { day: "Fri", hours: 6 },
  ];

  const performanceData = [
    { name: "Score", value: stats.performanceScore, fill: "#6366F1" }
  ];

  const COLORS = ["#10B981", "#EF4444"];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h2>
              <i className="bi bi-person-badge text-primary" aria-hidden="true" />
              Employee Workspace
            </h2>
            <p className="dashboard-subtitle">
              Your personal attendance stats, assignments, and performance overview
            </p>
          </div>
          <div className="dashboard-header-actions">
            <span className="dashboard-badge-pill">
              <span className="dashboard-badge-dot" aria-hidden="true" />
              On Duty
            </span>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="dashboard-grid">
          <Card
            title="Attendance"
            value={`${stats.attendance}%`}
            icon="bi-check2-circle"
            color="green"
            trend="+2.4%"
            trendUp={true}
          />
          <Card
            title="Leaves Taken"
            value={stats.leavesTaken}
            icon="bi-calendar-check"
            color="blue"
            trend="YTD Total"
            trendUp={true}
          />
          <Card
            title="Pending Requests"
            value={stats.pendingLeaves}
            icon="bi-hourglass-split"
            color="amber"
            trend="Awaiting review"
            trendUp={false}
          />
          <Card
            title="Tasks Completed"
            value={stats.tasksCompleted}
            icon="bi-clipboard2-check"
            color="indigo"
            trend="18 / 24 total"
            trendUp={true}
          />
        </div>

        {/* ROW 1 */}
        <div className="dashboard-row">
          <Section title="Attendance Trend" tag="Monthly %">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" opacity={0.3} />
                  <XAxis dataKey="month" className="chart-axis" tick={{ fontSize: 12 }} />
                  <YAxis domain={[80, 100]} className="chart-axis" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3B82F6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Task Status" tag="Active Sprint">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={tasksData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {tasksData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* ROW 2 */}
        <div className="dashboard-row">
          <Section title="Work Hours This Week" tag="Daily Log">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={workHours} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" opacity={0.3} />
                  <XAxis dataKey="day" className="chart-axis" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 12]} className="chart-axis" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Performance Score" tag="Monthly Rating">
            <div className="chart-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={220}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={performanceData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" background cornerRadius={8} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: "-40px", fontSize: "1.75rem", fontWeight: "800", color: "var(--dl-text, #0f172a)" }}>
                {stats.performanceScore}%
              </div>
            </div>
          </Section>
        </div>

        {/* ROW 3 */}
        <div className="dashboard-row">
          <Section title="Leave Summary & Balance" tag="Days">
            <ul className="insight-list">
              <li className="insight-item">
                <span className="insight-item-icon text-success">
                  <i className="bi bi-check-circle" aria-hidden="true" />
                </span>
                <div><strong>Approved Taken:</strong> {stats.leavesTaken} days logged this fiscal year.</div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-warning">
                  <i className="bi bi-hourglass" aria-hidden="true" />
                </span>
                <div><strong>Pending Approval:</strong> {stats.pendingLeaves} days awaiting manager confirmation.</div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-primary">
                  <i className="bi bi-calendar3" aria-hidden="true" />
                </span>
                <div><strong>Available Remaining:</strong> 10 days available to schedule.</div>
              </li>
            </ul>
          </Section>

          <Section title="Smart Productivity Insights" tag="Tips">
            <ul className="insight-list">
              <li className="insight-item">
                <span className="insight-item-icon text-success">
                  <i className="bi bi-trophy" aria-hidden="true" />
                </span>
                <div><strong>Top Quartile Attendance:</strong> Your 92% punctuality ranks among the top in your department.</div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-primary">
                  <i className="bi bi-lightning-charge" aria-hidden="true" />
                </span>
                <div><strong>Sprint Velocity:</strong> 75% of your target tasks for this cycle are already concluded.</div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-info">
                  <i className="bi bi-clock-history" aria-hidden="true" />
                </span>
                <div><strong>Consistent Logins:</strong> Average 7.6 logged hours per workday this week.</div>
              </li>
            </ul>
          </Section>
        </div>

        {/* ROW 4 */}
        <div className="dashboard-row">
          <Section title="Monthly Leave History" tag="Annual Record">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyLeaves} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" opacity={0.3} />
                  <XAxis dataKey="month" className="chart-axis" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 4]} className="chart-axis" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="leaves" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

      </div>
    </div>
  );
};

/* HELPER COMPONENTS */

interface CardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "indigo" | "amber";
  trend?: string;
  trendUp?: boolean;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color, trend, trendUp }) => (
  <div className="dashboard-card">
    <div className="card-top">
      <h4 className="card-title">{title}</h4>
      <div className={`card-icon-wrap ${color}`}>
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
    </div>
    <div className="card-bottom">
      <span className="card-value">{value}</span>
      {trend && (
        <span className={`card-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? <i className="bi bi-arrow-up-short" aria-hidden="true" /> : null}
          {trend}
        </span>
      )}
    </div>
  </div>
);

interface SectionProps {
  title: string;
  tag?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, tag, children }) => (
  <div className="dashboard-section">
    <div className="section-header">
      <h3>{title}</h3>
      {tag && <span className="section-header-tag">{tag}</span>}
    </div>
    {children}
  </div>
);

export default EmployeeDashboard;