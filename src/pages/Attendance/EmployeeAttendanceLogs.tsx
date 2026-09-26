import React, { useState, useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  ClockHistory,
  CalendarCheck,
  CheckCircleFill,
  XCircleFill,
  ExclamationCircleFill,
  Download,
  FileEarmarkPdf,
  FileEarmarkExcel,
  Search,
  PersonFill,
  ArrowRepeat,
  ArrowDownUp,
  BoxArrowInRight,
  BoxArrowRight,
  Laptop,
} from 'react-bootstrap-icons';
import Select from 'react-select';
import employeeService from '../../services/employeeService';
import employeeAttendanceService from '../../services/employeeAttendanceService';
import LoggedInUser from '../../types/LoggedInUser';
import { generatePDF } from '../Reports/components/PDFGenerator';
import { exportExcel } from '../Reports/components/ExcelExporter';
import Swal from 'sweetalert2';
import '../../css/HrmsPages.css';

interface AttendanceLog {
  employeeID: string;
  employeeName?: string;
  attendanceDate: string;
  attendanceTypeID: string;
  checkInTime: string;
  checkOutTime: string;
  shiftID: string;
  isLate: string;
  isHalfDay: string;
  isApproved: string;
  source: string;
  remarks: string;
}

const getInitials = (name: string): string => {
  if (!name) return 'EM';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const EmployeeAttendanceLogs: React.FC = () => {
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeOption, setSelectedEmployeeOption] = useState<{ value: number; label: string; code: string } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LATE' | 'HALFDAY' | 'APPROVED'>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<keyof AttendanceLog>('attendanceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Load Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        const data = res?.Table ?? res ?? [];
        setEmployees(data);

        // Pre-select first employee if available
        if (data.length > 0 && !selectedEmployeeOption) {
          const first = data[0];
          const empOption = {
            value: first.EmployeeID,
            label: `${first.EmployeeName || first.FirstName || 'Employee'} (${first.EmployeeCode || first.EmployeeID})`,
            code: first.EmployeeCode || String(first.EmployeeID),
          };
          setSelectedEmployeeOption(empOption);
          loadAttendance(first.EmployeeID, first.EmployeeName || 'Employee');
        }
      } catch (err) {
        console.error('Error loading employees', err);
      }
    };

    if (organizationID > 0) {
      fetchEmployees();
    }
  }, [organizationID]);

  // Load Attendance
  const loadAttendance = async (empId: number, empName?: string) => {
    try {
      setLoading(true);
      const data = await employeeAttendanceService.getEmployeeAttendanceByEmployeeId(empId);
      const summary = data?.Table || [];

      const currentEmpName = empName || employees.find((e) => e.EmployeeID === empId)?.EmployeeName || 'Employee';

      const mapped: AttendanceLog[] = summary.map((item: any) => ({
        employeeID: item.EmployeeID.toString(),
        employeeName: currentEmpName,
        attendanceDate: item.AttendanceDate
          ? new Date(item.AttendanceDate).toISOString().split('T')[0]
          : '-',
        attendanceTypeID: item.AttendanceTypeID ? item.AttendanceTypeID.toString() : 'Regular',
        checkInTime: item.CheckInTime
          ? new Date(item.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '-',
        checkOutTime: item.CheckOutTime
          ? new Date(item.CheckOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : '-',
        shiftID: item.ShiftID ? item.ShiftID.toString() : 'Default',
        isLate: item.IsLate ? 'Yes' : 'No',
        isHalfDay: item.IsHalfDay ? 'Yes' : 'No',
        isApproved: item.IsApproved ? 'Yes' : 'No',
        source: item.Source || 'Web Portal',
        remarks: item.Remarks || '-',
      }));

      setLogs(mapped);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading attendance', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to retrieve attendance logs for this employee.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (opt: any) => {
    setSelectedEmployeeOption(opt);
    if (opt?.value) {
      loadAttendance(opt.value, opt.label);
    } else {
      setLogs([]);
    }
  };

  // Sorting
  const toggleSort = (column: keyof AttendanceLog) => {
    if (sortField === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(column);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted logs
  const processedLogs = useMemo(() => {
    let result = [...logs];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (log) =>
          log.employeeID.toLowerCase().includes(q) ||
          log.attendanceDate.toLowerCase().includes(q) ||
          log.attendanceTypeID.toLowerCase().includes(q) ||
          log.source.toLowerCase().includes(q) ||
          log.remarks.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'LATE') {
      result = result.filter((l) => l.isLate === 'Yes');
    } else if (statusFilter === 'HALFDAY') {
      result = result.filter((l) => l.isHalfDay === 'Yes');
    } else if (statusFilter === 'APPROVED') {
      result = result.filter((l) => l.isApproved === 'Yes');
    }

    // Date filter
    if (dateFilter) {
      result = result.filter((l) => l.attendanceDate === dateFilter);
    }

    // Sorting
    result.sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      const comp = String(valA).localeCompare(String(valB));
      return sortDirection === 'asc' ? comp : -comp;
    });

    return result;
  }, [logs, searchQuery, statusFilter, dateFilter, sortField, sortDirection]);

  // KPI Metrics
  const kpis = useMemo(() => {
    const totalPunches = logs.length;
    const lateDays = logs.filter((l) => l.isLate === 'Yes').length;
    const halfDays = logs.filter((l) => l.isHalfDay === 'Yes').length;
    const approvedDays = logs.filter((l) => l.isApproved === 'Yes').length;

    return {
      totalPunches,
      lateDays,
      halfDays,
      approvedDays,
    };
  }, [logs]);

  // Pagination
  const totalPages = Math.ceil(processedLogs.length / pageSize) || 1;
  const indexOfLast = currentPage * pageSize;
  const currentLogs = processedLogs.slice(indexOfLast - pageSize, indexOfLast);

  const columns = [
    { key: 'employeeID', label: 'Employee ID' },
    { key: 'attendanceDate', label: 'Date' },
    { key: 'attendanceTypeID', label: 'Type' },
    { key: 'checkInTime', label: 'Check In' },
    { key: 'checkOutTime', label: 'Check Out' },
    { key: 'shiftID', label: 'Shift' },
    { key: 'isLate', label: 'Late' },
    { key: 'isHalfDay', label: 'Half Day' },
    { key: 'isApproved', label: 'Approved' },
    { key: 'source', label: 'Source' },
    { key: 'remarks', label: 'Remarks' },
  ];

  const downloadPDF = () => {
    if (processedLogs.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No attendance logs available to export.' });
      return;
    }
    generatePDF({
      title: `Attendance Logs - ${selectedEmployeeOption?.label || 'Staff'}`,
      organizationName: 'Corporate HRMS System',
      columns,
      data: processedLogs,
      fileName: `Attendance_${selectedEmployeeOption?.code || 'Logs'}_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const downloadExcel = () => {
    if (processedLogs.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No attendance logs available to export.' });
      return;
    }
    exportExcel({
      title: `Attendance Logs - ${selectedEmployeeOption?.label || 'Staff'}`,
      columns,
      data: processedLogs,
      fileName: `Attendance_${selectedEmployeeOption?.code || 'Logs'}_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const employeeSelectOptions = employees.map((emp) => ({
    value: emp.EmployeeID,
    label: `${emp.EmployeeName || emp.FirstName || 'Employee'} (${emp.EmployeeCode || emp.EmployeeID})`,
    code: emp.EmployeeCode || String(emp.EmployeeID),
  }));

  return (
    <div className="hrms-page-container">
      <div className="container-fluid px-4">
        {/* ================= HEADER ================= */}
        <div className="hrms-header">
          <div>
            <div className="hrms-breadcrumb">
              <span>Time & Attendance</span>
              <span className="hrms-breadcrumb-dot" />
              <span>Biometrics & Punch Logs</span>
              <span className="hrms-breadcrumb-dot" />
              <span>Employee Audit Trail</span>
            </div>
            <div className="hrms-title-wrap">
              <div className="hrms-title-icon-box teal">
                <ClockHistory />
              </div>
              <div>
                <h1 className="hrms-title">Employee Attendance Logs</h1>
                <p className="hrms-subtitle">
                  Inspect check-in/out timestamps, punctuality flags, biometric devices, and shift assignments.
                </p>
              </div>
            </div>
          </div>

          <div className="hrms-actions-group">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={() => {
                if (selectedEmployeeOption) {
                  loadAttendance(selectedEmployeeOption.value);
                }
              }}
              disabled={loading || !selectedEmployeeOption}
              title="Refresh attendance records"
            >
              <ArrowRepeat className={loading ? 'mu-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={downloadPDF}
              disabled={processedLogs.length === 0}
              title="Export report as PDF"
            >
              <FileEarmarkPdf />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={downloadExcel}
              disabled={processedLogs.length === 0}
              title="Export report as Excel"
            >
              <FileEarmarkExcel />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* ================= METRICS CARDS ================= */}
        <div className="hrms-kpi-grid">
          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Total Logged Days</span>
              <span className="hrms-kpi-value">{kpis.totalPunches}</span>
              <span className="hrms-kpi-subtext">Recorded punches in log</span>
            </div>
            <div className="hrms-kpi-icon-wrap teal">
              <CalendarCheck />
            </div>
          </div>

          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Punctual & Approved</span>
              <span className="hrms-kpi-value">{kpis.approvedDays}</span>
              <span className="hrms-kpi-subtext">Verified attendance shifts</span>
            </div>
            <div className="hrms-kpi-icon-wrap emerald">
              <CheckCircleFill />
            </div>
          </div>

          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Late Arrivals</span>
              <span className="hrms-kpi-value">{kpis.lateDays}</span>
              <span className="hrms-kpi-subtext">Flagged beyond grace period</span>
            </div>
            <div className="hrms-kpi-icon-wrap amber">
              <ExclamationCircleFill />
            </div>
          </div>

          <div className="hrms-kpi-card">
            <div className="hrms-kpi-info">
              <span className="hrms-kpi-label">Half-Day Shifts</span>
              <span className="hrms-kpi-value">{kpis.halfDays}</span>
              <span className="hrms-kpi-subtext">Partial hours logged</span>
            </div>
            <div className="hrms-kpi-icon-wrap rose">
              <ClockHistory />
            </div>
          </div>
        </div>

        {/* ================= FILTERS & CONTROLS ================= */}
        <div className="hrms-filter-card">
          <div className="hrms-filter-header">
            <h5 className="hrms-filter-title">
              <PersonFill className="text-teal" /> Select Staff Member & Query Scope
            </h5>
            {(searchQuery || statusFilter !== 'ALL' || dateFilter) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setDateFilter('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <Row className="g-3 align-items-center">
            {/* Employee Selector */}
            <Col lg={4} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">
                Target Employee <span className="text-danger">*</span>
              </label>
              <Select
                options={employeeSelectOptions}
                value={selectedEmployeeOption}
                onChange={handleSelectEmployee}
                placeholder="Search staff by name or code..."
                isClearable={false}
                className="hrms-select"
              />
            </Col>

            {/* Keyword Search */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">Quick Search</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 text-muted">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Type, date, remarks, source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Col>

            {/* Status Filter */}
            <Col lg={3} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">Shift Quality Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Recorded Shifts</option>
                <option value="APPROVED">Approved Only</option>
                <option value="LATE">Late Arrivals Only</option>
                <option value="HALFDAY">Half Days Only</option>
              </select>
            </Col>

            {/* Specific Date */}
            <Col lg={2} md={6}>
              <label className="form-label small fw-bold text-secondary mb-1">Specific Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Col>
          </Row>
        </div>

        {/* ================= TABLE VIEW ================= */}
        {loading && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner animation="border" variant="teal" style={{ color: '#0d9488' }} />
            <span className="text-muted small mt-2">Loading attendance logs...</span>
          </div>
        )}

        {!loading && !selectedEmployeeOption && (
          <div className="hrms-empty-box">
            <div className="hrms-empty-icon">
              <PersonFill />
            </div>
            <h5>Select an Employee to View Logs</h5>
            <p className="text-muted small mb-0">
              Pick a staff member from the dropdown above to load their check-in and check-out logs.
            </p>
          </div>
        )}

        {!loading && selectedEmployeeOption && processedLogs.length === 0 && (
          <div className="hrms-empty-box">
            <div className="hrms-empty-icon">
              <ClockHistory />
            </div>
            <h5>No Attendance Logs Found</h5>
            <p className="text-muted small mb-3">
              {searchQuery || statusFilter !== 'ALL' || dateFilter
                ? 'No punch records match your current filter parameters.'
                : `No attendance records logged for ${selectedEmployeeOption.label}.`}
            </p>
            {(searchQuery || statusFilter !== 'ALL' || dateFilter) && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setDateFilter('');
                }}
              >
                Clear Applied Filters
              </button>
            )}
          </div>
        )}

        {!loading && selectedEmployeeOption && processedLogs.length > 0 && (
          <div className="hrms-table-card">
            <div className="table-responsive">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => toggleSort('attendanceDate')}>
                        Date <ArrowDownUp size={12} />
                      </button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => toggleSort('checkInTime')}>
                        Check In <ArrowDownUp size={12} />
                      </button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => toggleSort('checkOutTime')}>
                        Check Out <ArrowDownUp size={12} />
                      </button>
                    </th>
                    <th>Shift Type</th>
                    <th>Punctuality</th>
                    <th>Duration Type</th>
                    <th>Approval</th>
                    <th>Source Device</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, index) => {
                    const isLate = log.isLate === 'Yes';
                    const isHalfDay = log.isHalfDay === 'Yes';
                    const isApproved = log.isApproved === 'Yes';

                    return (
                      <tr key={index}>
                        {/* Employee Identity */}
                        <td>
                          <div className="hrms-user-cell">
                            <div className="hrms-avatar-sm teal">
                              {getInitials(log.employeeName || selectedEmployeeOption.label)}
                            </div>
                            <div>
                              <div className="hrms-user-meta-name">
                                {log.employeeName || selectedEmployeeOption.label}
                              </div>
                              <div className="hrms-user-meta-code">ID: {log.employeeID}</div>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td>
                          <span className="fw-semibold">{log.attendanceDate}</span>
                        </td>

                        {/* Check In */}
                        <td>
                          {log.checkInTime !== '-' ? (
                            <span className="hrms-time-pill in">
                              <BoxArrowInRight size={13} /> {log.checkInTime}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        {/* Check Out */}
                        <td>
                          {log.checkOutTime !== '-' ? (
                            <span className="hrms-time-pill out">
                              <BoxArrowRight size={13} /> {log.checkOutTime}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>

                        {/* Shift Type */}
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {log.attendanceTypeID}
                          </span>
                        </td>

                        {/* Punctuality */}
                        <td>
                          {isLate ? (
                            <span className="hrms-status-badge rejected">
                              <ExclamationCircleFill size={10} /> Late
                            </span>
                          ) : (
                            <span className="hrms-status-badge approved">
                              <CheckCircleFill size={10} /> On Time
                            </span>
                          )}
                        </td>

                        {/* Half Day */}
                        <td>
                          {isHalfDay ? (
                            <span className="hrms-status-badge pending">Half Day</span>
                          ) : (
                            <span className="hrms-status-badge neutral">Full Day</span>
                          )}
                        </td>

                        {/* Approval */}
                        <td>
                          {isApproved ? (
                            <span className="hrms-status-badge approved">
                              <CheckCircleFill size={10} /> Approved
                            </span>
                          ) : (
                            <span className="hrms-status-badge neutral">
                              <XCircleFill size={10} /> Unverified
                            </span>
                          )}
                        </td>

                        {/* Source */}
                        <td>
                          <div className="d-flex align-items-center gap-1 text-muted small">
                            <Laptop size={12} />
                            <span>{log.source}</span>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td>
                          <span className="text-muted small" title={log.remarks}>
                            {log.remarks}
                          </span>
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
                <strong>{Math.min(indexOfLast, processedLogs.length)}</strong> of{' '}
                <strong>{processedLogs.length}</strong> punch logs
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

export default EmployeeAttendanceLogs;
