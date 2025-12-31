import { Table, Badge } from 'react-bootstrap';
import { Leave, LeaveTypeOption } from '../../types/Leaves';

interface Props {
  leaves: Leave[];
  leaveTypes: LeaveTypeOption[];
}

const LeaveBalanceTab: React.FC<Props> = ({ leaves, leaveTypes }) => {
  const compute = (id: string) => {
    const type = leaveTypes.find(l => l.value === id)!;
    const applied = leaves.filter(l => l.leaveTypeID === id && l.status === 'Approved')
      .reduce((s, l) => s + l.numberOfDays, 0);

    return { total: type.totalLeaves, applied, balance: type.totalLeaves - applied };
  };

  return (
    <Table bordered>
      <thead>
        <tr>
          <th>Leave Type</th>
          <th>Total</th>
          <th>Applied</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {leaveTypes.map(lt => {
          const b = compute(lt.value);
          return (
            <tr key={lt.value}>
              <td>{lt.label}</td>
              <td>{b.total}</td>
              <td>{b.applied}</td>
              <td>
                <Badge bg={b.balance <= 2 ? 'danger' : 'success'}>{b.balance}</Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default LeaveBalanceTab;
