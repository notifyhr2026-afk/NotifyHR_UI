import React, { useState, useEffect } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import employeeService from "../../services/employeeService";
import employeeAttendanceService from "../../services/employeeAttendanceService";
import LoggedInUser from "../../types/LoggedInUser";

interface Attendance {
  AttendanceID: number;
  EmployeeID: number;
  AttendanceDate: string;
  CheckInTime: string;
  CheckOutTime: string;
  ShiftID: string;
  IsLate: boolean;
  IsHalfDay: boolean;
  IsApproved: boolean;
  Source: string;
  Remarks: string;
}

interface Employee {
  value: number;
  label: string;
}

// Group by date
const groupByDate = (data: any[]) => {
  return data.reduce((acc: Record<string, any[]>, item) => {
    const date = item.AttendanceDate.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
};

// Calculate total hours from logs
const calculateTotalHours = (logs: any[]) => {
  let totalMinutes = 0;

  logs.forEach((log) => {
    const time = new Date(log.LogTime);
    if (log.LogTypeID === 1) {
      log._inTime = time;
    } else if (log.LogTypeID === 2 && log._inTime) {
      totalMinutes +=
        (time.getTime() - log._inTime.getTime()) / (1000 * 60);
      log._inTime = null;
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  return `${hours}h ${minutes}m`;
};

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
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [expandedDates, setExpandedDates] = useState<
    Record<string, boolean>
  >({});

  // 🔹 Load Employees
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
        console.error(err);
      }
    };

    if (organizationID > 0) loadEmployees();
  }, [organizationID]);

  // 🔹 Load Attendance + Logs
  const loadAttendance = async (empId: number) => {
    try {
      setLoading(true);

      const res =
        await employeeAttendanceService.getEmployeeAttendanceByEmployeeId(
          empId
        );

      const summary = res?.Table || [];
      const logs = res?.Table1 || [];

      setAttendanceLogs(logs);

      setAttendanceData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (emp: any) => {
    setSelectedEmployee(emp);
    if (emp) loadAttendance(emp.value);
  };

  // 🔹 Filter by date
  const filteredAttendance = attendanceData.filter((att) => {
    const date = att.AttendanceDate.split("T")[0];
    const afterFrom = fromDate ? date >= fromDate : true;
    const beforeTo = toDate ? date <= toDate : true;
    return afterFrom && beforeTo;
  });

  const attendanceByDate = groupByDate(filteredAttendance);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // 🔹 Get logs for date
  const getLogsByDate = (date: string) => {
    return attendanceLogs
      .filter((log) => log.AttendanceDate.split("T")[0] === date)
      .sort(
        (a, b) =>
          new Date(a.LogTime).getTime() -
          new Date(b.LogTime).getTime()
      );
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">
        Employee Attendance (Logs View)
      </h2>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label>Select Employee</label>
          <Select
            options={employees}
            value={selectedEmployee}
            onChange={handleEmployeeChange}
          />
        </div>

        <div className="col-md-3">
          <label>From</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>To</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <table className="table table-bordered">
          <thead className="table-dark">
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
                  No records found
                </td>
              </tr>
            )}

            {Object.entries(attendanceByDate).map(([date, records]) => {
              const logs = getLogsByDate(date);

              const totalHours = calculateTotalHours([...logs]);

              return (
                <React.Fragment key={date}>
                  {/* Main Row */}
                  <tr
                    className="table-primary"
                    onClick={() => toggleExpand(date)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{date}</td>
                    <td>
                      Click to view logs ({logs.length})
                    </td>
                    <td>{totalHours}</td>
                  </tr>

                  {/* Logs */}
                  {expandedDates[date] &&
                    logs.map((log) => (
                      <tr key={log.LogID}>
                        <td></td>
                        <td colSpan={2}>
                          <div className="d-flex justify-content-between">
                            <strong>
                              {log.LogTypeID === 1
                                ? "Clock In"
                                : "Clock Out"}
                            </strong>

                            <span>
                              {new Date(
                                log.LogTime
                              ).toLocaleTimeString()}
                            </span>

                            <span>
                              Device: {log.DeviceName || "-"}
                            </span>

                            <span>
                              IP: {log.IPAddress || "-"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendancePage;