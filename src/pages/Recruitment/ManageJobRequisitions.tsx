import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import branchService from "../../services/branchService";
import positionService from "../../services/positionService";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";

// ======= Types =======
interface JobRequisition {
  JobRequisitionID: number;
  JobRequisitionNo: string;
  BranchID: number;
  PositionID: number;
  DepartmentID: number;
  EmploymentTypeID: number;
  NoOfOpenings: number;
  RequestedBy: number;
  RequestedDate: string;
  TargetStartDate: string;
  JobDescription: string;
  MinExperienceYears: number;
  MaxExperienceYears: number;
  MinSalary: number;
  MaxSalary: number;
  Status: string;
  CreatedDate: string;
  ModifiedDate?: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

// ======= Static Data (only statuses remain static) =======
const statuses: DropdownItem[] = [
  { id: 1, name: "Open" },
  { id: 2, name: "Closed" },
  { id: 3, name: "Pending" },
];

// ======= Component =======
const ManageJobRequisitions: React.FC = () => {
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([
    {
      JobRequisitionID: 1,
      JobRequisitionNo: "JR-001",
      BranchID: 1,
      PositionID: 101,
      DepartmentID: 10,
      EmploymentTypeID: 1,
      NoOfOpenings: 3,
      RequestedBy: 1001,
      RequestedDate: "2025-12-01",
      TargetStartDate: "2026-01-15",
      JobDescription: "Frontend Developer with React and TypeScript skills",
      MinExperienceYears: 2,
      MaxExperienceYears: 5,
      MinSalary: 5,
      MaxSalary: 10,
      Status: "Open",
      CreatedDate: "2025-12-01",
    },
  ]);

  // API data states
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [positions, setPositions] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<DropdownItem[]>([]);
  const [employees, setEmployees] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dropdown data from APIs
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const organizationID = user.organizationID;

        if (!organizationID) {
          setError('Organization ID not found');
          setLoading(false);
          return;
        }

        const [branchesData, positionsData, departmentsData, employmentTypesData, employeesData] = await Promise.all([
          branchService.getBranchesAsync(organizationID),
          positionService.getPositionsAsync(organizationID),
          departmentService.getdepartmentesAsync(organizationID),
          employeeService.getEmploymentTypes(),
          employeeService.getEmployeesByOrganizationIdAsync(organizationID),
        ]);

        // Handle different response formats
        const branchesList = Array.isArray(branchesData) ? branchesData : branchesData?.Table || [];
        const positionsList = Array.isArray(positionsData) ? positionsData : positionsData?.Table || [];
        const departmentsList = Array.isArray(departmentsData) ? departmentsData : departmentsData?.Table || [];
        const employeesList = Array.isArray(employeesData) ? employeesData : employeesData?.Table || [];

        // Map API responses to component format
        setBranches(branchesList.map((item: any) => ({
          id: item.BranchID || item.id,
          name: item.BranchName || item.name,
        })));

        setPositions(positionsList.map((item: any) => ({
          id: item.PositionID || item.id,
          name: item.PositionTitle || item.PositionName || item.name,
        })));

        setDepartments(departmentsList.map((item: any) => ({
          id: item.DepartmentID || item.id,
          name: item.DepartmentName || item.name,
        })));

        setEmploymentTypes(employmentTypesData.map((item: any) => ({
          id: item.EmploymentTypeID || item.id,
          name: item.EmploymentTypeName || item.name,
        })));

        setEmployees(employeesList.map((item: any) => ({
          id: item.EmployeeID || item.id,
          name: item.EmployeeName || item.FirstName + ' ' + item.LastName || item.name,
        })));

        setError(null);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        setError('Failed to load dropdown data');
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editRequisition, setEditRequisition] = useState<JobRequisition | null>(null);
  const [formData, setFormData] = useState<JobRequisition>({
    JobRequisitionID: 0,
    JobRequisitionNo: "",
    BranchID: 0,
    PositionID: 0,
    DepartmentID: 0,
    EmploymentTypeID: 0,
    NoOfOpenings: 1,
    RequestedBy: 0,
    RequestedDate: new Date().toISOString().slice(0, 10),
    TargetStartDate: "",
    JobDescription: "",
    MinExperienceYears: 0,
    MaxExperienceYears: 0,
    MinSalary: 0,
    MaxSalary: 0,
    Status: "Open",
    CreatedDate: new Date().toISOString().slice(0, 10),
  });
  const [validated, setValidated] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [requisitionToDelete, setRequisitionToDelete] = useState<number | null>(null);

  // ======= Handlers =======
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "BranchID" ||
        id === "PositionID" ||
        id === "DepartmentID" ||
        id === "EmploymentTypeID" ||
        id === "RequestedBy" ||
        id === "NoOfOpenings" ||
        id === "MinExperienceYears" ||
        id === "MaxExperienceYears" ||
        id === "MinSalary" ||
        id === "MaxSalary"
          ? parseInt(value)
          : value,
    }));
  };

  const openAddModal = () => {
    setEditRequisition(null);
    setFormData({
      JobRequisitionID: 0,
      JobRequisitionNo: "",
      BranchID: 0,
      PositionID: 0,
      DepartmentID: 0,
      EmploymentTypeID: 0,
      NoOfOpenings: 1,
      RequestedBy: 0,
      RequestedDate: new Date().toISOString().slice(0, 10),
      TargetStartDate: "",
      JobDescription: "",
      MinExperienceYears: 0,
      MaxExperienceYears: 0,
      MinSalary: 0,
      MaxSalary: 0,
      Status: "Open",
      CreatedDate: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const openEditModal = (req: JobRequisition) => {
    setEditRequisition(req);
    setFormData(req);
    setShowModal(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      toast.warn("Please fill all required fields correctly.");
      return;
    }

    if (editRequisition) {
      setRequisitions((prev) =>
        prev.map((r) => (r.JobRequisitionID === formData.JobRequisitionID ? formData : r))
      );
      toast.success("Job requisition updated successfully!");
    } else {
      const newID = requisitions.length
        ? Math.max(...requisitions.map((r) => r.JobRequisitionID)) + 1
        : 1;
      setRequisitions((prev) => [...prev, { ...formData, JobRequisitionID: newID }]);
      toast.success("Job requisition added successfully!");
    }

    setShowModal(false);
    setValidated(false);
  };

  const confirmDeleteRequisition = (id: number) => {
    setRequisitionToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (requisitionToDelete !== null) {
      setRequisitions((prev) => prev.filter((r) => r.JobRequisitionID !== requisitionToDelete));
      toast.success("Job requisition deleted successfully!");
      setConfirmDelete(false);
    }
  };

  // ======= Render =======
  return (
    <div className="Container">
      <h3>Manage Job Requisitions</h3>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dropdown data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          {error}
        </div>
      ) : (
        <>
          <div className="text-end mb-3">
            <Button variant="success" onClick={openAddModal}>
              + Add Job Requisition
            </Button>
          </div>

          {/* Table */}
          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>No</th>
                <th>Branch</th>
                <th>Position</th>
                <th>Department</th>
                <th>Employment Type</th>
                <th>NoOfOpenings</th>
                <th>RequestedBy</th>
                <th>Experience (Yrs)</th>
                <th>Salary (Lacs)</th>
                <th>Status</th>
                <th>Target Start</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((r) => (
                <tr key={r.JobRequisitionID}>
                  <td>{r.JobRequisitionNo}</td>
                  <td>{branches.find((b) => b.id === r.BranchID)?.name}</td>
                  <td>{positions.find((p) => p.id === r.PositionID)?.name}</td>
                  <td>{departments.find((d) => d.id === r.DepartmentID)?.name}</td>
                  <td>{employmentTypes.find((e) => e.id === r.EmploymentTypeID)?.name}</td>
                  <td>{r.NoOfOpenings}</td>
                  <td>{employees.find((u) => u.id === r.RequestedBy)?.name}</td>
                  <td>
                    {r.MinExperienceYears}-{r.MaxExperienceYears}
                  </td>
              <td>
                {r.MinSalary}-{r.MaxSalary}
              </td>
              <td>
                <span
                  className={`badge ${
                    r.Status === "Open"
                      ? "bg-primary"
                      : r.Status === "Closed"
                      ? "bg-secondary"
                      : "bg-warning"
                  }`}
                >
                  {r.Status}
                </span>
              </td>
              <td>{r.TargetStartDate}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => openEditModal(r)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => confirmDeleteRequisition(r.JobRequisitionID)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editRequisition ? "Edit Job Requisition" : "Add Job Requisition"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading form data...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              {error}
            </div>
          ) : (
            <Form noValidate validated={validated} onSubmit={handleSave}>
              {/* First Row */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="JobRequisitionNo">
                    <Form.Label>Job Requisition No</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={formData.JobRequisitionNo}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="BranchID">
                    <Form.Label>Branch</Form.Label>
                    <Form.Select required value={formData.BranchID} onChange={handleInputChange}>
                      <option value="">Select Branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="PositionID">
                    <Form.Label>Position</Form.Label>
                    <Form.Select required value={formData.PositionID} onChange={handleInputChange}>
                      <option value="">Select Position</option>
                      {positions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Second Row */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="DepartmentID">
                    <Form.Label>Department</Form.Label>
                    <Form.Select
                      required
                      value={formData.DepartmentID}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="EmploymentTypeID">
                    <Form.Label>Employment Type</Form.Label>
                    <Form.Select
                      required
                      value={formData.EmploymentTypeID}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Type</option>
                      {employmentTypes.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="NoOfOpenings">
                    <Form.Label>No Of Openings</Form.Label>
                    <Form.Control
                      required
                      type="number"
                      value={formData.NoOfOpenings}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

            {/* Third Row */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="RequestedBy">
                  <Form.Label>Requested By</Form.Label>
                  <Form.Select required value={formData.RequestedBy} onChange={handleInputChange}>
                    <option value="">Select User</option>
                    {employees.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="RequestedDate">
                  <Form.Label>Requested Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.RequestedDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="TargetStartDate">
                  <Form.Label>Target Start Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.TargetStartDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Fourth Row - Experience and Salary */}
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="MinExperienceYears">
                  <Form.Label>Min Experience (Years)</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={formData.MinExperienceYears}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="MaxExperienceYears">
                  <Form.Label>Max Experience (Years)</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={formData.MaxExperienceYears}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="MinSalary">
                  <Form.Label>Min Salary (Lacs)</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={formData.MinSalary}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="MaxSalary">
                  <Form.Label>Max Salary (Lacs)</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={formData.MaxSalary}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Fifth Row - Status & Description */}
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="Status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select required value={formData.Status} onChange={handleInputChange}>
                    <option value="">Select Status</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={9}>
                <Form.Group controlId="JobDescription">
                  <Form.Label>Job Description</Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    value={formData.JobDescription}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editRequisition ? "Update" : "Save"}
              </Button>
            </Modal.Footer>
          </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this job requisition?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
        </>
      )}
    </div>
  );
};

export default ManageJobRequisitions;
