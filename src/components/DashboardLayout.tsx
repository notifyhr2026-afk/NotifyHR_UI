import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import OrgSideMenu from "./OrgSideMenu";
import { useAuth } from "../auth/AuthContext";
import ErrorBoundary from "./common/ErrorBoundary";
import "../css/DashboardLayout.css";

export const BREADCRUMB_MAP: Record<string, string> = {
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
  EmployeeClock: "Clock In / Out",
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
  CandidateList: "Candidate List",
  JobRequisition: "Job Requisition",
  JobRequisitionApprovals: "Requisition Approvals",
  OnboardProcess: "Onboarding Process",
  EmployeeSelfReview: "Self Review",
  EmployeePerformanceReview: "Performance Review",
  ReviewCycleManagement: "Review Cycles",
  Feedback360Page: "360 Feedback",
  EmployeeDirectoryReport: "Employee Directory",
  AttendanceRegisterReport: "Attendance Register",
  SalaryRegisterReport: "Salary Register",
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Leave Request Approved",
    description: "Your annual leave request for Oct 12-14 was approved by HR Manager.",
    time: "25m ago",
    icon: "bi-calendar-check",
    iconBg: "rgba(16, 185, 129, 0.12)",
    iconColor: "#10b981",
    isRead: false,
    link: "/ApplyLeave",
  },
  {
    id: "notif-2",
    title: "September Payslip Ready",
    description: "Your monthly payslip for Sept 2026 has been processed and ready to view.",
    time: "2h ago",
    icon: "bi-cash-coin",
    iconBg: "rgba(79, 70, 229, 0.12)",
    iconColor: "#4f46e5",
    isRead: false,
    link: "/EmployeePayslip",
  },
  {
    id: "notif-3",
    title: "Helpdesk Ticket Resolved",
    description: "Ticket #HD-109: IT Workstation and dual-monitor setup resolved.",
    time: "Yesterday",
    icon: "bi-headset",
    iconBg: "rgba(6, 182, 212, 0.12)",
    iconColor: "#06b6d4",
    isRead: false,
    link: "/EmployeeTickets",
  },
];

const QUICK_ACTIONS = [
  { title: "Clock In / Out", path: "/EmployeeClock", icon: "bi-alarm", category: "Time & Attendance" },
  { title: "Apply for Leave", path: "/ApplyLeave", icon: "bi-calendar-plus", category: "Time & Attendance" },
  { title: "Employee Directory", path: "/EmployeeList", icon: "bi-people", category: "Workforce" },
  { title: "View My Payslip", path: "/EmployeePayslip", icon: "bi-file-earmark-text", category: "Payroll" },
  { title: "Submit Helpdesk Ticket", path: "/EmployeeTickets", icon: "bi-ticket-perforated", category: "Support" },
  { title: "Enter Timesheet", path: "/TimesheetEntry", icon: "bi-calendar-date", category: "Time Tracking" },
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const userData = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, []);

  const [avatarImgError, setAvatarImgError] = useState(false);

  // Self-heal localStorage to remove corrupted "undefined" or "null" substrings
  useEffect(() => {
    try {
      const rawUserStr = localStorage.getItem("user");
      if (
        rawUserStr &&
        (rawUserStr.toLowerCase().includes("undefined") ||
          rawUserStr.toLowerCase().includes("null"))
      ) {
        const parsed = JSON.parse(rawUserStr);
        if (parsed && typeof parsed === "object") {
          let changed = false;
          if (typeof parsed.fullName === "string") {
            const cleaned = parsed.fullName
              .replace(/undefined/gi, "")
              .replace(/null/gi, "")
              .trim();
            if (cleaned !== parsed.fullName) {
              parsed.fullName = cleaned;
              changed = true;
            }
          }
          if (typeof parsed.employeeName === "string") {
            const cleaned = parsed.employeeName
              .replace(/undefined/gi, "")
              .replace(/null/gi, "")
              .trim();
            if (cleaned !== parsed.employeeName) {
              parsed.employeeName = cleaned;
              changed = true;
            }
          }
          if (typeof parsed.userName === "string") {
            const cleaned = parsed.userName
              .replace(/undefined/gi, "")
              .replace(/null/gi, "")
              .trim();
            if (cleaned !== parsed.userName) {
              parsed.userName = cleaned;
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem("user", JSON.stringify(parsed));
          }
        }
      }
    } catch (e) {
      console.warn("User data normalization error:", e);
    }
  }, []);

  // Determine avatar image URL if provided in user or employee data
  const avatarUrl = useMemo(() => {
    return (
      userData.profilePic ||
      userData.ProfilePic ||
      userData.profilePicture ||
      userData.profileImage ||
      userData.avatarUrl ||
      userData.avatar ||
      userData.photoUrl ||
      userData.photo ||
      null
    );
  }, [userData]);

  // Clean, robust display name resolution that eliminates any "undefined" artifacts
  const resolvedDisplayName = useMemo(() => {
    const rawCandidates = [
      userData.fullName,
      userData.FullName,
      [userData.firstName || userData.FirstName, userData.lastName || userData.LastName]
        .filter(Boolean)
        .join(" "),
      userData.employeeName,
      userData.EmployeeName,
      userData.name,
      userData.Name,
      userData.username,
      userData.userName,
      userData.email ? userData.email.split("@")[0] : "",
    ];

    for (const raw of rawCandidates) {
      if (typeof raw === "string" && raw.trim()) {
        const sanitized = raw
          .replace(/undefined/gi, "")
          .replace(/null/gi, "")
          .replace(/[_\-.]+/g, " ")
          .trim();

        if (sanitized.length > 0) {
          // If the candidate was a single letter like "J" but an email is present, check email
          if (sanitized.length === 1 && userData.email) {
            const emailPrefix = userData.email
              .split("@")[0]
              .replace(/undefined/gi, "")
              .replace(/null/gi, "")
              .replace(/[0-9]+/g, "")
              .replace(/[_\-.]+/g, " ")
              .trim();
            if (emailPrefix.length > 1) {
              return emailPrefix
                .split(/\s+/)
                .filter(Boolean)
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(" ");
            }
          }

          return sanitized
            .split(/\s+/)
            .filter(Boolean)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }
      }
    }

    return "User";
  }, [userData]);

  const resolvedEmail = useMemo(() => {
    if (userData.email && typeof userData.email === "string") {
      const cleanEmail = userData.email.replace(/undefined/gi, "").trim();
      if (cleanEmail) return cleanEmail;
    }
    return "user@organization.com";
  }, [userData.email]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== "undefined" && window.innerWidth <= 992 ? false : true
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Command Palette State
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const prevPathRef = useRef<string>(location.pathname);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  const userRoles: any[] = JSON.parse(
    localStorage.getItem("userRoles") || "[]"
  );

  const hasEmployeeRole = userRoles.some(
    (r: any) => r === "Employee" || r?.roleName === "Employee"
  );

  const primaryRole =
    typeof userRoles[0] === "string"
      ? userRoles[0]
      : userRoles[0]?.roleName || "Org Admin";

  // Breadcrumbs calculation
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: BREADCRUMB_MAP[part] || part.replace(/-/g, " "),
    path: "/" + pathParts.slice(0, i + 1).join("/"),
    active: i === pathParts.length - 1,
  }));

  // Sync theme
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    document.body.classList.toggle("light-mode", !isDarkMode);
    document.body.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Window resize handler for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on mobile route change
  useEffect(() => {
    if (window.innerWidth <= 992 && location.pathname !== prevPathRef.current) {
      setSidebarOpen(false);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
        setPaletteQuery("");
        setSelectedIndex(0);
      } else if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteOpen]);

  // Auto focus input when palette opens
  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => paletteInputRef.current?.focus(), 60);
    }
  }, [paletteOpen]);

  // Filter Command Palette Items
  const paletteResults = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) {
      return QUICK_ACTIONS.map((item) => ({
        label: item.title,
        path: item.path,
        icon: item.icon,
        category: item.category,
      }));
    }

    const matchedPages = Object.entries(BREADCRUMB_MAP)
      .map(([pathKey, label]) => ({
        label,
        path: pathKey.startsWith("/") ? pathKey : `/${pathKey}`,
        icon: "bi-arrow-right-short",
        category: "Navigation",
      }))
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.path.toLowerCase().includes(q)
      );

    const matchedActions = QUICK_ACTIONS.filter(
      (action) =>
        action.title.toLowerCase().includes(q) ||
        action.category.toLowerCase().includes(q)
    ).map((item) => ({
      label: item.title,
      path: item.path,
      icon: item.icon,
      category: item.category,
    }));

    return [...matchedActions, ...matchedPages].slice(0, 10);
  }, [paletteQuery]);

  const selectPaletteItem = useCallback(
    (path: string) => {
      navigate(path);
      setPaletteOpen(false);
      setPaletteQuery("");
    },
    [navigate]
  );

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < paletteResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : paletteResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (paletteResults[selectedIndex]) {
        selectPaletteItem(paletteResults[selectedIndex].path);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    navigate("/");
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getInitials = useCallback((name?: string) => {
    if (!name) return "HR";
    // Strip any "undefined" or "null" case-insensitive strings
    const sanitized = name
      .replace(/undefined/gi, "")
      .replace(/null/gi, "")
      .trim();

    if (!sanitized) return "HR";

    const parts = sanitized.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0].charAt(0).toUpperCase();
      const second = parts[parts.length - 1].charAt(0).toUpperCase();
      if (first && second) return first + second;
    }

    const letters = sanitized.replace(/[^a-zA-Z]/g, "");
    if (letters.length >= 2) {
      return letters.substring(0, 2).toUpperCase();
    }
    if (letters.length === 1) {
      return letters.toUpperCase();
    }
    return "HR";
  }, []);

  return (
    <div
      className={`dashboard-layout ${isDarkMode ? "theme-dark" : "theme-light"}`}
    >
      {/* Mobile Drawer Backdrop */}
      <div
        id="sidebar-backdrop"
        className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <OrgSideMenu
        isOpen={sidebarOpen}
        isDarkMode={isDarkMode}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Application Area */}
      <div
        id="dashboard-main"
        className={`dashboard-main ${
          sidebarOpen ? "sidebar-open" : "sidebar-close"
        }`}
      >
        {/* Topbar Header */}
        <header id="dashboard-topbar" className="dashboard-topbar">
          {/* Topbar Left: Menu Toggle + Org Tag + Breadcrumbs */}
          <div className="topbar-left">
            <button
              id="topbar-sidebar-toggle"
              type="button"
              className="topbar-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <i
                className={`bi ${sidebarOpen ? "bi-layout-sidebar-inset" : "bi-list"}`}
                aria-hidden="true"
              />
            </button>

            <div className="topbar-identity-group">
              <span className="org-identity-chip">
                <i className="bi bi-buildings" aria-hidden="true" />
                <span>{userData.organizationName || "Niku Enterprise"}</span>
              </span>

              {breadcrumbs.length > 0 && (
                <>
                  <span className="topbar-divider" aria-hidden="true">/</span>
                  <nav className="topbar-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/dashboard" className="topbar-breadcrumb-item">
                      <i className="bi bi-house-door" aria-hidden="true" />
                    </Link>
                    {breadcrumbs.map((crumb) => (
                      <React.Fragment key={crumb.path}>
                        <span className="topbar-divider" aria-hidden="true">/</span>
                        {crumb.active ? (
                          <span className="topbar-breadcrumb-current">
                            {crumb.label}
                          </span>
                        ) : (
                          <Link to={crumb.path} className="topbar-breadcrumb-item">
                            {crumb.label}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                </>
              )}
            </div>
          </div>

          {/* Topbar Center: Universal Command Bar Trigger */}
          <div className="topbar-center">
            <button
              id="topbar-search-trigger"
              type="button"
              className="topbar-search-trigger"
              onClick={() => {
                setPaletteOpen(true);
                setPaletteQuery("");
                setSelectedIndex(0);
              }}
              aria-label="Open command search"
            >
              <span className="search-trigger-content">
                <i className="bi bi-search" aria-hidden="true" />
                <span>Search modules, pages, or actions...</span>
              </span>
              <kbd className="search-kbd-badge">⌘K</kbd>
            </button>
          </div>

          {/* Topbar Right: Quick Clock + Notifications + Theme + User Menu */}
          <div className="topbar-right">
            {/* Mobile Search Button */}
            <button
              id="topbar-mobile-search-btn"
              type="button"
              className="topbar-icon-btn topbar-mobile-search-btn"
              onClick={() => {
                setPaletteOpen(true);
                setPaletteQuery("");
                setSelectedIndex(0);
              }}
              aria-label="Search modules"
              title="Search modules"
            >
              <i className="bi bi-search" aria-hidden="true" />
            </button>

            {/* Quick Clock in / Clock out shortcut */}
            <Link
              id="quick-clock-btn"
              to="/EmployeeClock"
              className="quick-clock-btn"
              title="Attendance & Time Clock"
            >
              <i className="bi bi-clock-history" aria-hidden="true" />
              <span>Clock In/Out</span>
            </Link>

            {/* Notifications Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                id="notifications-dropdown-toggle"
                as="button"
                className="topbar-icon-btn"
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <i className="bi bi-bell" aria-hidden="true" />
                {unreadCount > 0 && <span className="notif-badge-dot" />}
              </Dropdown.Toggle>

              <Dropdown.Menu className="notifications-dropdown-menu">
                <div className="notif-dropdown-header">
                  <div className="notif-header-title">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notif-unread-pill">{unreadCount} New</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-mark-read-btn"
                      onClick={markAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <ul className="notif-items-list">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`notif-item ${!notif.isRead ? "unread" : ""}`}
                      onClick={() => {
                        if (notif.link) navigate(notif.link);
                      }}
                    >
                      <div
                        className="notif-icon-box"
                        style={{ background: notif.iconBg, color: notif.iconColor }}
                      >
                        <i className={`bi ${notif.icon}`} aria-hidden="true" />
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-desc">{notif.description}</div>
                        <div className="notif-time">{notif.time}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="notif-dropdown-footer">
                  <Link to="/HelpdeskDashboard" className="notif-footer-link">
                    View Helpdesk & Activity Logs
                  </Link>
                </div>
              </Dropdown.Menu>
            </Dropdown>

            {/* Dark / Light Mode Toggle */}
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="theme-toggle-tt">
                  {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </Tooltip>
              }
            >
              <button
                id="theme-toggle-btn"
                type="button"
                className="topbar-icon-btn"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <i
                  className={`bi ${isDarkMode ? "bi-sun-fill" : "bi-moon-stars-fill"}`}
                  aria-hidden="true"
                />
              </button>
            </OverlayTrigger>

            {/* User Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                id="user-profile-dropdown-toggle"
                as="button"
                className="topbar-avatar-btn"
                aria-label="User account menu"
              >
                <div className="user-avatar-pill">
                  {avatarUrl && !avatarImgError ? (
                    <img
                      src={avatarUrl}
                      alt={resolvedDisplayName}
                      className="user-avatar-img"
                      onError={() => setAvatarImgError(true)}
                    />
                  ) : (
                    <span className="user-avatar-initials">
                      {getInitials(resolvedDisplayName)}
                    </span>
                  )}
                  <span className="user-avatar-status" aria-hidden="true" />
                </div>
                <span className="user-avatar-name" title={resolvedDisplayName}>
                  {resolvedDisplayName}
                </span>
                <i className="bi bi-chevron-down user-avatar-chevron" aria-hidden="true" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-dropdown-menu">
                <div className="profile-card-header">
                  <div className="profile-card-avatar">
                    {avatarUrl && !avatarImgError ? (
                      <img
                        src={avatarUrl}
                        alt={resolvedDisplayName}
                        className="profile-card-img"
                        onError={() => setAvatarImgError(true)}
                      />
                    ) : (
                      <span>{getInitials(resolvedDisplayName)}</span>
                    )}
                  </div>
                  <div className="profile-card-details">
                    <div className="profile-card-name" title={resolvedDisplayName}>
                      {resolvedDisplayName}
                    </div>
                    <div className="profile-card-email" title={resolvedEmail}>
                      {resolvedEmail}
                    </div>
                    <span className="profile-card-role-badge">
                      {primaryRole}
                    </span>
                  </div>
                </div>

                {hasEmployeeRole && (
                  <Dropdown.Item onClick={() => navigate("/MyProfile")}>
                    <i className="bi bi-person-circle" aria-hidden="true" />
                    <span>My Profile</span>
                  </Dropdown.Item>
                )}

                <Dropdown.Item onClick={() => navigate("/career-personal")}>
                  <i className="bi bi-person-badge" aria-hidden="true" />
                  <span>Career & Personal</span>
                </Dropdown.Item>

                <Dropdown.Item onClick={() => navigate("/EmployeeClock")}>
                  <i className="bi bi-alarm" aria-hidden="true" />
                  <span>Attendance Clock</span>
                </Dropdown.Item>

                <Dropdown.Item onClick={() => navigate("/ChangePassword")}>
                  <i className="bi bi-shield-lock" aria-hidden="true" />
                  <span>Change Password</span>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  className="logout-action"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                  <span>Sign Out</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main id="dashboard-content" className="dashboard-content">
          <ErrorBoundary moduleName="DashboardViewport">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Command Palette Modal Dialog */}
      {paletteOpen && (
        <div
          className="command-palette-backdrop"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="command-palette-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Universal Search and Quick Actions"
          >
            <div className="command-palette-input-wrap">
              <i className="bi bi-search palette-search-icon" aria-hidden="true" />
              <input
                ref={paletteInputRef}
                type="text"
                className="palette-input"
                placeholder="Type to search pages, employees, modules..."
                value={paletteQuery}
                onChange={(e) => {
                  setPaletteQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handlePaletteKeyDown}
                aria-label="Command search input"
              />
              <span className="palette-esc-badge">ESC</span>
            </div>

            <div className="command-palette-body">
              <div className="palette-section-title">
                {paletteQuery.trim() ? "Search Results" : "Quick Actions & Navigation"}
              </div>

              {paletteResults.length === 0 ? (
                <div className="text-center py-4 text-muted" style={{ fontSize: "0.875rem" }}>
                  <i className="bi bi-search d-block fs-3 mb-2 opacity-50" />
                  No pages or actions matching "{paletteQuery}"
                </div>
              ) : (
                paletteResults.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={`${item.path}-${index}`}
                      type="button"
                      className={`palette-item ${isSelected ? "selected" : ""}`}
                      onClick={() => selectPaletteItem(item.path)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="palette-item-left">
                        <span className="palette-item-icon">
                          <i className={`bi ${item.icon}`} aria-hidden="true" />
                        </span>
                        <div>
                          <div className="palette-item-name">{item.label}</div>
                          <div className="palette-item-path">{item.path}</div>
                        </div>
                      </div>
                      <span className="badge bg-light text-secondary border">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="command-palette-footer">
              <div className="palette-footer-hint">
                <kbd>↑</kbd> <kbd>↓</kbd> <span>Navigate</span>
              </div>
              <div className="palette-footer-hint">
                <kbd>↵</kbd> <span>Select</span>
              </div>
              <div className="palette-footer-hint">
                <kbd>ESC</kbd> <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
