// EmployeeClock.tsx
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ClockRecord {
  type: 'IN' | 'OUT';
  time: string;
}

const EmployeeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [records, setRecords] = useState<ClockRecord[]>([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClock = (type: 'IN' | 'OUT') => {
    const confirmMsg = `Are you sure you want to Clock ${type === 'IN' ? 'In' : 'Out'}?`;
    if (window.confirm(confirmMsg)) {
      const newRecord: ClockRecord = { type, time: currentTime };
      setRecords(prev => [...prev, newRecord]);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h4>Employee Clock In / Clock Out</h4>
        </div>
        <div className="card-body text-center">
          <h5 className="mb-3">Current Time: {currentTime}</h5>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <button className="btn btn-success btn-lg" onClick={() => handleClock('IN')}>
              Clock In
            </button>
            <button className="btn btn-danger btn-lg" onClick={() => handleClock('OUT')}>
              Clock Out
            </button>
          </div>
          <hr />
          <h5>Recent Records</h5>
          {records.length === 0 ? (
            <p>No clock in/out records yet.</p>
          ) : (
            <ul className="list-group">
              {records.slice(-5).reverse().map((rec, idx) => (
                <li
                  key={idx}
                  className={`list-group-item d-flex justify-content-between ${
                    rec.type === 'IN' ? 'list-group-item-success' : 'list-group-item-danger'
                  }`}
                >
                  <span>{rec.type === 'IN' ? 'Clock In' : 'Clock Out'}</span>
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
