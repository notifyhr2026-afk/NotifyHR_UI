import React, { useState } from 'react';
import { Container, Button, Tabs, Tab } from 'react-bootstrap';
import { Leave, LeaveTypeOption, EmployeeOption } from  '../../types/Leaves';


import LeaveHistoryTab   from  './LeaveHistoryTab'
import LeaveBalanceTab from './LeaveBalanceTab';
import ApproveLeavesTab from './ApproveLeavesTab';
import EmployeeLeavesTab from './EmployeeLeavesTab';
import ApplyLeaveModal from './ApplyLeaveModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const ApplyLeave: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [activeTab, setActiveTab] = useState('history');

  const [showModal, setShowModal] = useState(false);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);

  const employeeOptions: EmployeeOption[] = [
    { value: 'emp1', label: 'Alice Johnson' },
    { value: 'emp2', label: 'Bob Smith' },
    { value: 'emp3', label: 'Charlie Brown' },
  ];

  const leaveTypeOptions: LeaveTypeOption[] = [
    { value: '1', label: 'Casual Leave', totalLeaves: 12 },
    { value: '2', label: 'Sick Leave', totalLeaves: 10 },
    { value: '3', label: 'Earned Leave', totalLeaves: 15 },
  ];

  const handleSaveLeave = (leave: Leave) => {
    if (editLeave) {
      setLeaves(prev => prev.map(l => l.id === leave.id ? leave : l));
    } else {
      setLeaves(prev => [...prev, { ...leave, id: Date.now() }]);
    }
    setShowModal(false);
    setEditLeave(null);
  };

  const handleApprove = (id: number) =>
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));

  const handleReject = (id: number) =>
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));

  const handleDelete = () => {
    if (leaveToDelete !== null) {
      setLeaves(prev => prev.filter(l => l.id !== leaveToDelete));
      setConfirmDelete(false);
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between mb-4">
        <h3>My Leaves</h3>
        <Button onClick={() => setShowModal(true)}>+ Apply Leave</Button>
      </div>

      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k || 'history')}>
        <Tab eventKey="history" title="Leave History">
          <LeaveHistoryTab
            leaves={leaves}
            employees={employeeOptions}
            leaveTypes={leaveTypeOptions}
            onEdit={setEditLeave}
            onDelete={(id) => {
              setLeaveToDelete(id);
              setConfirmDelete(true);
            }}
          />
        </Tab>

        <Tab eventKey="balance" title="Leave Balance">
          <LeaveBalanceTab leaves={leaves} leaveTypes={leaveTypeOptions} />
        </Tab>

        <Tab eventKey="approve" title="Approve Leaves">
          <ApproveLeavesTab
            leaves={leaves}
            employees={employeeOptions}
            leaveTypes={leaveTypeOptions}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </Tab>

        <Tab eventKey="employee" title="Employee Leaves">
          <EmployeeLeavesTab
            leaves={leaves}
            employees={employeeOptions}
            leaveTypes={leaveTypeOptions}
          />
        </Tab>
      </Tabs>

      <ApplyLeaveModal
  show={showModal}
  onHide={() => { setShowModal(false); setEditLeave(null); }}
  editLeave={editLeave}
  onSave={handleSaveLeave}
/>

      <DeleteConfirmModal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  );
};

export default ApplyLeave;
