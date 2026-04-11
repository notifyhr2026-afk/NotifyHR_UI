import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import employeeProjectService from "../../services/employeeProjectService";
import projectService from "../../services/projectService";

interface EmployeeProject {
  EmployeeProjectId: number;
  employeeId: number;
  projectId: number;
  allocationPercentage: number;
  fromDate: string;
  toDate: string | null;
  isActive: boolean;
}

interface Project {
  ProjectId: number;
  ProjectName: string;
}

const EmployeeProjects: React.FC = () => {

  const { employeeID } = useParams<{ employeeID: string }>();
  const empId = Number(employeeID);

  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = userFromStorage?.organizationID ?? 0;

  const [records, setRecords] = useState<EmployeeProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editRecord, setEditRecord] = useState<EmployeeProject | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EmployeeProject>({
    EmployeeProjectId: 0,
    employeeId: empId,
    projectId: 0,
    allocationPercentage: 0,
    fromDate: "",
    toDate: "",
    isActive: true
  });

  /* ================= LOAD PROJECT DROPDOWN ================= */

  const loadProjects = async () => {
    try {
      const res = await projectService.GetProjectsByOrganization(organizationID);
      setProjects(res);
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  /* ================= LOAD EMPLOYEE PROJECTS ================= */

  const loadEmployeeProjects = async () => {
    try {

      const res = await employeeProjectService.GetEmployeeProjectsByemployeeId(empId);

      const formatted = res.map((item: any) => ({
        EmployeeProjectId: item.EmployeeProjectId,
        employeeId: item.EmployeeId,
        projectId: item.ProjectId,
        allocationPercentage: item.AllocationPercentage,
        fromDate: item.FromDate,
        toDate: item.ToDate,
        isActive: item.IsActive
      }));

      setRecords(formatted);

    } catch (error) {
      console.error("Failed to load employee projects", error);
    }
  };

  useEffect(() => {
    loadProjects();
    loadEmployeeProjects();
  }, [empId]);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e: React.ChangeEvent<any>) => {

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
      allocationPercentage: 0,
      fromDate: "",
      toDate: "",
      isActive: true
    });

    setEditRecord(null);
    setValidated(false);
    setShowModal(true);

  };

  /* ================= EDIT ================= */

  const handleEdit = (record: EmployeeProject) => {

    setEditRecord(record);

    setFormData({
      ...record,
      fromDate: record.fromDate ? record.fromDate.split("T")[0] : "",
      toDate: record.toDate ? record.toDate.split("T")[0] : ""
    });

    setShowModal(true);

  };

  /* ================= SAVE ================= */

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

        employeeProjectId: editRecord ? editRecord.EmployeeProjectId : 0,
        employeeId: empId,
        projectId: Number(formData.projectId),
        allocationPercentage: Number(formData.allocationPercentage),
        fromDate: new Date(formData.fromDate).toISOString(),
        toDate: formData.toDate
          ? new Date(formData.toDate).toISOString()
          : null,
        isActive: formData.isActive,
        createdBy: "1"

      };

      const res = await employeeProjectService.PostEmployeeProjectByAsync(payload);

      if (res.value === 0) {
        alert(res.message || "Warning occurred");
        return;
      }

      alert(res.message || "Saved successfully");

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

      const res = await employeeProjectService.DeleteEmployeeProjectByAsync(deleteId);

      if (res[0].value === 0) {
        alert(res[0].message || "Warning occurred");
        return;
      }

      alert(res[0].message || "Deleted successfully");

      setConfirmDelete(false);
      loadEmployeeProjects();

    } catch (error) {

      console.error(error);
      alert("Delete failed");

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

      {records.length ? (

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

            {records.map(r => {

              const project = projects.find(p => p.ProjectId === r.projectId);

              return (

                <tr key={r.EmployeeProjectId}>

                  <td>{project?.ProjectName}</td>
                  <td>{r.allocationPercentage}</td>
                  <td>{r.fromDate?.split("T")[0]}</td>
                  <td>{r.toDate?.split("T")[0]}</td>
                  <td>{r.isActive ? "Yes" : "No"}</td>

                  <td>

                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleEdit(r)}
                    >
                      Edit
                    </Button>{" "}

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(r.EmployeeProjectId)}
                    >
                      Delete
                    </Button>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </Table>

      ) : (
        <p>No project allocations found.</p>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>
            {editRecord ? "Edit Project Allocation" : "Add Project Allocation"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">

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

              <Col md={6}>

                <Form.Group controlId="allocationPercentage">

                  <Form.Label>Allocation %</Form.Label>

                  <Form.Control
                    required
                    type="number"
                    min={0}
                    max={100}
                    value={formData.allocationPercentage}
                    onChange={handleChange}
                  />

                </Form.Group>

              </Col>

            </Row>

            <Row className="mb-3">

              <Col md={6}>

                <Form.Group controlId="fromDate">

                  <Form.Label>From</Form.Label>

                  <Form.Control
                    required
                    type="date"
                    value={formData.fromDate}
                    onChange={handleChange}
                  />

                </Form.Group>

              </Col>

              <Col md={6}>

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

            <Form.Group controlId="isActive" className="mb-3">

              <Form.Check
                label="Active"
                checked={formData.isActive}
                onChange={handleChange}
              />

            </Form.Group>

            <Modal.Footer>

              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button variant="primary" type="submit">
                {editRecord ? "Update" : "Save"}
              </Button>

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

          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={confirmDeleteAction}
          >
            Delete
          </Button>

        </Modal.Footer>

      </Modal>

    </div>

  );

};

export default EmployeeProjects;