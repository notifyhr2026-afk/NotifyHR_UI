import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import OrgSideMenu from "./OrgSideMenu";
import { useAuth } from "../auth/AuthContext";

import "../css/DashboardLayout.css";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  menus: "Menus",
  Organization: "Manage Organization",
  Organizations: "Organizations",
  ManageRoles: "Roles",
  Users: "Users",
  Branches: "Manage Branches",
  Divisions: "Manage Divisions",
  Departments: "Departments",
  EmployeeList: "Employee List",
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
  AssignedRoles: "Available Roles",
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== "undefined" && window.innerWidth <= 768 ? false : true
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string>(location.pathname);

 

  
  const userRoles: any[] = JSON.parse(
    localStorage.getItem("userRoles") || "[]"
  );

  const hasEmployeeRole = userRoles.some(
    (r: any) => r === "Employee" || r?.roleName === "Employee"
  );

  const primaryRole =
    typeof userRoles[0] === "string"
      ? userRoles[0]
      : userRoles[0]?.roleName || "User";

  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: BREADCRUMB_MAP[part] || part.replace(/-/g, " "),
    path: "/" + pathParts.slice(0, i + 1).join("/"),
    active: i === pathParts.length - 1,
  }));

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("light-mode", !isDarkMode);
    document.body.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (window.innerWidth <= 768 && location.pathname !== prevPathRef.current) {
      setSidebarOpen(false);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

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

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div
      className={`dashboard-layout ${isDarkMode ? "theme-dark" : "theme-light"}`}
    >
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <OrgSideMenu isOpen={sidebarOpen} isDarkMode={isDarkMode} />

      <div
        className={`dashboard-main ${
          sidebarOpen ? "sidebar-open" : "sidebar-close"
        }`}
      >
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className={`menu-btn ${sidebarOpen ? "active" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="menu-lines" aria-hidden="true">
                <span className="menu-line menu-line-top" />
                <span className="menu-line menu-line-middle" />
                <span className="menu-line menu-line-bottom" />
              </span>
            </button>

            <div className="topbar-title-group">
              <h1 className="org-name">
                <span className="org-name-icon" aria-hidden="true">
                  <i className="bi bi-buildings" />
                </span>
                <span className="org-name-text">
                  {userData.organizationName || "Organization"}
                </span>
              </h1>

              {breadcrumbs.length > 0 && (
                <nav className="breadcrumb-nav" aria-label="Breadcrumb">
                  <ol className="breadcrumb mb-0">
                    {breadcrumbs.map((crumb, i) => (
                      <li
                        key={crumb.path}
                        className={`breadcrumb-item ${crumb.active ? "active" : ""}`}
                        aria-current={crumb.active ? "page" : undefined}
                      >
                        {crumb.label}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
          </div>

          <div className="topbar-right">
            <div className="search-box" ref={searchRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <i className="bi bi-search" aria-hidden="true" />
              </button>

              {searchOpen && (
                <div className="search-input-wrapper">
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                    aria-label="Search pages"
                  />
                  <span className="search-go-icon" aria-hidden="true">
                    <i className="bi bi-arrow-right" />
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-btn notification-btn"
              aria-label="Notifications"
            >
              <i className="bi bi-bell" aria-hidden="true" />
              <span className="notification-badge">3</span>
            </button>

            <button
              type="button"
              className="icon-btn theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <i
                className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-fill"}`}
                aria-hidden="true"
              />
            </button>

            <Dropdown align="end">
              <Dropdown.Toggle
                className="avatar-toggle"
                variant="light"
                aria-label="User menu"
              >
                <div className="avatar-circle">
                  {getInitials(userData.fullName)}
                  <span className="online-indicator" aria-hidden="true" />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-dropdown">
                <div className="dropdown-header-card">
                  <div className="avatar-large">
                    {getInitials(userData.fullName)}
                  </div>
                  <div className="user-info">
                    <div className="user-name-display">
                      {userData.fullName || "User"}
                    </div>
                    <div className="user-email">{userData.email || ""}</div>
                    <span className="user-role-badge">{primaryRole}</span>
                  </div>
                </div>

                <Dropdown.Divider className="dropdown-divider" />

                {hasEmployeeRole && (
                  <Dropdown.Item onClick={() => navigate("/MyProfile")}>
                    <i className="bi bi-person-circle me-3" aria-hidden="true" />
                    Profile
                  </Dropdown.Item>
                )}
                {hasEmployeeRole && (
                  <Dropdown.Item onClick={() => navigate("/career-personal")}>
                    <i className="bi bi-person-badge me-3" aria-hidden="true" />
                    Career & Personal
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={() => navigate("/ChangePassword")}>
                  <i className="bi bi-lock me-3" aria-hidden="true" />
                  Change Password
                </Dropdown.Item>

                <Dropdown.Divider className="dropdown-divider" />

                <Dropdown.Item className="logout-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-3" aria-hidden="true" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
