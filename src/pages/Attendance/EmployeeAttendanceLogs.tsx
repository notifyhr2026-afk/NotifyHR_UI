import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  InputGroup,
  FormControl,
  Spinner,
  Row,
  Col,
  Form
} from 'react-bootstrap';
import employeeService from '../../services/employeeService';
import employeeAttendanceService from '../../services/employeeAttendanceService';
import LoggedInUser from '../../types/LoggedInUser';

interface AttendanceLog {
  employeeID: string;
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

const EmployeeAttendanceLogs: React.FC = () => {
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  // 🔹 Load Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        const data = res?.Table ?? res ?? [];
        setEmployees(data);
      } catch (err) {
        console.error("Error loading employees", err);
      }
    };

    if (organizationID > 0) {
      fetchEmployees();
    }
  }, [organizationID]);

  // 🔹 Load Attendance based on selected employee
  const loadAttendance = async (empId: number) => {
    try {
      setLoading(true);

      const data = await employeeAttendanceService.getEmployeeAttendanceByEmployeeId(empId);

      const summary = data?.Table || [];

      const mapped: AttendanceLog[] = summary.map((item: any) => ({
        employeeID: item.EmployeeID.toString(),
        attendanceDate: new Date(item.AttendanceDate).toLocaleDateString(),
        attendanceTypeID: item.AttendanceTypeID.toString(),
        checkInTime: item.CheckInTime
          ? new Date(item.CheckInTime).toLocaleTimeString()
          : '-',
        checkOutTime: item.CheckOutTime
          ? new Date(item.CheckOutTime).toLocaleTimeString()
          : '-',
        shiftID: item.ShiftID ? item.ShiftID.toString() : '-',
        isLate: item.IsLate ? 'Yes' : 'No',
        isHalfDay: item.IsHalfDay ? 'Yes' : 'No',
        isApproved: item.IsApproved ? 'Yes' : 'No',
        source: item.Source || '-',
        remarks: item.Remarks || '-',
      }));

      setLogs(mapped);
      setFilteredLogs(mapped);

    } catch (err) {
      console.error("Error loading attendance", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Employee Change
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = Number(e.target.value);
    setSelectedEmployeeId(empId);
    if (empId) {
      loadAttendance(empId);
    }
  };

  // 🔹 Sorting
  const handleSort = (column: keyof AttendanceLog) => {
    const sorted = [...filteredLogs].sort((a, b) =>
      a[column].localeCompare(b[column])
    );
    setFilteredLogs(sorted);
  };

  // 🔹 Search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = logs.filter(
      (log) =>
        log.employeeID.toLowerCase().includes(query) ||
        log.attendanceDate.toLowerCase().includes(query) ||
        log.attendanceTypeID.toLowerCase().includes(query)
    );

    setFilteredLogs(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredLogs(logs);
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Employee Attendance Logs</h2>

      {/* 🔽 Employee Dropdown */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select
           value={selectedEmployeeId ?? ''} onChange={handleEmployeeChange}>
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.EmployeeID} value={emp.EmployeeID}>
                {emp.EmployeeName} ({emp.EmployeeCode})
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* 🔍 Search */}
        <Col md={8}>
          <InputGroup>
            <FormControl
              placeholder="Search by Employee ID, Date, or Type"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Button variant="outline-secondary" onClick={handleClearSearch}>
              Clear
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* 📊 Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th><Button variant="link" onClick={() => handleSort('employeeID')}>Employee</Button></th>
                <th><Button variant="link" onClick={() => handleSort('attendanceDate')}>Date</Button></th>
                <th>Type</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Shift</th>
                <th>Late</th>
                <th>Half Day</th>
                <th>Approved</th>
                <th>Source</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.employeeID}</td>
                    <td>{log.attendanceDate}</td>
                    <td>{log.attendanceTypeID}</td>
                    <td>{log.checkInTime}</td>
                    <td>{log.checkOutTime}</td>
                    <td>{log.shiftID}</td>
                    <td>{log.isLate}</td>
                    <td>{log.isHalfDay}</td>
                    <td>{log.isApproved}</td>
                    <td>{log.source}</td>
                    <td>{log.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceLogs;