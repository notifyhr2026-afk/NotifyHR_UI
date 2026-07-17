import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import ticketService from '../../services/ticketService';
import employeeService from '../../services/employeeService';

const PRIORITY_OPTIONS = [
  { id: 1, name: 'Low' },
  { id: 2, name: 'Medium' },
  { id: 3, name: 'High' },
  { id: 4, name: 'Critical' },
];

const STATUS_OPTIONS = [
  { id: 1, name: 'Open' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'On Hold' },
  { id: 4, name: 'Resolved' },
  { id: 5, name: 'Closed' },
];

export default function ManagerTicketVerification() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    { CategoryId: number; CategoryName: string }[]
  >([]);

  const [category, setCategory] = useState<number | null>(null);
  const [priority, setPriority] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [employee, setEmployee] = useState<number | null>(null);

  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID = user?.organizationID || 0;

  // Current Week Dates
  const getCurrentWeekDates = () => {
    const today = new Date();

    const day = today.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const start = new Date(today);
    start.setDate(today.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const weekDates = getCurrentWeekDates();

  const [fromDate, setFromDate] = useState(weekDates.start);
  const [toDate, setToDate] = useState(weekDates.end);

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const [catRes, empRes] = await Promise.all([
        ticketService.GetSupportCategoryByOrganization(organizationID),
        employeeService.getEmployeesByOrganizationIdAsync(organizationID),
      ]);

      const catData = catRes?.Table || catRes || [];
      const empData = empRes?.Table || empRes || [];

      setCategories(catData);

      setEmployeeOptions(
        empData.map((e: any) => ({
          value: e.EmployeeID || e.EmployeeId || e.id,
          label:
            e.EmployeeName ||
            `${e.FirstName || ''} ${e.LastName || ''}`.trim(),
        }))
      );

      fetchReport();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);

      const payload = {
        organizationId: organizationID,
        categoryId: category || null,
        categoryName: categories.find(c => c.CategoryId === category)?.CategoryName || null,
        statusId: status || null,
        priorityId: priority || null,
        assignedToUserId: employee || null,
        fromDate: fromDate
          ? new Date(fromDate).toISOString()
          : null,
        toDate: toDate
          ? new Date(toDate + 'T23:59:59').toISOString()
          : null,
      };

      const response = await ticketService.GetTicketReportAsync(payload);

      const reportData = response?.Table || response || [];

      const normalized = reportData.map((t: any) => ({
        ticketId: t.TicketId,
        ticketNumber: t.TicketNumber,
        subject: t.Subject,
        description: t.Description,
        categoryId: t.CategoryId,
        categoryName: t.CategoryName || categories.find(c => c.CategoryId === t.CategoryId)?.CategoryName || null,
        priorityId: t.PriorityId,
        statusId: t.StatusId,
        assignedToUserId: t.AssignedToUserId,
        createdAt: t.CreatedAt,

        category:
          categories.find(c => c.CategoryId === t.CategoryId)
            ?.CategoryName || '-',

        priority:
          PRIORITY_OPTIONS.find(p => p.id === t.PriorityId)?.name ||
          '-',

        status:
          STATUS_OPTIONS.find(s => s.id === t.StatusId)?.name ||
          '-',

        assignedTo:
          employeeOptions.find(
            e => e.value === t.AssignedToUserId
          )?.label || 'Unassigned',
      }));

      setTickets(normalized);
    } catch (error) {
      console.error('Failed to fetch report', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => tickets, [tickets]);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Manager Ticket Verification</h3>

      <div className="card p-3 mb-4">
        <div className="row g-3">

          {/* Category */}
          <div className="col-md-2">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category ?? ''}
              onChange={(e) =>
                setCategory(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option
                  key={c.CategoryId}
                  value={c.CategoryId}
                >
                  {c.CategoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="col-md-2">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority ?? ''}
              onChange={(e) =>
                setPriority(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">All</option>

              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status ?? ''}
              onChange={(e) =>
                setStatus(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">All</option>

              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee */}
          <div className="col-md-2">
            <label className="form-label">Employee</label>
            <Select
              options={employeeOptions}
              isClearable
              placeholder="Select Employee"
              className="org-select"
              classNamePrefix="org-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              onChange={(option) =>
                setEmployee(option ? option.value : null)
              }
            />
          </div>

          {/* From Date */}
          <div className="col-md-2">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="col-md-2">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Fetch Button */}
          <div className="col-md-12 text-end">
            <button
              className="btn btn-primary"
              onClick={fetchReport}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Fetch Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
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
                  <td colSpan={6} className="text-center">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.ticketId}>
                    <td>{t.ticketNumber}</td>
                    <td>{t.categoryName}</td>

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

                    <td>{t.assignedTo}</td>

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