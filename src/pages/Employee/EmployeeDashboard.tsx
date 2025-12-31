import React, { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

// Sample data (replace with API)
const employee = {
  fullName: "John Doe",
  employeeCode: "EMP-1024",
  designation: "Senior Software Engineer",
  department: "IT Department",
  email: "john.doe@example.com",
  phone: "+1 987 654 3210",
  joinDate: "2021-04-15",
  status: "Active",
  profileImage: "",
};

// Attendance graph (last 7 days)
const attendanceData = [
  { day: "Mon", hrs: 8 },
  { day: "Tue", hrs: 7 },
  { day: "Wed", hrs: 6 },
  { day: "Thu", hrs: 8 },
  { day: "Fri", hrs: 9 },
];

// Leave distribution
const leavePie = [
  { name: "Used", value: 6 },
  { name: "Remaining", value: 12 },
];
const colors = ["#007bff", "#e0e0e0"];

// Team members
const team = [
  { name: "Alice Brown", role: "UI Developer" },
  { name: "James Lee", role: "Backend Dev" },
  { name: "Robert Paul", role: "QA Engineer" },
];

// Timeline
const timeline = [
  { date: "2024-01-15", title: "Promotion", desc: "Promoted to Senior Engineer" },
  { date: "2023-11-03", title: "Award", desc: "Employee of the Month" },
  { date: "2023-08-25", title: "Project", desc: "Completed Project Falcon" },
];

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="text-center mb-4">
        <i className="bi bi-person-circle text-primary" style={{ fontSize: "4rem" }}></i>
        <h3 className="fw-bold mt-2">{employee.fullName}</h3>
        <span className="badge bg-success px-3 py-2">{employee.status}</span>
      </div>

      {/* TABS */}
      <ul className="nav nav-tabs mb-4 justify-content-center">
        {[
          "profile", "attendance", "leaves", "payroll", "documents",
          "skills", "projects", "timeline", "settings"
        ].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {/* TAB CONTENT */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">

          {/* ========================
                PROFILE TAB
          ========================= */}
          {activeTab === "profile" && (
            <>
              <h4 className="mb-3">Employee Details</h4>
              <div className="row">

                {/* Block 1 */}
                <div className="col-md-6 mb-3">
                  <div className="border rounded p-3 bg-light">
                    <strong>Employee Code:</strong>
                    <p>{employee.employeeCode}</p>
                    <strong>Designation:</strong>
                    <p>{employee.designation}</p>
                    <strong>Department:</strong>
                    <p>{employee.department}</p>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="col-md-6 mb-3">
                  <div className="border rounded p-3 bg-light">
                    <strong>Email:</strong>
                    <p>{employee.email}</p>
                    <strong>Phone:</strong>
                    <p>{employee.phone}</p>
                    <strong>Joining Date:</strong>
                    <p>{employee.joinDate}</p>
                  </div>
                </div>

                {/* Team Block */}
                <div className="col-12 mt-3">
                  <h5 className="mb-3">Team Members</h5>
                  <div className="row">
                    {team.map((m, i) => (
                      <div className="col-md-4" key={i}>
                        <div className="p-3 border rounded text-center">
                          <i className="bi bi-person-fill" style={{ fontSize: "2rem" }}></i>
                          <h6 className="mt-2">{m.name}</h6>
                          <small className="text-muted">{m.role}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ========================
                ATTENDANCE TAB
          ========================= */}
          {activeTab === "attendance" && (
            <>
              <h4 className="mb-3">Attendance Summary</h4>

              {/* Graph */}
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <Bar dataKey="hrs" fill="#007bff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Heatmap */}
              <h5 className="mt-4">Attendance Heatmap</h5>
              <p className="text-muted small mb-2">Sample visual only</p>

              <div className="d-flex flex-wrap" style={{ width: "300px" }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="m-1"
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: ["#d4edda", "#fff3cd", "#f8d7da"][Math.floor(Math.random() * 3)],
                      borderRadius: "3px",
                    }}
                  ></div>
                ))}
              </div>
            </>
          )}

          {/* ========================
                LEAVES TAB
          ========================= */}
          {activeTab === "leaves" && (
            <>
              <h4 className="mb-3">Leave Analytics</h4>

              {/* Donut Chart */}
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leavePie}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={90}
                      label
                    >
                      {leavePie.map((entry, index) => (
                        <Cell key={index} fill={colors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3">
                <strong>Total Leaves: 18</strong><br />
                <strong>Used: 6</strong><br />
                <strong>Available: 12</strong>
              </div>
            </>
          )}

          {/* ========================
                TIMELINE TAB
          ========================= */}
          {activeTab === "timeline" && (
            <>
              <h4 className="mb-3">Career Timeline</h4>

              <ul className="timeline list-unstyled">
                {timeline.map((t, i) => (
                  <li key={i} className="mb-3">
                    <div className="d-flex">
                      <div className="me-3">
                        <i className="bi bi-dot" style={{ fontSize: "2rem" }}></i>
                      </div>
                      <div>
                        <strong>{t.date}</strong>
                        <p className="mb-1">{t.title}</p>
                        <small className="text-muted">{t.desc}</small>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ========================
                OTHER TABS (placeholders)
          ========================= */}
          {["documents", "skills", "projects", "payroll", "settings"].includes(activeTab) && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder2-open" style={{ fontSize: "3rem" }}></i>
              <h5 className="mt-3">This section will be implemented with real data.</h5>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default EmployeeDashboard;
