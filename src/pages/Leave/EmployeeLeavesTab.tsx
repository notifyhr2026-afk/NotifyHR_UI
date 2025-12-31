import { useState } from 'react';
import Select from 'react-select';
import { Table, Badge } from 'react-bootstrap';
import { Leave, EmployeeOption, LeaveTypeOption } from '../../types/Leaves';

interface Props {
  leaves: Leave[];
  employees: EmployeeOption[];
  leaveTypes: LeaveTypeOption[];
}

const EmployeeLeavesTab: React.FC<Props> = ({ leaves, employees, leaveTypes }) => {
  const [employee, setEmployee] = useState<EmployeeOption | null>(null);
  const filtered = employee ? leaves.filter(l => l.employeeID === employee.value) : [];

  return (
    <>
      <Select options={employees} onChange={setEmployee} placeholder="Select employee" />

      {employee && filtered.length === 0 && <div className="alert alert-info mt-3">No leaves found.</div>}

      {filtered.length > 0 && (
        <Table className="mt-3" bordered>
          <thead className="table-dark">
            <tr>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td>{leaveTypes.find(t => t.value === l.leaveTypeID)?.label}</td>
                <td>{l.startDate} → {l.endDate}</td>
                <td>{l.numberOfDays}</td>
                <td>
                  <Badge bg={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning'}>
                    {l.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default EmployeeLeavesTab;
