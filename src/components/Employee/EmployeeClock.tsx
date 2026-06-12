import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import employeeAttendanceService from '../../services/employeeAttendanceService';

interface ClockRecord {
  type: 'IN' | 'OUT';
  time: string;
}

const EmployeeClock: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeId = user?.employeeID;
  const organizationID: number | undefined = user?.organizationID;

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [attendanceId, setAttendanceId] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
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
          time: new Date(log.LogTime).toLocaleTimeString(),
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

      const location = await getCurrentLocation();

      const ipAddress = await getIPAddress();

      let locationAddress = '';

      if (location.latitude && location.longitude) {
        locationAddress = await getAddress(
          location.latitude,
          location.longitude
        );
      }

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

        OrganizationId:organizationID,

        IsApproved: true,
        IsLate: false,
        IsHalfDay: false,
      };

      // Check In / Out
      if (type === 'IN') {
        payload.CheckInTime = now.toISOString();
      } else {
        payload.CheckOutTime = now.toISOString();
      }

      // IP Address
      if (ipAddress) {
        payload.IpAddress = ipAddress;
      }

      // Location Details
      if (location.latitude) {
        payload.Latitude = location.latitude;
      }

      if (location.longitude) {
        payload.Longitude = location.longitude;
      }

      if (location.accuracy) {
        payload.LocationAccuracy =
          Number(location.accuracy.toFixed(2));
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

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">
            Employee Clock In / Clock Out
          </h4>
        </div>

        <div className="card-body text-center">
          <h5 className="mb-4">
            Current Time: {currentTime}
          </h5>

          <div className="d-flex justify-content-center gap-3 mb-4">
            <button
              className="btn btn-success btn-lg"
              onClick={() => handleClock('IN')}
              disabled={loading || lastType === 'IN'}
            >
              {loading ? 'Processing...' : 'Clock In'}
            </button>

            <button
              className="btn btn-danger btn-lg"
              onClick={() => handleClock('OUT')}
              disabled={loading || lastType !== 'IN'}
            >
              {loading ? 'Processing...' : 'Clock Out'}
            </button>
          </div>

          <hr />

          <h5>Today's Records</h5>

          {records.length === 0 ? (
            <p>No clock records found.</p>
          ) : (
            <ul className="list-group">
              {records.map((record, index) => (
                <li
                  key={index}
                  className={`list-group-item d-flex justify-content-between ${
                    record.type === 'IN'
                      ? 'list-group-item-success'
                      : 'list-group-item-danger'
                  }`}
                >
                  <span>
                    {record.type === 'IN'
                      ? 'Clock In'
                      : 'Clock Out'}
                  </span>

                  <span>{record.time}</span>
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