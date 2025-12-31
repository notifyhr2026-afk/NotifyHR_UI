import { Table, Button, Badge } from 'react-bootstrap';
import { Leave, EmployeeOption, LeaveTypeOption } from  '../../types/Leaves';

interface Props {
  leaves: Leave[];
  employees: EmployeeOption[];
  leaveTypes: LeaveTypeOption[];
  onEdit: (leave: Leave) => void;
  onDelete: (id: number) => void;
}

const LeaveHistoryTab: React.FC<Props> = ({ leaves, employees, leaveTypes, onEdit, onDelete }) => {
  if (!leaves.length) return <div className="alert alert-info">No leaves applied yet.</div>;

  return (
    <Table striped bordered hover>
      <thead className="table-dark">
        <tr>
          <th>Employee</th>
          <th>Leave Type</th>
          <th>Dates</th>
          <th>Days</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leaves.map(l => (
          <tr key={l.id}>
            <td>{employees.find(e => e.value === l.employeeID)?.label}</td>
            <td>{leaveTypes.find(t => t.value === l.leaveTypeID)?.label}</td>
            <td>{l.startDate} → {l.endDate}</td>
            <td>{l.numberOfDays}</td>
            <td>
              <Badge bg={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning'}>
                {l.status}
              </Badge>
            </td>
            <td>
              <Button size="sm" onClick={() => onEdit(l)}>Edit</Button>{' '}
              <Button size="sm" variant="danger" onClick={() => onDelete(l.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LeaveHistoryTab;
