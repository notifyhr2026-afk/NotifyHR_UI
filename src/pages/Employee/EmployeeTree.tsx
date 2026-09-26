import React, { useEffect, useState, useMemo, useRef } from "react";
import { Container, Spinner, Badge, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import {
  Diagram3,
  Grid3x3Gap,
  Table,
  Search,
  ArrowRepeat,
  Download,
  PersonBadge,
  People,
  Building,
  GeoAlt,
  Telephone,
  Envelope,
  CalendarEvent,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ArrowsAngleContract,
  ArrowsAngleExpand,
  CheckCircleFill,
  XCircleFill,
  ShieldCheck,
  Briefcase,
  Eye,
  Clipboard,
  ClipboardCheck,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import employeeService from "../../services/employeeService";
import "../../css/EmployeeTree.css";

// ---------------------- Interfaces ----------------------

export interface EmployeeRecord {
  TotalRecords: number;
  EmployeeID: number;
  EmployeeCode: string;
  EmployeeName: string;
  Gender: string;
  MaritalStatus: string;
  DateOfJoining: string;
  PersonalPhone: string;
  PersonalEmail: string;
  EffectiveFrom: string;
  EffectiveTo: string | null;
  IsCurrent: boolean;
  EmploymentTypeName: string;
  PositionTitle: string;
  DepartmentName: string;
  DivisionName: string;
  BranchName: string;
  ReportingManagerCode: string;
  ReportingManagerName: string;
}

export interface HierarchyNode {
  employee: EmployeeRecord;
  children: HierarchyNode[];
  isExpanded: boolean;
}

type ViewMode = "tree" | "grid" | "table";

// Helper to get initials
const getInitials = (name: string): string => {
  if (!name) return "EMP";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

// Helper to format date
const formatDate = (date?: string | null): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
};

// Helper to calculate tenure
const calculateTenure = (doj?: string | null): string => {
  if (!doj) return "-";
  try {
    const start = new Date(doj);
    const now = new Date();
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (diffMonths <= 0) return "New Joiner";
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (years === 0) return `${months} mo${months > 1 ? "s" : ""}`;
    if (months === 0) return `${years} yr${years > 1 ? "s" : ""}`;
    return `${years} yr${years > 1 ? "s" : ""} ${months} mo${months > 1 ? "s" : ""}`;
  } catch {
    return "-";
  }
};

// ---------------------- Component ----------------------

const EmployeeTree: React.FC = () => {
  const [data, setData] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("ALL");

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalRecords, setTotalRecords] = useState(0);

  // Tree Controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [collapsedNodeCodes, setCollapsedNodeCodes] = useState<Set<string>>(new Set());

  // Detail Modal
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;

  // ---------------------- API Call ----------------------

  const loadEmployees = async () => {
    if (!organizationID) return;

    setLoading(true);

    try {
      // In Tree view, fetch more records (up to 100) so reporting relationships link cleanly
      const effectivePageSize = viewMode === "tree" ? 100 : pageSize;

      const payload = {
        organizationID,
        pageNumber: viewMode === "tree" ? 1 : pageNumber,
        pageSize: effectivePageSize,
        employeeName: search,
      };

      const res = await employeeService.GetEmployeeTreeAsync(payload);

      setData(res || []);
      setTotalRecords(res?.[0]?.TotalRecords || (res?.length ?? 0));
    } catch (err) {
      console.error("Error loading employees", err);
      toast.error("Failed to load employee directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [pageNumber, pageSize, viewMode]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPageNumber(1);
      loadEmployees();
    }, 350);

    return () => clearTimeout(delay);
  }, [search]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEmployees();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.info("Employee records updated");
    }, 600);
  };

  // ---------------------- Copy Helper ----------------------

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // ---------------------- Filter Calculations ----------------------

  const departments = useMemo(() => {
    const depts = new Set<string>();
    data.forEach((emp) => {
      if (emp.DepartmentName) depts.add(emp.DepartmentName.trim());
    });
    return Array.from(depts).sort();
  }, [data]);

  const employmentTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach((emp) => {
      if (emp.EmploymentTypeName) types.add(emp.EmploymentTypeName.trim());
    });
    return Array.from(types).sort();
  }, [data]);

  const filteredEmployees = useMemo(() => {
    return data.filter((emp) => {
      const matchesSearch =
        !search.trim() ||
        emp.EmployeeName?.toLowerCase().includes(search.toLowerCase()) ||
        emp.EmployeeCode?.toLowerCase().includes(search.toLowerCase()) ||
        emp.PositionTitle?.toLowerCase().includes(search.toLowerCase()) ||
        emp.DepartmentName?.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        departmentFilter === "ALL" ||
        emp.DepartmentName?.trim().toLowerCase() === departmentFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && emp.IsCurrent) ||
        (statusFilter === "INACTIVE" && !emp.IsCurrent);

      const matchesType =
        employmentTypeFilter === "ALL" ||
        emp.EmploymentTypeName?.trim().toLowerCase() === employmentTypeFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus && matchesType;
    });
  }, [data, search, departmentFilter, statusFilter, employmentTypeFilter]);

  // ---------------------- Top KPI Metrics ----------------------

  const kpis = useMemo(() => {
    const totalCount = totalRecords || data.length;
    const activeCount = data.filter((e) => e.IsCurrent).length;
    const managerCount = new Set(
      data.map((e) => e.ReportingManagerCode).filter(Boolean)
    ).size;
    const deptCount = departments.length;

    return {
      total: totalCount,
      active: activeCount,
      managers: managerCount,
      departments: deptCount,
    };
  }, [data, totalRecords, departments]);

  // ---------------------- Hierarchy Tree Construction ----------------------

  const { treeRoots, directReportsMap } = useMemo(() => {
    const reportsMap = new Map<string, EmployeeRecord[]>();
    const codeMap = new Map<string, EmployeeRecord>();

    data.forEach((emp) => {
      if (emp.EmployeeCode) {
        codeMap.set(emp.EmployeeCode.trim().toUpperCase(), emp);
      }
    });

    data.forEach((emp) => {
      const managerCode = emp.ReportingManagerCode?.trim().toUpperCase();
      if (managerCode) {
        if (!reportsMap.has(managerCode)) {
          reportsMap.set(managerCode, []);
        }
        reportsMap.get(managerCode)!.push(emp);
      }
    });

    // Build recursive tree nodes
    const visited = new Set<string>();

    const buildNode = (emp: EmployeeRecord): HierarchyNode => {
      const empCode = emp.EmployeeCode.trim().toUpperCase();
      visited.add(empCode);
      const childEmps = reportsMap.get(empCode) || [];
      const children = childEmps
        .filter((child) => !visited.has(child.EmployeeCode.trim().toUpperCase()))
        .map(buildNode);

      return {
        employee: emp,
        children,
        isExpanded: !collapsedNodeCodes.has(emp.EmployeeCode),
      };
    };

    // Find roots: employees without a reporting manager, or whose manager is not in data
    const roots: HierarchyNode[] = [];

    data.forEach((emp) => {
      const managerCode = emp.ReportingManagerCode?.trim().toUpperCase();
      const empCode = emp.EmployeeCode?.trim().toUpperCase();

      const isRoot =
        !managerCode ||
        managerCode === empCode ||
        !codeMap.has(managerCode);

      if (isRoot && !visited.has(empCode)) {
        roots.push(buildNode(emp));
      }
    });

    // If still no roots found, use the first 3 records as top roots
    if (roots.length === 0 && data.length > 0) {
      data.slice(0, 3).forEach((emp) => {
        roots.push(buildNode(emp));
      });
    }

    return { treeRoots: roots, directReportsMap: reportsMap };
  }, [data, collapsedNodeCodes]);

  const toggleNodeExpansion = (empCode: string) => {
    setCollapsedNodeCodes((prev) => {
      const next = new Set(prev);
      if (next.has(empCode)) {
        next.delete(empCode);
      } else {
        next.add(empCode);
      }
      return next;
    });
  };

  const expandAllNodes = () => {
    setCollapsedNodeCodes(new Set());
  };

  const collapseAllNodes = () => {
    const allCodes = new Set(data.map((d) => d.EmployeeCode));
    setCollapsedNodeCodes(allCodes);
  };

  // ---------------------- CSV Export ----------------------

  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) {
      toast.warning("No employees available to export");
      return;
    }

    const headers = [
      "Employee ID",
      "Employee Code",
      "Name",
      "Position",
      "Department",
      "Division",
      "Branch",
      "Reporting Manager Code",
      "Reporting Manager Name",
      "Employment Type",
      "Date of Joining",
      "Phone",
      "Email",
      "Status",
    ];

    const rows = filteredEmployees.map((e) => [
      e.EmployeeID,
      `"${e.EmployeeCode || ""}"`,
      `"${e.EmployeeName || ""}"`,
      `"${e.PositionTitle || ""}"`,
      `"${e.DepartmentName || ""}"`,
      `"${e.DivisionName || ""}"`,
      `"${e.BranchName || ""}"`,
      `"${e.ReportingManagerCode || ""}"`,
      `"${e.ReportingManagerName || ""}"`,
      `"${e.EmploymentTypeName || ""}"`,
      `"${e.DateOfJoining || ""}"`,
      `"${e.PersonalPhone || ""}"`,
      `"${e.PersonalEmail || ""}"`,
      e.IsCurrent ? "Active" : "Inactive",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employee_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Employee records exported to CSV");
  };

  // ---------------------- Tree Node Renderer ----------------------

  const renderTreeNode = (node: HierarchyNode) => {
    const emp = node.employee;
    const directReportsCount = directReportsMap.get(emp.EmployeeCode?.trim().toUpperCase())?.length || 0;
    const hasChildren = node.children.length > 0;
    const isExpanded = !collapsedNodeCodes.has(emp.EmployeeCode);

    const isMatch =
      search.trim() &&
      (emp.EmployeeName?.toLowerCase().includes(search.toLowerCase()) ||
        emp.PositionTitle?.toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="et-tree-node-wrapper" key={emp.EmployeeID || emp.EmployeeCode}>
        {/* Node Card */}
        <div
          className={`et-node-card ${isMatch ? "highlighted" : ""} ${
            !emp.ReportingManagerCode ? "root-leader" : ""
          }`}
          onClick={() => setSelectedEmployee(emp)}
        >
          <div className="et-node-header">
            <div className="et-avatar">
              {getInitials(emp.EmployeeName)}
              {emp.IsCurrent && <span className="et-avatar-status" />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h6 className="et-node-name" title={emp.EmployeeName}>
                {emp.EmployeeName}
              </h6>
              <div className="et-node-code">{emp.EmployeeCode}</div>
            </div>
          </div>

          <div className="et-node-title" title={emp.PositionTitle}>
            {emp.PositionTitle || "Team Member"}
          </div>

          <div className="et-node-dept-badge" title={emp.DepartmentName}>
            {emp.DepartmentName || "General"}
          </div>

          <div className="et-node-footer">
            <span className="et-reports-badge">
              <People /> {directReportsCount} {directReportsCount === 1 ? "report" : "reports"}
            </span>

            {hasChildren && (
              <button
                type="button"
                className="et-toggle-expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(emp.EmployeeCode);
                }}
                title={isExpanded ? "Collapse branch" : "Expand branch"}
              >
                {isExpanded ? "− Hide" : `+ ${node.children.length}`}
              </button>
            )}
          </div>
        </div>

        {/* Child branches */}
        {hasChildren && isExpanded && (
          <div className="et-tree-children">
            {node.children.map((childNode) => (
              <div className="et-tree-node-branch" key={childNode.employee.EmployeeID || childNode.employee.EmployeeCode}>
                {renderTreeNode(childNode)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="employee-tree-page">
      <Container fluid="xl">
        {/* Page Header */}
        <div className="et-header">
          <div>
            <div className="et-breadcrumb">
              <span>Organization</span>
              <span className="et-breadcrumb-dot" />
              <span>People & Teams</span>
              <span className="et-breadcrumb-dot" />
              <span>Employee Hierarchy</span>
            </div>
            <div className="et-title-wrap">
              <div className="et-title-icon-box">
                <Diagram3 />
              </div>
              <div>
                <h1 className="et-title">Employee Tree & Directory</h1>
                <p className="et-subtitle">
                  Interactive organizational hierarchy, reporting chains, and corporate personnel directory.
                </p>
              </div>
            </div>
          </div>

          <div className="et-header-actions">
            <button
              type="button"
              className="et-btn et-btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh personnel records"
            >
              <ArrowRepeat className={isRefreshing ? "et-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="et-btn et-btn-secondary"
              onClick={handleExportCSV}
              title="Export filtered records to CSV"
            >
              <Download />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="et-kpi-grid">
          <div className="et-kpi-card">
            <div className="et-kpi-info">
              <span className="et-kpi-label">Total Workforce</span>
              <span className="et-kpi-value">{kpis.total}</span>
              <span className="et-kpi-subtext">Registered employees in org</span>
            </div>
            <div className="et-kpi-icon-wrap blue">
              <People />
            </div>
          </div>

          <div className="et-kpi-card">
            <div className="et-kpi-info">
              <span className="et-kpi-label">Active Staff</span>
              <span className="et-kpi-value">{kpis.active}</span>
              <span className="et-kpi-subtext">Currently on active payroll</span>
            </div>
            <div className="et-kpi-icon-wrap emerald">
              <CheckCircleFill />
            </div>
          </div>

          <div className="et-kpi-card">
            <div className="et-kpi-info">
              <span className="et-kpi-label">Departments</span>
              <span className="et-kpi-value">{kpis.departments}</span>
              <span className="et-kpi-subtext">Active corporate business units</span>
            </div>
            <div className="et-kpi-icon-wrap violet">
              <Building />
            </div>
          </div>

          <div className="et-kpi-card">
            <div className="et-kpi-info">
              <span className="et-kpi-label">People Managers</span>
              <span className="et-kpi-value">{kpis.managers}</span>
              <span className="et-kpi-subtext">Leading direct report teams</span>
            </div>
            <div className="et-kpi-icon-wrap amber">
              <PersonBadge />
            </div>
          </div>
        </div>

        {/* Search, Filter & View Controls Bar */}
        <div className="et-control-bar">
          {/* View Mode Switcher */}
          <div className="et-view-toggle-group">
            <button
              type="button"
              className={`et-view-toggle-btn ${viewMode === "tree" ? "active" : ""}`}
              onClick={() => setViewMode("tree")}
            >
              <Diagram3 /> Hierarchy Tree
            </button>
            <button
              type="button"
              className={`et-view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3Gap /> Bento Cards
            </button>
            <button
              type="button"
              className={`et-view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              <Table /> Matrix Table
            </button>
          </div>

          {/* Search Box */}
          <div className="et-search-wrap">
            <Search className="et-search-icon" />
            <input
              type="text"
              className="et-search-input"
              placeholder="Search by name, code, position, dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="et-filters-row">
            {/* Department Filter */}
            <select
              className="et-select-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Employment Type Filter */}
            <select
              className="et-select-filter"
              value={employmentTypeFilter}
              onChange={(e) => setEmploymentTypeFilter(e.target.value)}
            >
              <option value="ALL">All Employment Types</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="et-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="INACTIVE">Inactive / Past</option>
            </select>
          </div>
        </div>

        {/* ---------------- LOADING STATE ---------------- */}
        {loading && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
            <span className="text-muted small mt-2">Loading organizational records...</span>
          </div>
        )}

        {/* ---------------- EMPTY STATE ---------------- */}
        {!loading && filteredEmployees.length === 0 && (
          <div className="et-empty-state">
            <div className="et-empty-icon">
              <People />
            </div>
            <div className="et-empty-title">No Employees Found</div>
            <div className="et-empty-desc">
              {search || departmentFilter !== "ALL" || statusFilter !== "ALL"
                ? "No employees match your search query or selected department filters."
                : "No employee records have been uploaded or configured for this organization."}
            </div>
            <button
              type="button"
              className="et-btn et-btn-secondary"
              onClick={() => {
                setSearch("");
                setDepartmentFilter("ALL");
                setStatusFilter("ALL");
                setEmploymentTypeFilter("ALL");
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* ---------------- VIEW 1: INTERACTIVE HIERARCHY TREE ---------------- */}
        {!loading && filteredEmployees.length > 0 && viewMode === "tree" && (
          <div className="et-tree-container">
            {/* Tree Toolbar Controls */}
            <div className="et-tree-toolbar">
              <div className="et-tree-hint">
                <ShieldCheck /> Click on any employee card to inspect their direct team & reporting chain.
              </div>

              <div className="et-tree-actions">
                <button
                  type="button"
                  className="et-btn-xs"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
                  title="Zoom In"
                >
                  <ZoomIn /> Zoom In
                </button>
                <button
                  type="button"
                  className="et-btn-xs"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.65))}
                  title="Zoom Out"
                >
                  <ZoomOut /> Zoom Out
                </button>
                <button
                  type="button"
                  className="et-btn-xs"
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                >
                  100%
                </button>
                <button
                  type="button"
                  className="et-btn-xs"
                  onClick={expandAllNodes}
                  title="Expand all branches"
                >
                  <ArrowsAngleExpand /> Expand All
                </button>
                <button
                  type="button"
                  className="et-btn-xs"
                  onClick={collapseAllNodes}
                  title="Collapse all branches"
                >
                  <ArrowsAngleContract /> Collapse All
                </button>
              </div>
            </div>

            {/* Tree Canvas */}
            <div
              className="et-org-chart"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
            >
              {treeRoots.map((rootNode) => renderTreeNode(rootNode))}
            </div>
          </div>
        )}

        {/* ---------------- VIEW 2: BENTO PROFILE GRID ---------------- */}
        {!loading && filteredEmployees.length > 0 && viewMode === "grid" && (
          <div className="et-grid">
            {filteredEmployees.map((emp, index) => (
              <div className="et-card" key={`${emp.EmployeeID}-${index}`}>
                <div className="et-card-top">
                  <div className={`et-card-avatar ${!emp.IsCurrent ? "inactive" : ""}`}>
                    {getInitials(emp.EmployeeName)}
                  </div>
                  <div className="et-card-meta">
                    <div className="et-card-name-row">
                      <h5 className="et-card-name" title={emp.EmployeeName}>
                        {emp.EmployeeName}
                      </h5>
                      <span className={`et-status-pill ${emp.IsCurrent ? "active" : "inactive"}`}>
                        {emp.IsCurrent ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="et-card-role" title={emp.PositionTitle}>
                      {emp.PositionTitle || "Staff"}
                    </div>
                    <span className="et-card-dept-tag">
                      <Building size={11} /> {emp.DepartmentName || "General"}
                    </span>
                  </div>
                </div>

                {/* Details Table */}
                <div className="et-card-info-table">
                  <div className="et-info-row">
                    <span className="et-info-label">Code:</span>
                    <span className="et-info-val">{emp.EmployeeCode}</span>
                  </div>
                  <div className="et-info-row">
                    <span className="et-info-label">Division:</span>
                    <span className="et-info-val">{emp.DivisionName || "-"}</span>
                  </div>
                  <div className="et-info-row">
                    <span className="et-info-label">Branch:</span>
                    <span className="et-info-val">{emp.BranchName || "-"}</span>
                  </div>
                  <div className="et-info-row">
                    <span className="et-info-label">Employment:</span>
                    <span className="et-info-val">{emp.EmploymentTypeName || "-"}</span>
                  </div>
                  <div className="et-info-row">
                    <span className="et-info-label">Joined:</span>
                    <span className="et-info-val">{formatDate(emp.DateOfJoining)}</span>
                  </div>
                </div>

                {/* Manager Info */}
                <div className="et-card-manager-box">
                  <span className="et-manager-label">
                    <PersonBadge /> Manager:
                  </span>
                  <span className="et-manager-name" title={emp.ReportingManagerName || "No Manager"}>
                    {emp.ReportingManagerName || <span className="text-muted italic">Self / Executive</span>}
                  </span>
                </div>

                {/* Card Footer Actions */}
                <div className="et-card-footer">
                  <div className="et-contact-actions">
                    {emp.PersonalEmail ? (
                      <OverlayTrigger placement="top" overlay={<Tooltip>Email {emp.PersonalEmail}</Tooltip>}>
                        <a href={`mailto:${emp.PersonalEmail}`} className="et-icon-btn">
                          <Envelope />
                        </a>
                      </OverlayTrigger>
                    ) : null}

                    {emp.PersonalPhone ? (
                      <OverlayTrigger placement="top" overlay={<Tooltip>Call {emp.PersonalPhone}</Tooltip>}>
                        <a href={`tel:${emp.PersonalPhone}`} className="et-icon-btn">
                          <Telephone />
                        </a>
                      </OverlayTrigger>
                    ) : null}

                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {copiedText === emp.EmployeeCode ? "Copied Code!" : "Copy Employee Code"}
                        </Tooltip>
                      }
                    >
                      <button
                        type="button"
                        className="et-icon-btn"
                        onClick={() => handleCopy(emp.EmployeeCode, "Employee Code")}
                      >
                        {copiedText === emp.EmployeeCode ? <ClipboardCheck className="text-success" /> : <Clipboard />}
                      </button>
                    </OverlayTrigger>
                  </div>

                  <button
                    type="button"
                    className="et-view-profile-btn"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <Eye /> Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- VIEW 3: MATRIX TABLE ---------------- */}
        {!loading && filteredEmployees.length > 0 && viewMode === "table" && (
          <div className="et-table-card">
            <div className="table-responsive">
              <table className="et-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position & Dept</th>
                    <th>Division & Branch</th>
                    <th>Reporting Manager</th>
                    <th>Employment</th>
                    <th>Joining Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr key={`${emp.EmployeeID}-${index}`}>
                      <td>
                        <div className="et-user-cell">
                          <div className="et-user-avatar-sm">
                            {getInitials(emp.EmployeeName)}
                          </div>
                          <div>
                            <div className="et-user-name">{emp.EmployeeName}</div>
                            <div className="et-user-sub">{emp.EmployeeCode}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold text-primary" style={{ fontSize: "0.85rem" }}>
                          {emp.PositionTitle || "Staff"}
                        </div>
                        <div className="text-muted small">{emp.DepartmentName || "General"}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.85rem" }}>{emp.DivisionName || "-"}</div>
                        <div className="text-muted small">{emp.BranchName || "-"}</div>
                      </td>

                      <td>
                        <div className="fw-medium" style={{ fontSize: "0.85rem" }}>
                          {emp.ReportingManagerName || "-"}
                        </div>
                        <div className="text-muted small">{emp.ReportingManagerCode || ""}</div>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {emp.EmploymentTypeName || "Full-time"}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.85rem" }}>{formatDate(emp.DateOfJoining)}</div>
                        <div className="text-muted small">{calculateTenure(emp.DateOfJoining)}</div>
                      </td>

                      <td>
                        <span className={`et-status-pill ${emp.IsCurrent ? "active" : "inactive"}`}>
                          {emp.IsCurrent ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="et-view-profile-btn"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          <Eye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- EMPLOYEE DETAIL MODAL / DRAWER ---------------- */}
        <Modal
          show={!!selectedEmployee}
          onHide={() => setSelectedEmployee(null)}
          size="lg"
          centered
          className="et-detail-modal"
        >
          {selectedEmployee && (
            <>
              <div className="et-drawer-header">
                <div className="et-drawer-avatar">
                  {getInitials(selectedEmployee.EmployeeName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h3 className="et-drawer-name">{selectedEmployee.EmployeeName}</h3>
                    <span
                      className={`et-status-pill ${
                        selectedEmployee.IsCurrent ? "active" : "inactive"
                      }`}
                    >
                      {selectedEmployee.IsCurrent ? "Active Employee" : "Inactive / Resigned"}
                    </span>
                  </div>
                  <div className="et-drawer-role">
                    {selectedEmployee.PositionTitle || "Personnel"}
                  </div>
                  <div className="et-drawer-tags">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                      Code: {selectedEmployee.EmployeeCode}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                      {selectedEmployee.DepartmentName}
                    </span>
                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                      {selectedEmployee.EmploymentTypeName}
                    </span>
                  </div>
                </div>
              </div>

              <Modal.Body className="p-4">
                {/* Employment & Location Metrics Grid */}
                <div className="et-detail-grid">
                  <div className="et-detail-box">
                    <div className="et-detail-label">Date of Joining & Tenure</div>
                    <div className="et-detail-value">
                      {formatDate(selectedEmployee.DateOfJoining)} ({calculateTenure(selectedEmployee.DateOfJoining)})
                    </div>
                  </div>

                  <div className="et-detail-box">
                    <div className="et-detail-label">Division & Branch</div>
                    <div className="et-detail-value">
                      {selectedEmployee.DivisionName || "-"} / {selectedEmployee.BranchName || "-"}
                    </div>
                  </div>

                  <div className="et-detail-box">
                    <div className="et-detail-label">Personal Email</div>
                    <div className="et-detail-value d-flex align-items-center justify-content-between">
                      <span className="text-truncate">{selectedEmployee.PersonalEmail || "-"}</span>
                      {selectedEmployee.PersonalEmail && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => handleCopy(selectedEmployee.PersonalEmail, "Email")}
                        >
                          <Clipboard size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="et-detail-box">
                    <div className="et-detail-label">Contact Phone</div>
                    <div className="et-detail-value d-flex align-items-center justify-content-between">
                      <span>{selectedEmployee.PersonalPhone || "-"}</span>
                      {selectedEmployee.PersonalPhone && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => handleCopy(selectedEmployee.PersonalPhone, "Phone")}
                        >
                          <Clipboard size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="et-detail-box">
                    <div className="et-detail-label">Gender & Marital Status</div>
                    <div className="et-detail-value">
                      {selectedEmployee.Gender || "-"} • {selectedEmployee.MaritalStatus || "-"}
                    </div>
                  </div>

                  <div className="et-detail-box">
                    <div className="et-detail-label">Effective Record Period</div>
                    <div className="et-detail-value">
                      {formatDate(selectedEmployee.EffectiveFrom)} →{" "}
                      {selectedEmployee.EffectiveTo ? formatDate(selectedEmployee.EffectiveTo) : "Present"}
                    </div>
                  </div>
                </div>

                {/* Reporting Line Section */}
                <div className="et-reporting-tree-card">
                  <div className="et-section-title">
                    <PersonBadge /> Reporting Line
                  </div>

                  {selectedEmployee.ReportingManagerName ? (
                    <div className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="et-user-avatar-sm">
                          {getInitials(selectedEmployee.ReportingManagerName)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{selectedEmployee.ReportingManagerName}</div>
                          <div className="text-muted small">
                            Direct Reporting Manager • Code: {selectedEmployee.ReportingManagerCode}
                          </div>
                        </div>
                      </div>
                      <span className="badge bg-primary">Reporting Manager</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-light rounded-3 border text-muted small mb-3">
                      This employee reports directly to Executive Board or has no designated manager.
                    </div>
                  )}

                  {/* Direct Team Members */}
                  <div className="et-section-title mt-3">
                    <People /> Direct Reports (
                    {directReportsMap.get(selectedEmployee.EmployeeCode?.trim().toUpperCase())?.length || 0})
                  </div>

                  {directReportsMap.has(selectedEmployee.EmployeeCode?.trim().toUpperCase()) &&
                  directReportsMap.get(selectedEmployee.EmployeeCode?.trim().toUpperCase())!.length > 0 ? (
                    <div className="et-team-list">
                      {directReportsMap
                        .get(selectedEmployee.EmployeeCode?.trim().toUpperCase())!
                        .map((teamMember) => (
                          <div
                            className="et-team-item"
                            key={teamMember.EmployeeID || teamMember.EmployeeCode}
                            onClick={() => setSelectedEmployee(teamMember)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="et-team-item-left">
                              <div className="et-user-avatar-sm" style={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                                {getInitials(teamMember.EmployeeName)}
                              </div>
                              <div>
                                <div className="fw-semibold text-dark">{teamMember.EmployeeName}</div>
                                <div className="text-muted" style={{ fontSize: "0.725rem" }}>
                                  {teamMember.PositionTitle} • {teamMember.DepartmentName}
                                </div>
                              </div>
                            </div>
                            <span className="text-primary small d-flex align-items-center gap-1">
                              View <ChevronRight size={12} />
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-muted small py-2">
                      No direct reports assigned to this employee.
                    </div>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer className="border-top-0 pt-0">
                <button
                  type="button"
                  className="et-btn et-btn-secondary"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Close Profile
                </button>
              </Modal.Footer>
            </>
          )}
        </Modal>
      </Container>
    </div>
  );
};

export default EmployeeTree;
