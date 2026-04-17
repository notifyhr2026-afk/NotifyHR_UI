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
import { useParams } from "react-router-dom";

import employeeProjectService from "../../services/employeeProjectService";
import projectService from "../../services/projectService";
import manageClientsService from "../../services/manageClientsService";

/* ================= TYPES ================= */

interface EmployeeProject {
  EmployeeProjectId: number;
  employeeId: number;
  projectId: number;
  clientId: number;
  allocationPercentage: number;
  fromDate: string;
  toDate: string | null;
  isActive: boolean;

  // API extra fields
  ProjectName?: string;
  ProjectCode?: string;
}

interface Project {
  ProjectId: number;
  ProjectName: string;
}

interface ClientOption {
  value: number;
  label: string;
}

/* ================= COMPONENT ================= */

const EmployeeProjects: React.FC = () => {

  const { employeeID } = useParams<{ employeeID: string }>();
  const empId = Number(employeeID);

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = userFromStorage?.organizationID ?? 0;

  /* ================= STATES ================= */

  const [records, setRecords] = useState<EmployeeProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editRecord, setEditRecord] = useState<EmployeeProject | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EmployeeProject>({
    EmployeeProjectId: 0,
    employeeId: empId,
    projectId: 0,
    clientId: 0,
    allocationPercentage: 0,
    fromDate: "",
    toDate: "",
    isActive: true
  });

  /* ================= LOAD CLIENTS ================= */

  const loadClients = async () => {
    try {
      const res = await manageClientsService.GetClientsByOrganization(organizationID);

      const formatted = (res || []).map((c: any) => ({
        value: Number(c.ClientId ?? c.clientId),
        label: c.ClientName ?? c.clientName
      }));

      setClients(formatted);
    } catch (error) {
      console.error("Failed to load clients", error);
    }
  };

  /* ================= LOAD PROJECTS BY CLIENT ================= */

  const loadProjectsByClient = async (clientId: number) => {
    try {
      const res = await projectService.GetProjectsByClientIdAsync(clientId);

      const formatted: Project[] = (res || []).map((p: any) => ({
        ProjectId: Number(p.ProjectId ?? p.projectId),
        ProjectName: p.ProjectName ?? p.projectName
      }));

      setProjects(formatted);
    } catch (error) {
      console.error("Failed to load projects", error);
      setProjects([]);
    }
  };

  /* ================= LOAD EMPLOYEE PROJECTS ================= */

  const loadEmployeeProjects = async () => {
    try {
      const res = await employeeProjectService.GetEmployeeProjectsByemployeeId(empId);

      const formatted = (res || []).map((item: any) => ({
        EmployeeProjectId: item.EmployeeProjectId,
        employeeId: item.EmployeeId,
        projectId: item.ProjectId,
        clientId: item.ClientId,
        allocationPercentage: item.AllocationPercentage,
        fromDate: item.FromDate,
        toDate: item.ToDate,
        isActive: item.IsActive,

        ProjectName: item.ProjectName,
        ProjectCode: item.ProjectCode
      }));

      setRecords(formatted);
    } catch (error) {
      console.error("Failed to load employee projects", error);
    }
  };

  useEffect(() => {
    loadClients();
    loadEmployeeProjects();
  }, [empId]);

  /* ================= INPUT ================= */

  const handleChange = (e: any) => {
    const { id, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  };

  /* ================= ADD ================= */

  const handleAdd = () => {
    setFormData({
      EmployeeProjectId: 0,
      employeeId: empId,
      projectId: 0,
      clientId: 0,
      allocationPercentage: 0,
      fromDate: "",
      toDate: "",
      isActive: true
    });

    setSelectedClient(null);
    setProjects([]);
    setEditRecord(null);
    setValidated(false);
    setShowModal(true);
  };

  /* ================= EDIT ================= */

  const handleEdit = async (record: EmployeeProject) => {

    setEditRecord(record);

    const clientOption =
      clients.find(c => c.value === Number(record.clientId)) || null;

    setSelectedClient(clientOption);

    await loadProjectsByClient(Number(record.clientId));

    setFormData({
      EmployeeProjectId: record.EmployeeProjectId,
      employeeId: record.employeeId,
      clientId: record.clientId,
      projectId: record.projectId,
      allocationPercentage: record.allocationPercentage,
      fromDate: record.fromDate ? record.fromDate.split("T")[0] : "",
      toDate: record.toDate ? record.toDate.split("T")[0] : "",
      isActive: record.isActive
    });

    setShowModal(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async (e: any) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {

      const payload = {
        employeeProjectId: editRecord ? editRecord.EmployeeProjectId : 0,
        employeeId: empId,
        clientId: Number(formData.clientId),
        projectId: Number(formData.projectId),
        allocationPercentage: Number(formData.allocationPercentage),
        fromDate: new Date(formData.fromDate).toISOString(),
        toDate: formData.toDate ? new Date(formData.toDate).toISOString() : null,
        isActive: formData.isActive,
        createdBy: "1"
      };

      const res = await employeeProjectService.PostEmployeeProjectByAsync(payload);

      alert(res?.message || "Saved successfully");

      setShowModal(false);
      loadEmployeeProjects();

    } catch (error) {
      console.error(error);
      alert("Save failed");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    if (!deleteId) return;

    try {
      await employeeProjectService.DeleteEmployeeProjectByAsync(deleteId);
      setConfirmDelete(false);
      loadEmployeeProjects();
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-3 mt-4">

      <div className="text-end mb-4">
        <Button variant="success" onClick={handleAdd}>
          + Add Project Allocation
        </Button>
      </div>

      {/* ================= TABLE ================= */}
      <Table className="table table-hover table-dark-custom">

        <thead>
          <tr>
            <th>Project</th>
            <th>Allocation %</th>
            <th>From</th>
            <th>To</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.EmployeeProjectId}>

              <td>{r.ProjectName || "N/A"}</td>

              <td>{r.allocationPercentage}</td>

              <td>{r.fromDate ? r.fromDate.split("T")[0] : "-"}</td>

              <td>{r.toDate ? r.toDate.split("T")[0] : "-"}</td>

              <td>{r.isActive ? "Yes" : "No"}</td>

              <td>
                <Button size="sm" onClick={() => handleEdit(r)}>
                  Edit
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(r.EmployeeProjectId)}
                >
                  Delete
                </Button>
              </td>

            </tr>
          ))}
        </tbody>

      </Table>

      {/* ================= MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>
            {editRecord ? "Edit" : "Add"} Project Allocation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">

              <Col md={6}>
                <Form.Label>Client</Form.Label>

                <Select
                  options={clients}
                  value={selectedClient}
                  onChange={(opt) => {
                    setSelectedClient(opt);
                    setFormData(prev => ({
                      ...prev,
                      clientId: opt?.value || 0,
                      projectId: 0
                    }));
                    loadProjectsByClient(Number(opt?.value));
                  }}
                   className="org-select"
                   classNamePrefix="org-select"
                />
              </Col>

              <Col md={6}>
                <Form.Group controlId="projectId">
                  <Form.Label>Project</Form.Label>
                  <Form.Select
                    required
                    value={formData.projectId}
                    onChange={handleChange}
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => (
                      <option key={p.ProjectId} value={p.ProjectId}>
                        {p.ProjectName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

            </Row>

            <Row className="mb-3">

              <Col md={6}>
                <Form.Group controlId="allocationPercentage">
                  <Form.Label>Allocation %</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={formData.allocationPercentage}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="fromDate">
                  <Form.Label>From</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="toDate">
                  <Form.Label>To</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.toDate || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

            </Row>

            <Modal.Footer>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Modal.Footer>

          </Form>

        </Modal.Body>
      </Modal>

      {/* ================= DELETE MODAL ================= */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this record?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>

          <Button variant="danger" onClick={confirmDeleteAction}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default EmployeeProjects;