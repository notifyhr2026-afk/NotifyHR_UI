import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { Leave, LeaveTypeOption }  from '../../types/Leaves';

interface Props {
  show: boolean;
  onHide: () => void;
  editLeave: Leave | null;
  leaveTypes: LeaveTypeOption[];
  onSave: (leave: Leave) => void;
}

const ApplyLeaveModal: React.FC<Props> = ({ show, onHide, editLeave, leaveTypes, onSave }) => {
  const [data, setData] = useState<Leave>({
    id: 0,
    employeeID: 'emp1',
    leaveTypeID: '',
    startDate: '',
    endDate: '',
    numberOfDays: 0,
    status: 'Pending',
    reason: '',
  });

  useEffect(() => {
    if (editLeave) setData(editLeave);
  }, [editLeave]);

  useEffect(() => {
    if (data.startDate && data.endDate) {
      const d =
        (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
        1;
      setData(prev => ({ ...prev, numberOfDays: d > 0 ? d : 0 }));
    }
  }, [data.startDate, data.endDate]);

  const submit = () => {
    onSave(data);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editLeave ? 'Edit Leave' : 'Apply Leave'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Select
          options={leaveTypes}
          value={leaveTypes.find(l => l.value === data.leaveTypeID)}
          onChange={(v) => setData(p => ({ ...p, leaveTypeID: v?.value || '' }))}
          placeholder="Leave Type"
        />
        <Form.Control type="date" className="mt-2"
          value={data.startDate}
          onChange={e => setData(p => ({ ...p, startDate: e.target.value }))} />
        <Form.Control type="date" className="mt-2"
          value={data.endDate}
          onChange={e => setData(p => ({ ...p, endDate: e.target.value }))} />
        <Form.Control as="textarea" className="mt-2"
          placeholder="Reason"
          value={data.reason}
          onChange={e => setData(p => ({ ...p, reason: e.target.value }))} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={submit}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplyLeaveModal;
