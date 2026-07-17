import React, { useState, useEffect } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import employeeService from "../../services/employeeService";
import employeeAttendanceService from "../../services/employeeAttendanceService";
import LoggedInUser from "../../types/LoggedInUser";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface Employee {
  value: number;
  label: string;
}

interface AttendanceLog {
  LogID: number;
  AttendanceID: number;
  AttendanceDate: string;
  LogTypeID: number;
  LogTime: string;
  DeviceName: string;
  IPAddress: string;
  LocationAddress: string;
}

const AttendancePage: React.FC = () => {
  const userString = localStorage.getItem("user");
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [expandedRows, setExpandedRows] = useState<
    Record<string, boolean>
  >({});

  // -------------------------------
  // Load Employees
  // -------------------------------
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res =
          await employeeService.getEmployeesByOrganizationIdAsync(
            organizationID
          );

        const data = res?.Table ?? res ?? [];

        const mapped = data.map((emp: any) => ({
          value: emp.EmployeeID,
          label: `${emp.EmployeeName} (${emp.EmployeeCode})`,
        }));

        setEmployees(mapped);
      } catch (err) {
        console.error("Employee load error:", err);
      }
    };

    if (organizationID > 0) {
      loadEmployees();
    }
  }, [organizationID]);

  // -------------------------------
  // Helpers
  // -------------------------------
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return dateStr.split("T")[0];
  };

  const formatISTTime = (dateStr: string | null) => {
    if (!dateStr) return "-";

    return new Date(dateStr).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getLogsByAttendance = (attendanceId: number) => {
    return attendanceLogs
      .filter((x) => x.AttendanceID === attendanceId)
      .sort(
        (a, b) =>
          new Date(a.LogTime).getTime() -
          new Date(b.LogTime).getTime()
      );
  };

  const toggleExpand = (attendanceId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [attendanceId]: !prev[attendanceId],
    }));
  };

  // -------------------------------
  // Get Attendance
  // -------------------------------
const handleGetAttendance = async () => {
  try {
    setLoading(true);

    const employeeID = selectedEmployee?.value ?? 0;

    let finalFromDate: string | null = fromDate || null;
    let finalToDate: string | null = toDate || null;

    // If only employee is selected (no dates), use current month
    if (employeeID > 0 && !finalFromDate && !finalToDate) {
      const today = new Date();

      const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      finalFromDate = firstDay.toISOString().split("T")[0];
      finalToDate = today.toISOString().split("T")[0];
    }

    // If only From Date is selected
    if (finalFromDate && !finalToDate) {
      finalToDate = finalFromDate;
    }

    // If only To Date is selected
    if (!finalFromDate && finalToDate) {
      finalFromDate = finalToDate;
    }

    const res =
      await employeeAttendanceService.getEmployeeAttendance({
        employeeID,
        organizationID,
        fromDate: finalFromDate,
        toDate: finalToDate,
      });

    const summary = res?.Table || [];
    const logs = res?.Table1 || [];

    setAttendanceData(summary);
    setAttendanceLogs(logs);
    setExpandedRows({});
  } catch (err) {
    console.error("Attendance load error:", err);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="container">
      <h3 className="text-center mb-4">
        Employee Attendance
      </h3>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label>Employee</label>

          <Select
            options={employees}
            value={selectedEmployee}
            onChange={(value: any) => setSelectedEmployee(value as Employee | null)}
            className="org-select"
            classNamePrefix="org-select"
            isClearable
            isSearchable
            placeholder="Select employee..."
            noOptionsMessage={() => "No employees"}
          />
        </div>

        <div className="col-md-3">
          <label>From Date</label>

          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>To Date</label>

          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={handleGetAttendance}
          >
            GET
          </button>
        </div>        
      </div>

      {/* Attendance Grid */}
      {loading ? (
        <div className="text-center">
          Loading attendance...
        </div>
      ) : (
       <Table
            hover
            responsive
            className="mb-0"
            style={{
              verticalAlign: "middle",
            }}
          >
            <thead
              style={{
                background: "rgba(0,0,0,.03)",
              }}
            >
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Worked Hours</th>
              <th>Source</th>
              <th>Status</th>
              <th>Logs</th>
            </tr>
          </thead>

          <tbody>
            {attendanceData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  No records found
                </td>
              </tr>
            ) : (
              attendanceData.map((attendance: any) => {
                const logs = getLogsByAttendance(
                  attendance.AttendanceID
                );

                return (
                  <React.Fragment
                    key={attendance.AttendanceID}
                  >
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        toggleExpand(
                          attendance.AttendanceID
                        )
                      }
                    >
                      <td>
                        {attendance.EmployeeName} 
                      </td>
                      <td>
                        {formatDate(
                          attendance.AttendanceDate
                        )}
                      </td>

                      <td>
                        {formatISTTime(
                          attendance.CheckInTime
                        )}
                      </td>

                      <td>
                        {formatISTTime(
                          attendance.CheckOutTime
                        )}
                      </td>

                      <td>
                        {Number(
                          attendance.WorkedHours || 0
                        ).toFixed(2)}{" "}
                        hrs
                      </td>

                      <td>{attendance.Source}</td>

                      <td>
                        {attendance.AttendanceStatus}
                      </td>

                      <td>
                        View Logs ({logs.length})
                      </td>
                    </tr>

                    {expandedRows[
                      attendance.AttendanceID
                    ] &&
                      (logs.length > 0 ? (
                        logs.map((log) => (
                          <tr key={log.LogID}>
                            <td></td>

                            <td colSpan={6}>
                              <strong>
                                {log.LogTypeID === 1
                                  ? "IN"
                                  : "OUT"}
                              </strong>

                              {" | "}

                              {formatISTTime(
                                log.LogTime
                              )}

                              {" | "}

                              {log.DeviceName}

                              {" | "}

                              {log.IPAddress}
                               {" | "}

                              {log.LocationAddress}
                            </td>                            
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td></td>

                          <td colSpan={6}>
                            No logs available
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </Table>
        
      )}
      <div className="alert alert-info py-2 mt-2 mb-3">
  <i className="bi bi-info-circle me-2"></i>
  <strong>Search Tips:</strong> Employee and date filters are optional.
  Selecting only an employee searches from the first day of the current
  month to today. Selecting only one date uses that date for both
  <strong> From</strong> and <strong>To</strong>. Leaving all filters empty
  displays attendance for all employees.
</div>
    </div>
    
  );
};

export default AttendancePage;
