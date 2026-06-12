import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import {
  OverlayTrigger,
  Tooltip,
  Modal,
  Button,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import employeeAttendanceService from "../../services/employeeAttendanceService";
import  "../../css/AttendanceCalendar.css";

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

interface SelectedDateData {
  date: string;
  startTime: string;
  endTime: string;
}

const AttendanceCalendar: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");  
  const employeeId = user?.employeeID;
  const organizationID = user?.organizationID;  
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [checkedDates, setCheckedDates] = useState<Record<string, boolean>>(
    {}
  );

  const [showModal, setShowModal] = useState(false);

  const [selectedAction, setSelectedAction] = useState<string>("");

  const [attendanceData, setAttendanceData] = useState<AttendanceLog[]>([]);

  const [selectedDatesData, setSelectedDatesData] = useState<
    SelectedDateData[]
  >([]);

  const [rawAttendance, setRawAttendance] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

  const correctionTypeMap: Record<string, number> = {
    WFH: 1,
    WFONSITE: 2,
    CORRECTION: 3,
    "MISSED PUNCH": 4,
    "LATE LOGIN": 5,
    "EARLY LOGOUT": 6,
    "MANUAL REGULARIZATION": 7,
  };


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

    const [res, activitiesRes] = await Promise.all([
      employeeAttendanceService.getEmployeeAttendance(payload),
      employeeAttendanceService.GetEmployeeTimeActivities(payload),
    ]);

    const raw = res?.Table1 || [];
    const activitiesArr = Array.isArray(activitiesRes) ? activitiesRes : activitiesRes?.Table || [];

    setRawAttendance(raw);
    setActivities(activitiesArr || []);

    // populate holidays from activities where ActivityType === 'HOLIDAY'
    const holidayList: Holiday[] = (activitiesArr || [])
      .filter((a: any) => String(a.ActivityType).toUpperCase() === "HOLIDAY")
      .map((h: any) => ({ date: (h.ActivityDate || "").split("T")[0], name: h.Description || h.ActivityType }));

    setHolidays(holidayList);

    const grouped: Record<string, any[]> = {};

    raw.forEach((item: any) => {
      // 🔹 CONVERT LOG TIME TO IST DATE FOR GROUPING
      // If server does not send a 'Z' or offset suffix, append 'Z' to treat it as absolute UTC
      const rawLogTime = item.LogTime || "";
      const utcString = rawLogTime.endsWith("Z") || rawLogTime.includes("+") ? rawLogTime : `${rawLogTime}Z`;
      
      const logDateUtc = new Date(utcString);
      
      // Extract the local IST Date String (YYYY-MM-DD) matching Asia/Kolkata
      const istDateString = logDateUtc.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      if (!grouped[istDateString]) grouped[istDateString] = [];
      grouped[istDateString].push(item);
    });

    const mapped: AttendanceLog[] = Object.keys(grouped).map((day) => {
      // Sort logs by actual timestamp
      const logs = grouped[day].sort((a, b) => {
        const timeA = a.LogTime.endsWith("Z") || a.LogTime.includes("+") ? a.LogTime : `${a.LogTime}Z`;
        const timeB = b.LogTime.endsWith("Z") || b.LogTime.includes("+") ? b.LogTime : `${b.LogTime}Z`;
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      });

      let inTime: Date | null = null;
      let totalMinutes = 0;

      logs.forEach((log) => {
        const rawTime = log.LogTime || "";
        const utcString = rawTime.endsWith("Z") || rawTime.includes("+") ? rawTime : `${rawTime}Z`;
        const t = new Date(utcString);

        if (log.LogTypeID === 1) {
          inTime = t;
        } else if (log.LogTypeID === 2 && inTime) {
          totalMinutes += (t.getTime() - inTime.getTime()) / 60000;
          inTime = null;
        }
      });

      const hours = totalMinutes / 60;
      let status: "Present" | "Absent" | "Half Day" = "Absent";

      if (hours >= 6) status = "Present";
      else if (hours > 0) status = "Half Day";

      return {
        date: day, // This is now safely grouped under the IST string format "YYYY-MM-DD"
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

  // ---------------- CHECKBOX SELECT ----------------
  const handleCheckboxToggle = (day: Date) => {
    const key = formatDate(day);

    setCheckedDates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ---------------- SINGLE DAY MODAL ----------------
  const openModal = (day: Date) => {
    setSelectedDate(day);
    setSelectedAction("");
    setShowModal(true);
  };

  // ---------------- APPLY BUTTON ----------------
  const selectedDates = useMemo(() => {
    return Object.keys(checkedDates).filter(
      (key) => checkedDates[key]
    );
  }, [checkedDates]);

  const handleApply = () => {
  console.log("checkedDates", checkedDates);

  const rows: SelectedDateData[] = selectedDates.map((d) => ({
    date: d,
    startTime: "",
    endTime: "",
  }));

  console.log("rows", rows);

  setSelectedDatesData(rows);
  setSelectedAction("");
  setShowModal(true);
};

  // ---------------- UPDATE TIME ----------------
  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updated = [...selectedDatesData];

    updated[index][field] = value;

    setSelectedDatesData(updated);
  };

// ---------------- SAVE ----------------
const handleSave = async () => {
  try {
    if (!selectedAction) {
      toast.warn("Please select a request type.");
      return;
    }

    for (const row of selectedDatesData) {
      if (!row.startTime || !row.endTime) {
        toast.warn(
          `Please enter both start and end time for ${row.date}.`
        );
        return;
      }
    }

    const getAttendanceInfo = (dateStr: string) => {
      const logs = rawAttendance.filter(
        (item: any) =>
          item.AttendanceDate?.startsWith(dateStr)
      );

      if (logs.length === 0) {
        return {
          attendanceID: null,
          oldCheckInTime: null,
          oldCheckOutTime: null,
        };
      }

      const sorted = [...logs].sort(
        (a: any, b: any) =>
          new Date(a.LogTime).getTime() -
          new Date(b.LogTime).getTime()
      );

      const attendanceID =
        logs[0].AttendanceID || null;

      const checkIn = sorted.find(
        (l: any) => l.LogTypeID === 1
      );

      const checkOut = [...sorted]
        .reverse()
        .find((l: any) => l.LogTypeID === 2);

      return {
        attendanceID,
        oldCheckInTime:
          checkIn?.LogTime || null,
        oldCheckOutTime:
          checkOut?.LogTime || null,
      };
    };

    /**
     * Converts local/org time selected in UI
     * into UTC ISO string.
     *
     * Example:
     * 2025-09-28 + 09:00 (IST)
     * =>
     * 2025-09-28T03:30:00.000Z
     */
    const localToUtcIso = (
      dateStr: string,
      timeStr: string
    ) => {
      const [year, month, day] = dateStr
        .split("-")
        .map(Number);

      const [hours, minutes] = timeStr
        .split(":")
        .map(Number);

      const localDate = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        0,
        0
      );

      return localDate.toISOString();
    };

    for (const row of selectedDatesData) {
      const {
        attendanceID,
        oldCheckInTime,
        oldCheckOutTime,
      } = getAttendanceInfo(row.date);

      const payload = {
        organizationID,
        attendanceID,
        correctionID: 0,
        correctionTypeID:
          correctionTypeMap[selectedAction] ||
          null,

        // Existing values
        oldCheckInTime: oldCheckInTime
          ? new Date(oldCheckInTime).toISOString()
          : localToUtcIso(row.date, "00:00"),

        oldCheckOutTime: oldCheckOutTime
          ? new Date(oldCheckOutTime).toISOString()
          : localToUtcIso(row.date, "00:00"),

        // New corrected values
        newCheckInTime: localToUtcIso(
          row.date,
          row.startTime
        ),

        newCheckOutTime: localToUtcIso(
          row.date,
          row.endTime
        ),

        reason: `${selectedAction} request for ${row.date}`,
        remarks: "",
        statusID: 1,
        createdBy: employeeId,
      };

      console.log("Attendance Correction Payload", payload);

      const res =
        await employeeAttendanceService.submitAttendanceCorrection(
          payload
        );

      const result = Array.isArray(res)
        ? res[0]
        : res;

      if (result?.Message !== "Success") {
        throw new Error(
          result?.ErrorMessage ||
            "Submission failed"
        );
      }
    }

    toast.success(
      `Attendance ${selectedAction} request${
        selectedDatesData.length > 1 ? "s" : ""
      } submitted successfully!`
    );

    setShowModal(false);
    setCheckedDates({});
    setSelectedDatesData([]);
    setSelectedAction("");

    await loadAttendance();
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to submit attendance request.";

    toast.error(msg);
  }
};

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4 text-center">
        Attendance Calendar
      </h2>

      {/* APPLY BUTTON */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          className="px-4"
          disabled={selectedDates.length === 0}
          onClick={handleApply}
        >
          Apply ({selectedDates.length})
        </Button>
      </div>

      <div className="calendar-layout">
        <div className="calendar-left">
          <Calendar
            value={date}
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) {
                setDate(activeStartDate);
              }
            }}
            onClickDay={(d) => openModal(d)}
            tileContent={({ date: tileDate }) => {
              const logs = getLogsForDay(tileDate);

              const holiday = getHolidayForDay(tileDate);

              const key = formatDate(tileDate);

              return (
                <div className="tile-wrapper">
                  {/* CHECKBOX */}
                  <input
                    type="checkbox"
                    className="tile-checkbox"
                    checked={!!checkedDates[key]}
                    onChange={() =>
                      handleCheckboxToggle(tileDate)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* HOLIDAY */}
                  {holiday && (
                    <div className="holiday-log">
                      🎉 {holiday.name}
                    </div>
                  )}

                  {/* LOGS */}
                {logs.map((log, idx) => (
                  <OverlayTrigger
                    key={idx}
                    placement="top"
                    overlay={
                      <Tooltip>
                        {log.logs?.length ? (
                          <>
                            IN:{" "}
                            {log.logs[0]?.LogTime ? (() => {
                              // Ensure timestamp is parsed explicitly as UTC
                              const tStr = log.logs[0].LogTime;
                              const utcStr = tStr.endsWith("Z") || tStr.includes("+") ? tStr : `${tStr}Z`;
                              return new Date(utcStr).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              });
                            })() : "-"}
                            {" | "}
                            OUT:{" "}
                            {log.logs[log.logs.length - 1]?.LogTime ? (() => {
                              // Ensure timestamp is parsed explicitly as UTC
                              const tStr = log.logs[log.logs.length - 1].LogTime;
                              const utcStr = tStr.endsWith("Z") || tStr.includes("+") ? tStr : `${tStr}Z`;
                              return new Date(utcStr).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              });
                            })() : "-"}
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
                if (
                  tileDate.getMonth() !== date.getMonth()
                )
                  classes.push("other-month-day");

                if ([0, 6].includes(tileDate.getDay()))
                  classes.push("weekend-day");

                const key = formatDate(tileDate);

                // present if attendance logs exist for the day OR activities include present/leave/holiday
                const hasAttendance = attendanceData.some((a) => a.date === key);
                const presentTypes = new Set(["ATTENDANCE", "LEAVE", "ATTENDANCE_CORRECTION", "HOLIDAY"]);
                const hasActivity = activities.some((act) => {
                  const dt = (act.ActivityDate || "").split("T")[0];
                  return dt === key && presentTypes.has(String(act.ActivityType).toUpperCase());
                });

                if (hasAttendance || hasActivity) classes.push("present-day");
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Apply Attendance Request
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* REQUEST TYPE */}
          <div className="mb-4">
            <label className="fw-bold mb-2">
              Request Type
            </label>

            <Form.Select
              value={selectedAction}
              onChange={(e) =>
                setSelectedAction(e.target.value)
              }
            >
              <option value="">
                -- Choose Request Type --
              </option>

              <option value="WFH">WFH</option>

              <option value="WFONSITE">
                WFONSITE
              </option>

              <option value="CORRECTION">
                CORRECTION
              </option>

              <option value="MISSED PUNCH">
                MISSED PUNCH
              </option>

              <option value="LATE LOGIN">
                LATE LOGIN
              </option>

              <option value="EARLY LOGOUT">
                EARLY LOGOUT
              </option>

              <option value="MANUAL REGULARIZATION">
                MANUAL REGULARIZATION
              </option>
            </Form.Select>
          </div>

        {/* DYNAMIC ROWS */}
<div className="request-rows">

  {/* HEADER */}
  <Row className="fw-bold mb-2 px-2">
    <Col md={4}>Date</Col>
    <Col md={4}>Start Time</Col>
    <Col md={4}>End Time</Col>
  </Row>

  {/* ROWS */}
  {selectedDatesData.map((row, index) => (
    <div
      key={index}
      className="request-row mb-2"
    >
      <Row className="align-items-center">
        <Col md={4}>
          <Form.Control
            type="text"
            value={row.date}
            readOnly
          />
        </Col>

        <Col md={4}>
          <Form.Control
            type="time"
            value={row.startTime}
            onChange={(e) =>
              handleTimeChange(
                index,
                "startTime",
                e.target.value
              )
            }
          />
        </Col>

        <Col md={4}>
          <Form.Control
            type="time"
            value={row.endTime}
            onChange={(e) =>
              handleTimeChange(
                index,
                "endTime",
                e.target.value
              )
            }
          />
        </Col>
      </Row>
    </div>
  ))}
</div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={!selectedAction}
            onClick={handleSave}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
  
    </div>
  );
};

export default AttendanceCalendar;