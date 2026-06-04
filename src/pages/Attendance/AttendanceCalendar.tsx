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
import holidayService from "../../services/holidayService";
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

const holidays: Holiday[] = [
  { date: "2026-02-01", name: "All Saints' Day" },
  { date: "2026-02-11", name: "Veterans Day" },
];

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

      const res =
        await employeeAttendanceService.getEmployeeAttendance(payload);

      const raw = res?.Table1 || [];

      setRawAttendance(raw);

      const grouped: Record<string, any[]> = {};

      raw.forEach((item: any) => {
        const d = item.AttendanceDate.split("T")[0];

        if (!grouped[d]) grouped[d] = [];

        grouped[d].push(item);
      });

      const mapped: AttendanceLog[] = Object.keys(grouped).map((day) => {
        const logs = grouped[day].sort(
          (a, b) =>
            new Date(a.LogTime).getTime() -
            new Date(b.LogTime).getTime()
        );

        let inTime: Date | null = null;

        let totalMinutes = 0;

        logs.forEach((log) => {
          const t = new Date(log.LogTime);

          if (log.LogTypeID === 1) inTime = t;
          else if (log.LogTypeID === 2 && inTime) {
            totalMinutes +=
              (t.getTime() - inTime.getTime()) / 60000;

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
          toast.warn(`Please enter both start and end time for ${row.date}.`);
          return;
        }
      }

      const getAttendanceInfo = (dateStr: string) => {
        const logs = rawAttendance.filter((item: any) =>
          item.AttendanceDate?.startsWith(dateStr)
        );
        if (logs.length === 0) {
          return { attendanceID: null, oldCheckInTime: null, oldCheckOutTime: null };
        }
        const sorted = [...logs].sort(
          (a: any, b: any) =>
            new Date(a.LogTime).getTime() - new Date(b.LogTime).getTime()
        );
        const attendanceID = logs[0].AttendanceID || null;
        const checkIn = sorted.find((l: any) => l.LogTypeID === 1);
        const checkOut = [...sorted].reverse().find((l: any) => l.LogTypeID === 2);
        return {
          attendanceID,
          oldCheckInTime: checkIn?.LogTime || null,
          oldCheckOutTime: checkOut?.LogTime || null,
        };
      };

    const formatDateTime = (dateStr: string, timeStr: string) =>
      `${dateStr}T${timeStr}:00`;

      for (const row of selectedDatesData) {
        const { attendanceID, oldCheckInTime, oldCheckOutTime } =
          getAttendanceInfo(row.date);

        const payload = {
          organizationID,
          attendanceID,
          correctionID: 0,
          correctionTypeID: correctionTypeMap[selectedAction] || null,
          oldCheckInTime: oldCheckInTime || formatDateTime(row.date, "00:00"),
          oldCheckOutTime: oldCheckOutTime || formatDateTime(row.date, "00:00"),
          newCheckInTime: formatDateTime(row.date, row.startTime),
          newCheckOutTime: formatDateTime(row.date, row.endTime),
          reason: `${selectedAction} request for ${row.date}`,
          remarks: "",
          statusID: 1,
          createdBy: employeeId,
        };

        const res = await employeeAttendanceService.submitAttendanceCorrection(payload);
        const result = Array.isArray(res) ? res[0] : res;
        if (result?.Message !== "Success") {
          throw new Error(result?.ErrorMessage || "Submission failed");
        }
      }

      toast.success(
        `Attendance ${selectedAction} request${selectedDatesData.length > 1 ? "s" : ""} submitted successfully!`
      );

      setShowModal(false);
      setCheckedDates({});
      setSelectedDatesData([]);
      setSelectedAction("");

      loadAttendance();
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
                              {log.logs[0]?.LogTime
                                ? new Date(
                                    log.logs[0].LogTime
                                  ).toLocaleTimeString()
                                : "-"}
                              {" | "}
                              OUT:{" "}
                              {log.logs[
                                log.logs.length - 1
                              ]?.LogTime
                                ? new Date(
                                    log.logs[
                                      log.logs.length - 1
                                    ].LogTime
                                  ).toLocaleTimeString()
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
                if (
                  tileDate.getMonth() !== date.getMonth()
                )
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