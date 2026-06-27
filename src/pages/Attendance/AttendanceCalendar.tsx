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
  const [activityMap, setActivityMap] = useState<Record<string, any[]>>({});
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

    const [activitiesRes] = await Promise.all([
      employeeAttendanceService.GetEmployeeTimeActivities(payload),
    ]);

   
    const activitiesArr = Array.isArray(activitiesRes) ? activitiesRes : activitiesRes?.Table || [];
    
   
    setActivities(activitiesArr || []);

    const groupedActivities: Record<string, any[]> = {};

activitiesArr.forEach((item: any) => {
  const dateKey = item.ActivityDate.split("T")[0];

  if (!groupedActivities[dateKey]) {
    groupedActivities[dateKey] = [];
  }

  groupedActivities[dateKey].push(item);
});

setActivityMap(groupedActivities);

    // populate holidays from activities where ActivityType === 'HOLIDAY'
    const holidayList: Holiday[] = (activitiesArr || [])
      .filter((a: any) => String(a.ActivityType).toUpperCase() === "HOLIDAY")
      .map((h: any) => ({ date: (h.ActivityDate || "").split("T")[0], name: h.Description || h.ActivityType }));

    setHolidays(holidayList);

    const grouped: Record<string, any[]> = {};

  
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

const getActivitiesForDay = (day: Date) => {
  return activityMap[formatDate(day)] || [];
};

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
            
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const currentTileDate = new Date(tileDate);
              currentTileDate.setHours(0, 0, 0, 0);

              const isPastOrToday = currentTileDate <= today;
              const activities = getActivitiesForDay(tileDate);

              const holiday = getHolidayForDay(tileDate);
const isWeekend =
  tileDate.getDay() === 0 || tileDate.getDay() === 6;
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
                  {/* {holiday && (
                    <div className="holiday-log">
                      🎉 {holiday.name}
                    </div>
                  )} */}

                  {/* LOGS */}
                {activities.map((activity, idx) => {
  const type = activity.ActivityType?.toUpperCase();
const displayText =
  type === "ATTENDANCE"
    ? "Present"
    : type === "ATTENDANCE_CORRECTION"
    ? "Attendance Correction"
    : type === "LEAVE"
    ? "Leave"
    : type === "HOLIDAY"
    ? "Holiday"
    : "Absent";
  let className = "absent";

  if (type === "ATTENDANCE") {
    className = "attendance";
  } else if (type === "ATTENDANCE_CORRECTION") {
    className = "attendance-correction";
  } else if (type === "LEAVE") {
    className = "leave";
  } else if (type === "HOLIDAY") {
    className = "holiday";
  }
  else className = "absent";

  return (
    <OverlayTrigger
      key={idx}
      placement="top"
      overlay={
        <Tooltip>
          <div>
            <strong>{type}</strong>
          </div>

          {activity.CheckInTime && (
            <div>
              IN:{" "}
              {new Date(
                activity.CheckInTime
              ).toLocaleTimeString("en-IN")}
            </div>
          )}

          {activity.CheckOutTime && (
            <div>
              OUT:{" "}
              {new Date(
                activity.CheckOutTime
              ).toLocaleTimeString("en-IN")}
            </div>
          )}

          {activity.Description && (
            <div>{activity.Description}</div>
          )}
        </Tooltip>
      }
    >
      <div className={`attendance-log ${className}`}>
          {displayText}
      </div>
    </OverlayTrigger>
  );
})}
{activities.length === 0 &&
  isPastOrToday &&
  !isWeekend && (
    <div className="attendance-log absent">
      ABSENT
    </div>
)}

                </div>
              );
            }}
           tileClassName={({ date: tileDate, view }) => {
  const classes = ["calendar-tile"];

  if (view === "month") {
    const key = formatDate(tileDate);

    const dayActivities = activityMap[key] || [];

    if (dayActivities.some(a => a.ActivityType === "ATTENDANCE")) {
      classes.push("attendance-day");
    } else if (
      dayActivities.some(
        a => a.ActivityType === "ATTENDANCE_CORRECTION"
      )
    ) {
      classes.push("attendance-correction-day");
    } else if (
      dayActivities.some(a => a.ActivityType === "LEAVE")
    ) {
      classes.push("leave-day");
    } else if (
      dayActivities.some(a => a.ActivityType === "HOLIDAY")
    ) {
      classes.push("holiday-day");
    } 
     else {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentTileDate = new Date(tileDate);
  currentTileDate.setHours(0, 0, 0, 0);
  const isWeekend =
  tileDate.getDay() === 0 || tileDate.getDay() === 6;
 if (
  currentTileDate <= today &&
  !isWeekend
) {
  classes.push("absent-day");
}
}
    
  }

  return classes.join(" ");
}}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="calendar-right">
          {/* APPLY BUTTON */}
      <div className="d-flex justify-content mb-3">
        <Button
          className="px-4"
          disabled={selectedDates.length === 0}
          onClick={handleApply}
        >
          Apply ({selectedDates.length})
        </Button>
      </div>
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
          <div className="alert alert-info mt-2 py-2">
  <i className="bi bi-info-circle me-2"></i>
  Please enter <strong>Start Time</strong> and <strong>End Time</strong> using the
  <strong> 24-hour format (HH:mm)</strong>.
  <br />
  Examples: <strong>09:00</strong>, <strong>13:30</strong>, <strong>18:45</strong>.
</div>
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