import React, { useState, useEffect } from 'react';
import { Table, Button, InputGroup, FormControl, Spinner, Row, Col } from 'react-bootstrap';


// Static mock data for attendance logs (Replace with actual API later)
const staticLogs = [
  {
    employeeID: 'E123',
    attendanceDate: '2023-10-01',
    attendanceTypeID: 'Present',
    checkInTime: '09:00 AM',
    checkOutTime: '06:00 PM',
    shiftID: 'Morning',
    isLate: 'No',
    isHalfDay: 'No',
    isApproved: 'Yes',
    source: 'System',
    remarks: 'On time',
  },
  {
    employeeID: 'E124',
    attendanceDate: '2023-10-02',
    attendanceTypeID: 'Leave',
    checkInTime: '-',
    checkOutTime: '-',
    shiftID: 'Morning',
    isLate: 'No',
    isHalfDay: 'No',
    isApproved: 'Yes',
    source: 'System',
    remarks: 'Leave',
  },
  // Add more static logs as needed...
];

// Define the structure for attendance logs
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
  const [logs, setLogs] = useState<AttendanceLog[]>([]); // Store all logs
  const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>([]); // Store filtered logs
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    setLogs(staticLogs); // Initialize logs with static data
    setFilteredLogs(staticLogs); // Initialize filtered logs
    setLoading(false); // Set loading to false when data is ready
  }, []);

  // Handle sorting by column (sorts by employee ID, attendance date, etc.)
  const handleSort = (column: keyof AttendanceLog) => {
    const sortedLogs = [...filteredLogs].sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });
    setFilteredLogs(sortedLogs); // Update filtered logs with sorted data
  };

  // Handle search input change (search by employee ID, date, or attendance type)
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = logs.filter(
      (log) =>
        log.employeeID.toLowerCase().includes(query) ||
        log.attendanceDate.toLowerCase().includes(query) ||
        log.attendanceTypeID.toLowerCase().includes(query)
    );

    setFilteredLogs(filtered); // Update filtered logs based on search query
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchQuery(''); // Reset search query
    setFilteredLogs(logs); // Reset filtered logs to show all data
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Employee Attendance Logs</h2>

      {/* Search and Sort Section */}
      <Row className="mb-3">
        <Col md={8}>
          <InputGroup>
            <FormControl
              placeholder="Search by Employee ID, Date, or Attendance Type"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Button variant="outline-secondary" onClick={handleClearSearch}>
              Clear
            </Button>
          </InputGroup>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="primary" className="ms-2">
            Sort
          </Button>
        </Col>
      </Row>

      {/* Table Section */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {/* Table Headers with Sort Functionality */}
                <th>
                  <Button variant="link" onClick={() => handleSort('employeeID')}>
                    Employee ID 
                  </Button>
                </th>
                <th>
                  <Button variant="link" onClick={() => handleSort('attendanceDate')}>
                    Attendance Date 
                  </Button>
                </th>
                <th>
                  <Button variant="link" onClick={() => handleSort('attendanceTypeID')}>
                    Attendance Type 
                  </Button>
                </th>
                <th>Check-in Time</th>
                <th>Check-out Time</th>
                <th>Shift</th>
                <th>Late</th>
                <th>Half Day</th>
                <th>Approved</th>
                <th>Source</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Render Data Rows */}
              {filteredLogs.map((log, index) => (
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
                  <td>
                    <Button variant="info" size="sm" className="me-2">
                      View
                    </Button>
                    <Button variant="warning" size="sm">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceLogs;
