import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { OverlayTrigger, Tooltip, Modal, Button, Form } from "react-bootstrap";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import employeeAttendanceService from "../../services/employeeAttendanceService";
import holidayService from "../../services/holidayService";

interface Holiday {
  date: string;
  name: string;
}

interface AttendanceLog {
  date: string;
  employee: string;
  status: "Present" | "Absent" | "Half Day";
  logs?: any[];
}

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
  const [attendanceData, setAttendanceData] = useState<AttendanceLog[]>([]);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user?.employeeID;
  const organizationID = user?.organizationID;

  // ✅ month start → end
  const getMonthRange = () => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      fromDate: formatDate(start),
      toDate: formatDate(end),
    };
  };

  // ---------------- API CALL ----------------
  const loadAttendance = async () => {
    try {
      const { fromDate, toDate } = getMonthRange();

      const payload = {
        employeeID: employeeId,
        organizationID,
        fromDate,
        toDate,
      };

      const res = await employeeAttendanceService.getEmployeeAttendance(payload);

      const raw = res?.Table1 || [];

      const grouped: Record<string, any[]> = {};

      raw.forEach((item: any) => {
        const d = item.AttendanceDate.split("T")[0];
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(item);
      });

      const mapped: AttendanceLog[] = Object.keys(grouped).map((day) => {
        const logs = grouped[day].sort(
          (a, b) => new Date(a.LogTime).getTime() - new Date(b.LogTime).getTime()
        );

        let inTime: Date | null = null;
        let totalMinutes = 0;

        logs.forEach((log) => {
          const t = new Date(log.LogTime);

          if (log.LogTypeID === 1) inTime = t;
          else if (log.LogTypeID === 2 && inTime) {
            totalMinutes += (t.getTime() - inTime.getTime()) / 60000;
            inTime = null;
          }
        });

        const hours = totalMinutes / 60;

        let status: "Present" | "Absent" | "Half Day" = "Absent";
        if (hours >= 6) status = "Present";
        else if (hours > 0) status = "Half Day";

        return {
          date: day,
          employee: user?.employeeName || "Employee",
          status,
          logs,
        };
      });

      setAttendanceData(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (employeeId && organizationID) {
      loadAttendance();
    }
  }, [date]);

  const getLogsForDay = (day: Date) =>
    attendanceData.filter((x) => x.date === formatDate(day));

  const getHolidayForDay = (day: Date) =>
    holidays.find((h) => h.date === formatDate(day));

  const handleCheckboxToggle = (day: Date) => {
    const key = formatDate(day);
    setCheckedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal = (day: Date) => {
    setSelectedDate(day);
    setSelectedAction("");
    setShowModal(true);
  };

  const isToday = (d: string) => d === formatDate(new Date());

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4 text-center">Attendance Calendar</h2>

      <div className="calendar-layout">
        <div className="calendar-left">
          <Calendar
            value={date}
            onClickDay={(d) => openModal(d)}
            tileContent={({ date: tileDate }) => {
              const logs = getLogsForDay(tileDate);
              const holiday = getHolidayForDay(tileDate);
              const key = formatDate(tileDate);

              return (
                <div className="tile-wrapper">
                  
                  {/* ✅ FIXED CHECKBOX (VISIBLE ALWAYS) */}
                  <input
                    type="checkbox"
                    className="tile-checkbox"
                    checked={!!checkedDates[key]}
                    onChange={() => handleCheckboxToggle(tileDate)}
                  />

                  {holiday && (
                    <div className="holiday-log">🎉 {holiday.name}</div>
                  )}

                  {/* ONLY CURRENT DATE LOGS */}
                  {logs.map((log, idx) => (
                      <OverlayTrigger
                        key={idx}
                        placement="top"
                        overlay={
                        <Tooltip>
                          {log.logs?.length ? (
                            <>
                              IN: {log.logs[0]?.LogTime
                                ? new Date(log.logs[0].LogTime).toLocaleTimeString()
                                : "-"}
                              {" | "}
                              OUT: {log.logs[log.logs.length - 1]?.LogTime
                                ? new Date(log.logs[log.logs.length - 1].LogTime).toLocaleTimeString()
                                : "-"}
                            </>
                          ) : (
                            "No logs"
                          )}
                        </Tooltip>
                      }
                      >
                        <div
                          className={`attendance-log ${
                            log.status === "Present"
                              ? "present"
                              : log.status === "Half Day"
                              ? "leave"
                              : "absent"
                          }`}
                        >
                          {log.status === "Present" && "✓ "}
                          {log.status === "Half Day" && "◐ "}
                          {log.status === "Absent" && "✗ "}
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
                if (tileDate.getMonth() !== date.getMonth())
                  classes.push("other-month-day");
                if ([0, 6].includes(tileDate.getDay()))
                  classes.push("weekend-day");
              }
              return classes.join(" ");
            }}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="calendar-right">
          <div className="calendar-tile p-3">
            <h5>Upcoming Holidays</h5>
            {holidays.map((h, i) => (
              <div key={i}>
                {h.date} - {h.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDate && formatDate(selectedDate)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            <option value="">-- Choose Action --</option>
            <option value="WFH">WFH</option>
            <option value="Leave">Leave</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button disabled={!selectedAction}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* ---------------- CSS FIX ---------------- */}
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