import React, { useState } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import employeeService from "../../services/employeeService";
import employeeAttendanceService from "../../services/employeeAttendanceService";
import LoggedInUser from "../../types/LoggedInUser";

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
}

// ---------- Helpers ----------
const groupByDate = (data: any[]) => {
  return data.reduce((acc: Record<string, any[]>, item) => {
    const date = item.AttendanceDate.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});
};

// ---------- Component ----------
const AttendancePage: React.FC = () => {
  const userString = localStorage.getItem("user");
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;

  const organizationID = user?.organizationID ?? 0;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // ---------- Load Employees ----------
  React.useEffect(() => {
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

    if (organizationID > 0) loadEmployees();
  }, [organizationID]);

  // ---------- NEW API CALL ----------
  const handleGetAttendance = async () => {
    if (!selectedEmployee) {
      alert("Please select employee");
      return;
    }

    try {
      setLoading(true);

      const res = await employeeAttendanceService.getEmployeeAttendance({
        employeeID: selectedEmployee.value,
        organizationID: organizationID,
        fromDate: fromDate,
        toDate: toDate,
      });

      let summary = res?.Table || [];
      let logs = res?.Table1 || [];

      // OPTIONAL: frontend filtering (API already supports date range)
      if (fromDate || toDate) {
        summary = summary.filter((item: any) => {
          const d = item.AttendanceDate.split("T")[0];
          const afterFrom = fromDate ? d >= fromDate : true;
          const beforeTo = toDate ? d <= toDate : true;
          return afterFrom && beforeTo;
        });

        const validDates = new Set(
          summary.map((x: any) => x.AttendanceDate.split("T")[0])
        );

        logs = logs.filter((l: any) =>
          validDates.has(l.AttendanceDate.split("T")[0])
        );
      }

      setAttendanceData(summary);
      setAttendanceLogs(logs);
    } catch (err) {
      console.error("Attendance load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- GROUP ----------
  const attendanceByDate = groupByDate(attendanceData);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // ---------- GET LOGS ----------
  const getLogsByDate = (date: string) => {
    return attendanceLogs
      .filter((l) => l.AttendanceDate.split("T")[0] === date)
      .sort(
        (a, b) =>
          new Date(a.LogTime).getTime() - new Date(b.LogTime).getTime()
      );
  };

  // ---------- CALCULATE HOURS ----------
  const calculateHours = (logs: AttendanceLog[]) => {
    let totalMinutes = 0;
    let inTime: Date | null = null;

    logs.forEach((log) => {
      const time = new Date(log.LogTime);

      if (log.LogTypeID === 1) {
        inTime = time;
      } else if (log.LogTypeID === 2 && inTime) {
        totalMinutes += (time.getTime() - inTime.getTime()) / 60000;
        inTime = null;
      }
    });

    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);

    return `${h}h ${m}m`;
  };

  // ---------- UI ----------
  return (
    <div className="container">
      <h3 className="text-center mb-4">Employee Attendance</h3>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label>Employee</label>
          <Select
            options={employees}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
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

        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={handleGetAttendance}
          >
            GET
          </button>
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
            {Object.keys(attendanceByDate).length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">
                  No records found
                </td>
              </tr>
            ) : (
              Object.entries(attendanceByDate).map(([date]) => {
                const logs = getLogsByDate(date);
                const hours = calculateHours(logs);

                return (
                  <React.Fragment key={date}>
                    <tr
                      className="table-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleExpand(date)}
                    >
                      <td>{date}</td>
                      <td>Click to view logs ({logs.length})</td>
                      <td>{hours}</td>
                    </tr>

                    {expandedDates[date] &&
                      logs.map((log) => (
                        <tr key={log.LogID}>
                          <td></td>
                          <td colSpan={2}>
                            <strong>
                              {log.LogTypeID === 1 ? "IN" : "OUT"}
                            </strong>{" "}
                            | {new Date(log.LogTime).toLocaleTimeString()} |{" "}
                            {log.DeviceName} | {log.IPAddress}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendancePage;