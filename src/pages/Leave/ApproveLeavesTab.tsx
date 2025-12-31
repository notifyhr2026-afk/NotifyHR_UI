import { Table, Button } from 'react-bootstrap';
import { Leave, EmployeeOption, LeaveTypeOption }  from '../../types/Leaves';
interface Props {
  leaves: Leave[];
  employees: EmployeeOption[];
  leaveTypes: LeaveTypeOption[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const ApproveLeavesTab: React.FC<Props> = ({ leaves, employees, leaveTypes, onApprove, onReject }) => {
  const pending = leaves.filter(l => l.status === 'Pending');

  if (!pending.length) return <div className="alert alert-info">No pending requests.</div>;

  return (
    <Table bordered>
      <thead className="table-dark">
        <tr>
          <th>Employee</th>
          <th>Leave Type</th>
          <th>Dates</th>
          <th>Days</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pending.map(l => (
          <tr key={l.id}>
            <td>{employees.find(e => e.value === l.employeeID)?.label}</td>
            <td>{leaveTypes.find(t => t.value === l.leaveTypeID)?.label}</td>
            <td>{l.startDate} → {l.endDate}</td>
            <td>{l.numberOfDays}</td>
            <td>
              <Button size="sm" onClick={() => onApprove(l.id)}>Approve</Button>{' '}
              <Button size="sm" variant="danger" onClick={() => onReject(l.id)}>Reject</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ApproveLeavesTab;
