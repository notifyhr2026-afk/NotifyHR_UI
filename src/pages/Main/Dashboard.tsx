import React, { useState } from "react";

const Dashboard: React.FC = () => {
  const [stats] = useState({
    totalEmployees: 245,
    activeEmployees: 220,
    newJoiners: 12,
    presentToday: 198,
    absentToday: 47,
    pendingLeaves: 8,
    payrollStatus: "Processing",
  });

  /* ---------- MONTHLY DATA ---------- */
  const [monthlyReport] = useState([
    { month: "Jan", joined: 15, left: 3, attendance: 92 },
    { month: "Feb", joined: 22, left: 5, attendance: 89 },
    { month: "Mar", joined: 18, left: 7, attendance: 87 },
    { month: "Apr", joined: 25, left: 4, attendance: 90 },
    { month: "May", joined: 20, left: 6, attendance: 88 },
    { month: "Jun", joined: 28, left: 8, attendance: 91 },
  ]);

  /* ---------- YEARLY DATA ---------- */
  const [yearlyReport] = useState({
    2022: { employees: 180, attendance: 86 },
    2023: { employees: 210, attendance: 88 },
    2024: { employees: 245, attendance: 90 },
  });

  const latestMonth = monthlyReport[monthlyReport.length - 1];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2>📊 Organization Dashboard</h2>

        {/* STATS */}
        <div style={styles.grid}>
          <Card title="Total Employees" value={stats.totalEmployees} />
          <Card title="Active Employees" value={stats.activeEmployees} />
          <Card title="New Joiners" value={stats.newJoiners} />
          <Card title="Pending Leaves" value={stats.pendingLeaves} />
          <Card title="Payroll" value={stats.payrollStatus} />
        </div>

        {/* MONTHLY REPORT */}
        <Section title="📅 Monthly Report">
          <p>
            📊 Latest Month: <b>{latestMonth.month}</b>
          </p>

          <div style={styles.grid}>
            <Card title="Joined" value={latestMonth.joined} />
            <Card title="Left" value={latestMonth.left} />
            <Card title="Attendance %" value={`${latestMonth.attendance}%`} />
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Month</th>
                <th>Joined</th>
                <th>Left</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReport.map((m, i) => (
                <tr key={i}>
                  <td>{m.month}</td>
                  <td>{m.joined}</td>
                  <td>{m.left}</td>
                  <td>{m.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* YEARLY REPORT */}
        <Section title="📈 Yearly Report">
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Year</th>
                <th>Total Employees</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yearlyReport).map(([year, data]) => (
                <tr key={year}>
                  <td>{year}</td>
                  <td>{data.employees}</td>
                  <td>{data.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* INSIGHTS */}
        <Section title="🧠 Admin Insights">
          <ul>
            <li>
              📈 Employee count is steadily increasing year-over-year (growth trend)
            </li>
            <li>
              📊 Attendance improved from 86% → 90% over 3 years
            </li>
            <li>
              ⚠ Employee exits slightly increased in recent months
            </li>
            <li>
              💡 May shows strong hiring activity (peak recruitment)
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
};

/* ---------- COMPONENTS ---------- */

const Card = ({ title, value }: any) => (
  <div style={styles.card}>
    <div style={styles.cardTitle}>{title}</div>
    <div style={styles.cardValue}>{value}</div>
  </div>
);

const Section = ({ title, children }: any) => (
  <div style={styles.section}>
    <h3>{title}</h3>
    {children}
  </div>
);

/* ---------- STYLES ---------- */

const styles: any = {
  page: {
    background: "#f4f6f9",
    minHeight: "100vh",
    padding: 20,
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    marginTop: 10,
  },

  card: {
    padding: 16,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    fontSize: 14,
    color: "#555",
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
  },

  section: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 15,
  },

  th: {
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    padding: 8,
  },

  td: {
    padding: 8,
    borderBottom: "1px solid #eee",
  },
};

export default Dashboard;