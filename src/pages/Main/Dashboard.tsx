import React from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

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

        <h2>📊 Organization Admin Dashboard</h2>

        {/* KPI */}
        <div className="dashboard-grid">
          <Card title="Total Employees" value={stats.totalEmployees} />
          <Card title="Active Employees" value={stats.activeEmployees} />
          <Card title="New Joiners" value={stats.newJoiners} />
          <Card title="Pending Leaves" value={stats.pendingLeaves} />
        </div>

        {/* ROW 1 */}
        <div className="dashboard-row">

          <Section title="Hiring vs Attrition">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyReport}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Bar dataKey="joined" fill="#3B82F6" />
                <Bar dataKey="left" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Today's Attendance">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={attendanceToday} dataKey="value" innerRadius={50} outerRadius={80}>
                  {attendanceToday.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Section>

        </div>

        {/* ROW 2 */}
        <div className="dashboard-row">

          <Section title="Attendance Trend (%)">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyReport}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Employee Growth">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyReport}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#6366F1" fill="#C7D2FE" />
              </AreaChart>
            </ResponsiveContainer>
          </Section>

        </div>

        {/* ROW 3 */}
        <div className="dashboard-row">

          <Section title="Department Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={departmentData} dataKey="value" outerRadius={90}>
                  {departmentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Productivity Insight">
            <div className="section-text">
              <p>📈 Hiring is consistently higher than attrition — workforce is growing.</p>
              <p>⚠ Attendance dropped in Mar → needs attention.</p>
              <p>🚀 Strong growth trend from Apr–Jun.</p>
              <p>💡 Engineering dominates workforce (largest team).</p>
            </div>
          </Section>

        </div>

      </div>
    </div>
  );
};

/* COMPONENTS */

const Card = ({ title, value }: any) => (
  <div className="dashboard-card">
    <div className="card-title">{title}</div>
    <div className="card-value">{value}</div>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="dashboard-section">
    <h3>{title}</h3>
    {children}
  </div>
);

export default Dashboard;