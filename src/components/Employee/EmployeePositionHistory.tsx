import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import ToggleSection from '../ToggleSection';
import employeeService from '../../services/employeeService';

// 🟢 Interface for list (Table1 data)
interface ManagerHistory {
  ManagerHistoryID: number;
  EmployeeID: number;
  EmployeeName: string;
  ReportingManagerName: string;
  CurrentPosition: string;
  CurrentBranch: string;
  CurrentDivision: string;
  IsCurrent: boolean;
}

// 🟢 Interface for dropdown options
interface DropdownOption {
  id: number;
  name: string;
}

// 🟢 Interface for modal form (old fields)
interface PositionHistoryForm {
  branchId: number;
  divisionId: number;
  departmentId: number;
  employmentTypeId: number;
  positionId: number;
  reportingManagerId: number;
  effectiveFrom: string;
  effectiveTo: string;
  isCurrent: boolean;
  reason: string;
}

const EmployeePositionHistory: React.FC = () => {
  const [records, setRecords] = useState<ManagerHistory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editRecord, setEditRecord] = useState<ManagerHistory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 🟢 Modal form state
  const [formData, setFormData] = useState<PositionHistoryForm>({
    branchId: 0,
    divisionId: 0,
    departmentId: 0,
    employmentTypeId: 0,
    positionId: 0,
    reportingManagerId: 0,
    effectiveFrom: '',
    effectiveTo: '',
    isCurrent: false,
    reason: '',
  });

  // 🟢 Dropdown lists
  const [branches, setBranches] = useState<DropdownOption[]>([]);
  const [divisions, setDivisions] = useState<DropdownOption[]>([]);
  const [departments, setDepartments] = useState<DropdownOption[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<DropdownOption[]>([]);
  const [positions, setPositions] = useState<DropdownOption[]>([]);
  const [managers, setManagers] = useState<DropdownOption[]>([]);
const [showToast, setShowToast] = useState(false);
  // 🟢 Fetch dropdown master data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [b, d, dept, empT, pos, mgr] = await Promise.all([
          employeeService.getBranches(),
          employeeService.getDivisions(),
          employeeService.getDepartments(),
          employeeService.getEmploymentTypes(),
          employeeService.getPositions(),
          employeeService.getManagers(),
        ]);

        setBranches(b.map((x: any) => ({ id: x.BranchID, name: x.BranchName })));
        setDivisions(d.map((x: any) => ({ id: x.DivisionID, name: x.DivisionName })));
        setDepartments(dept.map((x: any) => ({ id: x.DepartmentID, name: x.DepartmentName })));
        setEmploymentTypes(empT.map((x: any) => ({ id: x.EmploymentTypeID, name: x.EmploymentTypeName })));
        setPositions(pos.map((x: any) => ({ id: x.PositionID, name: x.PositionTitle })));
        setManagers(mgr.map((x: any) => ({ id: x.EmployeeID, name: x.EmployeeName })));
      } catch (err) {
        console.error('Error loading master data', err);
      }
    };
    fetchMasters();
  }, []);

  // 🟢 Fetch API list (Table1)
  useEffect(() => {
    const fetchManagerHistory = async () => {
      try {
        const employeeID = 14; // replace with prop or context if needed
        const response = await employeeService.GetEmployeeDetialsByEmployeeID(employeeID);
        if (response?.Table1) {
          setRecords(response.Table1);
        }
      } catch (error) {
        console.error('Error fetching manager history:', error);
      }
    };
    fetchManagerHistory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // 🟢 Add record
  const handleAdd = () => {
    // Check if there's already a current record
  const currentRecord = records.find(r => r.IsCurrent);


   if (currentRecord) {
    setShowToast(true); // show the toast
    
    return;
  }
    setFormData({
      branchId: 0,
      divisionId: 0,
      departmentId: 0,
      employmentTypeId: 0,
      positionId: 0,
      reportingManagerId: 0,
      effectiveFrom: '',
      effectiveTo: '',
      isCurrent: false,
      reason: '',
    });
    setEditRecord(null);
    setValidated(false);
    setShowModal(true);
  };

  // 🟢 Save (create/update)
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const newRecord: ManagerHistory = {
      ManagerHistoryID: editRecord ? editRecord.ManagerHistoryID : Date.now(),
      EmployeeID: 14,
      EmployeeName: 'Hidden Employee',
      ReportingManagerName: managers.find(m => m.id === formData.reportingManagerId)?.name || '',
      CurrentPosition: positions.find(p => p.id === formData.positionId)?.name || '',
      CurrentBranch: branches.find(b => b.id === formData.branchId)?.name || '',
      CurrentDivision: divisions.find(d => d.id === formData.divisionId)?.name || '',
      IsCurrent: formData.isCurrent,
    };

    if (editRecord) {
      setRecords(prev =>
        prev.map(r => (r.ManagerHistoryID === editRecord.ManagerHistoryID ? newRecord : r))
      );
    } else {
      setRecords(prev => [...prev, newRecord]);
    }

    setShowModal(false);
    setValidated(false);
  };

  // 🟢 Delete record
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    setRecords(prev => prev.filter(r => r.ManagerHistoryID !== deleteId));
    setConfirmDelete(false);
  };

  return (
    <div className="p-3">
<div
  aria-live="polite"
  aria-atomic="true"
  style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1051 }}
>
  <div className={`toast align-items-center text-white bg-danger border-0 ${showToast ? 'show' : 'hide'}`} role="alert">
    <div className="d-flex">
      <div className="toast-body">
        An active manager history is already available. You cannot add another one.
      </div>
      <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
    </div>
  </div>
</div>

      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Manager History
        </Button>
      </div>

      {records.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {/* Hidden columns are not rendered */}
              <th>Reporting Manager</th>
              <th>Current Position</th>
              <th>Current Branch</th>
              <th>Current Division</th>
              <th>Is Current</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.ManagerHistoryID}>
                <td>{r.ReportingManagerName}</td>
                <td>{r.CurrentPosition}</td>
                <td>{r.CurrentBranch}</td>
                <td>{r.CurrentDivision}</td>
                <td>
                  {r.IsCurrent ? (
                    <span className="badge rounded-pill bg-success text-white px-3 py-1 shadow-sm">
                      Yes
                    </span>
                  ) : (
                    <span className="badge rounded-pill bg-danger text-white px-3 py-1 shadow-sm">
                      No
                    </span>
                  )}
                </td>

                <td>
                  {r.IsCurrent && (
                    <>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setEditRecord(r);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(r.ManagerHistoryID)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </Table>
      ) : (
        <p>No manager history records available.</p>
      )}

      {/* 🟢 Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editRecord ? 'Edit Position History' : 'Add Position History'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="branchId">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select required value={formData.branchId} onChange={handleInputChange}>
                    <option value={0}>Select Branch</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="divisionId">
                  <Form.Label>Division</Form.Label>
                  <Form.Select required value={formData.divisionId} onChange={handleInputChange}>
                    <option value={0}>Select Division</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="departmentId">
                  <Form.Label>Department</Form.Label>
                  <Form.Select required value={formData.departmentId} onChange={handleInputChange}>
                    <option value={0}>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="employmentTypeId">
                  <Form.Label>Employment Type</Form.Label>
                  <Form.Select required value={formData.employmentTypeId} onChange={handleInputChange}>
                    <option value={0}>Select Type</option>
                    {employmentTypes.map(et => (
                      <option key={et.id} value={et.id}>
                        {et.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="positionId">
                  <Form.Label>Position</Form.Label>
                  <Form.Select required value={formData.positionId} onChange={handleInputChange}>
                    <option value={0}>Select Position</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="reportingManagerId">
                  <Form.Label>Reporting Manager</Form.Label>
                  <Form.Select required value={formData.reportingManagerId} onChange={handleInputChange}>
                    <option value={0}>Select Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="effectiveFrom">
                  <Form.Label>Effective From</Form.Label>
                  <Form.Control type="date" required value={formData.effectiveFrom} onChange={handleInputChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="effectiveTo">
                  <Form.Label>Effective To</Form.Label>
                  <Form.Control type="date" value={formData.effectiveTo} onChange={handleInputChange} disabled={formData.isCurrent} />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-center">
                <Form.Group controlId="isCurrent">
                  <Form.Check label="Is Current" checked={formData.isCurrent} onChange={handleInputChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group controlId="reason">
                  <Form.Label>Reason</Form.Label>
                  <Form.Control required type="text" placeholder="Enter reason" value={formData.reason} onChange={handleInputChange} />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editRecord ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* 🟢 Delete confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
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

export default EmployeePositionHistory;
