import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Row, Col, Container, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';

import employeeService from '../../services/employeeService';
import branchService from '../../services/branchService';
import salaryService from '../../services/salaryService';
import employeeSalaryAssignment from '../../services/employeeSalaryAssignment';

const changeStatuses = [
  { ChangeStatusID: 5, Status: 'Initial Salary' },
  { ChangeStatusID: 1, Status: 'Annual Increment' },
  { ChangeStatusID: 2, Status: 'Promotion' },
  { ChangeStatusID: 3, Status: 'Correction' },
  { ChangeStatusID: 4, Status: 'Transfer' },
];

const EmployeeSalaryAssignment: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID ?? 0;
  const createdBy = '1'; // user?.username ?? 'system';

  const [showModal, setShowModal] = useState(false);
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [salaryStructures, setSalaryStructures] = useState<any[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [salaryBreakup, setSalaryBreakup] = useState<any[]>([]);
  const [breakupLoading, setBreakupLoading] = useState(false);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingStructures, setLoadingStructures] = useState(false);

  /* ---------------- Fetch Branches ---------------- */
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const res = await branchService.getBranchesAsync(organizationID);
        setBranches(res.Table || []);
      } catch {
        toast.error("Failed to load branches");
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, [organizationID]);

  /* ---------------- Fetch Employees ---------------- */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        setEmployees(res || []);
      } catch {
        toast.error("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [organizationID]);

  /* ---------------- Fetch Salary Structures ---------------- */
  useEffect(() => {
    const fetchStructures = async () => {
      try {
        setLoadingStructures(true);
        const res = await salaryService.getSalaryStructuresAsync(organizationID);
        setSalaryStructures(res || []);
      } catch {
        toast.error("Failed to load salary structures");
      } finally {
        setLoadingStructures(false);
      }
    };
    fetchStructures();
  }, [organizationID]);

  /* ---------------- Fetch Salary Assignments ---------------- */
  const fetchSalaryAssignments = async (employeeId: number) => {
    try {
      const res = await employeeSalaryAssignment.GetEmployeeSalaryAssignmentByEmployeeID(employeeId);
      setSalaryData(res || []);
    } catch {
      toast.error("Failed to fetch salary assignments");
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      fetchSalaryAssignments(selectedEmployee.value);
    } else {
      fetchSalaryAssignments(0); // If employee cleared, load all
    }
  }, [selectedEmployee]);

  /* ---------------- Add ---------------- */
  const handleAdd = () => {
    setSelectedAssignment({
      SalaryAssignmentID: 0,
      EmployeeID: selectedEmployee?.value || 0,
      OrganizationID: organizationID,
      StructureID: "",
      ChangeStatusID: "",
      CTC: "",
      EffectiveFrom: "",
      EffectiveTo: "",
      IsActive: true
    });
    setShowModal(true);
  };

  /* ---------------- Edit ---------------- */
  const handleEdit = (row: any) => {
    setSelectedAssignment({
      ...row,
      EffectiveFrom: row.EffectiveFrom?.split("T")[0],
      EffectiveTo: row.EffectiveTo ? row.EffectiveTo.split("T")[0] : ""
    });
    setShowModal(true);
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this salary assignment?")) return;
    try {
      const res = await employeeSalaryAssignment.DeleteEmployeeSalaryAssignmentAsync(id);
      toast.success(res.message);
      fetchSalaryAssignments(selectedEmployee.value);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- Handle Change ---------------- */
  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setSelectedAssignment((prev: any) => ({
      ...prev,
      [id]: value
    }));
  };

  /* ---------------- Save ---------------- */
  const handleSave = async () => {
    try {
      const payload = {
        salaryAssignmentID: selectedAssignment?.SalaryAssignmentID || 0,
        employeeID: selectedAssignment?.EmployeeID,
        organizationID: organizationID,
        structureID: Number(selectedAssignment.StructureID),
        changeStatusID: Number(selectedAssignment.ChangeStatusID),
        ctc: Number(selectedAssignment.CTC),
        effectiveFrom: selectedAssignment.EffectiveFrom,
        effectiveTo: selectedAssignment.EffectiveTo || null,
        isActive: true,
        createdBy: createdBy
      };
      const res = await employeeSalaryAssignment.PostEmployeeSalaryAssignmentAsync(payload);
      toast.success(res.message);
      setShowModal(false);
      fetchSalaryAssignments(selectedEmployee?.value || 0);
    } catch (error) {
      toast.error("Save failed");
    }
  };

  /* ---------------- Fetch Salary Breakup ---------------- */
  const handleViewBreakup = async (employeeId: number) => {
    try {
      setBreakupLoading(true);
      const res = await employeeSalaryAssignment.GetEmployeeSalaryBreakupByEmployeeID(employeeId);
      setSalaryBreakup(res || []);
      setShowBreakupModal(true);
    } catch {
      toast.error("Failed to fetch salary breakup");
    } finally {
      setBreakupLoading(false);
    }
  };

  const earnings = salaryBreakup.filter(x => x.ComponentTypeName === "Earning");
  const deductions = salaryBreakup.filter(x => x.ComponentTypeName === "Deduction");
  const employeeCTC = salaryBreakup.length > 0 ? salaryBreakup[0].EmployeeCTC : 0;

  /* ---------------- Render ---------------- */
  return (
    <Container className="mt-4">
      <h4>Employee Salary Assignment</h4>

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Branch</Form.Label>
              {loadingBranches ? <Spinner size="sm" /> :
                <Select
                  options={branches.map((b) => ({ value: b.BranchID, label: b.BranchName }))}
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  isClearable
                />
              }
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Form.Label>Employee</Form.Label>
              {loadingEmployees ? <Spinner size="sm" /> :
                <Select
                  options={employees.map((e) => ({ value: e.EmployeeID, label: e.EmployeeName }))}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  isClearable
                />
              }
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="d-flex align-items-end justify-content-end">
          <Button variant="success" disabled={!selectedEmployee} onClick={handleAdd}>
            + Add Salary
          </Button>
        </Col>
      </Row>

      {/* Salary Assignment Table */}
      <Table className="table table-hover table-dark-custom">
        <thead className="table-light">
          <tr>
            <th>Employee Name</th> {/* NEW COLUMN */}
            <th>Structure</th>
            <th>CTC</th>
            <th>Effective From</th>
            <th>Effective To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaryData.map((row) => {
            const emp = employees.find(e => e.EmployeeID === row.EmployeeID);
            return (
              <tr key={row.SalaryAssignmentID}>
                <td>{emp?.EmployeeName || "N/A"}</td> {/* NEW COLUMN */}
                <td>{salaryStructures.find(s => s.StructureID === row.StructureID)?.StructureName}</td>
                <td>{row.CTC}</td>
                <td>{row.EffectiveFrom?.split('T')[0]}</td>
                <td>{row.EffectiveTo?.split('T')[0]}</td>
                <td>{changeStatuses.find(s => s.ChangeStatusID === row.ChangeStatusID)?.Status}</td>
                <td>
                  <Button size="sm" variant="secondary" className="me-2"
                    onClick={() => handleViewBreakup(row.EmployeeID)}>
                    View Breakup
                  </Button>
                  <Button size="sm" variant="info" className="me-2"
                    onClick={() => handleEdit(row)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger"
                    onClick={() => handleDelete(row.SalaryAssignmentID)}>
                    Delete
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Salary Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="StructureID">
              <Form.Label>Salary Structure</Form.Label>
              <Form.Select value={selectedAssignment?.StructureID || ""} onChange={handleChange}>
                <option value="">Select</option>
                {salaryStructures.map((s) => (
                  <option key={s.StructureID} value={s.StructureID}>{s.StructureName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="ChangeStatusID">
              <Form.Label>Change Status</Form.Label>
              <Form.Select value={selectedAssignment?.ChangeStatusID || ""} onChange={handleChange}>
                <option value="">Select</option>
                {changeStatuses.map((s) => (
                  <option key={s.ChangeStatusID} value={s.ChangeStatusID}>{s.Status}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="CTC">
              <Form.Label>CTC</Form.Label>
              <Form.Control type="number" value={selectedAssignment?.CTC || ""} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="EffectiveFrom">
              <Form.Label>Effective From</Form.Label>
              <Form.Control type="date" value={selectedAssignment?.EffectiveFrom || ""} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="EffectiveTo">
              <Form.Label>Effective To</Form.Label>
              <Form.Control type="date" value={selectedAssignment?.EffectiveTo || ""} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* View Breakup Modal */}
      <Modal show={showBreakupModal} onHide={() => setShowBreakupModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Salary Breakup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {breakupLoading ? <Spinner /> :
            <>
              <h6>Employee CTC: ₹ {employeeCTC}</h6>
              <Row className="mt-3">
                <Col md={6}>
                  <h6>Earnings</h6>
                  <Table bordered size="sm">
                    <thead>
                      <tr><th>Component</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {earnings.map((e, i) => (
                        <tr key={i}><td>{e.ComponentName}</td><td>{e.ComponentAmount}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Deductions</h6>
                  <Table bordered size="sm">
                    <thead>
                      <tr><th>Component</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {deductions.map((d, i) => (
                        <tr key={i}><td>{d.ComponentName}</td><td>{d.ComponentAmount}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </>
          }
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default EmployeeSalaryAssignment;