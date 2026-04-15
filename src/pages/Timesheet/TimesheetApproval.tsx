import React, { useState, useEffect } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import employeeService from "../../services/employeeService";
import timesheetService from "../../services/timesheetService";
import projectService from "../../services/projectService";
import shiftService from "../../services/shiftService";

/* ================= TYPES ================= */

type Status = "PENDING" | "APPROVED" | "REJECTED" | "RESUBMIT";

interface TimesheetEntryAPI {
  TimesheetEntryId: number;
  OrganizationId: number;
  EmployeeID: number;
  ProjectID: number;
  EntryDate: string;
  ShiftID: number;
  ActivityId: number | string; // 🔥 important
  Hours: number;
  StatusID: number;
  CreatedAt: string;
}

interface Project {
  ProjectID: number;
  ProjectName: string;
}

interface Shift {
  ShiftID: number;
  ShiftName: string;
}

interface Activity {
  ActivityId: number;
  ActivityName: string;
}

interface ReportedEmployee {
  EmployeeID: number;
  EmployeeName: string;
}

interface TimesheetEntry {
  id: number;
  date: string;
  shift: string;
  activity: string;
  activityId: number; // ✅ added
  hours: number;
  status: Status;
}

interface ProjectTimesheet {
  projectId: number;
  projectName: string;
  entries: TimesheetEntry[];
}

interface EmployeeTimesheet {
  employeeId: number;
  employeeName: string;
  projects: ProjectTimesheet[];
}

/* ================= STATUS MAP ================= */

const STATUS_MAP: Record<number, Status> = {
  0: "PENDING",
  1: "APPROVED",
  2: "REJECTED",
  3: "RESUBMIT",
};

/* ================= MAIN COMPONENT ================= */

const TimesheetApproval: React.FC = () => {
  const [timesheets, setTimesheets] = useState<EmployeeTimesheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const employeeID = user.employeeID;
        const organizationID = user.organizationID;

        if (!employeeID || !organizationID) {
          setLoading(false);
          return;
        }

        const reportedEmployees: ReportedEmployee[] =
          await employeeService.GetReportedEmployeesAsync(employeeID);

        if (!reportedEmployees.length) {
          setLoading(false);
          return;
        }

        const [projects, shifts, activities] = await Promise.all([
          projectService.GetProjectsByOrganization(organizationID),
          shiftService.GetShiftsByOrganization(organizationID),
          shiftService.GetActivityMaster(),
        ]);

        const employeeIDs = reportedEmployees.map(
          (e: ReportedEmployee) => e.EmployeeID
        );

        const timesheetData: TimesheetEntryAPI[] =
          await timesheetService.GetTimesheetForApproveByAsync(employeeIDs);

        console.log("Activities API:", activities);
        console.log("Timesheet API:", timesheetData);

        setTimesheets(
          transformTimesheetData(
            timesheetData,
            reportedEmployees,
            projects,
            shifts,
            activities
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===== TRANSFORM ===== */
  const transformTimesheetData = (
    apiData: TimesheetEntryAPI[],
    employees: ReportedEmployee[],
    projects: Project[],
    shifts: Shift[],
    activities: Activity[]
  ): EmployeeTimesheet[] => {
    const employeeMap = new Map(
      employees.map((e) => [e.EmployeeID, e.EmployeeName])
    );

    const projectMap = new Map(
      projects.map((p) => [p.ProjectID, p.ProjectName])
    );

    const shiftMap = new Map(
      shifts.map((s) => [s.ShiftID, s.ShiftName])
    );

    // ✅ FIXED activity map (number-safe)
  const activityMap = new Map<number, string>(
  activities.map((a: any) => [Number(a.ActivityID), a.ActivityName])
);

    const grouped: Record<number, any> = {};

    apiData.forEach((entry) => {
      const empId = entry.EmployeeID;
      const projId = entry.ProjectID;

      const actId = Number(entry.ActivityId); // 🔥 critical fix

      if (!grouped[empId]) {
        grouped[empId] = {
          employeeId: empId,
          employeeName: employeeMap.get(empId) || "-",
          projects: {},
        };
      }

      if (!grouped[empId].projects[projId]) {
        grouped[empId].projects[projId] = {
          projectId: projId,
          projectName: projectMap.get(projId) || "-",
          entries: [],
        };
      }

      grouped[empId].projects[projId].entries.push({
        id: entry.TimesheetEntryId,
        date: entry.EntryDate.split("T")[0],
        shift: shiftMap.get(entry.ShiftID) || "-",

        // ✅ FIXED ACTIVITY
        activity: activityMap.get(actId) || `Unknown (${actId})`,
        activityId: actId,

        hours: entry.Hours,
        status: STATUS_MAP[entry.StatusID] || "PENDING",
      });
    });

    return Object.values(grouped).map((emp: any) => ({
      ...emp,
      projects: Object.values(emp.projects),
    }));
  };

  /* ===== UPDATE STATUS ===== */
  const updateProjectStatus = (
    employeeId: number,
    projectId: number,
    newStatus: Status
  ) => {
    setTimesheets((prev) =>
      prev.map((emp) =>
        emp.employeeId !== employeeId
          ? emp
          : {
              ...emp,
              projects: emp.projects.map((proj) =>
                proj.projectId !== projectId
                  ? proj
                  : {
                      ...proj,
                      entries: proj.entries.map((e) => ({
                        ...e,
                        status: newStatus,
                      })),
                    }
              ),
            }
      )
    );
  };

  /* ===== SAVE ===== */
  const saveApproval = (employeeId: number, projectId: number) => {
    const project = timesheets
      .find((e) => e.employeeId === employeeId)
      ?.projects.find((p) => p.projectId === projectId);

    if (!project) return;

    const payload = project.entries.map((e) => ({
      TimesheetEntryId: e.id,
      ActivityId: e.activityId, // ✅ ensured correct
      Status:
        e.status === "APPROVED"
          ? 1
          : e.status === "REJECTED"
          ? 2
          : e.status === "RESUBMIT"
          ? 3
          : 0,
    }));

    console.log("Final Approval Payload:", payload);

    alert("Timesheet approval updated successfully!");
  };

  /* ===== FILTER ===== */
  const pendingTimesheets = timesheets
    .map((emp) => ({
      ...emp,
      projects: emp.projects.filter((p) =>
        p.entries.some((e) => e.status === "PENDING")
      ),
    }))
    .filter((emp) => emp.projects.length > 0);

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-5">
      <h5 className="mb-3">Admin Timesheet Approval</h5>

      {pendingTimesheets.length === 0 ? (
        <div className="text-center">No pending timesheets</div>
      ) : (
        <Accordion alwaysOpen>
          {pendingTimesheets.map((employee) => (
            <Accordion.Item
              key={employee.employeeId}
              eventKey={employee.employeeId.toString()}
            >
              <Accordion.Header>{employee.employeeName}</Accordion.Header>

              <Accordion.Body>
                {employee.projects.map((project) => (
                  <Card className="mb-3" key={project.projectId}>
                    <Card.Header>
                      <Row>
                        <Col>{project.projectName}</Col>
                        <Col className="text-end">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              updateProjectStatus(
                                employee.employeeId,
                                project.projectId,
                                "APPROVED"
                              )
                            }
                          >
                            Approve All
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              updateProjectStatus(
                                employee.employeeId,
                                project.projectId,
                                "REJECTED"
                              )
                            }
                          >
                            Reject All
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() =>
                              updateProjectStatus(
                                employee.employeeId,
                                project.projectId,
                                "RESUBMIT"
                              )
                            }
                          >
                            Request Resubmit
                          </Button>
                        </Col>
                      </Row>
                    </Card.Header>

                    <Card.Body>
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
                          {project.entries.map((entry) => (
                            <tr key={entry.id}>
                              <td>{entry.date}</td>
                              <td>{entry.shift}</td>
                              <td>{entry.activity}</td>
                              <td>{entry.hours}</td>
                              <td>
                                <Badge
                                  bg={
                                    entry.status === "APPROVED"
                                      ? "success"
                                      : entry.status === "PENDING"
                                      ? "warning"
                                      : entry.status === "REJECTED"
                                      ? "danger"
                                      : "info"
                                  }
                                >
                                  {entry.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      <div className="text-end">
                        {/* <Button
                          onClick={() =>
                            saveApproval(
                              employee.employeeId,
                              project.projectId
                            )
                          }
                        >
                          Save
                        </Button> */}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Card>
  );
};

export default TimesheetApproval;