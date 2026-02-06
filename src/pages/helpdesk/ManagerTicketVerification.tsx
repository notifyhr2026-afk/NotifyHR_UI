// src/pages/helpdesk/ManagerTicketVerification.tsx
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { Ticket } from '../../types/helpdesk';

const CATEGORY_OPTIONS = ['IT', 'HR', 'Payroll'];

const PRIORITY_OPTIONS: Ticket['priority'][] = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

const STATUS_OPTIONS: Ticket['status'][] = [
  'Open',
  'In Progress',
  'Resolved',
  'Closed',
];

export default function ManagerTicketVerification() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [category, setCategory] = useState<string>('All');
  const [priority, setPriority] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [employee, setEmployee] = useState<string | null>(null);

  // 🔹 Mock data (replace with API)
  useEffect(() => {
    setTickets([
      {
        ticketId: 1,
        ticketNumber: 'TCK-1001',
        subject: 'Laptop issue',
        description: '',
        category: 'IT',
        priority: 'High',
        status: 'Open',
        assignedTo: 'John',
        createdAt: new Date().toISOString(),
      },
      {
        ticketId: 2,
        ticketNumber: 'TCK-1002',
        subject: 'Payroll mismatch',
        description: '',
        category: 'Payroll',
        priority: 'Critical',
        status: 'In Progress',
        assignedTo: 'Sarah',
        createdAt: new Date().toISOString(),
      },
      {
        ticketId: 3,
        ticketNumber: 'TCK-1003',
        subject: 'VPN issue',
        description: '',
        category: 'IT',
        priority: 'Medium',
        status: 'Resolved',
        assignedTo: 'Michael',
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  // 🔹 Employee options for react-select
  const employeeOptions = useMemo(() => {
    return Array.from(
      new Set(tickets.map(t => t.assignedTo).filter(Boolean))
    ).map(emp => ({
      label: emp as string,
      value: emp as string,
    }));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t =>
      (category === 'All' || t.category === category) &&
      (priority === 'All' || t.priority === priority) &&
      (status === 'All' || t.status === status) &&
      (!employee || t.assignedTo === employee)
    );
  }, [tickets, category, priority, status, employee]);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Manager Ticket Verification</h3>

      {/* 🔹 Filters */}
      <div className="card p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option>All</option>
              {CATEGORY_OPTIONS.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option>All</option>
              {PRIORITY_OPTIONS.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option>All</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Employee</label>
            <Select
              options={employeeOptions}
              isClearable
              placeholder="Search employee..."
              onChange={option =>
                setEmployee(option ? option.value : null)
              }
            />
          </div>
        </div>
      </div>

      {/* 🔹 Grid / Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Ticket #</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Employee</th>
                <th>Created Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => (
                  <tr key={t.ticketId}>
                    <td>{t.ticketNumber}</td>
                    <td>{t.category}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {t.status}
                      </span>
                    </td>
                    <td>{t.assignedTo || 'Unassigned'}</td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
