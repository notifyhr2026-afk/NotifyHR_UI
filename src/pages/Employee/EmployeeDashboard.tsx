import React from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from "recharts";

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

        <h2>👤 Employee Dashboard</h2>

        {/* KPI CARDS */}
        <div className="dashboard-grid">
          <Card title="Attendance %" value={`${stats.attendance}%`} />
          <Card title="Leaves Taken" value={stats.leavesTaken} />
          <Card title="Pending Leaves" value={stats.pendingLeaves} />
          <Card title="Tasks Completed" value={stats.tasksCompleted} />
        </div>

        {/* ROW 1 */}
        <div className="dashboard-row">

          <Section title="Attendance Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Task Status">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={tasksData} dataKey="value" innerRadius={50} outerRadius={80}>
                  {tasksData.map((_, i) => (
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

          <Section title="Work Hours This Week">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workHours}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="day" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Bar dataKey="hours" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Performance Score">
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={performanceData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" background />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="score-text">
              {stats.performanceScore}%
            </div>
          </Section>

        </div>

        {/* ROW 3 */}
        <div className="dashboard-row">

          <Section title="Leave Summary">
            <div className="section-text">
              <p>✅ Leaves Taken: {stats.leavesTaken}</p>
              <p>⏳ Pending Approval: {stats.pendingLeaves}</p>
              <p>📅 Remaining Balance: 10 days</p>
            </div>
          </Section>

          <Section title="Smart Insights">
            <div className="section-text">
              <p>📈 Your attendance is above average.</p>
              <p>⚠ Mid-week productivity dips slightly.</p>
              <p>🎯 You are close to achieving monthly goals.</p>
              <p>💡 Try maintaining consistent work hours.</p>
            </div>
          </Section>

        </div>

        {/* ROW 4 */}
        <div className="dashboard-row">

          <Section title="Monthly Leaves">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyLeaves}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Bar dataKey="leaves" fill="#F59E0B" label />
              </BarChart>
            </ResponsiveContainer>
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

export default EmployeeDashboard;