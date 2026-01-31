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

/* ================= TYPES ================= */

type Status = "PENDING" | "APPROVED" | "REJECTED" | "RESUBMIT";
type Activity = "PRESENT" | "HOLIDAY" | "LEAVE" | "WEEKOFF";

interface TimesheetEntry {
  date: string;
  shift: string;
  activity: Activity;
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

/* ================= MOCK DATA ================= */

const mockTimesheets: EmployeeTimesheet[] = [
  {
    employeeId: 1,
    employeeName: "John Doe",
    projects: [
      {
        projectId: 1,
        projectName: "Project A",
        entries: [
          { date: "2026-01-01", shift: "General", activity: "PRESENT", hours: 8, status: "PENDING" },
          { date: "2026-01-02", shift: "Night", activity: "PRESENT", hours: 9, status: "PENDING" },
        ],
      },
      {
        projectId: 2,
        projectName: "Project B",
        entries: [
          { date: "2026-01-01", shift: "General", activity: "LEAVE", hours: 0, status: "PENDING" },
        ],
      },
    ],
  },
  {
    employeeId: 2,
    employeeName: "Jane Smith",
    projects: [
      {
        projectId: 3,
        projectName: "Project C",
        entries: [
          { date: "2026-01-01", shift: "General", activity: "PRESENT", hours: 8, status: "PENDING" },
        ],
      },
    ],
  },
];

/* ================= MAIN COMPONENT ================= */

const TimesheetApproval: React.FC = () => {
  const [timesheets, setTimesheets] = useState<EmployeeTimesheet[]>([]);

  useEffect(() => {
    setTimesheets(mockTimesheets);
  }, []);

  /* ===== UPDATE STATUS ===== */
  const updateProjectStatus = (
    employeeId: number,
    projectId: number,
    newStatus: Status
  ) => {
    setTimesheets((prev) =>
      prev
        .map((emp) =>
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
        .filter((emp) => emp.projects.some((p) => p.entries.some((e) => e.status === "PENDING")))
    );
  };

  /* ===== SAVE APPROVAL ===== */
  const saveApproval = (employeeId: number, projectId: number) => {
    const payload = timesheets
      .find((e) => e.employeeId === employeeId)
      ?.projects.find((p) => p.projectId === projectId);
    console.log("Approval Payload:", payload);
    alert("Timesheet approval updated successfully!");
  };

  /* ===== FILTER ONLY PENDING ===== */
  const pendingTimesheets = timesheets
    .map((emp) => ({
      ...emp,
      projects: emp.projects.filter((p) =>
        p.entries.some((e) => e.status === "PENDING")
      ),
    }))
    .filter((emp) => emp.projects.length > 0);

  return (
    <Card className="p-5">
      <h5 className="mb-3">Admin Timesheet Approval</h5>

      {pendingTimesheets.length === 0 ? (
        <div className="text-center">No pending timesheets</div>
      ) : (
        <Accordion alwaysOpen>
          {pendingTimesheets.map((employee) => (
            <Accordion.Item key={employee.employeeId} eventKey={employee.employeeId.toString()}>
              <Accordion.Header>{employee.employeeName}</Accordion.Header>
              <Accordion.Body>
                {employee.projects.map((project) => (
                  <Card className="mb-3" key={project.projectId}>
                    <Card.Header>
                      <Row className="align-items-center">
                        <Col>{project.projectName}</Col>
                        <Col className="text-end">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() =>
                              updateProjectStatus(employee.employeeId, project.projectId, "APPROVED")
                            }
                          >
                            Approve All
                          </Button>{" "}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              updateProjectStatus(employee.employeeId, project.projectId, "REJECTED")
                            }
                          >
                            Reject All
                          </Button>{" "}
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() =>
                              updateProjectStatus(employee.employeeId, project.projectId, "RESUBMIT")
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
                            <tr key={entry.date}>
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
                        <Button
                          variant="primary"
                          onClick={() =>
                            saveApproval(employee.employeeId, project.projectId)
                          }
                        >
                          Save
                        </Button>
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
