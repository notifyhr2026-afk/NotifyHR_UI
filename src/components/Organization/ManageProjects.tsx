import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col
} from "react-bootstrap";

import projectService from "../../services/projectService";

/* ===================== INTERFACES ===================== */

interface Project {
  ProjectId: number;
  OrganizationId: number;
  ProjectCode: string;
  ProjectName: string;
  IsBillable: boolean;
  StartDate: string;
  EndDate: string | null;
  ProjectStatusId: number;
}

interface ProjectStatus {
  ProjectStatusId: number;
  StatusCode: string;
  StatusName: string;
}

/* ===================== STATIC DATA ===================== */

const projectStatuses: ProjectStatus[] = [
  { ProjectStatusId: 1, StatusCode: "ACTIVE", StatusName: "Active" },
  { ProjectStatusId: 2, StatusCode: "ONHOLD", StatusName: "On Hold" },
  { ProjectStatusId: 3, StatusCode: "COMPLETED", StatusName: "Completed" }
];

const ManageProjects: React.FC = () => {

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number = userFromStorage?.organizationID ?? 0;

  /* ===================== STATES ===================== */

  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Project>({
    ProjectId: 0,
    OrganizationId: organizationID,
    ProjectCode: "",
    ProjectName: "",
    IsBillable: false,
    StartDate: "",
    EndDate: "",
    ProjectStatusId: 1
  });

  /* ===================== LOAD PROJECTS ===================== */

  const loadProjects = async () => {
    try {
      const res = await projectService.GetProjectsByOrganization(organizationID);
      setProjects(res);
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ===================== HANDLERS ===================== */

  const handleInputChange = (e: any) => {
    const { id, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  };

  const handleAdd = () => {

    setEditItem(null);

    setFormData({
      ProjectId: 0,
      OrganizationId: organizationID,
      ProjectCode: "",
      ProjectName: "",
      IsBillable: false,
      StartDate: "",
      EndDate: "",
      ProjectStatusId: 1
    });

    setValidated(false);
    setShowModal(true);
  };

const handleEdit = (project: Project) => {

  setEditItem(project);

  setFormData({
    ...project,
    StartDate: project.StartDate
      ? project.StartDate.split("T")[0]
      : "",
    EndDate: project.EndDate
      ? project.EndDate.split("T")[0]
      : ""
  });

  setShowModal(true);

};

  /* ===================== SAVE ===================== */

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {

      const payload = {
        projectId: editItem ? editItem.ProjectId : 0,
        organizationId: organizationID,
        projectCode: formData.ProjectCode,
        projectName: formData.ProjectName,
        isBillable: formData.IsBillable,
        startDate: new Date(formData.StartDate).toISOString(),
        endDate: formData.EndDate
          ? new Date(formData.EndDate).toISOString()
          : null,
        projectStatusId: formData.ProjectStatusId,
        createdBy: "1",
        modifiedBy: "1"
      };

      const res = await projectService.PostProjectByAsync(payload);

      if (res.value === 0) {
        alert(res.message || "Warning occurred");
        return;
      }

      alert(res.message || "Project saved successfully");

      setShowModal(false);
      loadProjects();

    } catch (error) {
      console.error(error);
      alert("Error saving project");
    }

  };

  /* ===================== DELETE ===================== */

  const handleDelete = async (id: number) => {

    if (!window.confirm("Delete this project?")) return;

    try {

      const res = await projectService.DeleteProjectByAsync(id);

      if (res[0].value === 0) {
        alert(res[0].message || "Warning occurred");
        return;
      }

      alert(res[0].message || "Deleted successfully");

      loadProjects();

    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }

  };

  /* ===================== RENDER ===================== */

  return (

    <div className="Container">

      <Row className="mb-3">

        <Col>
          <h4>Manage Projects</h4>
        </Col>

        <Col className="text-end">
          <Button variant="success" onClick={handleAdd}>
            + Add Project
          </Button>
        </Col>

      </Row>

      <Table className="table table-hover table-dark-custom">

        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Billable</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {projects.map(project => {

            const status = projectStatuses.find(
              s => s.ProjectStatusId === project.ProjectStatusId
            );

            return (

              <tr key={project.ProjectId}>

                <td>{project.ProjectCode}</td>
                <td>{project.ProjectName}</td>
                <td>{project.IsBillable ? "Yes" : "No"}</td>
                <td>{project.StartDate?.split("T")[0]}</td>
                <td>{project.EndDate?.split("T")[0]}</td>
                <td>{status?.StatusName}</td>

                <td>

                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </Button>{" "}

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(project.ProjectId)}
                  >
                    Delete
                  </Button>

                </td>

              </tr>

            );

          })}

        </tbody>

      </Table>

      {/* ===================== MODAL ===================== */}

      <Modal show={showModal} onHide={() => setShowModal(false)}>

        <Modal.Header closeButton>
          <Modal.Title>
            {editItem ? "Edit Project" : "Add Project"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">

              <Col md={6}>
                <Form.Group controlId="ProjectCode">
                  <Form.Label>Project Code</Form.Label>
                  <Form.Control
                    required
                    value={formData.ProjectCode}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="ProjectName">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.ProjectName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

            </Row>

            <Row className="mb-3">

              <Col md={6}>
                <Form.Group controlId="StartDate">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.StartDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="EndDate">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.EndDate || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

            </Row>

            <Row className="mb-3">

              <Col md={6}>

                <Form.Group controlId="ProjectStatusId">
                  <Form.Label>Status</Form.Label>

                  <Form.Select
                    value={formData.ProjectStatusId}
                    onChange={handleInputChange}
                  >

                    {projectStatuses.map(status => (
                      <option
                        key={status.ProjectStatusId}
                        value={status.ProjectStatusId}
                      >
                        {status.StatusName}
                      </option>
                    ))}

                  </Form.Select>

                </Form.Group>

              </Col>

              <Col md={6} className="d-flex align-items-center">

                <Form.Check
                  id="IsBillable"
                  label="Billable Project"
                  checked={formData.IsBillable}
                  onChange={handleInputChange}
                />

              </Col>

            </Row>

            <Modal.Footer>

              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button variant="primary" type="submit">
                Save
              </Button>

            </Modal.Footer>

          </Form>

        </Modal.Body>

      </Modal>

    </div>

  );

};

export default ManageProjects;