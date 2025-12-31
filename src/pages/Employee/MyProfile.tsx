import React from "react";

const MyProfile: React.FC = () => {

  // ===== SAMPLE DATA =====
  const employee = {
    fullName: "John Doe",
    employeeCode: "EMP1024",
    designation: "Senior Software Engineer",
    department: "Technology",
    email: "john.doe@example.com",
    phone: "+1 987 654 3210",
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

  return (
    <div className="container py-5">

      {/* ============= PROFILE HEADER ============= */}
      <div className="rounded-4 shadow-sm mb-4 p-4 text-white"
        style={{ background: "linear-gradient(135deg, #0055cc, #002855)" }}>
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

      <div className="row g-4">

        {/* ================= LEFT SIDE ================= */}
        <div className="col-lg-4">

          {/* QUICK SUMMARY */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-graph-up-arrow text-primary me-2"></i>Quick Summary
            </h6>

            <div className="row text-center">
              <div className="col-4">
                <h5 className="fw-bold text-primary">{leaveSummary.remaining}</h5>
                <small className="text-muted">Leaves Left</small>
              </div>
              <div className="col-4">
                <h5 className="fw-bold text-success">{attendance.monthPresent}</h5>
                <small className="text-muted">Present</small>
              </div>
              <div className="col-4">
                <h5 className="fw-bold text-danger">{attendance.monthAbsent}</h5>
                <small className="text-muted">Absent</small>
              </div>
            </div>
          </div>

          {/* PAYROLL SUMMARY */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-cash-stack text-success me-2"></i>Payroll Summary</h6>
            <p><strong>Salary:</strong> {payroll.monthlySalary}</p>
            <p><strong>Bank:</strong> {payroll.bank}</p>
            <p><strong>Account No:</strong> {payroll.account}</p>
            <p className="mb-0"><strong>PF No:</strong> {payroll.pfNo}</p>
          </div>

          {/* SKILLS */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-stars text-warning me-2"></i>Skills</h6>
            {skills.map((skill, i) => (
              <span key={i} className="badge bg-primary bg-opacity-75 me-2 mb-2">{skill}</span>
            ))}
          </div>

          {/* UPCOMING HOLIDAYS */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-calendar-event text-danger me-2"></i>Upcoming Holidays</h6>
            {holidays.map((h, i) => (
              <p key={i} className="mb-1"><i className="bi bi-dot text-primary"></i>{h}</p>
            ))}
          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="col-lg-8">

          {/* JOB INFORMATION */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-briefcase-fill text-info me-2"></i>Job Details</h5>

            <div className="row mb-2">
              <div className="col-sm-6"><strong>Employee Code:</strong><p>{employee.employeeCode}</p></div>
              <div className="col-sm-6"><strong>Department:</strong><p>{employee.department}</p></div>
              <div className="col-sm-6"><strong>Date of Joining:</strong><p>{employee.joinDate}</p></div>
              <div className="col-sm-6"><strong>Reporting Manager:</strong><p>{employee.manager}</p></div>
            </div>
          </div>

          {/* SHIFT DETAILS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-clock-history text-warning me-2"></i>Shift & Schedule</h5>
            <p><strong>Shift Type:</strong> {shift.type}</p>
            <p><strong>Shift Time:</strong> {shift.time}</p>
            <p><strong>Weekly Off:</strong> {shift.weeklyOff}</p>
          </div>

          {/* PROJECTS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-kanban text-primary me-2"></i>Projects Assigned</h5>
            <ul>
              {projects.map((p, i) => (
                <li key={i} className="mb-1">{p}</li>
              ))}
            </ul>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-telephone-inbound text-danger me-2"></i>Emergency Contact</h5>
            <p><strong>Name:</strong> {emergencyContact.name}</p>
            <p><strong>Relation:</strong> {emergencyContact.relation}</p>
            <p><strong>Phone:</strong> {emergencyContact.phone}</p>
          </div>

          {/* DOCUMENTS */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-folder2-open text-secondary me-2"></i>Documents</h5>

            {documents.map((doc, i) => (
              <p key={i} className="mb-1">
                <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                {doc.name} <span className="text-muted small">({doc.type})</span>
              </p>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-activity text-danger me-2"></i>Recent Activity</h5>

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
  );
};

export default MyProfile;
