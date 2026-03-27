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

interface StatusMaster {
  StatusID: number;
  StatusName: string;
}

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
  statusId: number;
  statusName: string;
}

interface ProjectTimesheet {
  projectId: number;
  entries: TimesheetEntry[];
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

const isWeekOff = (date: string): boolean => {
  const day = new Date(date).getDay();
  return WEEK_OFF_CONFIG.includes(day);
};

const normalize = (val: string) =>
  val.replace(/\s+/g, "").toUpperCase();

const findActivityId = (activities: ActivityOption[], name: string) => {
  return (
    activities.find(
      (a) => normalize(a.label) === normalize(name)
    )?.value || 0
  );
};

/* ================= MAIN ================= */

const TimesheetEntry: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [timesheets, setTimesheets] = useState<ProjectTimesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [statusMaster, setStatusMaster] = useState<StatusMaster[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID;
  const employeeID = user?.employeeID;

  const dates = useMemo(
    () => generateDates(fromDate, toDate),
    [fromDate, toDate]
  );

  /* ===== LOAD MASTER ===== */
  useEffect(() => {
    const loadAll = async () => {
      if (!employeeID || !organizationID) return;

      const proj =
        await employeeProjectService.GetEmployeeProjectsByemployeeId(
          employeeID
        );

      setProjects(
        proj.map((p: any) => ({
          projectId: p.ProjectId,
          projectName: p.ProjectName,
        }))
      );

      const shiftRes =
        await shiftService.GetShiftsByOrganization(organizationID);

      setShifts(
        shiftRes.map((s: any) => ({
          value: s.ShiftID,
          label: s.ShiftName,
        }))
      );

      const act = await shiftService.GetActivityMaster();

      setActivities(
        act.map((a: any) => ({
          value: a.ActivityID,
          label: a.ActivityName,
        }))
      );

      // ✅ STATUS MASTER
      const statusRes =
        await timesheetService.GetTimesheetStatusMaster();

      setStatusMaster(statusRes);
    };

    loadAll();
  }, [employeeID, organizationID]);

  /* ===== HELPERS ===== */

  const getStatusName = (id: number): string => {
    return (
      statusMaster.find((s) => s.StatusID === id)?.StatusName ||
      "PENDING"
    );
  };

  const isApproved = (statusId: number) => {
    return getStatusName(statusId) === "APPROVED";
  };

  /* ===== LOAD TIMESHEETS ===== */

  const loadTimesheets = async () => {
    if (!employeeID) return;

    const apiData =
      await timesheetService.GetTimesheetEntriesByEmployeeID(employeeID);

    const map = new Map<string, any>();

    apiData.forEach((item: any) => {
      const key = `${item.ProjectID}_${item.EntryDate.split("T")[0]}`;
      map.set(key, item);
    });

    const defaultShift = shifts[0];

    const sheets = projects.map((p) => {
      const entries: TimesheetEntry[] = [];

      dates.forEach((date) => {
        const key = `${p.projectId}_${date}`;
        const existing = map.get(key);

        // ✅ EXISTING RECORD
        if (existing) {
          entries.push({
            date,
            shift:
              shifts.find((s) => s.value === existing.ShiftId)?.label ||
              "",
            shiftId: existing.ShiftId,
            activity:
              activities.find(
                (a) => a.value === existing.ActivityId
              )?.label || "",
            activityId: existing.ActivityId,
            hours: existing.Hours,
            statusId: existing.StatusID,
            statusName: getStatusName(existing.StatusID),
          });
          return;
        }

        // ✅ DEFAULT ENTRY
        const activity = isWeekOff(date) ? "WEEKOFF" : "PRESENT";

        entries.push({
          date,
          shift: defaultShift?.label ?? "General",
          shiftId: defaultShift?.value ?? 0,
          activity,
          activityId: findActivityId(activities, activity),
          hours: activity === "PRESENT" ? 8 : 0,
          statusId: 0,
          statusName: "PENDING",
        });
      });

      return {
        projectId: p.projectId,
        entries,
      };
    });

    setTimesheets(sheets);
  };

  /* ===== UPDATE (UNCHANGED LOGIC) ===== */

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
      StatusID: e.statusId,
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
            onChange={(e) => setToDate(e.target.value)}
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
                    {sheet?.entries.map((entry, index) => {
                      const disabled = isApproved(entry.statusId);

                      return (
                        <tr key={`${entry.date}-${index}`}>
                          <td>{entry.date}</td>

                          <td>
                            <Form.Select
                              size="sm"
                              value={entry.shift}
                              disabled={disabled}
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
                              disabled={disabled}
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
                              disabled={disabled}
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
                            <Badge
                              bg={
                                entry.statusName === "APPROVED"
                                  ? "success"
                                  : entry.statusName === "REJECTED"
                                  ? "danger"
                                  : entry.statusName === "SUBMITTED"
                                  ? "primary"
                                  : "warning"
                              }
                            >
                              {entry.statusName}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
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