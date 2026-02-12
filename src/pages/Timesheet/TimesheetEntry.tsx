import React, { useMemo, useState } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import timesheetService from '../../services/timesheetService';
import shiftService from '../../services/shiftService';

/* ================= CONFIG ================= */

// 0 = Sunday, 6 = Saturday
const WEEK_OFF_CONFIG: number[] = [0, 6];

/* ================= TYPES ================= */

type Status = "PENDING" | "APPROVED";
type Activity =
  | "PRESENT"
  | "HOLIDAY"
  | "LEAVE"
  | "HALF_LEAVE"
  | "WEEKOFF";

interface Project {
  projectId: number;
  projectName: string;
}

interface TimesheetEntry {
  date: string;
  shift: string;
  activity: Activity;
  hours: number;
  status: Status;
}

interface ProjectTimesheet {
  projectId: number;
  entries: TimesheetEntry[];
}

interface CalendarDay {
  date: string;
  type: "HOLIDAY" | "LEAVE" | "HALF_LEAVE";
}

/* ================= MOCK DATA ================= */

const projects: Project[] = [
  { projectId: 1, projectName: "Project A" },
  { projectId: 2, projectName: "Project B" },
];

const shiftOptions = ["General", "Night"];
const activityOptions: Activity[] = [
  "PRESENT",
  "HALF_LEAVE",
  "LEAVE",
  "HOLIDAY",
  "WEEKOFF",
];

/* ================= HELPERS ================= */

const generateDates = (from: string, to: string): string[] => {
  if (!from || !to) return [];
  const dates: string[] = [];
  let current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const isMoreThanOneMonth = (from: string, to: string): boolean => {
  const start = new Date(from);
  const max = new Date(start);
  max.setMonth(max.getMonth() + 1);
  return new Date(to) > max;
};

const isWeekOff = (date: string): boolean => {
  const day = new Date(date).getDay();
  return WEEK_OFF_CONFIG.includes(day);
};

/* ================= MOCK API ================= */

const fetchCalendarData = async (
  from: string,
  to: string
): Promise<CalendarDay[]> => {
  return [
    { date: "2026-01-01", type: "HOLIDAY" },
    { date: "2026-01-03", type: "LEAVE" },
    { date: "2026-01-04", type: "HALF_LEAVE" },
  ];
};

/* ================= MAIN COMPONENT ================= */

const TimesheetEntry: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [timesheets, setTimesheets] = useState<ProjectTimesheet[]>([]);

  const dates = useMemo(
    () => generateDates(fromDate, toDate),
    [fromDate, toDate]
  );

  /* ===== LOAD TIMESHEETS ===== */
  const loadTimesheets = async () => {
    const calendarData = await fetchCalendarData(fromDate, toDate);

    const entries: TimesheetEntry[] = [];

    dates.forEach((date) => {
      const calendarDay = calendarData.find((c) => c.date === date);

      // 🔹 HALF DAY LEAVE → SHOW DATE TWICE
      if (calendarDay?.type === "HALF_LEAVE") {
        entries.push(
          {
            date,
            shift: "General",
            activity: "HALF_LEAVE",
            hours: 4,
            status: "PENDING",
          },
          {
            date,
            shift: "General",
            activity: "PRESENT",
            hours: 4,
            status: "PENDING",
          }
        );
        return;
      }

      let activity: Activity = "PRESENT";

      if (calendarDay?.type === "HOLIDAY") activity = "HOLIDAY";
      else if (calendarDay?.type === "LEAVE") activity = "LEAVE";
      else if (isWeekOff(date)) activity = "WEEKOFF";

      entries.push({
        date,
        shift: "General",
        activity,
        hours: activity === "PRESENT" ? 8 : 0,
        status: "PENDING",
      });
    });

    setTimesheets(
      projects.map((p) => ({
        projectId: p.projectId,
        entries,
      }))
    );
  };

  /* ===== UPDATE ENTRY ===== */
  const updateEntry = (
    projectId: number,
    date: string,
    index: number,
    field: keyof TimesheetEntry,
    value: any
  ) => {
    setTimesheets((prev) =>
      prev.map((p) =>
        p.projectId !== projectId
          ? p
          : {
              ...p,
              entries: p.entries.map((e, i) =>
                i !== index || e.date !== date
                  ? e
                  : {
                      ...e,
                      [field]: value,
                      hours:
                        field === "activity" && value === "PRESENT"
                          ? 8
                          : field === "activity" && value !== "PRESENT"
                          ? 0
                          : e.hours,
                    }
              ),
            }
      )
    );
  };

  /* ===== SAVE PROJECT ===== */
const saveProject = async (projectId: number) => {
  try {
    const projectSheet = timesheets.find(
      (p) => p.projectId === projectId
    );

    if (!projectSheet) return;

    // 🔹 Convert UI entries → API format
    const timesheetPayload = projectSheet.entries.map((entry, index) => ({
      TimesheetID: 0, // 0 for new entry
      EmployeeID: 1,  // Replace with logged-in employee ID
      ProjectID: projectId,
      EntryDate: entry.date,
      Shift: entry.shift,
      Activity: entry.activity,
      Hours: entry.hours,
    }));

    const requestBody = {
      createdBy: "Admin", // Replace with logged-in username
      timesheetEntryJson: JSON.stringify(timesheetPayload),
    };

    console.log("Final Request:", requestBody);

    const response = await timesheetService.createTimesheetEntries(
      requestBody
    );

    if (response.length > 0) {
      alert(response[0].msg);
    } else {
      alert("Timesheet saved successfully.");
    }
  } catch (error) {
    console.error("Save Error:", error);
    alert("Error saving timesheet.");
  }
};


  return (
    <Card className="p-5">
      <h5 className="mb-3">Timesheet</h5>

      {/* DATE RANGE */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setToDate("");
            }}
          />
        </Col>

        <Col md={3}>
          <Form.Control
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => {
              if (fromDate && isMoreThanOneMonth(fromDate, e.target.value)) {
                alert("You can select a maximum of one month only.");
                return;
              }
              setToDate(e.target.value);
            }}
          />
        </Col>

        <Col md={3}>
          <Button onClick={loadTimesheets} disabled={!fromDate || !toDate}>
            Load
          </Button>
        </Col>
      </Row>

      {/* PROJECT ACCORDION */}
      <Accordion alwaysOpen>
        {projects.map((project) => {
          const projectSheet = timesheets.find(
            (p) => p.projectId === project.projectId
          );

          return (
            <Accordion.Item
              key={project.projectId}
              eventKey={project.projectId.toString()}
            >
              <Accordion.Header>{project.projectName}</Accordion.Header>

              <Accordion.Body>
                <Table bordered size="sm" responsive>
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Shift</th>
                      <th>Activity</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projectSheet?.entries.map((entry, index) => (
                      <tr key={`${entry.date}-${index}`}>
                        <td>{entry.date}</td>

                        <td>
                          <Form.Select
                            size="sm"
                            value={entry.shift}
                            onChange={(e) =>
                              updateEntry(
                                project.projectId,
                                entry.date,
                                index,
                                "shift",
                                e.target.value
                              )
                            }
                          >
                            {shiftOptions.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Select
                            size="sm"
                            value={entry.activity}
                            onChange={(e) =>
                              updateEntry(
                                project.projectId,
                                entry.date,
                                index,
                                "activity",
                                e.target.value as Activity
                              )
                            }
                          >
                            {activityOptions.map((a) => (
                              <option key={a}>{a}</option>
                            ))}
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={entry.hours}
                            disabled={entry.activity !== "PRESENT"}
                          />
                        </td>

                        <td>
                          <Badge bg="warning">{entry.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="text-end">
                  <Button
                    variant="success"
                    onClick={() => saveProject(project.projectId)}
                  >
                    Save {project.projectName}
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Card>
  );
};

export default TimesheetEntry;
