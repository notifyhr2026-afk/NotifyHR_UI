import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/EmployeeClock.css';
import employeeAttendanceService from '../../services/employeeAttendanceService';
import FullPageLoader  from '../FullPageLoader';

interface ClockRecord {
  type: 'IN' | 'OUT';
  time: string;
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);

const getClockAngles = (date: Date) => {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return {
    hourAngle: (hours * 30) + (minutes * 0.5),
    minuteAngle: minutes * 6 + seconds * 0.1,
    secondAngle: seconds * 6,
  };
};

const EmployeeClock: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const employeeId = user?.employeeID;
  const organizationID: number | undefined = user?.organizationID;
  const employeeName: number | undefined = user?.fullName;
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  const [clockAngles, setClockAngles] = useState(() => getClockAngles(new Date()));

  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [attendanceId, setAttendanceId] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatTime(now));
      setClockAngles(getClockAngles(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (employeeId) {
      loadTodayAttendance();
    }
  }, [employeeId]);

  const loadTodayAttendance = async () => {
    try {
      const data =
        await employeeAttendanceService.getEmployeeAttendanceByEmployeeId(
          employeeId
        );

      const summary = data?.Table || [];
      const logs = data?.Table1 || [];

      if (summary.length > 0) {
        setAttendanceId(summary[0].AttendanceID);

        const temp: ClockRecord[] = logs.map((log: any) => ({
          type: log.LogTypeID === 1 ? 'IN' : 'OUT',
          time: formatTime(new Date(log.LogTime)),
        }));

        setRecords(temp);
      } else {
        setAttendanceId(0);
        setRecords([]);
      }
    } catch (error) {
      console.error('Attendance Load Error:', error);
    }
  };

  const getCurrentLocation = async () => {
    return new Promise<{
      latitude?: number;
      longitude?: number;
      accuracy?: number;
    }>((resolve) => {
      if (!navigator.geolocation) {
        resolve({});
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        () => resolve({}),
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    });
  };

  const getIPAddress = async () => {
    try {
      const response = await fetch(
        'https://api.ipify.org?format=json'
      );

      const data = await response.json();

      return data.ip;
    } catch {
      return '';
    }
  };

  const getAddress = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      const data = await response.json();

      return data.display_name || '';
    } catch {
      return '';
    }
  };

  const handleClock = async (type: 'IN' | 'OUT') => {
    const confirmMsg = `Are you sure you want to Clock ${
      type === 'IN' ? 'In' : 'Out'
    }?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);

      const now = new Date();

      setLoadingMessage('Getting GPS Location and IP Address...');

      const [location, ipAddress] = await Promise.all([
        getCurrentLocation(),
        getIPAddress(),
      ]);

      let locationAddress = '';

      if (location.latitude && location.longitude) {
        setLoadingMessage('Getting Address Information...');

        locationAddress = await getAddress(
          location.latitude,
          location.longitude
        );
      }

      setLoadingMessage('Saving Attendance...');

      const payload: any = {
        AttendanceID: attendanceId,
        EmployeeID: employeeId,
        AttendanceDate: now.toISOString().split('T')[0],
        AttendanceTypeID: 1,
        LogTypeID: type === 'IN' ? 1 : 2,
        LogTime: now.toISOString(),
        Source: 'Web Clock',
        Remarks: '',

        Devicename: navigator.platform,
        DeviceType: 'Web',
        BrowserInfo: navigator.userAgent,
        UserAgent: navigator.userAgent,

        OrganizationId: organizationID,

        IsApproved: true,
        IsLate: false,
        IsHalfDay: false,
        EmployeeName: employeeName,
      };

      if (type === 'IN') {
        payload.CheckInTime = now.toISOString();
      } else {
        payload.CheckOutTime = now.toISOString();
      }

      if (ipAddress) {
        payload.IpAddress = ipAddress;
      }

      if (location.latitude) {
        payload.Latitude = location.latitude;
      }

      if (location.longitude) {
        payload.Longitude = location.longitude;
      }

      if (location.accuracy) {
        payload.LocationAccuracy = Number(
          location.accuracy.toFixed(2)
        );
      }

      if (locationAddress) {
        payload.LocationAddress = locationAddress;
      }

      if (location.latitude && location.longitude) {
        payload.LocationSource = 'GPS';
      }

      await employeeAttendanceService.LogEmployeeAttendanceAsync(
        payload
      );

      await loadTodayAttendance();

      alert(
        type === 'IN'
          ? 'Clock In Successful'
          : 'Clock Out Successful'
      );
    } catch (error) {
      console.error('Clock Error:', error);
      alert('Failed to save attendance.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  if (!employeeId) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          Employee not found. Please login again.
        </div>
      </div>
    );
  }

  const lastRecord = records[records.length - 1];
  const lastType = lastRecord?.type;
  const totalIns = records.filter((record) => record.type === 'IN').length;
  const totalOuts = records.filter((record) => record.type === 'OUT').length;
  const employeeDisplayName = user?.fullName || 'Employee';

  return (
    <>
      {loading && (
        <FullPageLoader message={loadingMessage} />
      )}

      <div className="container m-0 w-100 p-0">
        <div className="employee-clock-card">
          <div className="clock-hero">
            <div>
              <p className="clock-eyebrow">Self Attendance</p>
              <h2>Welcome back, {employeeDisplayName}</h2>
              <p className="clock-hero-text">
                Keep your daily attendance simple, fast, and organized.
              </p>
            </div>

            <div className={`clock-status-pill ${lastType === 'IN' ? 'active' : 'ready'}`}>
              <span className="status-dot" />
              {lastType === 'IN' ? 'Currently Clocked In' : 'Ready to Clock In'}
            </div>
          </div>

          <div className="clock-body">
            <div className="clock-dashboard">
              <div className="clock-time-panel">
                <p className="clock-label">Current Time</p>
                <div className="clock-time-display">
                  <div className="clock-timer-icon" aria-hidden="true">
                    <span className="clock-timer-face" />
                    <span
                      className="clock-timer-hour"
                      style={{ transform: `translateX(-50%) rotate(${clockAngles.hourAngle}deg)` }}
                    />
                    <span
                      className="clock-timer-minute"
                      style={{ transform: `translateX(-50%) rotate(${clockAngles.minuteAngle}deg)` }}
                    />
                    <span
                      className="clock-timer-second"
                      style={{ transform: `translateX(-50%) rotate(${clockAngles.secondAngle}deg)` }}
                    />
                    <span className="clock-timer-center" />
                  </div>
                  <div className="clock-time-value">
                    {currentTime.replace(/\s*(AM|PM)$/i, '')}
                    <span className="clock-ampm">{currentTime.match(/(AM|PM)$/i)?.[0] || ''}</span>
                  </div>
                </div>
                <p className="clock-actions-note">
                  {lastType === 'IN'
                    ? 'You have clocked in. Please clock out when your shift ends.'
                    : 'Ready to clock in for your next shift.'}
                </p>
              </div>

              <div className="clock-actions-panel">
                <div className="clock-action-btns">
                  <button
                    className="btn btn-outline-success btn-lg"
                    onClick={() => handleClock('IN')}
                    disabled={loading || lastType === 'IN'}
                  >
                    Clock In
                  </button>

                  <button
                    className="btn btn-outline-danger btn-lg"
                    onClick={() => handleClock('OUT')}
                    disabled={loading || lastType !== 'IN'}
                  >
                    Clock Out
                  </button>
                </div>
              </div>
            </div>

            <div className="clock-summary">
              <div className="clock-summary-item">
                <span className="summary-label">Clocked In</span>
                <strong>{totalIns}</strong>
              </div>
              <div className="clock-summary-item">
                <span className="summary-label">Clocked Out</span>
                <strong>{totalOuts}</strong>
              </div>
            </div>

            <div className="clock-record-section">
              <div className="clock-section-title">Today's Records</div>

              {records.length === 0 ? (
                <div className="clock-empty-state">No clock records found.</div>
              ) : (
                <ul className="list-group clock-records">
                  {records.map((record, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <span className={`clock-badge ${record.type === 'IN' ? 'in' : 'out'}`}>
                          {record.type}
                        </span>
                        <span className="ms-3 clock-record-status">
                          {record.type === 'IN' ? 'Clock In' : 'Clock Out'}
                        </span>
                      </div>

                      <span className="clock-record-time">
                        {record.time}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeClock;