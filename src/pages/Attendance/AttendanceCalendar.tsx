import React, { useState } from "react";
import Calendar from "react-calendar";
import { OverlayTrigger, Tooltip, Modal, Button, Form } from "react-bootstrap";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

interface AttendanceLog {
  date: string;
  employee: string;
  status: "Present" | "Absent" | "Leave";
}

interface Holiday {
  date: string;
  name: string;
}

const attendanceLogs: AttendanceLog[] = [
  { date: "2026-02-01", employee: "jagadish k", status: "Present" },
  { date: "2026-02-14", employee: "jagadish k", status: "Absent" },
  { date: "2026-02-05", employee: "jagadish k", status: "Present" },
  { date: "2026-02-06", employee: "jagadish k", status: "Leave" },
  { date: "2026-02-07", employee: "jagadish k", status: "Present" },
  { date: "2026-01-08", employee: "jagadish k", status: "Absent" },
];

const holidays: Holiday[] = [
  { date: "2026-02-01", name: "All Saints' Day" },
  { date: "2026-02-11", name: "Veterans Day" },
];

const AttendanceCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [checkedDates, setCheckedDates] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const getLogsForDay = (day: Date) =>
    attendanceLogs.filter((log) => log.date === formatDate(day));

  const getHolidayForDay = (day: Date) =>
    holidays.find((h) => h.date === formatDate(day));

  const handleCheckboxToggle = (day: Date) => {
    const key = formatDate(day);
    setCheckedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal = (day: Date) => {
    setSelectedDate(day);
    setSelectedAction(""); // reset dropdown
    setShowModal(true);
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(e.target.value);
  };

  const handleModalSave = () => {
    alert(`Action "${selectedAction}" saved for ${formatDate(selectedDate!)}`);
    setShowModal(false);
  };

  return (
    <div className="container-fluid p-5">
      <h2 className="fw-bold mb-4 text-center">Attendance Calendar</h2>

      <div className="calendar-layout">
        <div className="calendar-left">
          <Calendar
            value={date}
            onClickDay={(d) => openModal(d)}
            calendarType="iso8601"
            tileContent={({ date: tileDate }) => {
              const logs = getLogsForDay(tileDate);
              const holiday = getHolidayForDay(tileDate);
              const key = formatDate(tileDate);

              return (
                <div className="attendance-logs-container">
                  <input
                    type="checkbox"
                    className="tile-checkbox"
                    checked={!!checkedDates[key]}
                    onChange={() => handleCheckboxToggle(tileDate)}
                  />
                  {holiday && <div className="holiday-log">🎉 {holiday.name}</div>}
                  {logs.map((log, idx) => (
                    <OverlayTrigger
                      key={idx}
                      placement="top"
                      overlay={<Tooltip id={`tooltip-${idx}`}>{log.employee}: {log.status}</Tooltip>}
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
                if (tileDate.getMonth() !== date.getMonth()) classes.push("other-month-day");
                if ([0, 6].includes(tileDate.getDay())) classes.push("weekend-day");
                if (getHolidayForDay(tileDate)) classes.push("holiday-day");
              }
              return classes.join(" ");
            }}
          />
        </div>

        {/* RIGHT SIDE – DETAILS / ACTIONS */}
        <div className="calendar-right">
          <div className="calendar-tile p-3">
            <h5 className="mb-3">Upcoming Info</h5>
            <div className="info-section mb-3">
              <h6 className="mb-2">🎉 Holidays</h6>
              {holidays.filter(h => new Date(h.date) >= new Date()).map((holiday, idx) => (
                <div key={idx} className="holiday-log mb-1">
                  {holiday.date}: {holiday.name}
                </div>
              ))}
            </div>

            <div className="info-section">
              <h6 className="mb-2">🏖 Upcoming Leaves</h6>
              {attendanceLogs
                .filter(log => new Date(log.date) >= new Date() && log.status === "Leave")
                .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((log, idx) => (
                  <div key={idx} className="attendance-log leave mb-1">
                    {log.date}: {log.employee}
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Modal ===== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedDate && formatDate(selectedDate)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="actionSelect">
            <Form.Label>Select Action</Form.Label>
            <Form.Select value={selectedAction} onChange={handleActionChange}>
              <option value="">-- Choose Action --</option>
              <option value="WFH">WFH</option>
              <option value="Leave">Leave</option>
              <option value="Login Missing">Login Missing</option>
              <option value="Logout Missing">Logout Missing</option>
              <option value="Early Logout">Early Logout</option>
              <option value="Early Login">Early Login</option>
            </Form.Select>
          </Form.Group>

          {/* Conditional content based on selection */}
          {selectedAction === "WFH" && <p className="mt-3">You can apply for Work From Home for this day.</p>}
          {selectedAction === "Leave" && <p className="mt-3">You can apply for Leave for this day.</p>}
          {(selectedAction === "Login Missing" || selectedAction === "Logout Missing") && (
            <p className="mt-3">Please provide the missing time details.</p>
          )}
          {(selectedAction === "Early Logout" || selectedAction === "Early Login") && (
            <p className="mt-3">Please provide the corrected time.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleModalSave} disabled={!selectedAction}>Save</Button>
        </Modal.Footer>
      </Modal>
       <style>{`
          .react-calendar {
          width: 100%;
          border: none;
          font-family: Arial, sans-serif;
          font-size: 1rem;
          border-radius: 12px;
        }

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

        .other-month-day {
          background-color: #f1f3f5;
          color: #868e96;
        }
        .other-month-day:hover {
          background-color: #e9ecef;
        }

        .weekend-day {
          background-color: #f0f0ff;
        }

        .holiday-day {
          background-color: #ffe6e6 !important;
          border-color: #ff4d4d !important;
        }

        .react-calendar__tile--now {
          background-color: #d7d15396 !important;
          border-color: #339af0 !important;
          font-weight: bold;
        }

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

        .holiday-log {
          background-color: #ffd6d6;
          color: #b71c1c;
          font-size: 0.75rem;
          border-radius: 6px;
          padding: 2px 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

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
        .calendar-action-btn {
          margin-top: 8px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 8px 14px;
          background-color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .calendar-action-btn:hover {
          border-color: #007bff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }       
        .calendar-tile {
          position: relative;
        }
        .tile-checkbox {
          position: absolute;
          bottom: 6px;
          right: 6px;
          cursor: pointer;
          transform: scale(1.05);
        }  .tile-checkbox {
          opacity: 0.6;
        }
        .calendar-tile:hover .tile-checkbox {
          opacity: 1;
        }
          /* ===== Calendar Navigation (Month / Year Header) ===== */
.react-calendar__navigation {
  margin-bottom: 12px;
  padding: 6px;
  border-radius: 10px;
  background-color: #1dc19669;
  border: 1px solid #dee2e6;
}

.react-calendar__navigation button {
  border-radius: 8px;
  font-weight: 600;
  color: #343a40;
  background: transparent;
  transition: all 0.2s;
}

.react-calendar__navigation button:hover {
  background-color: #e7f5ff;
  color: #084298;
}

.react-calendar__navigation button:disabled {
  background-color: transparent;
  color: #adb5bd;
}


.react-calendar__navigation__label {
  font-size: 1.1rem;
  font-weight: bold;
  color: #212529;
}

.react-calendar__navigation__label {
  font-size: 1.1rem;
  font-weight: bold;
  color: #212529;
}
.react-calendar__month-view__weekdays {
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #495057;
  margin-bottom: 6px;
}

.react-calendar__month-view__weekdays__weekday {
  padding: 6px 0;
}

.react-calendar__month-view__weekdays__weekday:first-child {
  color: #c92a2a;
}


.react-calendar__month-view__weekdays__weekday:last-child {
  color: #1864ab;
}


.react-calendar__month-view__weekdays abbr {
  text-decoration: none;
  cursor: default;
}

.calendar-layout {
  display: flex;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-left {
  width: 65%;
  min-width: 320px;
}

.calendar-left .react-calendar {
  max-height: 100%;
  overflow-y: auto;
}

.calendar-left .calendar-tile {
  height: 80px !important;
  position: relative;
}

.tile-checkbox {
  position: absolute;
  bottom: 6px;
  right: 6px;
}
  
      `}</style>
    </div>
  );
};

export default AttendanceCalendar;
