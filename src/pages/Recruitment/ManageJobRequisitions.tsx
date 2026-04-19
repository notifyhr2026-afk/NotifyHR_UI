import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jobRequisitionService from "../../services/jobRequisitionService";
import branchService from "../../services/branchService";
import positionService from "../../services/positionService";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";

// ================= TYPES =================
interface JobRequisition {
  jobRequisitionID: number;
  jobRequisitionNo: string;
  organizationID: number;
  branchID: number;
  positionID: number;
  departmentID: number;
  employmentTypeID: number;
  noOfOpenings: number;
  requestedBy: number;
  requestedDate: string;
  targetStartDate: string;
  jobDescription: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  minSalary: number;
  maxSalary: number;
  status: string;
  createdBy: number;
}

interface Dropdown {
  id: number;
  name: string;
}

// ================= COMPONENT =================
const ManageJobRequisitions: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user.organizationID;
  const userID = user.userID;

  // states
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [branches, setBranches] = useState<Dropdown[]>([]);
  const [positions, setPositions] = useState<Dropdown[]>([]);
  const [departments, setDepartments] = useState<Dropdown[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<Dropdown[]>([]);
  const [employees, setEmployees] = useState<Dropdown[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editRequisition, setEditRequisition] = useState<JobRequisition | null>(null);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  const mapJobRequisition = (x: any) => ({
  jobRequisitionID: x.JobRequisitionID,
  jobRequisitionNo: x.JobRequisitionNo,
  organizationID: x.OrganizationID,
  branchID: x.BranchID,
  positionID: x.PositionID,
  departmentID: x.DepartmentID,
  employmentTypeID: x.EmploymentTypeID,
  noOfOpenings: x.NoOfOpenings,
  requestedBy: x.RequestedBy,
  requestedDate: x.RequestedDate?.split("T")[0],
  targetStartDate: x.TargetStartDate?.split("T")[0],
  jobDescription: x.JobDescription,
  minExperienceYears: x.MinExperienceYears,
  maxExperienceYears: x.MaxExperienceYears,
  status: x.Status,
  createdBy: x.CreatedBy,
  minSalary: x.MinSalary,
  maxSalary: x.MaxSalary,
});

  const initialForm: JobRequisition = {
    jobRequisitionID: 0,
    jobRequisitionNo: "",
    organizationID: organizationID,
    branchID: 0,
    positionID: 0,
    departmentID: 0,
    employmentTypeID: 0,
    noOfOpenings: 1,
    requestedBy: 0,
    requestedDate: new Date().toISOString().split("T")[0],
    targetStartDate: "",
    jobDescription: "",
    minExperienceYears: 0,
    maxExperienceYears: 0,
    minSalary: 0,
    maxSalary: 0,
    status: "Open",
    createdBy: userID,
  };

  const [formData, setFormData] = useState<JobRequisition>(initialForm);

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [
        jobs,
        branchRes,
        positionRes,
        deptRes,
        empTypeRes,
        empRes,
      ] = await Promise.all([
        jobRequisitionService.GetJobRequisitionsByOrganization(organizationID),
        branchService.getBranchesAsync(organizationID),
        positionService.getPositionsAsync(organizationID),
        departmentService.getdepartmentesAsync(organizationID),
        employeeService.getEmploymentTypes(),
        employeeService.getEmployeesByOrganizationIdAsync(organizationID),
      ]);

     setRequisitions((jobs || []).map(mapJobRequisition));

const branchesList =
  Array.isArray(branchRes)
    ? branchRes
    : branchRes?.Table || branchRes?.data || [];

setBranches(
  branchesList.map((x: any) => ({
    id: x.BranchID,
    name: x.BranchName,
  }))
);

const positionsList =
  Array.isArray(positionRes)
    ? positionRes
    : positionRes?.Table || positionRes?.data || [];

setPositions(
  positionsList.map((x: any) => ({
    id: x.PositionID,
    name: x.PositionTitle,
  }))
);

const deptList =
  Array.isArray(deptRes)
    ? deptRes
    : deptRes?.Table || deptRes?.data || [];

setDepartments(
  deptList.map((x: any) => ({
    id: x.DepartmentID,
    name: x.DepartmentName,
  }))
);

const empTypeList =
  Array.isArray(empTypeRes)
    ? empTypeRes
    : empTypeRes?.Table || empTypeRes?.data || [];

setEmploymentTypes(
  empTypeList.map((x: any) => ({
    id: x.EmploymentTypeID,
    name: x.EmploymentTypeName,
  }))
);

const empList =
  Array.isArray(empRes)
    ? empRes
    : empRes?.Table || empRes?.data || [];

setEmployees(
  empList.map((x: any) => ({
    id: x.EmployeeID,
    name: x.EmployeeName,
  }))
);

    } catch (err) {
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // ================= INPUT =================
const handleInputChange = (e: any) => {
  const { id, value } = e.target;

  setFormData((prev: any) => ({
    ...prev,
    [id]:
      typeof prev[id] === "number"
        ? Number(value)
        : value,
  }));
};

  // ================= SAVE =================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        organizationID,
        createdBy: userID,
      };

      await jobRequisitionService.PostJobRequisitionByAsync(payload);

      toast.success(
        formData.jobRequisitionID === 0
          ? "Created successfully"
          : "Updated successfully"
      );

      setShowModal(false);
      setFormData(initialForm);
      setEditRequisition(null);
      fetchAll();
    } catch (err) {
      toast.error("Save failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item: JobRequisition) => {
    setEditRequisition(item);
    setFormData(item);
    setShowModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    try {
      await jobRequisitionService.DeleteJobRequisitionByAsync(id);
      toast.success("Deleted successfully");
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= UI =================
  return (
    <div className="container mt-3">
      <h3>Job Requisitions</h3>

      <div className="d-flex justify-content-end">
    <Button
      onClick={() => {
        setFormData(initialForm);
        setEditRequisition(null);
        setShowModal(true);
      }}
    >
      + New Job Requisitions
    </Button> </div>

      <Table className="mt-3" bordered>
        <thead>
          <tr>
            <th>No</th>
            <th>Branch</th>
            <th>Position</th>
            <th>Department</th>
            <th>Openings</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {requisitions.map((r) => (
            <tr key={r.jobRequisitionID}>
              <td>{r.jobRequisitionNo}</td>
              <td>{branches.find(b => b.id === r.branchID)?.name}</td>
              <td>{positions.find(p => p.id === r.positionID)?.name}</td>
              <td>{departments.find(d => d.id === r.departmentID)?.name}</td>
              <td>{r.noOfOpenings}</td>
              <td>{r.status}</td>
              <td>
                <Button size="sm" onClick={() => handleEdit(r)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(r.jobRequisitionID)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ================= ADD / EDIT MODAL ================= */}
<Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>
      {editRequisition ? "Edit Job Requisition" : "Add Job Requisition"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form noValidate validated={validated} onSubmit={handleSave}>

      {/* ================= ROW 1 ================= */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="jobRequisitionNo">
            <Form.Label>Job Requisition No</Form.Label>
            <Form.Control
              required
              type="text"
              value={formData.jobRequisitionNo}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="branchID">
            <Form.Label>Branch</Form.Label>
            <Form.Select
              required
              value={formData.branchID}
              onChange={handleInputChange}
            >
              <option value={0}>Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="positionID">
            <Form.Label>Position</Form.Label>
            <Form.Select
              required
              value={formData.positionID}
              onChange={handleInputChange}
            >
              <option value={0}>Select Position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* ================= ROW 2 ================= */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="departmentID">
            <Form.Label>Department</Form.Label>
            <Form.Select
              required
              value={formData.departmentID}
              onChange={handleInputChange}
            >
              <option value={0}>Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="employmentTypeID">
            <Form.Label>Employment Type</Form.Label>
            <Form.Select
              required
              value={formData.employmentTypeID}
              onChange={handleInputChange}
            >
              <option value={0}>Select Type</option>
              {employmentTypes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="noOfOpenings">
            <Form.Label>No Of Openings</Form.Label>
            <Form.Control
              required
              type="number"
              value={formData.noOfOpenings}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* ================= ROW 3 ================= */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="requestedBy">
            <Form.Label>Requested By</Form.Label>
            <Form.Select
              required
              value={formData.requestedBy}
              onChange={handleInputChange}
            >
              <option value={0}>Select User</option>
              {employees.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="requestedDate">
            <Form.Label>Requested Date</Form.Label>
            <Form.Control
              required
              type="date"
              value={formData.requestedDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="targetStartDate">
            <Form.Label>Target Start Date</Form.Label>
            <Form.Control
              required
              type="date"
              value={formData.targetStartDate}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* ================= ROW 4 ================= */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="minExperienceYears">
            <Form.Label>Min Experience</Form.Label>
            <Form.Control
              type="number"
              value={formData.minExperienceYears}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="maxExperienceYears">
            <Form.Label>Max Experience</Form.Label>
            <Form.Control
              type="number"
              value={formData.maxExperienceYears}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="minSalary">
            <Form.Label>Min Salary</Form.Label>
            <Form.Control
              type="number"
              value={formData.minSalary}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group controlId="maxSalary">
            <Form.Label>Max Salary</Form.Label>
            <Form.Control
              type="number"
              value={formData.maxSalary}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* ================= ROW 5 ================= */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              required
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="">Select Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Pending">Pending</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={9}>
          <Form.Group controlId="jobDescription">
            <Form.Label>Job Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.jobDescription}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* ================= FOOTER ================= */}
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {editRequisition ? "Update" : "Save"}
        </Button>
      </Modal.Footer>

    </Form>
  </Modal.Body>
</Modal>

      <ToastContainer />
    </div>
  );
};

export default ManageJobRequisitions;