import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import employeeAttendanceService from '../../services/employeeAttendanceService';

interface ClockRecord {
  type: 'IN' | 'OUT';
  time: string;
}

const EmployeeClock: React.FC = () => {
  // ✅ Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId: number | undefined = user?.employeeID;

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString()
  );

  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [attendanceId, setAttendanceId] = useState<number>(0);

  // ⏱ Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 📥 Load today's attendance
  useEffect(() => {
    if (employeeId) {
      loadTodayAttendance();
    }
  }, [employeeId]);

  const loadTodayAttendance = async () => {
    try {
      const data = await employeeAttendanceService.getEmployeeAttendanceByEmployeeId(employeeId!);

      const summary = data?.Table || [];
      const logs = data?.Table1 || [];

      if (summary.length > 0) {
        const att = summary[0];
        setAttendanceId(att.AttendanceID);

        // 🔥 Convert logs into UI format
        const temp: ClockRecord[] = logs.map((log: any) => ({
          type: log.LogTypeID === 1 ? 'IN' : 'OUT',
          time: new Date(log.LogTime).toLocaleTimeString()
        }));

        setRecords(temp);
      } else {
        setAttendanceId(0);
        setRecords([]);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  // 🕒 Handle Clock IN / OUT
  const handleClock = async (type: 'IN' | 'OUT') => {
    const confirmMsg = `Are you sure you want to Clock ${type === 'IN' ? 'In' : 'Out'}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const now = new Date();

      const payload: any = {
        AttendanceID: attendanceId,
        EmployeeID: employeeId,
        AttendanceDate: now.toISOString().split('T')[0],
        AttendanceTypeID: 1, // Web Clock
        CheckInTime: null,
        CheckOutTime: null,
        IsLate: false,
        IsHalfDay: false,
        IsApproved: true,
        Remarks: '',
        Source: 'Web Clock',
      };

      if (type === 'IN') {
        payload.CheckInTime = now;
      } else {
        payload.CheckOutTime = now;
      }

      await employeeAttendanceService.CreateOrUpdateEmployeeAttendanceByemployeeId(payload);

      // 🔄 Refresh UI
      await loadTodayAttendance();

    } catch (error) {
      console.error("Clock error:", error);
      alert("Something went wrong!");
    }
  };

  // 🚫 If user not found
  if (!employeeId) {
    return <div className="text-center mt-5">User not found</div>;
  }

  // 🔥 Last record (for enabling/disabling buttons)
  const lastRecord = records[records.length - 1];
  const lastType = lastRecord?.type;

  return (
    <div className="container">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h4>Employee Clock In / Clock Out</h4>
        </div>

        <div className="card-body text-center">
          <h5 className="mb-3">Current Time: {currentTime}</h5>

          {/* 🔘 Buttons */}
          <div className="d-flex justify-content-center gap-3 mb-3">
            <button
              className="btn btn-success btn-lg"
              onClick={() => handleClock('IN')}
              disabled={lastType === 'IN'}
            >
              Clock In
            </button>

            <button
              className="btn btn-danger btn-lg"
              onClick={() => handleClock('OUT')}
              disabled={lastType !== 'IN'}
            >
              Clock Out
            </button>
          </div>

          <hr />

          {/* 📋 Records */}
          <h5>Today Records</h5>

          {records.length === 0 ? (
            <p>No clock in/out records yet.</p>
          ) : (
            <ul className="list-group">
              {records.map((rec, idx) => (
                <li
                  key={idx}
                  className={`list-group-item d-flex justify-content-between ${
                    rec.type === 'IN'
                      ? 'list-group-item-success'
                      : 'list-group-item-danger'
                  }`}
                >
                  <span>
                    {rec.type === 'IN' ? 'Clock In' : 'Clock Out'}
                  </span>
                  <span>{rec.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeClock;