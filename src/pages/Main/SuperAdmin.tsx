import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* ─────────────── TYPES ─────────────── */

interface MonthlyRow {
  month: string;
  newSubs: number;
  churned: number;
  renewals: number;
  queries: number;
  active: number;
}

interface GrowthRow {
  month: string;
  total: number;
  active: number;
  churnedCumul: number;
}

interface PieRow {
  name: string;
  value: number;
}

interface OrgRow {
  name: string;
  plan: string;
  status: string;
  payment: string;
  queries: number;
  joined: string;
}

interface BadgeStyleMap {
  bg: string;
  color: string;
}

/* ─────────────── DATA ─────────────── */

const monthlyData: MonthlyRow[] = [
  { month: "Jan", newSubs: 22, churned: 3, renewals: 74, queries: 38, active: 96 },
  { month: "Feb", newSubs: 18, churned: 5, renewals: 73, queries: 45, active: 109 },
  { month: "Mar", newSubs: 25, churned: 4, renewals: 72, queries: 52, active: 130 },
  { month: "Apr", newSubs: 30, churned: 6, renewals: 74, queries: 61, active: 154 },
  { month: "May", newSubs: 28, churned: 4, renewals: 78, queries: 74, active: 178 },
  { month: "Jun", newSubs: 32, churned: 5, renewals: 80, queries: 57, active: 210 },
];

const growthData: GrowthRow[] = [
  { month: "Jan", total: 118, active: 96,  churnedCumul: 3 },
  { month: "Feb", total: 136, active: 109, churnedCumul: 8 },
  { month: "Mar", total: 161, active: 130, churnedCumul: 12 },
  { month: "Apr", total: 191, active: 154, churnedCumul: 18 },
  { month: "May", total: 219, active: 178, churnedCumul: 22 },
  { month: "Jun", total: 251, active: 210, churnedCumul: 27 },
];

const statusData: PieRow[] = [
  { name: "Active",  value: 142 },
  { name: "Churned", value: 42 },
];

const paymentData: PieRow[] = [
  { name: "Paid",    value: 138 },
  { name: "Pending", value: 4 },
];

const queryCategories: PieRow[] = [
  { name: "Technical",    value: 131 },
  { name: "Billing",      value: 115 },
  { name: "Feature req.", value: 49 },
  { name: "Other",        value: 32 },
];

const orgs: OrgRow[] = [
  { name: "TechNova Pvt Ltd",  plan: "Enterprise", status: "Active",  payment: "Paid",    queries: 42, joined: "Jan 2024" },
  { name: "GreenBridge Corp",  plan: "Pro",        status: "Active",  payment: "Pending", queries: 18, joined: "Mar 2024" },
  { name: "HealthFirst Ltd",   plan: "Starter",    status: "Churned", payment: "Lapsed",  queries: 5,  joined: "Feb 2024" },
  { name: "Skyline Analytics", plan: "Pro",        status: "Active",  payment: "Paid",    queries: 31, joined: "Apr 2024" },
  { name: "NovaBuild Systems", plan: "Enterprise", status: "Active",  payment: "Paid",    queries: 67, joined: "Dec 2023" },
  { name: "MedCore Solutions", plan: "Starter",    status: "Churned", payment: "Lapsed",  queries: 3,  joined: "May 2024" },
];

/* ─────────────── COLORS ─────────────── */

const BLUE   = "#3B8BD4";
const PURPLE = "#534AB7";
const GREEN  = "#1D9E75";
const RED    = "#E24B4A";
const AMBER  = "#EF9F27";
const GRAY   = "#888780";

/* ─────────────── BADGE ─────────────── */

const BADGE_MAP: Record<string, BadgeStyleMap> = {
  Active:     { bg: "#e8f7f2", color: "#0f6e56" },
  Churned:    { bg: "#fceaea", color: "#a32d2d" },
  Paid:       { bg: "#e6f1fb", color: "#185fa5" },
  Pending:    { bg: "#fdf3e2", color: "#854f0b" },
  Lapsed:     { bg: "#fceaea", color: "#a32d2d" },
  Enterprise: { bg: "#eeedfe", color: "#3c3489" },
  Pro:        { bg: "#e6f1fb", color: "#185fa5" },
  Starter:    { bg: "#eaf3de", color: "#3b6d11" },
};

const Badge: React.FC<{ label: string }> = ({ label }) => {
  const s = BADGE_MAP[label] || { bg: "#f1efe8", color: "#5f5e5a" };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>
      {label}
    </span>
  );
};

/* ─────────────── METRIC CARD ─────────────── */

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}> = ({ label, value, sub, accent }) => (
  <div style={{
    background: "#fff",
    borderRadius: 12,
    border: "0.5px solid #e8e6df",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  }}>
    <span style={{ fontSize: 12, color: GRAY, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {label}
    </span>
    <span style={{ fontSize: 28, fontWeight: 700, color: accent || "#2c2c2a", lineHeight: 1.15 }}>
      {value}
    </span>
    {sub && <span style={{ fontSize: 12, color: GRAY }}>{sub}</span>}
  </div>
);

/* ─────────────── SECTION CARD ─────────────── */

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, children, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 14,
    border: "0.5px solid #e8e6df",
    padding: "18px 20px",
    ...style,
  }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#2c2c2a", marginBottom: 14, marginTop: 0 }}>
      {title}
    </h3>
    {children}
  </div>
);

/* ─────────────── LEGEND ─────────────── */

const ChartLegend: React.FC<{ items: { color: string; label: string }[] }> = ({ items }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginBottom: 10 }}>
    {items.map(({ color, label }) => (
      <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#73726c" }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
        {label}
      </span>
    ))}
  </div>
);

/* ─────────────── CUSTOM TOOLTIP ─────────────── */

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { name?: string | number; value?: string | number; color?: string }[];
  label?: string | number;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{
      background: "#fff",
      border: "0.5px solid #d3d1c7",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#2c2c2a" }}>{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} style={{ color: p.color || "#2c2c2a", marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─────────────── DONUT CHART ─────────────── */

const DonutChart: React.FC<{
  data: PieRow[];
  colors: string[];
  centerLabel: string;
}> = ({ data, colors, centerLabel }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ position: "relative", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_entry, i) => (
              <Cell key={i} fill={colors[i] || GRAY} />
            ))}
          </Pie>
          {/* <Tooltip
            formatter={(value: number, name: string) => [
              `${value} (${Math.round((value / total) * 100)}%)`,
              name,
            ]}
          /> */}
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#2c2c2a", lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 10, color: GRAY, marginTop: 2 }}>{centerLabel}</div>
      </div>
    </div>
  );
};

/* ─────────────── COUNTER ─────────────── */

const Counter: React.FC<{ target: number }> = ({ target }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val}</>;
};

/* ─────────────── TABLE HEADER CELL ─────────────── */

const TH: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{
    textAlign: "left",
    padding: "8px 12px",
    color: GRAY,
    fontWeight: 600,
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    borderBottom: "0.5px solid #e8e6df",
  }}>
    {children}
  </th>
);

/* ─────────────── MAIN DASHBOARD ─────────────── */

const SuperAdminDashboard: React.FC = () => {

  return (
    <div style={{
      minHeight: "100vh",
      // background: "#f4f2ed",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#2c2c2a",
    }}>

     

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 28px" }}>

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, marginTop: 0 }}>
            Super Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: GRAY, margin: 0 }}>
            Subscription analytics, payment tracking &amp; support overview
          </p>
        </div>

        {/* METRIC CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}>
          <MetricCard label="Total Organizations"  value={<Counter target={184} />} sub="All-time registered" />
          <MetricCard label="Active Subscriptions" value={<Counter target={142} />} sub="+8 this month"   accent={GREEN} />
          <MetricCard label="Churned"               value={<Counter target={42}  />} sub="−5 this month"   accent={RED} />
          <MetricCard label="Paid This Month"       value={<Counter target={138} />} sub="of 142 active"   accent={BLUE} />
          <MetricCard label="Queries Raised"        value={<Counter target={327} />} sub="Across all orgs" accent={PURPLE} />
        </div>

        {/* BAR + AREA ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          <SectionCard title="New Subscriptions vs Churn — Monthly">
            <ChartLegend items={[
              { color: BLUE, label: "New subscriptions" },
              { color: RED,  label: "Churned" },
            ]} />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barSize={14} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="newSubs" name="New subs" fill={BLUE} radius={[4, 4, 0, 0] as [number,number,number,number]} />
                <Bar dataKey="churned" name="Churned"  fill={RED}  radius={[4, 4, 0, 0] as [number,number,number,number]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Queries Raised per Month">
            <ChartLegend items={[{ color: GREEN, label: "Support queries" }]} />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GREEN} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="queries"
                  name="Queries"
                  stroke={GREEN}
                  strokeWidth={2.5}
                  fill="url(#gQ)"
                  dot={{ fill: GREEN, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* GROWTH TREND */}
        <SectionCard title="Subscription Growth — Cumulative Trend" style={{ marginBottom: 16 }}>
          <ChartLegend items={[
            { color: PURPLE, label: "Total organizations" },
            { color: BLUE,   label: "Active subscriptions" },
            { color: RED,    label: "Churned (cumulative)" },
          ]} />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total"        name="Total orgs" stroke={PURPLE} strokeWidth={2}   dot={false} />
              <Line type="monotone" dataKey="active"       name="Active"     stroke={BLUE}   strokeWidth={2.5} dot={{ fill: BLUE, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="churnedCumul" name="Churned"    stroke={RED}    strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* 3 DONUTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>

          <SectionCard title="Subscription Status">
            <DonutChart data={statusData} colors={[GREEN, RED]} centerLabel="total" />
            <ChartLegend items={[
              { color: GREEN, label: "Active 77%" },
              { color: RED,   label: "Churned 23%" },
            ]} />
          </SectionCard>

          <SectionCard title="Payment Status (This Month)">
            <DonutChart data={paymentData} colors={[BLUE, AMBER]} centerLabel="active" />
            <ChartLegend items={[
              { color: BLUE,  label: "Paid 97%" },
              { color: AMBER, label: "Pending 3%" },
            ]} />
          </SectionCard>

          <SectionCard title="Query Categories">
            <DonutChart data={queryCategories} colors={[PURPLE, BLUE, GREEN, GRAY]} centerLabel="queries" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {[
                { color: PURPLE, label: "Technical 40%" },
                { color: BLUE,   label: "Billing 35%" },
                { color: GREEN,  label: "Feature 15%" },
                { color: GRAY,   label: "Other 10%" },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#73726c" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ORG TABLE */}
        <SectionCard title="Recent Organization Activity" style={{ marginBottom: 16 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>Organization</TH>
                  <TH>Plan</TH>
                  <TH>Status</TH>
                  <TH>Payment</TH>
                  <TH>Queries</TH>
                  <TH>Joined</TH>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: i < orgs.length - 1 ? "0.5px solid #f0ede6" : "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#faf9f6"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{org.name}</td>
                    <td style={{ padding: "10px 12px" }}><Badge label={org.plan} /></td>
                    <td style={{ padding: "10px 12px" }}><Badge label={org.status} /></td>
                    <td style={{ padding: "10px 12px" }}><Badge label={org.payment} /></td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: PURPLE }}>{org.queries}</td>
                    <td style={{ padding: "10px 12px", color: GRAY }}>{org.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* MONTHLY BREAKDOWN TABLE */}
        <SectionCard title="Monthly Subscription Breakdown" style={{ marginBottom: 16 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>Month</TH>
                  <TH>New Subs</TH>
                  <TH>Renewals</TH>
                  <TH>Churned</TH>
                  <TH>Net Growth</TH>
                  <TH>Active (EOM)</TH>
                  <TH>Queries</TH>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, i) => {
                  const net = row.newSubs - row.churned;
                  return (
                    <tr
                      key={i}
                      style={{ borderBottom: i < monthlyData.length - 1 ? "0.5px solid #f0ede6" : "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#faf9f6"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                    >
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{row.month}</td>
                      <td style={{ padding: "10px 12px", color: BLUE,   fontWeight: 600 }}>{row.newSubs}</td>
                      <td style={{ padding: "10px 12px" }}>{row.renewals}</td>
                      <td style={{ padding: "10px 12px", color: RED,    fontWeight: 600 }}>{row.churned}</td>
                      <td style={{ padding: "10px 12px", color: net >= 0 ? GREEN : RED, fontWeight: 700 }}>
                        {net >= 0 ? "+" : ""}{net}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>{row.active}</td>
                      <td style={{ padding: "10px 12px", color: PURPLE, fontWeight: 600 }}>{row.queries}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* INSIGHTS */}
        <SectionCard title="Admin Insights">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "📈", text: "Subscription base grew from 96 to 142 active organizations over 6 months — a 48% increase." },
              { icon: "💰", text: "97% payment compliance this month — only 4 organizations have pending payments, down from 7 last month." },
              { icon: "⚠️", text: "Churn peaked in April (6 orgs). Proactive outreach to at-risk organizations is recommended." },
              { icon: "🎯", text: "June recorded the highest new subscriptions (32) — likely driven by the Q2 promotional campaign." },
              { icon: "🔧", text: "Technical queries make up 40% of all support tickets. A self-service help center may reduce load significantly." },
              { icon: "🏢", text: "Enterprise plan orgs raise 3× more queries than Starter plan — consider dedicated enterprise support tiers." },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                background: "#faf9f6", borderRadius: 8, padding: "12px 14px",
                border: "0.5px solid #e8e6df",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#444441", lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>
        </SectionCard>

     

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
