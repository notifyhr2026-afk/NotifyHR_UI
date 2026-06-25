import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import OrgSideMenu from "./OrgSideMenu";
import { useAuth } from "../auth/AuthContext";

import "../css/DashboardLayout.css";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  menus: "Menus",
  Organizations: "Organizations",
  ManageRoles: "Roles",
  Users: "Users",
  Branches: "Branches",
  Divisions: "Divisions",
  Departments: "Departments",
  EmployeeList: "Employees",
  ApplyLeave: "Apply Leave",
  LeavePolicies: "Leave Policies",
  ManageLeavePolicy: "Leave Policy",
  HolidayList: "Holidays",
  HolidaySettings: "Holiday Settings",
  AttendanceSettings: "Attendance Settings",
  AttendanceCalendar: "Attendance Calendar",
  EmployeeAttendanceLogs: "Attendance Logs",
  AssetList: "Assets",
  AssetAssignment: "Asset Assignment",
  VendorDetails: "Vendors",
  ShiftManagement: "Shifts",
  assignshifts: "Assign Shifts",
  Shiftpatterns: "Shift Patterns",
  FeatureManagement: "Features",
  RoleMenuPermissions: "Role Permissions",
  OrganizationFeatures: "Organization Features",
  plans: "Plans",
  ChangePassword: "Change Password",
  MyProfile: "My Profile",
  "career-personal": "Career & Personal",
  EmployeeDashboard: "Employee Dashboard",
  OrgPayrollCyclePage: "Payroll Cycle",
  SalaryComponentMaster: "Salary Components",
  SalaryStructureMaster: "Salary Structures",
  EmployeeSalaryAssignment: "Salary Assignment",
  EmployeePayslip: "Payslip",
  RunPayroll: "Run Payroll",
  PayrollProcessPage: "Payroll Process",
  PayrollReportPage: "Payroll Report",
  TaxSectionMaster: "Tax Sections",
  EmployeeTaxDeclaration: "Tax Declaration",
  HelpdeskDashboard: "Helpdesk Dashboard",
  AssignTicketsPage: "Assign Tickets",
  EmployeeTickets: "My Tickets",
  ManagerTicketVerification: "Verify Tickets",
  MyServiceTicket: "Service Ticket",
  TimesheetEntry: "Timesheet Entry",
  TimesheetApproval: "Timesheet Approval",
  TimesheetPayrollReport: "Timesheet Report",
  VerifyEmployeeTasks: "Verify Tasks",
  ReportsDashboard: "Reports",
  ManageOrgHierarchy: "Org Hierarchy",
  "employee-id-rules": "Employee ID Rules",
  "approve-leaves": "Approve Leaves",
  "manage-attendance-devices": "Attendance Devices",
  "bench-policy-rules": "Bench Policy",
  "notice-period-policies": "Notice Period",
  "resignation-approval": "Resignation Approval",
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("light-mode", !isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const userRoles: any[] = JSON.parse(
    localStorage.getItem("userRoles") || "[]"
  );

  const hasEmployeeRole = userRoles.some(
    (r: any) => r === "Employee" || r?.roleName === "Employee"
  );

  // Breadcrumb logic
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: BREADCRUMB_MAP[part] || part.replace(/-/g, " "),
    path: "/" + pathParts.slice(0, i + 1).join("/"),
    active: i === pathParts.length - 1,
  }));

  // User role for display — handles both string[] and {roleID, roleName}[]
  const primaryRole = userRoles[0]?.roleName || "User";

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Simple search navigation — can be extended
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="dashboard-layout">
      <OrgSideMenu isOpen={sidebarOpen} />

      <div
        className={`dashboard-main ${
          sidebarOpen ? "sidebar-open" : "sidebar-close"
        }`}
      >
        {/* ===== TOPBAR ===== */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className={`menu-btn ${!sidebarOpen ? "active" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="hamburger-lines">
                <span className="line line-1" />
                <span className="line line-2" />
                <span className="line line-3" />
              </span>
            </button>

            <h5 className="org-name">
              <i className="bi bi-buildings" />
              <span>{userData.organizationName || "Organization"}</span>
            </h5>

            {breadcrumbs.length > 0 && (
              <nav className="breadcrumb-nav">
                <ol className="breadcrumb">
                  {breadcrumbs.map((crumb, i) => (
                    <li
                      key={i}
                      className={`breadcrumb-item ${crumb.active ? "active" : ""}`}
                    >
                      {crumb.active ? (
                        crumb.label
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>

          <div className="topbar-right">
            {/* Search */}
            <div className="search-box" ref={searchRef}>
              <button
                className="icon-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <i className="bi bi-search" />
              </button>

              {searchOpen && (
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                  />
                  <span className="search-go-icon">
                    <i className="bi bi-arrow-right" />
                  </span>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              className="icon-btn notification-btn"
              aria-label="Notifications"
            >
              <i className="bi bi-bell" />
              <span className="notification-badge">3</span>
            </button>

            {/* Theme toggle */}
            <button
              className="icon-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <i className="bi bi-sun-fill" style={{ color: "#fbbf24" }} />
              ) : (
                <i className="bi bi-moon-fill" />
              )}
            </button>

            {/* User name */}
            {/* <span className="user-name">{userData.fullName}</span> */}

            {/* Avatar Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle className="avatar-toggle" variant="light">
                <div className="avatar-circle">
                  {getInitials(userData.fullName)}
                  <span className="online-indicator" />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-dropdown">
                {/* User Card */}
                <div className="dropdown-header-card">
                  <div className="avatar-large">
                    {getInitials(userData.fullName)}
                  </div>
                  <div className="user-info">
                    <div className="user-name-display">
                      {userData.fullName || "User"}
                    </div>
                    <div className="user-email">
                      {userData.email || ""}
                    </div>
                    <span className="user-role-badge">
                      {primaryRole}
                    </span>
                  </div>
                </div>

                <Dropdown.Divider className="dropdown-divider" />

                {/* <Dropdown.Item onClick={() => navigate("/MyProfile")}>
                  <i className="bi bi-person-circle me-3" />
                  Profile
                </Dropdown.Item> */}

                <Dropdown.Item onClick={() => navigate("/ChangePassword")}>
                  <i className="bi bi-lock me-3" />
                  Change Password
                </Dropdown.Item>

                {hasEmployeeRole && (
                  <Dropdown.Item onClick={() => navigate("/career-personal")}>
                    <i className="bi bi-person-badge me-3" />
                    Career & Personal
                  </Dropdown.Item>
                )}

                <Dropdown.Divider className="dropdown-divider" />

                {/* Theme switch inline */}
                {/* <div
                  className="dropdown-item d-flex align-items-center justify-content-between"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    <i
                      className={`bi me-3 ${
                        isDarkMode ? "bi-sun-fill" : "bi-moon-fill"
                      }`}
                    />
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                  <div className="theme-switch position-relative">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      readOnly
                      className="form-check-input position-static"
                      style={{ cursor: "pointer" }}
                    />
                  </div> 
                </div>

                <Dropdown.Divider className="dropdown-divider" />*/}

                <Dropdown.Item
                  className="logout-item"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-3" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
