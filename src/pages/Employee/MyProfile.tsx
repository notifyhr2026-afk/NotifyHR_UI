import React, { useState } from "react";

const MyProfile: React.FC = () => {
  // ===== SAMPLE DATA =====
  const employee = {
    fullName: "John Doe",
    employeeCode: "EMP1024",
    designation: "Senior Software Engineer",
    department: "Technology",
    email: "john.doe@example.com",
    secondaryEmail: "john.secondary@example.com",
    phone: "+1 987 654 3210",
    extension: "2345",
    gender: "Male",
    dob: "1990-05-12",
    bloodGroup: "O+",
    address: "123 Main St, New York, NY",
    joinDate: "2021-04-15",
    manager: "Sarah Johnson",
    team: "Product Engineering",
    status: "Active",
    profilePhoto: "https://i.pravatar.cc/200",
  };

  const leaveSummary = { total: 24, used: 10, remaining: 14 };

  const attendance = {
    today: "Present",
    checkIn: "09:12 AM",
    checkOut: "06:10 PM",
    monthPresent: 18,
    monthAbsent: 2,
  };

  const pendingTasks = 5;

  const recentActivities = [
    "Submitted Sprint Demo Feedback",
    "Updated Timesheet (15 Feb)",
    "Attended Scrum Meeting",
    "Checked In - 09:12 AM",
  ];

  const skills = ["React", "Node.js", "SQL", "AWS", "Bootstrap", "Microservices"];

  const documents = [
    { name: "Resume.pdf", type: "PDF" },
    { name: "ID Proof.png", type: "Image" },
    { name: "Degree Certificate.pdf", type: "PDF" },
  ];

  const holidays = [
    "Republic Day - Jan 26",
    "Good Friday - Apr 18",
    "Labor Day - May 1",
  ];

  const payroll = {
    monthlySalary: "₹85,000",
    bank: "HDFC Bank",
    account: "XXXX 3345",
    pfNo: "PF8899221",
  };

  const shift = {
    type: "General Shift",
    time: "09:00 AM - 06:00 PM",
    weeklyOff: "Saturday, Sunday",
  };

  const projects = [
    "HRMS Portal Revamp",
    "Employee Attendance AI Module",
    "Company Dashboard Analytics",
  ];

  const emergencyContact = {
    name: "Michael Doe",
    relation: "Brother",
    phone: "+1 999 888 7777",
  };

  // ===== STATE =====
  const [showPayroll, setShowPayroll] = useState(false);

  const handleTogglePayroll = () => {
    const confirm = window.confirm("Are you sure you want to view payroll details?");
    if (confirm) setShowPayroll(!showPayroll);
  };

  // ===== SMALL REUSABLE COMPONENT =====
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="col-sm-6 mb-2">
      <strong>{label}:</strong> <p className="mb-0">{value}</p>
    </div>
  );

  return (
    <div className="container py-5">
      {/* ===== PROFILE HEADER ===== */}
      <div
        className="rounded-4 shadow-sm mb-4 p-4 text-white"
        style={{ background: "linear-gradient(135deg, #0055cc, #002855)" }}
      >
        <div className="d-flex align-items-center">
          <img
            src={employee.profilePhoto}
            alt="Profile"
            className="rounded-circle border border-3 border-light"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <div className="ms-4">
            <h3 className="fw-bold mb-0">{employee.fullName}</h3>
            <p className="mb-1 opacity-75">{employee.designation}</p>
            <span className="badge bg-success px-3 py-2">{employee.status}</span>
          </div>
        </div>
      </div>

      {/* ===== QUICK SUMMARY ===== */}
      {/* <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-speedometer2 text-primary me-2"></i>Quick Summary
        </h6>
        <div className="row text-center">
          <div className="col-3">
            <h5 className="fw-bold text-primary">{leaveSummary.remaining}</h5>
            <small className="text-muted">Leaves Left</small>
          </div>
          <div className="col-3">
            <h5 className="fw-bold text-success">{attendance.monthPresent}</h5>
            <small className="text-muted">Days Present</small>
          </div>
          <div className="col-3">
            <h5 className="fw-bold text-danger">{attendance.monthAbsent}</h5>
            <small className="text-muted">Days Absent</small>
          </div>
          <div className="col-3">
            <h5 className="fw-bold text-warning">{pendingTasks}</h5>
            <small className="text-muted">Pending Tasks</small>
          </div>
        </div>
      </div>        */}

      <div className="row g-4">
        {/* LEFT SIDE */}
        <div className="col-lg-4">
           {/* ===== QUICK SUMMARY ===== */}
           <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
           <h6 className="fw-bold mb-3">
          <i className="bi bi-speedometer2 text-primary me-2"></i>Quick Summary
        </h6>
        <div className="row text-center">
          <div className="col">
            <h5 className="fw-bold text-primary">{leaveSummary.remaining}</h5>
            <small className="text-muted">Leaves Left</small>
          </div>
          <div className="col">
            <h5 className="fw-bold text-success">{attendance.monthPresent}</h5>
            <small className="text-muted">Days Present</small>
          </div>
          <div className="col">
            <h5 className="fw-bold text-danger">{attendance.monthAbsent}</h5>
            <small className="text-muted">Days Absent</small>
          </div>       
        </div>
          </div>
          {/* PAYROLL SUMMARY */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-cash-stack text-success me-2"></i>Payroll Summary
              </span>
              <button
                className={`btn btn-sm ${showPayroll ? "btn-danger" : "btn-primary"}`}
                onClick={handleTogglePayroll}
              >
                {showPayroll ? "Hide" : "Show"}
              </button>
            </h6>
            <p>
              <strong>Salary:</strong> {showPayroll ? payroll.monthlySalary : "XXXX"}
            </p>
            <p>
              <strong>Bank:</strong> {showPayroll ? payroll.bank : "XXXX"}
            </p>
            <p>
              <strong>Account No:</strong> {showPayroll ? payroll.account : "XXXX"}
            </p>
            <p className="mb-0">
              <strong>PF No:</strong> {showPayroll ? payroll.pfNo : "XXXX"}
            </p>
          </div> 

          {/* UPCOMING HOLIDAYS */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-calendar-event text-danger me-2"></i>Upcoming Holidays
            </h6>
            {holidays.map((h, i) => (
              <p key={i} className="mb-1">
                <i className="bi bi-dot text-primary"></i> {h}
              </p>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-8">
          {/* JOB DETAILS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-briefcase-fill text-info me-2"></i>Job Details
            </h5>
            <div className="row">
              <InfoRow label="Employee Code" value={employee.employeeCode} />
              <InfoRow label="Department" value={employee.department} />
              <InfoRow label="Date of Joining" value={employee.joinDate} />
              <InfoRow label="Reporting Manager" value={employee.manager} />
              <InfoRow label="Team" value={employee.team} />
              <InfoRow label="Email" value={employee.email} />
              <InfoRow label="Secondary Email" value={employee.secondaryEmail} />
              <InfoRow label="Phone" value={employee.phone} />
              <InfoRow label="Extension" value={employee.extension} />
              <InfoRow label="Gender" value={employee.gender} />
              <InfoRow label="Date of Birth" value={employee.dob} />
              <InfoRow label="Blood Group" value={employee.bloodGroup} />
              <InfoRow label="Address" value={employee.address} />
            </div>
          </div>

          {/* SHIFT DETAILS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-clock-history text-warning me-2"></i>Shift & Schedule
            </h5>
            <p>
              <strong>Shift Type:</strong> {shift.type}
            </p>
            <p>
              <strong>Shift Time:</strong> {shift.time}
            </p>
            <p>
              <strong>Weekly Off:</strong> {shift.weeklyOff}
            </p>
          </div>

          {/* 2-COLUMN CARDS: Projects, Emergency, Documents, Recent Activity */}
          <div className="row g-4">
            {/* Projects Assigned */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-kanban text-primary me-2"></i>Projects Assigned
                </h5>
                <ul>
                  {projects.map((p, i) => (
                    <li key={i} className="mb-1">{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-telephone-inbound text-danger me-2"></i>Emergency Contact
                </h5>
                <p><strong>Name:</strong> {emergencyContact.name}</p>
                <p><strong>Relation:</strong> {emergencyContact.relation}</p>
                <p><strong>Phone:</strong> {emergencyContact.phone}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-folder2-open text-secondary me-2"></i>Documents
                </h5>
                {documents.map((doc, i) => (
                  <p key={i} className="mb-1">
                    <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                    {doc.name} <span className="text-muted small">({doc.type})</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-activity text-danger me-2"></i>Recent Activity
                </h5>
                <ul className="list-group list-group-flush">
                  {recentActivities.map((act, idx) => (
                    <li key={idx} className="list-group-item border-0">
                      <i className="bi bi-dot text-primary fs-4"></i> {act}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
