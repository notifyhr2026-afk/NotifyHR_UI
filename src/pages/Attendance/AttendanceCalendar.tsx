import React, { useState } from "react";
import Calendar from "react-calendar";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface AttendanceLog {
  date: string; // YYYY-MM-DD
  employee: string;
  status: "Present" | "Absent" | "Leave";
}

const attendanceLogs: AttendanceLog[] = [
  { date: "2025-11-05", employee: "John Doe", status: "Present" },
  { date: "2025-11-05", employee: "Samantha Red", status: "Absent" },
  { date: "2025-11-06", employee: "Michael Adams", status: "Present" },
  { date: "2025-11-08", employee: "John Doe", status: "Leave" },
  { date: "2025-11-08", employee: "Alice Smith", status: "Present" },
  { date: "2025-11-08", employee: "Bob Brown", status: "Absent" },
];

const AttendanceCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());

  const getLogsForDay = (day: Date) => {
    const dayStr = day.toISOString().split("T")[0];
    return attendanceLogs.filter((log) => log.date === dayStr);
  };

  const handleDateChange = (value: any) => {
    if (!value) return;
    if (value instanceof Date) setDate(value);
    else if (Array.isArray(value)) {
      const firstDate = value.find((v: any) => v instanceof Date);
      if (firstDate) setDate(firstDate);
    }
  };

  return (
    <div className="container-fluid py-5">
      <h2 className="fw-bold mb-4 text-center">Attendance Calendar</h2>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Calendar
          value={date}
          onChange={handleDateChange}
          calendarType="iso8601"
          tileContent={({ date: tileDate, view }) => {
            const logs = getLogsForDay(tileDate);
            if (!logs.length) return null;

            return (
              <div className="attendance-logs-container">
                {logs.map((log, idx) => (
                  <OverlayTrigger
                    key={idx}
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-${idx}`}>
                        {log.employee}: {log.status}
                      </Tooltip>
                    }
                  >
                    <div
                      className={`attendance-log ${
                        log.status === "Present"
                          ? "present"
                          : log.status === "Absent"
                          ? "absent"
                          : "leave"
                      }`}
                    >
                      {log.status === "Present" && "✓ "}
                      {log.status === "Absent" && "✗ "}
                      {log.status === "Leave" && "🏖 "}
                      {log.employee}
                    </div>
                  </OverlayTrigger>
                ))}
              </div>
            );
          }}
          tileClassName={({ date: tileDate, view }) => {
            const classes = ["calendar-tile"];

            if (view === "month") {
              const currentMonth = date.getMonth();
              if (tileDate.getMonth() !== currentMonth) {
                classes.push("other-month-day");
              }
              const dayOfWeek = tileDate.getDay();
              if (dayOfWeek === 0 || dayOfWeek === 6) {
                classes.push("weekend-day");
              }
            }

            return classes.join(" ");
          }}
        />
      </div>

      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: Arial, sans-serif;
          font-size: 1rem;
          border-radius: 12px;
        }

        /* Day tiles */
        .calendar-tile {
          border: 1px solid #dee2e6 !important;
          border-radius: 8px;
          height: 120px !important;
          padding: 6px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          transition: all 0.2s;
          background-color: #fff;
        }

        .calendar-tile:hover {
          border-color: #007bff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        /* Previous/Next month days */
        .other-month-day {
          background-color: #f1f3f5;
          color: #868e96;
        }
        .other-month-day:hover {
          background-color: #e9ecef;
        }

        /* Weekends */
        .weekend-day {
          background-color: #3226d637;
        }

        /* Today highlight */
        .react-calendar__tile--now {
          background-color: #d7d15396 !important;
          border-color: #339af0 !important;
          font-weight: bold;
        }

        /* Weekdays header */
        .react-calendar__month-view__weekdays {
          border-bottom: 1px solid #adb5bd;
          font-weight: 600;
          color: #495057;
        }

        /* Attendance log container */
        .attendance-logs-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          max-height: 70px;
          margin-top: 4px;
        }

        .attendance-log {
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }

        .attendance-log:hover {
          border: 1px solid rgba(0,0,0,0.15);
          background-color: rgba(0,0,0,0.03);
        }

        .attendance-log.present {
          background-color: #d4edda;
          color: #155724;
        }
        .attendance-log.absent {
          background-color: #f8d7da;
          color: #721c24;
        }
        .attendance-log.leave {
          background-color: #fff3cd;
          color: #856404;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .calendar-tile {
            height: 100px !important;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .calendar-tile {
            height: 80px !important;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceCalendar;
