import React, { useEffect, useState } from 'react';
import { Table, Badge, Spinner, Alert, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import employeeService from '../../services/leaveService';
import { LeaveBalance } from '../../types/Leaves';

const LeaveBalanceTab: React.FC = () => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number | undefined = user?.employeeID;

  useEffect(() => {
    if (!organizationID || !employeeID) {
      setError('User information not found.');
      setLoading(false);
      return;
    }

    const fetchLeaveBalance = async () => {
      try {
        setLoading(true);
        const data: LeaveBalance[] = await employeeService.GetEmployeeLeaveBalanceAsync(
          organizationID,
          employeeID
        );
        setLeaveBalance(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load leave balance.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, [organizationID, employeeID]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    );

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <div className="table-responsive">
          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Total</th>
                <th>Used</th>
                <th>Applied</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {leaveBalance.map((lt) => (
                <tr key={lt.LeaveTypeID}>
                  <td>{lt.LeaveTypeName}</td>
                  <td>{lt.TotalLeaves}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Leaves already approved</Tooltip>}
                    >
                      <Badge bg="info">{lt.UsedLeaves}</Badge>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Leaves pending approval</Tooltip>}
                    >
                      <Badge bg="warning">{lt.AppliedLeaves}</Badge>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <Badge bg={lt.LeaveBalance <= 2 ? 'danger' : 'success'}>
                      {lt.LeaveBalance}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LeaveBalanceTab;