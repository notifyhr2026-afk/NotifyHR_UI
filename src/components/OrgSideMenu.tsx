import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { GetByUserIDAsync } from "../services/menuService";
import NikuHRLogo from "./landing/NikuHRLogo";
import "../css/OrgSideMenu.css";

export interface MenuItem {
  menuID: number;
  parentMenuID?: number | null;
  menuName: string;
  menuKey: string;
  menuIcon: string;
  menuOrder: number;
  routeUrl: string | null;
  isActive: boolean;
  featureID: number | null;
  featureName?: string | null;
  featureIcon?: string | null;
  subMenu?: MenuItem[];
}

interface SideMenuProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onToggle?: () => void;
}

// Enterprise section groupings
const SECTION_MAPPING: Record<string, string> = {
  Dashboard: "MAIN",
  Employees: "PEOPLE & TALENT",
  Recruitment: "PEOPLE & TALENT",
  Performance: "PEOPLE & TALENT",
  Attendance: "TIME & ATTENDANCE",
  Leave: "TIME & ATTENDANCE",
  Shift: "TIME & ATTENDANCE",
  Timesheet: "TIME & ATTENDANCE",
  Payroll: "PAYROLL & TAX",
  Helpdesk: "HELPDESK & REPORTS",
  Reports: "HELPDESK & REPORTS",
  Organization: "ORGANIZATION & ACCESS",
  Features: "ORGANIZATION & ACCESS",
};

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    menuID: 100,
    menuName: "Dashboard",
    menuKey: "dashboard",
    menuIcon: "bi-speedometer2",
    menuOrder: 1,
    routeUrl: "/dashboard",
    isActive: true,
    featureID: null,
    subMenu: [],
  },
  {
    menuID: 200,
    menuName: "Employees",
    menuKey: "employees",
    menuIcon: "bi-people",
    menuOrder: 2,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 201,
        menuName: "Employee List",
        menuKey: "emp-list",
        menuIcon: "bi-person-lines-fill",
        menuOrder: 1,
        routeUrl: "/EmployeeList",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 202,
        menuName: "Career & Personal",
        menuKey: "career-personal",
        menuIcon: "bi-person-badge",
        menuOrder: 2,
        routeUrl: "/career-personal",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 203,
        menuName: "Employee Groups",
        menuKey: "emp-groups",
        menuIcon: "bi-collection",
        menuOrder: 3,
        routeUrl: "/EmployeeGroups",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 204,
        menuName: "Org Hierarchy",
        menuKey: "org-hierarchy",
        menuIcon: "bi-diagram-3",
        menuOrder: 4,
        routeUrl: "/ManageOrgHierarchy",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 205,
        menuName: "Employee Tree",
        menuKey: "employee-tree",
        menuIcon: "bi-diagram-2",
        menuOrder: 5,
        routeUrl: "/employee-tree",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 300,
    menuName: "Attendance",
    menuKey: "attendance",
    menuIcon: "bi-calendar-check",
    menuOrder: 3,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 301,
        menuName: "Attendance Calendar",
        menuKey: "att-calendar",
        menuIcon: "bi-calendar3",
        menuOrder: 1,
        routeUrl: "/AttendanceCalendar",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 302,
        menuName: "Attendance Logs",
        menuKey: "att-logs",
        menuIcon: "bi-clock-history",
        menuOrder: 2,
        routeUrl: "/EmployeeAttendanceLogs",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 303,
        menuName: "Clock In/Out",
        menuKey: "att-clock",
        menuIcon: "bi-alarm",
        menuOrder: 3,
        routeUrl: "/EmployeeClock",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 304,
        menuName: "Attendance Settings",
        menuKey: "att-settings",
        menuIcon: "bi-gear",
        menuOrder: 4,
        routeUrl: "/AttendanceSettings",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 400,
    menuName: "Leave",
    menuKey: "leave",
    menuIcon: "bi-calendar2-minus",
    menuOrder: 4,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 401,
        menuName: "Apply Leave",
        menuKey: "apply-leave",
        menuIcon: "bi-calendar-plus",
        menuOrder: 1,
        routeUrl: "/ApplyLeave",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 402,
        menuName: "Approve Leaves",
        menuKey: "approve-leaves",
        menuIcon: "bi-check2-circle",
        menuOrder: 2,
        routeUrl: "/approve-leaves",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 403,
        menuName: "Leave Policies",
        menuKey: "leave-policies",
        menuIcon: "bi-shield-check",
        menuOrder: 3,
        routeUrl: "/LeavePolicies",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 404,
        menuName: "Leave Report",
        menuKey: "leave-report",
        menuIcon: "bi-journal-bookmark",
        menuOrder: 4,
        routeUrl: "/LeaveBalanceReport",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 500,
    menuName: "Payroll",
    menuKey: "payroll",
    menuIcon: "bi-cash-coin",
    menuOrder: 5,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 501,
        menuName: "Employee Payslip",
        menuKey: "payslip",
        menuIcon: "bi-file-earmark-text",
        menuOrder: 1,
        routeUrl: "/EmployeePayslip",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 502,
        menuName: "Salary Assignment",
        menuKey: "salary-assign",
        menuIcon: "bi-cash",
        menuOrder: 2,
        routeUrl: "/EmployeeSalaryAssignment",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 503,
        menuName: "Salary Structures",
        menuKey: "salary-structures",
        menuIcon: "bi-layers",
        menuOrder: 3,
        routeUrl: "/SalaryStructureMaster",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 504,
        menuName: "Payroll Cycle",
        menuKey: "payroll-cycle",
        menuIcon: "bi-arrow-repeat",
        menuOrder: 4,
        routeUrl: "/OrgPayrollCyclePage",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 505,
        menuName: "Tax Declaration",
        menuKey: "tax-declaration",
        menuIcon: "bi-receipt",
        menuOrder: 5,
        routeUrl: "/EmployeeTaxDeclaration",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 600,
    menuName: "Shift",
    menuKey: "shift",
    menuIcon: "bi-calendar-range",
    menuOrder: 6,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 601,
        menuName: "Manage Shifts",
        menuKey: "manage-shifts",
        menuIcon: "bi-clock",
        menuOrder: 1,
        routeUrl: "/ShiftManagement",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 602,
        menuName: "Shift Patterns",
        menuKey: "shift-patterns",
        menuIcon: "bi-grid-3x3",
        menuOrder: 2,
        routeUrl: "/Shiftpatterns",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 603,
        menuName: "Assign Shifts",
        menuKey: "assign-shifts",
        menuIcon: "bi-person-plus",
        menuOrder: 3,
        routeUrl: "/assignshifts",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 700,
    menuName: "Helpdesk",
    menuKey: "helpdesk",
    menuIcon: "bi-headset",
    menuOrder: 7,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 701,
        menuName: "Tickets Dashboard",
        menuKey: "tickets-dashboard",
        menuIcon: "bi-ticket-detailed",
        menuOrder: 1,
        routeUrl: "/HelpdeskDashboard",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 702,
        menuName: "My Tickets",
        menuKey: "my-tickets",
        menuIcon: "bi-ticket-perforated",
        menuOrder: 2,
        routeUrl: "/EmployeeTickets",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 703,
        menuName: "Assign Tickets",
        menuKey: "assign-tickets",
        menuIcon: "bi-person-check",
        menuOrder: 3,
        routeUrl: "/AssignTicketsPage",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 800,
    menuName: "Recruitment",
    menuKey: "recruitment",
    menuIcon: "bi-briefcase",
    menuOrder: 8,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 801,
        menuName: "Candidates",
        menuKey: "candidates",
        menuIcon: "bi-person-lines-fill",
        menuOrder: 1,
        routeUrl: "/CandidateList",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 802,
        menuName: "Job Requisitions",
        menuKey: "job-req",
        menuIcon: "bi-file-earmark-person",
        menuOrder: 2,
        routeUrl: "/JobRequisition",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 803,
        menuName: "Requisition Approvals",
        menuKey: "req-approvals",
        menuIcon: "bi-clipboard-check",
        menuOrder: 3,
        routeUrl: "/JobRequisitionApprovals",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 804,
        menuName: "Onboarding",
        menuKey: "onboarding",
        menuIcon: "bi-person-check-fill",
        menuOrder: 4,
        routeUrl: "/OnboardProcess",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 900,
    menuName: "Performance",
    menuKey: "performance",
    menuIcon: "bi-graph-up-arrow",
    menuOrder: 9,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 901,
        menuName: "Self Review",
        menuKey: "self-review",
        menuIcon: "bi-pencil-square",
        menuOrder: 1,
        routeUrl: "/EmployeeSelfReview",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 902,
        menuName: "Reviews",
        menuKey: "reviews",
        menuIcon: "bi-bar-chart",
        menuOrder: 2,
        routeUrl: "/EmployeePerformanceReview",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 903,
        menuName: "Review Cycles",
        menuKey: "cycles",
        menuIcon: "bi-arrow-clockwise",
        menuOrder: 3,
        routeUrl: "/ReviewCycleManagement",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 904,
        menuName: "360 Feedback",
        menuKey: "feedback-360",
        menuIcon: "bi-chat-heart",
        menuOrder: 4,
        routeUrl: "/Feedback360Page",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 1000,
    menuName: "Timesheet",
    menuKey: "timesheet",
    menuIcon: "bi-hourglass-split",
    menuOrder: 10,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 1001,
        menuName: "Timesheet Entry",
        menuKey: "ts-entry",
        menuIcon: "bi-calendar-date",
        menuOrder: 1,
        routeUrl: "/TimesheetEntry",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1002,
        menuName: "Timesheet Approval",
        menuKey: "ts-approval",
        menuIcon: "bi-check-all",
        menuOrder: 2,
        routeUrl: "/TimesheetApproval",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1003,
        menuName: "Verify Tasks",
        menuKey: "ts-verify",
        menuIcon: "bi-card-checklist",
        menuOrder: 3,
        routeUrl: "/VerifyEmployeeTasks",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 1100,
    menuName: "Reports",
    menuKey: "reports",
    menuIcon: "bi-bar-chart-line",
    menuOrder: 11,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 1101,
        menuName: "Reports Dashboard",
        menuKey: "rep-dashboard",
        menuIcon: "bi-grid-1x2",
        menuOrder: 1,
        routeUrl: "/ReportsDashboard",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1102,
        menuName: "Employee Directory",
        menuKey: "rep-emp-dir",
        menuIcon: "bi-file-person",
        menuOrder: 2,
        routeUrl: "/EmployeeDirectoryReport",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1103,
        menuName: "Attendance Register",
        menuKey: "rep-attendance",
        menuIcon: "bi-calendar4-week",
        menuOrder: 3,
        routeUrl: "/AttendanceRegisterReport",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1104,
        menuName: "Salary Register",
        menuKey: "rep-salary",
        menuIcon: "bi-cash-stack",
        menuOrder: 4,
        routeUrl: "/SalaryRegisterReport",
        isActive: true,
        featureID: null,
      },
    ],
  },
  {
    menuID: 1200,
    menuName: "Organization",
    menuKey: "organization",
    menuIcon: "bi-buildings",
    menuOrder: 12,
    routeUrl: null,
    isActive: true,
    featureID: null,
    subMenu: [
      {
        menuID: 1201,
        menuName: "Manage Org",
        menuKey: "org-manage",
        menuIcon: "bi-building",
        menuOrder: 1,
        routeUrl: "/Organization",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1202,
        menuName: "Branches",
        menuKey: "branches",
        menuIcon: "bi-geo-alt",
        menuOrder: 2,
        routeUrl: "/Branches",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1203,
        menuName: "Departments",
        menuKey: "departments",
        menuIcon: "bi-diagram-2",
        menuOrder: 3,
        routeUrl: "/Departments",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1204,
        menuName: "Manage Roles",
        menuKey: "roles",
        menuIcon: "bi-shield-lock",
        menuOrder: 4,
        routeUrl: "/ManageRoles",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1205,
        menuName: "Users",
        menuKey: "users",
        menuIcon: "bi-people-fill",
        menuOrder: 5,
        routeUrl: "/Users",
        isActive: true,
        featureID: null,
      },
      {
        menuID: 1206,
        menuName: "Plans",
        menuKey: "plans",
        menuIcon: "bi-stars",
        menuOrder: 6,
        routeUrl: "/plans",
        isActive: true,
        featureID: null,
      },
    ],
  },
];

const getMenuSection = (name: string): string => {
  for (const [key, label] of Object.entries(SECTION_MAPPING)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return label;
  }
  return "WORKSPACE";
};

const normalizeRoute = (url?: string | null): string => {
  if (!url || url === "#") return "";
  return url.startsWith("/") ? url : `/${url}`;
};

const buildFeatureMenu = (items: MenuItem[]): MenuItem[] => {
  const featureMap = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];

  items.forEach((item) => {
    if (item.featureID == null) {
      roots.push({
        ...item,
        subMenu: item.subMenu || [],
      });
      return;
    }

    if (!featureMap.has(item.featureID)) {
      featureMap.set(item.featureID, {
        menuID: -item.featureID,
        menuName: item.featureName || "Feature",
        menuKey: `feature-${item.featureID}`,
        menuIcon: item.menuIcon,
        menuOrder: 0,
        routeUrl: null,
        isActive: true,
        featureID: item.featureID,
        featureIcon: item.featureIcon,
        subMenu: [],
      });
      roots.push(featureMap.get(item.featureID)!);
    }

    featureMap.get(item.featureID)?.subMenu?.push(item);
  });

  return roots;
};

const OrgSideMenu: React.FC<SideMenuProps> = ({ isOpen, isDarkMode, onToggle }) => {
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ top: number } | null>(null);
  const [sidebarFilter, setSidebarFilter] = useState<string>("");

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user?.userID;

  const isRouteActive = (targetUrl?: string | null): boolean => {
    if (!targetUrl || targetUrl === "#") return false;
    const current = normalizeRoute(location.pathname).toLowerCase();
    const target = normalizeRoute(targetUrl).toLowerCase();
    return current === target || current.startsWith(`${target}/`);
  };

  useEffect(() => {
    if (isOpen) {
      setHoverIndex(null);
      setHoverCoords(null);
    } else {
      setOpenIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userID) {
        setMenu(DEFAULT_MENU_ITEMS);
        return;
      }
      try {
        const data: MenuItem[] = await GetByUserIDAsync(userID);
        if (data && data.length > 0) {
          const built = buildFeatureMenu(data);
          setMenu(built.length > 0 ? built : DEFAULT_MENU_ITEMS);
        } else {
          setMenu(DEFAULT_MENU_ITEMS);
        }
      } catch {
        setMenu(DEFAULT_MENU_ITEMS);
      }
    };
    fetchMenu();
  }, [userID]);

  // Keep active route's parent submenu open
  useEffect(() => {
    if (isOpen && menu.length > 0) {
      const activeIdx = menu.findIndex(
        (item) =>
          isRouteActive(item.routeUrl) ||
          Boolean(item.subMenu?.some((s) => isRouteActive(s.routeUrl)))
      );
      if (activeIdx !== -1) {
        setOpenIndex(activeIdx);
      }
    }
  }, [location.pathname, menu, isOpen]);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const toggleSubMenu = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Filtered menu when user types in the sidebar filter
  const displayedMenu = useMemo(() => {
    const query = sidebarFilter.trim().toLowerCase();
    if (!query) return menu;

    return menu
      .map((item) => {
        const itemMatches = item.menuName.toLowerCase().includes(query);
        const matchingSub = item.subMenu?.filter((sub) =>
          sub.menuName.toLowerCase().includes(query)
        );

        if (itemMatches || (matchingSub && matchingSub.length > 0)) {
          return {
            ...item,
            subMenu: matchingSub && matchingSub.length > 0 ? matchingSub : item.subMenu,
          };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[];
  }, [menu, sidebarFilter]);

  return (
    <nav
      ref={sidebarRef}
      className={`org-sidebar ${isOpen ? "expanded" : "collapsed"}`}
      aria-label="Main navigation"
    >
      {/* 1. SIDEBAR BRAND / LOGO */}
      <div className="sidebar-logo">
        <Link to="/dashboard" className="logo-link" aria-label="Go to dashboard">
          <NikuHRLogo
            variant={isDarkMode ? "dark" : "default"}
            showWordmark={isOpen}
          />
        </Link>
        {isOpen && onToggle && (
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* 2. IN-SIDEBAR QUICK FILTER (EXPANDED ONLY) */}
      {isOpen && (
        <div className="sidebar-search-box">
          <div className="sidebar-search-wrapper">
            <i className="bi bi-search sidebar-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Quick find module..."
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              aria-label="Filter sidebar navigation"
            />
            {sidebarFilter && (
              <button
                type="button"
                className="sidebar-search-clear"
                onClick={() => setSidebarFilter("")}
                aria-label="Clear filter"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SCROLLABLE NAVIGATION LIST */}
      <div className="sidebar-menu scrollable-menu">
        {displayedMenu.length === 0 ? (
          <div className="text-center py-4 px-2 text-muted" style={{ fontSize: "0.8125rem" }}>
            <i className="bi bi-search d-block fs-4 mb-2 opacity-50" />
            No modules match "{sidebarFilter}"
          </div>
        ) : (
          <ul className="menu-list">
            {displayedMenu.map((item, idx) => {
              const hasSub = item.subMenu && item.subMenu.length > 0;
              const isSubActive = Boolean(item.subMenu?.some((s) => isRouteActive(s.routeUrl)));
              const isActive = isRouteActive(item.routeUrl) || isSubActive;
              const isAccordionOpen = sidebarFilter.trim() ? true : openIndex === idx;

              // Compute enterprise section grouping label
              const currentSection = getMenuSection(item.menuName);
              const prevSection =
                idx > 0 ? getMenuSection(displayedMenu[idx - 1].menuName) : "";
              const showSectionLabel =
                isOpen &&
                !sidebarFilter.trim() &&
                currentSection &&
                currentSection !== prevSection;

              const menuIcon = item.featureIcon || item.menuIcon;

              return (
                <React.Fragment key={item.menuID || item.menuKey}>
                  {showSectionLabel && (
                    <li className="menu-section-label">
                      <span>{currentSection}</span>
                    </li>
                  )}

                  <li
                    className="menu-wrapper"
                    onMouseEnter={(e) => {
                      if (!isOpen && hasSub) {
                        clearHoverTimer();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setHoverCoords({ top: Math.max(10, Math.min(rect.top, window.innerHeight - 300)) });
                        setHoverIndex(idx);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isOpen) {
                        clearHoverTimer();
                        hoverTimerRef.current = setTimeout(() => {
                          setHoverIndex(null);
                          setHoverCoords(null);
                        }, 220);
                      }
                    }}
                  >
                    {hasSub ? (
                      <button
                        type="button"
                        className={`menu-item ${isActive ? "active" : ""}`}
                        onClick={() => toggleSubMenu(idx)}
                        aria-expanded={isAccordionOpen}
                      >
                        <span className="menu-icon-wrap" aria-hidden="true">
                          <i className={`bi ${menuIcon} menu-icon`} />
                        </span>
                        {isOpen && <span className="menu-label">{item.menuName}</span>}
                        {isOpen && (
                          <i
                            className={`bi bi-chevron-down submenu-arrow ${
                              isAccordionOpen ? "open" : ""
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : !isOpen ? (
                      <OverlayTrigger
                        placement="right"
                        overlay={
                          <Tooltip id={`tooltip-${item.menuKey}`}>{item.menuName}</Tooltip>
                        }
                      >
                        <Link
                          to={item.routeUrl ? normalizeRoute(item.routeUrl) : "#"}
                          className={`menu-item ${isActive ? "active" : ""}`}
                        >
                          <span className="menu-icon-wrap" aria-hidden="true">
                            <i className={`bi ${menuIcon} menu-icon`} />
                          </span>
                        </Link>
                      </OverlayTrigger>
                    ) : (
                      <Link
                        to={item.routeUrl ? normalizeRoute(item.routeUrl) : "#"}
                        className={`menu-item ${isActive ? "active" : ""}`}
                      >
                        <span className="menu-icon-wrap" aria-hidden="true">
                          <i className={`bi ${menuIcon} menu-icon`} />
                        </span>
                        <span className="menu-label">{item.menuName}</span>
                      </Link>
                    )}

                    {/* Expanded Accordion Submenu */}
                    {isOpen && hasSub && isAccordionOpen && (
                      <ul className="submenu">
                        {item.subMenu!.map((sub) => (
                          <li key={sub.menuID || sub.menuKey}>
                            <Link
                              to={sub.routeUrl ? normalizeRoute(sub.routeUrl) : "#"}
                              className={`submenu-link ${
                                isRouteActive(sub.routeUrl) ? "active" : ""
                              }`}
                            >
                              <i className={`bi ${sub.menuIcon}`} aria-hidden="true" />
                              <span>{sub.menuName}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Collapsed Flyout Floating Menu */}
                    {!isOpen && hasSub && hoverIndex === idx && hoverCoords && (
                      <ul
                        className="hover-menu"
                        style={{ top: `${hoverCoords.top}px` }}
                        onMouseEnter={clearHoverTimer}
                        onMouseLeave={() => {
                          setHoverIndex(null);
                          setHoverCoords(null);
                        }}
                      >
                        <li className="hover-menu-title">
                          <i className={`bi ${menuIcon}`} aria-hidden="true" />
                          <span>{item.menuName}</span>
                        </li>
                        {item.subMenu?.map((sub) => (
                          <li key={sub.menuID || sub.menuKey}>
                            <Link
                              to={sub.routeUrl ? normalizeRoute(sub.routeUrl) : "#"}
                              className={`hover-link ${
                                isRouteActive(sub.routeUrl) ? "active" : ""
                              }`}
                              onClick={() => {
                                setHoverIndex(null);
                                setHoverCoords(null);
                              }}
                            >
                              <i className={`bi ${sub.menuIcon}`} aria-hidden="true" />
                              <span>{sub.menuName}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </div>

      {/* 4. PINNED SIDEBAR FOOTER (COLLAPSE TOGGLE & STATUS) */}
      <div className="sidebar-footer">
        {onToggle ? (
          !isOpen ? (
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="sidebar-toggle-tt">Expand Sidebar</Tooltip>
              }
            >
              <button
                type="button"
                className="sidebar-collapse-btn"
                onClick={onToggle}
                aria-label="Expand sidebar"
              >
                <i className="bi bi-layout-sidebar" aria-hidden="true" />
              </button>
            </OverlayTrigger>
          ) : (
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <i className="bi bi-layout-sidebar-inset" aria-hidden="true" />
              <span>Collapse Sidebar</span>
            </button>
          )
        ) : (
          isOpen && (
            <div className="sidebar-footer-info">
              <span className="status-dot-pulse" aria-hidden="true" />
              <span>Niku HR Enterprise v2.4</span>
            </div>
          )
        )}
      </div>
    </nav>
  );
};

export default OrgSideMenu;
