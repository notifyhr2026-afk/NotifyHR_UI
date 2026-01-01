import React, { useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Container, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

// Static data for demonstration
const salaryAssignments = [
  {
    SalaryAssignmentID: 1,
    EmployeeID: 101,
    EmployeeName: 'PQR',
    OrganizationID: 1,
    StructureID: 1,
    ChangeStatusID: 1,
    CTC: 600000,
    EffectiveFrom: '2023-01-01',
    EffectiveTo: '2023-12-31',
    IsActive: true,
  },
  {
    SalaryAssignmentID: 2,
    EmployeeID: 102,
    EmployeeName: 'ABC',
    OrganizationID: 1,
    StructureID: 2,
    ChangeStatusID: 2,
    CTC: 550000,
    EffectiveFrom: '2023-06-01',
    EffectiveTo: '2023-12-31',
    IsActive: true,
  },
];

const salaryStructures = [
  { StructureID: 1, StructureName: 'Monthly Salary' },
  { StructureID: 2, StructureName: 'Contract Salary' },
];

const changeStatuses = [
  { ChangeStatusID: 1, Status: 'Initial Salary' },
  { ChangeStatusID: 2, Status: 'Salary Hike' },
];

const branches = [
  { BranchID: 1, BranchName: 'Head Office' },
  { BranchID: 2, BranchName: 'Branch 1' },
  { BranchID: 3, BranchName: 'Branch 2' },
];

const employees = [
  { EmployeeID: 101, EmployeeName: 'John Doe' },
  { EmployeeID: 102, EmployeeName: 'Jane Smith' },
];

const EmployeeSalaryAssignment: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [salaryData, setSalaryData] = useState(salaryAssignments);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const navigate = useNavigate(); // useNavigate hook for navigation

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

  // Handle Save (both Add and Edit)
  const handleSave = () => {
    if (!selectedAssignment) return;
    // If adding new, push it to the list, otherwise update the list
    if (!selectedAssignment.SalaryAssignmentID) {
      selectedAssignment.SalaryAssignmentID = salaryData.length + 1; // New ID
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
    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (confirmDelete) {
      setSalaryData(salaryData.filter((assignment) => assignment.SalaryAssignmentID !== id));
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

  // Navigate to View Backup Page
  const handleViewBackup = (employeeId: number) => {
    navigate(`/EmployeeSalaryBackupView/${employeeId}`); // Redirect to EmployeeSalaryBackupView with EmployeeID in the URL
  };

  return (
    <Container className="mt-5">
      <h3>Manage Employee Salary Assignments</h3>

      {/* Searchable Dropdown for Branch and Employee with improved design */}
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Select Branch</Form.Label>
              <Select
                options={branches.map((branch) => ({
                  value: branch.BranchID,
                  label: branch.BranchName,
                }))}
                value={selectedBranch}
                onChange={setSelectedBranch}
                placeholder="Search Branch"
                isClearable
                className="react-select-container"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Select Employee</Form.Label>
              <Select
                options={employees.map((employee) => ({
                  value: employee.EmployeeID,
                  label: employee.EmployeeName,
                }))}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                placeholder="Search Employee"
                isClearable
                className="react-select-container"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="d-flex justify-content-end align-items-end">
          <Button variant="success" onClick={handleAddSalaryAssignment}>
            + Add Salary Assignment
          </Button>
        </Col>
      </Row>

      {/* Table for Salary Assignments */}
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
                {
                  changeStatuses.find((s) => s.ChangeStatusID === assignment.ChangeStatusID)?.Status
                }
              </td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditSalaryAssignment(assignment)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="me-2"
                  onClick={() => handleDelete(assignment.SalaryAssignmentID)}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewBackup(assignment.EmployeeID)} // Pass EmployeeID to the view backup page
                >
                  View Backup
                </Button>
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
              <Form.Label>Employee ID</Form.Label>
              <Form.Control
                type="number"
                value={selectedAssignment?.EmployeeID || ''}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="StructureID">
              <Form.Label>Salary Structure</Form.Label>
              <Form.Select value={selectedAssignment?.StructureID || ''} onChange={handleChange} required>
                <option value="">-- Select Structure --</option>
                {salaryStructures.map((structure) => (
                  <option key={structure.StructureID} value={structure.StructureID}>
                    {structure.StructureName}
                  </option>
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

            <Form.Group controlId="ChangeStatusID">
              <Form.Label>Change Status</Form.Label>
              <Form.Select value={selectedAssignment?.ChangeStatusID || ''} onChange={handleChange} required>
                <option value="">-- Select Change Status --</option>
                {changeStatuses.map((status) => (
                  <option key={status.ChangeStatusID} value={status.ChangeStatusID}>
                    {status.Status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeSalaryAssignment;
