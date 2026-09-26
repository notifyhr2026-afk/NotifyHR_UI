import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import "../../css/Dashboard.css";

const Dashboard: React.FC = () => {

  const stats = {
    totalEmployees: 245,
    activeEmployees: 220,
    newJoiners: 12,
    presentToday: 198,
    absentToday: 47,
    pendingLeaves: 8,
  };

  const monthlyReport = [
    { month: "Jan", joined: 15, left: 3, attendance: 92, total: 180 },
    { month: "Feb", joined: 22, left: 5, attendance: 89, total: 197 },
    { month: "Mar", joined: 18, left: 7, attendance: 87, total: 208 },
    { month: "Apr", joined: 25, left: 4, attendance: 90, total: 229 },
    { month: "May", joined: 20, left: 6, attendance: 88, total: 243 },
    { month: "Jun", joined: 28, left: 8, attendance: 91, total: 245 },
  ];

  const attendanceToday = [
    { name: "Present", value: stats.presentToday },
    { name: "Absent", value: stats.absentToday },
  ];

  const departmentData = [
    { name: "Engineering", value: 120 },
    { name: "HR", value: 25 },
    { name: "Sales", value: 60 },
    { name: "Support", value: 40 },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h2>
              <i className="bi bi-speedometer2 text-primary" aria-hidden="true" />
              Organization Overview
            </h2>
            <p className="dashboard-subtitle">
              Live workforce metrics, daily attendance, and talent pipeline insights
            </p>
          </div>
          <div className="dashboard-header-actions">
            <Link
              to="/ViewOrgTree"
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
              style={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.82rem", padding: "6px 14px" }}
            >
              <i className="bi bi-diagram-3" /> Corporate Org Chart
            </Link>
            <span className="dashboard-badge-pill">
              <span className="dashboard-badge-dot" aria-hidden="true" />
              System Active
            </span>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="dashboard-grid">
          <Card
            title="Total Employees"
            value={stats.totalEmployees}
            icon="bi-people"
            color="blue"
            trend="+5.2%"
            trendUp={true}
          />
          <Card
            title="Active Employees"
            value={stats.activeEmployees}
            icon="bi-person-check"
            color="green"
            trend="+3.1%"
            trendUp={true}
          />
          <Card
            title="New Joiners"
            value={stats.newJoiners}
            icon="bi-person-plus"
            color="indigo"
            trend="This month"
            trendUp={true}
          />
          <Card
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon="bi-calendar-event"
            color="amber"
            trend="Needs review"
            trendUp={false}
          />
        </div>

        {/* ROW 1 */}
        <div className="dashboard-row">
          <Section title="Hiring vs Attrition" tag="Monthly">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyReport} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" opacity={0.3} />
                  <XAxis dataKey="month" className="chart-axis" tick={{ fontSize: 12 }} />
                  <YAxis className="chart-axis" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="joined" name="Joined" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="left" name="Resigned" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Today's Attendance" tag="Realtime">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={attendanceToday}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {attendanceToday.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#10B981" : "#EF4444"} />
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
          <Section title="Attendance Trend (%)" tag="Jan - Jun">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyReport} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" opacity={0.3} />
                  <XAxis dataKey="month" className="chart-axis" tick={{ fontSize: 12 }} />
                  <YAxis domain={[75, 100]} className="chart-axis" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10B981" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Total Headcount Growth" tag="Cumulative">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyReport} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" opacity={0.3} />
                  <XAxis dataKey="month" className="chart-axis" tick={{ fontSize: 12 }} />
                  <YAxis domain={[150, 260]} className="chart-axis" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* ROW 3 */}
        <div className="dashboard-row">
          <Section title="Department Distribution" tag="Headcount">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    outerRadius={95}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {departmentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Workforce Health & Productivity" tag="Insights">
            <ul className="insight-list">
              <li className="insight-item">
                <span className="insight-item-icon text-success">
                  <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                </span>
                <div>
                  <strong>Net Workforce Growth:</strong> Monthly hiring continuously exceeds attrition rates (+65 net talent addition).
                </div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-warning">
                  <i className="bi bi-exclamation-triangle" aria-hidden="true" />
                </span>
                <div>
                  <strong>March Attendance Dip:</strong> Seasonal dip to 87% noted in March; recovered smoothly to 91% in June.
                </div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-primary">
                  <i className="bi bi-rocket-takeoff" aria-hidden="true" />
                </span>
                <div>
                  <strong>H2 Scaling Projection:</strong> Trajectory suggests reaching 280 team members by Q4 with current momentum.
                </div>
              </li>
              <li className="insight-item">
                <span className="insight-item-icon text-info">
                  <i className="bi bi-pie-chart" aria-hidden="true" />
                </span>
                <div>
                  <strong>Team Allocation:</strong> Engineering represents 49% of total workforce, followed by Sales (24%).
                </div>
              </li>
            </ul>
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

export default Dashboard;