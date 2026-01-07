import React, { useState } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";

interface Attendance {
  AttendanceID: number;
  EmployeeID: number;
  AttendanceDate: string;
  AttendanceTypeID: string;
  CheckInTime: string;
  CheckOutTime: string;
  ShiftID: string;
  IsLate: boolean;
  IsHalfDay: boolean;
  IsApproved: boolean;
  Source: string;
  Remarks: string;
  CreatedAt: string;
}

interface Employee {
  value: number;
  label: string;
}

// Sample Employees
const employees: Employee[] = [
  { value: 1, label: "John Doe" },
  { value: 2, label: "Jane Smith" },
];

// Sample Attendance Data
const attendanceData: Attendance[] = [
  {
    AttendanceID: 101,
    EmployeeID: 1,
    AttendanceDate: "2026-01-05",
    AttendanceTypeID: "Regular",
    CheckInTime: "09:02",
    CheckOutTime: "12:05",
    ShiftID: "Morning",
    IsLate: false,
    IsHalfDay: false,
    IsApproved: true,
    Source: "Mobile App",
    Remarks: "Morning session",
    CreatedAt: "2026-01-05",
  },
  {
    AttendanceID: 104,
    EmployeeID: 1,
    AttendanceDate: "2026-01-05",
    AttendanceTypeID: "Regular",
    CheckInTime: "13:02",
    CheckOutTime: "17:05",
    ShiftID: "Afternoon",
    IsLate: false,
    IsHalfDay: false,
    IsApproved: true,
    Source: "Web Portal",
    Remarks: "Afternoon session",
    CreatedAt: "2026-01-05",
  },
  {
    AttendanceID: 102,
    EmployeeID: 1,
    AttendanceDate: "2026-01-04",
    AttendanceTypeID: "Regular",
    CheckInTime: "09:15",
    CheckOutTime: "17:00",
    ShiftID: "Morning",
    IsLate: true,
    IsHalfDay: false,
    IsApproved: true,
    Source: "Web Portal",
    Remarks: "Late arrival",
    CreatedAt: "2026-01-04",
  },
  {
    AttendanceID: 103,
    EmployeeID: 2,
    AttendanceDate: "2026-01-05",
    AttendanceTypeID: "Regular",
    CheckInTime: "08:50",
    CheckOutTime: "16:50",
    ShiftID: "Morning",
    IsLate: false,
    IsHalfDay: false,
    IsApproved: true,
    Source: "Web Portal",
    Remarks: "Perfect",
    CreatedAt: "2026-01-05",
  },
];

// Helper: Group by date
const groupByDate = (data: Attendance[]) => {
  return data.reduce((acc: Record<string, Attendance[]>, item) => {
    if (!acc[item.AttendanceDate]) acc[item.AttendanceDate] = [];
    acc[item.AttendanceDate].push(item);
    return acc;
  }, {});
};

// Helper: Calculate total hours
const calculateTotalHours = (records: Attendance[]) => {
  let totalMinutes = 0;
  records.forEach((r) => {
    const [inH, inM] = r.CheckInTime.split(":").map(Number);
    const [outH, outM] = r.CheckOutTime.split(":").map(Number);
    totalMinutes += outH * 60 + outM - (inH * 60 + inM);
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Helper: Get unique shifts
const getShifts = (records: Attendance[]) => {
  return Array.from(new Set(records.map((r) => r.ShiftID)));
};

// Main Component
const AttendancePage: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  // Filter attendance by employee and date range
  const filteredAttendance = selectedEmployee
    ? attendanceData.filter((att) => {
        const attDate = att.AttendanceDate;
        const afterFrom = fromDate ? attDate >= fromDate : true;
        const beforeTo = toDate ? attDate <= toDate : true;
        return att.EmployeeID === selectedEmployee.value && afterFrom && beforeTo;
      })
    : [];

  const attendanceByDate = groupByDate(filteredAttendance);

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">Employee Attendance Log</h2>

      {/* Filters */}
      <div className="row mb-4 align-items-end">
        <div className="col-md-4 mb-2">
          <label className="form-label">Select Employee</label>
          <Select
            options={employees}
            value={selectedEmployee}
            onChange={(employee) => setSelectedEmployee(employee as Employee)}
            placeholder="Choose an employee..."
          />
        </div>

        <div className="col-md-3 mb-2">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="col-md-3 mb-2">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Table */}
      {selectedEmployee && (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-dark text-center">
              <tr>
                <th>Date</th>
                <th>Summary</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(attendanceByDate).length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">
                    No attendance records found.
                  </td>
                </tr>
              )}

              {Object.entries(attendanceByDate).map(([date, records]) => {
                records.sort(
                  (a, b) =>
                    parseInt(a.CheckInTime.replace(":", ""), 10) -
                    parseInt(b.CheckInTime.replace(":", ""), 10)
                );

                const firstCheckIn = records[0].CheckInTime;
                const lastCheckOut = records[records.length - 1].CheckOutTime;
                const totalHours = calculateTotalHours(records);
                const shifts = getShifts(records);
                const isLate = records.some((r) => r.IsLate);
                const isHalfDay = records.some((r) => r.IsHalfDay);

                return (
                  <React.Fragment key={date}>
                    {/* Summary Row */}
                    <tr
                      onClick={() => toggleExpand(date)}
                      style={{ cursor: "pointer" }}
                      className="table-primary"
                    >
                      <td className="text-center fw-bold">{date}</td>
                      <td>
                        <div>
                          <strong>
                            {firstCheckIn} - {lastCheckOut}
                          </strong>
                        </div>
                        <div className="mt-1">
                          {shifts.map((s) => (
                            <span key={s} className="badge bg-info me-1">
                              {s}
                            </span>
                          ))}
                          <span
                            className={`badge ${
                              isLate ? "bg-danger" : "bg-success"
                            } me-1`}
                          >
                            Late: {isLate ? "Yes" : "No"}
                          </span>
                          <span
                            className={`badge ${
                              isHalfDay ? "bg-warning" : "bg-success"
                            }`}
                          >
                            Half Day: {isHalfDay ? "Yes" : "No"}
                          </span>
                        </div>
                      </td>
                      <td className="text-center fw-bold">{totalHours}</td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedDates[date] &&
                      records.map((r) => (
                        <tr key={r.AttendanceID} className="table-light">
                          <td></td>
                          <td colSpan={2}>
                            <div className="d-flex flex-wrap gap-3">
                              <div>
                                <strong>Check In:</strong> {r.CheckInTime}
                              </div>
                              <div>
                                <strong>Check Out:</strong> {r.CheckOutTime}
                              </div>
                              <div>
                                <strong>Shift:</strong> {r.ShiftID}
                              </div>
                              <div>
                                <strong>Late:</strong> {r.IsLate ? "Yes" : "No"}
                              </div>
                              <div>
                                <strong>Half Day:</strong>{" "}
                                {r.IsHalfDay ? "Yes" : "No"}
                              </div>
                              <div>
                                <strong>Approved:</strong>{" "}
                                {r.IsApproved ? "Yes" : "No"}
                              </div>
                              <div>
                                <strong>Source:</strong> {r.Source}
                              </div>
                              <div>
                                <strong>Remarks:</strong> {r.Remarks}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
