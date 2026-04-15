import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* COLORS */
const BLUE = "#3B8BD4";
const PURPLE = "#534AB7";
const GREEN = "#1D9E75";
const RED = "#E24B4A";
const AMBER = "#EF9F27";
const GRAY = "#888780";

/* DATA */
const monthlyData = [
  { month: "Jan", newSubs: 22, churned: 3, renewals: 74, queries: 38, active: 96 },
  { month: "Feb", newSubs: 18, churned: 5, renewals: 73, queries: 45, active: 109 },
  { month: "Mar", newSubs: 25, churned: 4, renewals: 72, queries: 52, active: 130 },
  { month: "Apr", newSubs: 30, churned: 6, renewals: 74, queries: 61, active: 154 },
  { month: "May", newSubs: 28, churned: 4, renewals: 78, queries: 74, active: 178 },
  { month: "Jun", newSubs: 32, churned: 5, renewals: 80, queries: 57, active: 210 },
];

const growthData = [
  { month: "Jan", total: 118, active: 96, churnedCumul: 3 },
  { month: "Feb", total: 136, active: 109, churnedCumul: 8 },
  { month: "Mar", total: 161, active: 130, churnedCumul: 12 },
  { month: "Apr", total: 191, active: 154, churnedCumul: 18 },
  { month: "May", total: 219, active: 178, churnedCumul: 22 },
  { month: "Jun", total: 251, active: 210, churnedCumul: 27 },
];

const statusData = [
  { name: "Active", value: 142 },
  { name: "Churned", value: 42 },
];

const paymentData = [
  { name: "Paid", value: 138 },
  { name: "Pending", value: 4 },
];

const COLORS = [GREEN, RED, BLUE, AMBER];

/* COMPONENTS */

const Badge = ({ label }: any) => (
  <span className={`badge badge-${label.toLowerCase()}`}>{label}</span>
);

const MetricCard = ({ label, value, sub, accent }: any) => (
  <div className="sa-card">
    <span className="sa-label">{label}</span>
    <span className="sa-value" style={{ color: accent }}>{value}</span>
    {sub && <span className="sa-sub">{sub}</span>}
  </div>
);

const SectionCard = ({ title, children }: any) => (
  <div className="sa-section">
    <h3>{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="sa-tooltip">
      <strong>{label}</strong>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const Counter = ({ target }: any) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let c = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      c += step;
      if (c >= target) {
        setVal(target);
        clearInterval(t);
      } else setVal(c);
    }, 20);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}</>;
};

/* MAIN */

const SuperAdminDashboard: React.FC = () => {

  return (
    <div className="sa-page">
      <div className="sa-container">

        <div className="sa-header">
          <h1>Super Admin Dashboard</h1>
          <p>Subscription analytics & insights</p>
        </div>

        {/* METRICS */}
        <div className="sa-grid">
          <MetricCard label="Total Orgs" value={<Counter target={184} />} />
          <MetricCard label="Active Subs" value={<Counter target={142} />} accent={GREEN} />
          <MetricCard label="Churned" value={<Counter target={42} />} accent={RED} />
          <MetricCard label="Paid" value={<Counter target={138} />} accent={BLUE} />
        </div>

        {/* ROW 1 */}
        <div className="sa-row">

          <SectionCard title="Subscriptions vs Churn">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="newSubs" fill={BLUE} />
                <Bar dataKey="churned" fill={RED} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Queries Trend">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip content={<CustomTooltip />} />
                <Area dataKey="queries" stroke={GREEN} fill="#d1fae5" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

        </div>

        {/* ROW 2 */}
        <div className="sa-row">

          <SectionCard title="Growth Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid className="chart-grid" />
                <XAxis dataKey="month" className="chart-axis" />
                <YAxis className="chart-axis" />
                <Tooltip />
                <Line dataKey="total" stroke={PURPLE} />
                <Line dataKey="active" stroke={BLUE} />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Subscription Status">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>

        </div>

        {/* ROW 3 */}
        <div className="sa-row">

          <SectionCard title="Payment Status">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentData} dataKey="value">
                  {paymentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i + 2]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Insights">
            <p>📈 Strong subscription growth</p>
            <p>⚠ Monitor churn in April</p>
            <p>💰 High payment success rate</p>
          </SectionCard>

        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;