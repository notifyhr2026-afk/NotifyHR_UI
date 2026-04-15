import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select from 'react-select';

import ticketService from '../../services/ticketService';
import branchService from '../../services/branchService';
import departmentService from '../../services/departmentService';
import employeeService from '../../services/employeeService';

/* ===========================
   Interfaces
   =========================== */
interface Ticket {
  TicketId: number;
  TicketNumber: string;
  Subject: string;
  CategoryName: string;
  PriorityName: string;
}

const AssignTicketsPage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID = user?.organizationID;
  const userID = user?.employeeID;

  /* ===========================
     State
     =========================== */
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [formData, setFormData] = useState({
    branchId: 0,
    departmentId: 0,
    employeeId: 0,
  });

  /* ===========================
     Load Data
     =========================== */
  useEffect(() => {
    if (organizationID) {
      loadTickets();
      loadBranches();
      loadDepartments();
      loadEmployees();
    }
  }, [organizationID]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketService.GetUnAssignedTicketsAsync(organizationID);
      setTickets(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    const res = await branchService.getBranchesAsync(organizationID);
    setBranches(res?.Table ?? []);
  };

  const loadDepartments = async () => {
    const res = await departmentService.getdepartmentesAsync(organizationID);
    setDepartments(res?.Table ?? []);
  };

  const loadEmployees = async () => {
    const res = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
    const data = res?.Table ?? res ?? [];
    setEmployees(data);
    setFilteredEmployees(data);
  };

  /* ===========================
     Filter Employees
     =========================== */
  useEffect(() => {
    let filtered = [...employees];

    if (formData.branchId > 0) {
      filtered = filtered.filter(e => e.BranchID === formData.branchId);
    }

    if (formData.departmentId > 0) {
      filtered = filtered.filter(e => e.DepartmentID === formData.departmentId);
    }

    setFilteredEmployees(filtered);
  }, [formData.branchId, formData.departmentId, employees]);

  /* ===========================
     Open Modal
     =========================== */
  const openAssignModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      branchId: 0,
      departmentId: 0,
      employeeId: 0,
    });
    setShowModal(true);
  };

  /* ===========================
     Assign Ticket (API)
     =========================== */
  const handleAssign = async () => {
    if (!selectedTicket) return;

    if (!formData.employeeId) {
      alert('Please select employee');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ticketId: selectedTicket.TicketId,
        ticketNumber: selectedTicket.TicketNumber,
        employeeId: formData.employeeId,
        userId: userID,
      };

      await ticketService.PostAssignTicketAsync(payload);

      await loadTickets();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to assign ticket');
    } finally {
      setSaving(false);
    }
  };

  /* ===========================
     Employee Options
     =========================== */
  const employeeOptions = filteredEmployees.map(emp => ({
    value: emp.EmployeeID,
    label: emp.EmployeeName,
  }));

  /* ===========================
     Priority Badge
     =========================== */
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'dark';
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  /* ===========================
     Render
     =========================== */
  return (
    <div className="Container">
      <h3>🎫 Assign Tickets</h3>

      {loading && <Spinner />}

      <Table className="table table-hover table-dark-custom">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Subject</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map(t => (
            <tr key={t.TicketId}>
              <td>{t.TicketNumber}</td>
              <td>{t.Subject}</td>
              <td>{t.CategoryName}</td>
              <td>
                <span className={`badge bg-${getPriorityColor(t.PriorityName)}`}>
                  {t.PriorityName}
                </span>
              </td>
              <td>
                <Button size="sm" onClick={() => openAssignModal(t)}>
                  Assign
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===========================
          MODAL
      =========================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assign Ticket</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket && (
            <>
              <h6>{selectedTicket.TicketNumber}</h6>
              <p>{selectedTicket.Subject}</p>
            </>
          )}

          <Row>
            <Col md={6}>
              <Form.Label>Branch</Form.Label>
              <Form.Select
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: Number(e.target.value) })
                }
              >
                <option value={0}>Select Branch</option>
                {branches.map(b => (
                  <option key={b.BranchID} value={b.BranchID}>
                    {b.BranchName}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: Number(e.target.value) })
                }
              >
                <option value={0}>Select Department</option>
                {departments.map(d => (
                  <option key={d.DepartmentID} value={d.DepartmentID}>
                    {d.DepartmentName}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>Employee</Form.Label>
            <Select
              options={employeeOptions}
              onChange={(val: any) =>
                setFormData({ ...formData, employeeId: val?.value || 0 })
              }
              placeholder="Select Employee"
              isSearchable
              isClearable
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAssign} disabled={saving}>
            {saving ? 'Assigning...' : 'Assign Ticket'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssignTicketsPage;