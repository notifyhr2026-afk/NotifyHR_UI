import React, { useMemo, useState, useEffect } from "react";
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
import timesheetService from "../../services/timesheetService";
import shiftService from "../../services/shiftService";
import employeeProjectService from "../../services/employeeProjectService";

/* ================= CONFIG ================= */

const WEEK_OFF_CONFIG: number[] = [0, 6];

/* ================= TYPES ================= */

type Status = "PENDING" | "APPROVED";

interface Project {
  projectId: number;
  projectName: string;
}

interface ShiftOption {
  value: number;
  label: string;
}

interface ActivityOption {
  value: number;
  label: string;
}

interface TimesheetEntry {
  date: string;
  shift: string;
  shiftId: number;
  activity: string;
  activityId: number;
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

/* ===== SAFE ACTIVITY MATCH ===== */
const normalize = (val: string) =>
  val.replace(/\s+/g, "").toUpperCase();

const findActivityId = (activities: ActivityOption[], name: string) => {
  return (
    activities.find(
      (a) => normalize(a.label) === normalize(name)
    )?.value || 0
  );
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number | undefined = user?.employeeID;

  const dates = useMemo(
    () => generateDates(fromDate, toDate),
    [fromDate, toDate]
  );

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    const loadProjects = async () => {
      if (!employeeID) return;
      const res =
        await employeeProjectService.GetEmployeeProjectsByemployeeId(
          employeeID
        );
      setProjects(
        res.map((p: any) => ({
          projectId: p.ProjectId,
          projectName: p.ProjectName,
        }))
      );
    };

    const loadShifts = async () => {
      if (!organizationID) return;
      const data =
        await shiftService.GetShiftsByOrganization(organizationID);
      setShifts(
        data.map((s: any) => ({
          value: s.ShiftID,
          label: s.ShiftName,
        }))
      );
    };

    const loadActivities = async () => {
      const data = await shiftService.GetActivityMaster();
      setActivities(
        data.map((a: any) => ({
          value: a.ActivityID,
          label: a.ActivityName,
        }))
      );
    };

    loadProjects();
    loadShifts();
    loadActivities();
  }, [employeeID, organizationID]);

  /* ===== LOAD TIMESHEETS ===== */
  const loadTimesheets = async () => {
    const calendarData = await fetchCalendarData(fromDate, toDate);

    const entries: TimesheetEntry[] = [];

    const defaultShift = shifts[0];

    dates.forEach((date) => {
      const calendarDay = calendarData.find((c) => c.date === date);

      // HALF DAY
      if (calendarDay?.type === "HALF_LEAVE") {
        entries.push(
          {
            date,
            shift: defaultShift?.label ?? "General",
            shiftId: defaultShift?.value ?? 0,
            activity: "HALF_LEAVE",
            activityId: findActivityId(activities, "HALF_LEAVE"),
            hours: 4,
            status: "PENDING",
          },
          {
            date,
            shift: defaultShift?.label ?? "General",
            shiftId: defaultShift?.value ?? 0,
            activity: "PRESENT",
            activityId: findActivityId(activities, "PRESENT"),
            hours: 4,
            status: "PENDING",
          }
        );
        return;
      }

      let activity = "PRESENT";

      if (calendarDay?.type === "HOLIDAY") activity = "HOLIDAY";
      else if (calendarDay?.type === "LEAVE") activity = "LEAVE";
      else if (isWeekOff(date)) activity = "WEEKOFF";

      entries.push({
        date,
        shift: defaultShift?.label ?? "General",
        shiftId: defaultShift?.value ?? 0,
        activity,
        activityId: findActivityId(activities, activity),
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
                      ...(field === "shift"
                        ? {
                            shiftId:
                              shifts.find((s) => s.label === value)?.value ??
                              e.shiftId,
                          }
                        : {}),
                      ...(field === "activity"
                        ? {
                            activityId: findActivityId(
                              activities,
                              value
                            ),
                          }
                        : {}),
                      ...(field === "hours"
                          ? {
                              hours: value,
                            }
                          : {}),
                    }
              ),
            }
      )
    );
  };

  /* ===== SAVE ===== */
  const saveProject = async (projectId: number) => {
    const sheet = timesheets.find((p) => p.projectId === projectId);
    if (!sheet) return;

    console.log("Saving:", sheet.entries);

    const payload = sheet.entries.map((e) => ({
      TimesheetID: 0,
      EmployeeID: employeeID,
      OrganizationID: organizationID,
      ProjectID: projectId,
      EntryDate: e.date,
      Shift: e.shift,
      ShiftID: e.shiftId,
      Activity: e.activity,
      ActivityID: e.activityId,
      Hours: e.hours,
    }));

    await timesheetService.createTimesheetEntries({
      createdBy: "1",
      timesheetEntryJson: JSON.stringify(payload),
    });

    alert("Saved successfully");
  };

  return (
    <Card className="p-5">
      <h5 className="mb-3">Timesheet</h5>

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
                alert("Max 1 month only");
                return;
              }
              setToDate(e.target.value);
            }}
          />
        </Col>

        <Col md={3}>
          <Button onClick={loadTimesheets}>Load</Button>
        </Col>
      </Row>

      <Accordion alwaysOpen>
        {projects.map((project) => {
          const sheet = timesheets.find(
            (p) => p.projectId === project.projectId
          );

          return (
            <Accordion.Item
              key={project.projectId}
              eventKey={project.projectId.toString()}
            >
              <Accordion.Header>
                {project.projectName}
              </Accordion.Header>

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
                    {sheet?.entries.map((entry, index) => (
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
                            {shifts.map((s) => (
                              <option key={s.value} value={s.label}>
                                {s.label}
                              </option>
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
                                e.target.value
                              )
                            }
                          >
                            {activities.map((a) => (
                              <option key={a.value} value={a.label}>
                                {a.label}
                              </option>
                            ))}
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={entry.hours}
                            onChange={(e) =>
                              updateEntry(
                                project.projectId,
                                entry.date,
                                index,
                                "hours",
                                Number(e.target.value)
                              )
                            }
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