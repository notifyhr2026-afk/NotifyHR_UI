import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Row, Col, Container, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import branchService from '../../services/branchService';
import salaryService from '../../services/salaryService';

// Sample static data for demonstration
const salaryAssignments = [
  {
    SalaryAssignmentID: 1,
    EmployeeID: 1024,
    EmployeeName: 'Nidhi Sri Kalipu',
    OrganizationID: 45,
    StructureID: 1,
    ChangeStatusID: 1,
    CTC: 600000,
    EffectiveFrom: '2023-01-01',
    EffectiveTo: '2023-12-31',
    IsActive: true,
  },
  {
    SalaryAssignmentID: 2,
    EmployeeID: 1025,
    EmployeeName: 'Kushal sai Kalipu',
    OrganizationID: 45,
    StructureID: 2,
    ChangeStatusID: 2,
    CTC: 550000,
    EffectiveFrom: '2023-06-01',
    EffectiveTo: '2023-12-31',
    IsActive: true,
  },
];

const changeStatuses = [
  { ChangeStatusID: 5, Status: 'Initial Salary' },
  { ChangeStatusID: 1, Status: 'Annual Increment' },
  { ChangeStatusID: 2, Status: 'Promotion' },
  { ChangeStatusID: 3, Status: 'Correction' },
  { ChangeStatusID: 4, Status: 'Transfer' },
];

const EmployeeSalaryAssignment: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [salaryData, setSalaryData] = useState(salaryAssignments);
  
  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [salaryStructures, setSalaryStructures] = useState<any[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(false);

  const navigate = useNavigate();
  const organizationID = 45; // replace with dynamic org ID if needed

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await branchService.getBranchesAsync(organizationID);
        setBranches(res.Table || []);
      } catch (error) {
        toast.error('Failed to fetch branches');
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [organizationID]);

  useEffect(() => {
  const fetchSalaryStructures = async () => {
    try {
      setLoadingStructures(true);
      const res = await salaryService.getSalaryStructuresAsync(organizationID);
      setSalaryStructures(res);
    } catch (error) {
      toast.error('Failed to fetch salary structures');
    } finally {
      setLoadingStructures(false);
    }
  };
  fetchSalaryStructures();
}, [organizationID]);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        setEmployees(res || []);
      } catch (error) {
        toast.error('Failed to fetch employees');
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [organizationID]);

  // Open Modal for Add
  const handleAddSalaryAssignment = () => {
    setSelectedAssignment(null);
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleEditSalaryAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowModal(true);
  };

  // Handle Save (Add/Edit)
  const handleSave = () => {
    if (!selectedAssignment) return;
    if (!selectedAssignment.SalaryAssignmentID) {
      selectedAssignment.SalaryAssignmentID = salaryData.length + 1;
      setSalaryData([...salaryData, selectedAssignment]);
      toast.success('Employee Salary Assignment Added!');
    } else {
      setSalaryData(
        salaryData.map((item) =>
          item.SalaryAssignmentID === selectedAssignment.SalaryAssignmentID
            ? selectedAssignment
            : item
        )
      );
      toast.success('Employee Salary Assignment Updated!');
    }
    setShowModal(false);
  };

  // Handle Delete
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setSalaryData(salaryData.filter((a) => a.SalaryAssignmentID !== id));
      toast.success('Employee Salary Assignment Deleted!');
    }
  };

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setSelectedAssignment((prev: any) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Navigate to Backup
  const handleViewBackup = (employeeId: number) => {
    navigate(`/EmployeeSalaryBackupView/${employeeId}`);
  };

  return (
    <Container className="mt-5">
      <h3>Manage Employee Salary Assignments</h3>

      <Row className="mb-5">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Select Branch</Form.Label>
              {loadingBranches ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Select
                  options={branches.map((branch) => ({
                    value: branch.BranchID,
                    label: branch.BranchName,
                  }))}
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  placeholder="Search Branch"
                  isClearable
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Select Employee</Form.Label>
              {loadingEmployees ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Select
                  options={employees.map((emp) => ({
                    value: emp.EmployeeID,
                    label: emp.EmployeeName,
                  }))}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  placeholder="Search Employee"
                  isClearable
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="d-flex justify-content-end align-items-end">
          <Button variant="success" onClick={handleAddSalaryAssignment}>
            + Add Salary Assignment
          </Button>
        </Col>
      </Row>

      {/* Salary Table */}
      <Table bordered hover responsive size="sm">
        <thead className="table-light">
          <tr>
            <th>Employee ID</th>
            <th>Salary Structure</th>
            <th>CTC</th>
            <th>Effective From</th>
            <th>Effective To</th>
            <th>Change Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaryData.map((assignment) => (
            <tr key={assignment.SalaryAssignmentID}>
              <td>{assignment.EmployeeID}</td>
              <td>
                {salaryStructures.find((s) => s.StructureID === assignment.StructureID)?.StructureName}
              </td>
              <td>{assignment.CTC}</td>
              <td>{assignment.EffectiveFrom}</td>
              <td>{assignment.EffectiveTo}</td>
              <td>
                {changeStatuses.find((c) => c.ChangeStatusID === assignment.ChangeStatusID)?.Status}
              </td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => handleEditSalaryAssignment(assignment)}>Edit</Button>
                <Button variant="danger" size="sm" className="me-2" onClick={() => handleDelete(assignment.SalaryAssignmentID)}>Delete</Button>
                <Button variant="secondary" size="sm" onClick={() => handleViewBackup(assignment.EmployeeID)}>View Backup</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedAssignment ? 'Edit Salary Assignment' : 'Add Salary Assignment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="EmployeeID">
             <Form.Label>Select Employee</Form.Label>
              {loadingEmployees ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Select
                  options={employees.map((emp) => ({
                    value: emp.EmployeeID,
                    label: emp.EmployeeName,
                  }))}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  placeholder="Search Employee"
                  isClearable
                />
              )}
            </Form.Group>

            <Form.Group controlId="StructureID">
              <Form.Label>hangeStatus</Form.Label>
              <Form.Select
                value={selectedAssignment?.ChangeStatusID || ''}
                onChange={handleChange}
                required
              >
                <option value="">-- Select change Status --</option>
                {changeStatuses.map((s) => (
                  <option key={s.ChangeStatusID} value={s.ChangeStatusID}>{s.Status}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="CTC">
              <Form.Label>CTC</Form.Label>
              <Form.Control
                type="number"
                value={selectedAssignment?.CTC || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="EffectiveFrom">
              <Form.Label>Effective From</Form.Label>
              <Form.Control
                type="date"
                value={selectedAssignment?.EffectiveFrom || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>

           <Form.Group controlId="StructureID">
            <Form.Label>Salary Structure</Form.Label>
            {loadingStructures ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <Form.Select
                value={selectedAssignment?.StructureID || ''}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Structure --</option>
                {salaryStructures.map((s) => (
                  <option key={s.StructureID} value={s.StructureID}>{s.StructureName}</option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeSalaryAssignment;