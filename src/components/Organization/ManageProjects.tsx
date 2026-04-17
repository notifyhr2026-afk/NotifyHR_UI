import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col
} from "react-bootstrap";
import Select from "react-select";

import projectService from "../../services/projectService";
import manageClientsService from "../../services/manageClientsService";

/* ===================== INTERFACES ===================== */

interface Project {
  ProjectId: number;
  OrganizationId: number;
  ClientId: number; // ✅ NEW
  ProjectCode: string;
  ProjectName: string;
  IsBillable: boolean;
  StartDate: string;
  EndDate: string | null;
  ProjectStatusId: number;
}

interface ClientOption {
  value: number;
  label: string;
}

/* ===================== STATIC ===================== */

const projectStatuses = [
  { ProjectStatusId: 1, StatusName: "Active" },
  { ProjectStatusId: 2, StatusName: "On Hold" },
  { ProjectStatusId: 3, StatusName: "Completed" }
];

/* ===================== COMPONENT ===================== */

const ManageProjects: React.FC = () => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID ?? 0;

  /* ===================== STATES ===================== */

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);

  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);

  const [formData, setFormData] = useState<Project>({
    ProjectId: 0,
    OrganizationId: organizationID,
    ClientId: 0,
    ProjectCode: "",
    ProjectName: "",
    IsBillable: false,
    StartDate: "",
    EndDate: "",
    ProjectStatusId: 1
  });

  /* ===================== LOAD DATA ===================== */

  const loadProjects = async () => {
    const res = await projectService.GetProjectsByOrganization(organizationID);
    setProjects(res);
  };

  const loadClients = async () => {
    const res = await manageClientsService.GetClientsByOrganization(organizationID);

    const mapped = res.map((c: any) => ({
      value: c.ClientId,
      label: c.ClientName
    }));

    setClients(mapped);
  };

  useEffect(() => {
    loadProjects();
    loadClients();
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
    setSelectedClient(null);

    setFormData({
      ProjectId: 0,
      OrganizationId: organizationID,
      ClientId: 0,
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

    const client = clients.find(c => c.value === project.ClientId) || null;

    setSelectedClient(client);

    setFormData({
      ...project,
      StartDate: project.StartDate?.split("T")[0] || "",
      EndDate: project.EndDate?.split("T")[0] || ""
    });

    setShowModal(true);
  };

  /* ===================== SAVE ===================== */

  const handleSave = async (e: any) => {

    e.preventDefault();

    if (!selectedClient) {
      alert("Client is required");
      return;
    }

    const payload = {
      projectId: editItem ? editItem.ProjectId : 0,
      organizationId: organizationID,
      clientId: selectedClient.value,
      projectCode: formData.ProjectCode,
      projectName: formData.ProjectName,
      isBillable: formData.IsBillable,
      startDate: new Date(formData.StartDate).toISOString(),
      endDate: formData.EndDate
        ? new Date(formData.EndDate).toISOString()
        : null,
      projectStatusId: Number(formData.ProjectStatusId),
      createdBy: "1",
      modifiedBy: "1"
    };

    try {

      const res = await projectService.PostProjectByAsync(payload);

      alert(res.message || "Saved successfully");

      setShowModal(false);
      loadProjects();

    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  /* ===================== DELETE ===================== */

  const handleDelete = async (id: number) => {

    if (!window.confirm("Delete this project?")) return;

    await projectService.DeleteProjectByAsync(id);
    loadProjects();
  };

  /* ===================== UI ===================== */

  return (
    <div className="Container">

      <Row className="mb-3">
        <Col><h4>Manage Projects</h4></Col>
        <Col className="text-end">
          <Button onClick={handleAdd}>+ Add Project</Button>
        </Col>
      </Row>

      <Table className="table table-hover table-dark-custom">

        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Client</th>
            <th>Billable</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map(p => {

            const client = clients.find(c => c.value === p.ClientId);

            return (
              <tr key={p.ProjectId}>
                <td>{p.ProjectCode}</td>
                <td>{p.ProjectName}</td>
                <td>{client?.label}</td>
                <td>{p.IsBillable ? "Yes" : "No"}</td>
                <td>{p.StartDate?.split("T")[0]}</td>
                <td>{p.EndDate?.split("T")[0]}</td>
                <td>
                  {projectStatuses.find(s => s.ProjectStatusId === p.ProjectStatusId)?.StatusName}
                </td>
                <td>
                  <Button size="sm" onClick={() => handleEdit(p)}>
                    <i className="bi bi-pencil-square"></i>
                  </Button>{" "}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.ProjectId)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </Table>

      {/* ===================== MODAL ===================== */}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>
            {editItem ? "Edit Project" : "Add Project"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">

              {/* CLIENT DROPDOWN */}
              <Col md={6}>
                <Form.Label>Client *</Form.Label>
                <Select
                  className="org-select"
                  classNamePrefix="org-select"
                  options={clients}
                  value={selectedClient}
                  onChange={(val) => setSelectedClient(val)}
                  placeholder="Select Client"
                />
              </Col>

              <Col md={6}>
                <Form.Group controlId="ProjectCode">
                  <Form.Label>Project Code</Form.Label>
                  <Form.Control required value={formData.ProjectCode} onChange={handleInputChange}/>
                </Form.Group>
              </Col>

            </Row>

            <Row className="mb-3">

              <Col md={6}>
                <Form.Group controlId="ProjectName">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control required value={formData.ProjectName} onChange={handleInputChange}/>
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

            <Row className="mb-3">

              <Col md={6}>
                <Form.Control type="date" id="StartDate" required value={formData.StartDate} onChange={handleInputChange}/>
              </Col>

              <Col md={6}>
                <Form.Control type="date" id="EndDate" value={formData.EndDate || ""} onChange={handleInputChange}/>
              </Col>

            </Row>

            <Row className="mb-3">

              <Col md={6}>
                <Form.Select id="ProjectStatusId" value={formData.ProjectStatusId} onChange={handleInputChange}>
                  {projectStatuses.map(s => (
                    <option key={s.ProjectStatusId} value={s.ProjectStatusId}>
                      {s.StatusName}
                    </option>
                  ))}
                </Form.Select>
              </Col>

            </Row>

            <Modal.Footer>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Modal.Footer>

          </Form>

        </Modal.Body>

      </Modal>

    </div>
  );
};

export default ManageProjects;