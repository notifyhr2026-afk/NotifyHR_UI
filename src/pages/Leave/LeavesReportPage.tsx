import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import {
  Row,
  Col,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  CalendarDate,
  CheckCircleFill,
  XCircleFill,
  HourglassSplit,
  FileEarmarkPdf,
  FileEarmarkExcel,
  Search,
  Filter,
  ArrowRepeat,
  ArrowDownUp,
  Building,
  GeoAlt,
  PersonCheck,
  CalendarRange,
} from 'react-bootstrap-icons';
import employeeService from '../../services/employeeService';
import branchService from '../../services/branchService';
import departmentService from '../../services/departmentService';
import leaveService from '../../services/leaveService';
import { generatePDF } from '../Reports/components/PDFGenerator';
import { exportExcel } from '../Reports/components/ExcelExporter';
import Swal from 'sweetalert2';
import '../../css/HrmsPages.css';

// -------------------- Types --------------------

type Option = {
  value: number;
  label: string;
};

type Leave = {
  employeeLeaveID: number;
  employeeID: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  leaveStatus: string;
};

const getInitials = (name: string): string => {
  if (!name) return 'LV';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const LeavesReportPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID = user?.organizationID || 0;

  const [branches, setBranches] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);

  // Selected filters
  const [branch, setBranch] = useState<Option | null>(null);
  const [department, setDepartment] = useState<Option | null>(null);
  const [employee, setEmployee] = useState<Option | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Search & Status filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Approved' | 'Rejected' | 'Pending'>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<keyof Leave>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Leave data
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // -------------------- Load Master Data --------------------

  const loadData = async () => {
    try {
      const [empRes, branchRes, deptRes] = await Promise.all([
        employeeService.getEmployeesByOrganizationIdAsync(organizationID),
        branchService.getBranchesAsync(organizationID),
        departmentService.getdepartmentesAsync(organizationID),
      ]);

      const empData = empRes?.Table || empRes || [];
      const branchData = branchRes?.Table || branchRes || [];
      const deptData = deptRes?.Table || deptRes || [];

      setEmployees(empData);

      setBranches(
        branchData.map((b: any) => ({
          value: b.BranchID,
          label: b.BranchName || `Branch #${b.BranchID}`,
        }))
      );

      setDepartments(
        deptData.map((d: any) => ({
          value: d.DepartmentID,
          label: d.DepartmentName || `Department #${d.DepartmentID}`,
        }))
      );
    } catch (err) {
      console.error('Load error', err);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-fetch leaves on page mount for full view
    fetchLeaves();
  }, []);

  // -------------------- Filter Employees --------------------

  useEffect(() => {
    let filtered = [...employees];

    if (branch) {
      filtered = filtered.filter((e) => e.BranchID === branch.value);
    }

    if (department) {
      filtered = filtered.filter((e) => e.DepartmentID === department.value);
    }

    setEmployeeOptions(
      filtered.map((e: any) => ({
        value: e.EmployeeID,
        label:
          e.EmployeeName ||
          `${e.FirstName || ''} ${e.LastName || ''}`.trim() ||
          `Employee #${e.EmployeeID}`,
      }))
    );

    setEmployee(null);
  }, [branch, department, employees]);

  // -------------------- Fetch Leaves --------------------

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setSearched(true);

      const data = await leaveService.GetEmployeeLeavesReportAsync(
        organizationID,
        employee?.value,
        fromDate || undefined,
        toDate || undefined
      );

      const result = data?.Table || data || [];

      setLeaves(
        result.map((l: any) => ({
          employeeLeaveID: l.EmployeeLeaveID,
          employeeID: l.EmployeeID,
          employeeName: l.EmployeeName || `Employee #${l.EmployeeID}`,
          leaveType: l.LeaveTypeName || l.LeaveType || 'General Leave',
          startDate: l.StartDate ? l.StartDate.split('T')[0] : '-',
          endDate: l.EndDate ? l.EndDate.split('T')[0] : '-',
          numberOfDays: l.NumberOfDays || 1,
          reason: l.Reason || 'Not specified',
          leaveStatus: l.LeaveStatusName || l.Status || 'Pending',
        }))
      );
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to retrieve leaves report data.',
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Approve / Reject Action --------------------

  const handleAction = async (leaveId: number, status: 'Approved' | 'Rejected') => {
    const confirm = await Swal.fire({
      title: `${status} Leave Request?`,
      text: `Are you sure you want to mark this leave application as ${status.toLowerCase()}?`,
      icon: status === 'Approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Approved' ? '#059669' : '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${status}`,
    });

    if (!confirm.isConfirmed) return;

    try {
      await leaveService.ApproveOrRejectEmployeeLeaveAsync({
        EmployeeLeaveID: leaveId,
        Status: status,
        ActionBy: user?.username || 'admin',
      });

      Swal.fire({
        icon: 'success',
        title: `Leave ${status}!`,
        text: `The application status has been updated.`,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchLeaves();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: 'Could not update leave request status.',
      });
    }
  };

  // -------------------- Computed & Sorted --------------------

  const toggleSort = (field: keyof Leave) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedLeaves = useMemo(() => {
    let result = [...leaves];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(q) ||
          l.leaveType.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q) ||
          String(l.employeeID).includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((l) => l.leaveStatus.toLowerCase() === statusFilter.toLowerCase());
    }

    result.sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      const comp = String(valA).localeCompare(String(valB));
      return sortDirection === 'asc' ? comp : -comp;
    });

    return result;
  }, [leaves, searchQuery, statusFilter, sortField, sortDirection]);

  // KPI Metrics
  const kpis = useMemo(() => {
    const total = leaves.length;
    const approved = leaves.filter((l) => l.leaveStatus.toLowerCase() === 'approved').length;
    const pending = leaves.filter((l) => l.leaveStatus.toLowerCase() === 'pending').length;
    const rejected = leaves.filter((l) => l.leaveStatus.toLowerCase() === 'rejected').length;

    const totalDays = leaves.reduce((sum, l) => sum + (Number(l.numberOfDays) || 0), 0);

    return {
      total,
      approved,
      pending,
      rejected,
      totalDays,
    };
  }, [leaves]);

  // Pagination
  const totalPages = Math.ceil(processedLeaves.length / pageSize) || 1;
  const indexOfLast = currentPage * pageSize;
  const currentLeaves = processedLeaves.slice(indexOfLast - pageSize, indexOfLast);

  // -------------------- Export Handlers --------------------

  const columns = [
    { key: 'employeeName', label: 'Employee Name' },
    { key: 'employeeID', label: 'Employee ID' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'numberOfDays', label: 'Days' },
    { key: 'leaveStatus', label: 'Status' },
    { key: 'reason', label: 'Reason' },
  ];

  const downloadPDF = () => {
    if (processedLeaves.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No leave records to export.' });
      return;
    }
    generatePDF({
      title: 'Employee Leaves Report',
      organizationName: 'Corporate HRMS System',
      columns,
      data: processedLeaves,
      fileName: `Leaves_Report_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const downloadExcel = () => {
    if (processedLeaves.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No leave records to export.' });
      return;
    }
    exportExcel({
      title: 'Employee Leaves Report',
      columns,
      data: processedLeaves,
      fileName: `Leaves_Report_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const handleResetFilters = () => {
    setBranch(null);
    setDepartment(null);
    setEmployee(null);
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  return (
    <div className="hrms-page-container">
      <div className="container-fluid px-4">
        {/* ================= HEADER ================= */}
        <div className="hrms-header">
          <div>
            <div className="hrms-breadcrumb">
              <span>Time Off & Leave</span>
              <span className="hrms-breadcrumb-dot" />
              <span>Reports & Audits</span>
              <span className="hrms-breadcrumb-dot" />
              <span>Leaves Comprehensive Report</span>
            </div>
            <div className="hrms-title-wrap">
              <div className="hrms-title-icon-box violet">
                <CalendarDate />
              </div>
              <div>
                <h1 className="hrms-title">Leaves Comprehensive Report</h1>
                <p className="hrms-subtitle">
                  Audit employee leave applications, approvals, balance consumption, and department trends.
                </p>
              </div>
            </div>
          </div>

          <div className="hrms-actions-group">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={fetchLeaves}
              disabled={loading}
              title="Refresh leaves list"
            >
              <ArrowRepeat className={loading ? 'mu-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={downloadPDF}
              disabled={processedLeaves.length === 0}
              title="Export report as PDF"
            >
              <FileEarmarkPdf />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={downloadExcel}
              disabled={processedLeaves.length === 0}
              title="Export report as Excel"
            >
              <FileEarmarkExcel />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* ================= TOP METRICS CARDS ================= */}
        <div className="hrms-kpi-grid">
          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Total Applications</span>
              <span className="hrms-kpi-value">{kpis.total}</span>
              <span className="hrms-kpi-subtext">{kpis.totalDays} Total days taken</span>
            </div>
            <div className="hrms-kpi-icon-wrap indigo">
              <CalendarRange />
            </div>
          </div>

          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Approved Leaves</span>
              <span className="hrms-kpi-value">{kpis.approved}</span>
              <span className="hrms-kpi-subtext">Authorized time-off requests</span>
            </div>
            <div className="hrms-kpi-icon-wrap emerald">
              <CheckCircleFill />
            </div>
          </div>

          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Pending Reviews</span>
              <span className="hrms-kpi-value">{kpis.pending}</span>
              <span className="hrms-kpi-subtext">Awaiting manager decision</span>
            </div>
            <div className="hrms-kpi-icon-wrap amber">
              <HourglassSplit />
            </div>
          </div>

          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Rejected Requests</span>
              <span className="hrms-kpi-value">{kpis.rejected}</span>
              <span className="hrms-kpi-subtext">Declined applications</span>
            </div>
            <div className="hrms-kpi-icon-wrap rose">
              <XCircleFill />
            </div>
          </div>
        </div>

        {/* ================= FILTER PANEL ================= */}
        <div className="hrms-filter-card">
          <div className="hrms-filter-header">
            <h5 className="hrms-filter-title">
              <Filter className="text-primary" /> Filter Leaves Directory
            </h5>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          </div>

          <Row className="g-3">
            {/* Branch Selector */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">
                <GeoAlt size={12} className="me-1" /> Branch
              </label>
              <Select
                options={branches}
                value={branch}
                onChange={(v) => {
                  setBranch(v);
                  setDepartment(null);
                }}
                isClearable
                placeholder="All Branches..."
                className="hrms-select"
              />
            </Col>

            {/* Department Selector */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">
                <Building size={12} className="me-1" /> Department
              </label>
              <Select
                options={departments}
                value={department}
                onChange={(v) => setDepartment(v)}
                isDisabled={!branch}
                isClearable
                placeholder={branch ? 'All Departments...' : 'Select Branch first'}
                className="hrms-select"
              />
            </Col>

            {/* Employee Selector */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">
                <PersonCheck size={12} className="me-1" /> Employee
              </label>
              <Select
                options={employeeOptions}
                value={employee}
                onChange={(v) => setEmployee(v)}
                isClearable
                placeholder="Specific Employee..."
                className="hrms-select"
              />
            </Col>

            {/* Status Filter */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">Approval Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Application Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Col>

            {/* From Date */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">From Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Col>

            {/* To Date */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">To Date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Col>

            {/* Keyword Search */}
            <Col lg={4} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">Quick Search</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Filter by employee, leave type, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Col>

            {/* Fetch Button */}
            <Col lg={2} md={6} className="d-flex align-items-end">
              <button
                type="button"
                className="btn btn-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
                onClick={fetchLeaves}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : <Search size={14} />} Fetch Report
              </button>
            </Col>
          </Row>
        </div>

        {/* ================= TABLE VIEW ================= */}
        {loading && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
            <span className="text-muted small mt-2">Generating leaves report...</span>
          </div>
        )}

        {!loading && searched && processedLeaves.length === 0 && (
          <div className="hrms-empty-box">
            <div className="hrms-empty-icon">
              <CalendarDate />
            </div>
            <h5>No Leave Records Found</h5>
            <p className="text-muted small mb-3">
              No leave records match your chosen date ranges or filter conditions.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleResetFilters}
            >
              Reset Search Parameters
            </button>
          </div>
        )}

        {!loading && processedLeaves.length > 0 && (
          <div className="hrms-table-card">
            <div className="table-responsive">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => toggleSort('startDate')}>
                        Schedule / Dates <ArrowDownUp size={12} />
                      </button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => toggleSort('numberOfDays')}>
                        Duration <ArrowDownUp size={12} />
                      </button>
                    </th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLeaves.map((l) => {
                    const statusLower = l.leaveStatus.toLowerCase();
                    const isPending = statusLower === 'pending';

                    return (
                      <tr key={l.employeeLeaveID}>
                        {/* Employee Identity */}
                        <td>
                          <div className="hrms-user-cell">
                            <div className="hrms-avatar-sm">
                              {getInitials(l.employeeName)}
                            </div>
                            <div>
                              <div className="hrms-user-meta-name">{l.employeeName}</div>
                              <div className="hrms-user-meta-code">ID: {l.employeeID}</div>
                            </div>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1 fw-semibold">
                            {l.leaveType}
                          </span>
                        </td>

                        {/* Dates */}
                        <td>
                          <div className="d-flex align-items-center gap-1 font-monospace small">
                            <span className="fw-semibold text-dark">{l.startDate}</span>
                            <span className="text-muted">→</span>
                            <span className="fw-semibold text-dark">{l.endDate}</span>
                          </div>
                        </td>

                        {/* Days */}
                        <td>
                          <span className="fw-bold text-dark">{l.numberOfDays}</span>{' '}
                          <span className="text-muted small">
                            {Number(l.numberOfDays) === 1 ? 'day' : 'days'}
                          </span>
                        </td>

                        {/* Reason */}
                        <td>
                          <div
                            className="text-truncate text-secondary"
                            style={{ maxWidth: '220px' }}
                            title={l.reason}
                          >
                            {l.reason}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          {statusLower === 'approved' && (
                            <span className="hrms-status-badge approved">
                              <CheckCircleFill size={10} /> Approved
                            </span>
                          )}
                          {statusLower === 'rejected' && (
                            <span className="hrms-status-badge rejected">
                              <XCircleFill size={10} /> Rejected
                            </span>
                          )}
                          {statusLower === 'pending' && (
                            <span className="hrms-status-badge pending">
                              <HourglassSplit size={10} /> Pending
                            </span>
                          )}
                          {!['approved', 'rejected', 'pending'].includes(statusLower) && (
                            <span className="hrms-status-badge neutral">{l.leaveStatus}</span>
                          )}
                        </td>

                        {/* Inline Actions */}
                        <td style={{ textAlign: 'right' }}>
                          {isPending ? (
                            <div className="d-inline-flex align-items-center gap-1">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`approve-tt-${l.employeeLeaveID}`}>Approve Leave</Tooltip>}
                              >
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success px-2 py-1"
                                  onClick={() => handleAction(l.employeeLeaveID, 'Approved')}
                                >
                                  <CheckCircleFill size={12} className="me-1" /> Approve
                                </button>
                              </OverlayTrigger>

                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`reject-tt-${l.employeeLeaveID}`}>Reject Leave</Tooltip>}
                              >
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger px-2 py-1"
                                  onClick={() => handleAction(l.employeeLeaveID, 'Rejected')}
                                >
                                  <XCircleFill size={12} className="me-1" /> Reject
                                </button>
                              </OverlayTrigger>
                            </div>
                          ) : (
                            <span className="text-muted small">Completed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="d-flex align-items-center justify-content-between p-3 border-top">
              <div className="small text-muted">
                Showing <strong>{indexOfLast - pageSize + 1}</strong> to{' '}
                <strong>{Math.min(indexOfLast, processedLeaves.length)}</strong> of{' '}
                <strong>{processedLeaves.length}</strong> leave applications
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted me-1">Rows per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  &lsaquo; Prev
                </button>
                <span className="small fw-bold px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next &rsaquo;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeavesReportPage;
