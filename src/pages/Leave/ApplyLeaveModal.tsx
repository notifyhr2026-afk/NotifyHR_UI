import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import { Leave } from '../../types/Leaves';
import leaveTypesService from '../../services/leaveTypesService';
import LeaveType from '../../types/LeaveType';

interface Props {
  show: boolean;
  onHide: () => void;
  editLeave: Leave | null;
  onSave: (leave: Leave) => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const ApplyLeaveModal: React.FC<Props> = ({
  show,
  onHide,
  editLeave,
  onSave,
}) => {
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

  const [dropdownLeaveTypes, setDropdownLeaveTypes] = useState<LeaveType[]>([]);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await leaveTypesService.getLeaveLeaveTypes();
        setDropdownLeaveTypes(res);
      } catch (err) {
        console.error('Failed to load leave types', err);
      }
    };
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (editLeave) setData(editLeave);
  }, [editLeave]);

  useEffect(() => {
    if (data.startDate && data.endDate) {
      const days =
        (new Date(data.endDate).getTime() -
          new Date(data.startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
        1;

      setData(prev => ({
        ...prev,
        numberOfDays: days > 0 ? days : 0,
      }));
    }
  }, [data.startDate, data.endDate]);

  const leaveTypeOptions: SelectOption[] = dropdownLeaveTypes.map(lt => ({
    value: lt.LeaveTypeID.toString(),
    label: lt.LeaveTypeName,
  }));

  const submit = () => onSave(data);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      contentClassName="rounded-4 shadow-lg"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {editLeave ? 'Edit Leave Request' : 'Apply for Leave'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Leave Type */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Leave Type</Form.Label>
          <Select
            options={leaveTypeOptions}
            value={
              leaveTypeOptions.find(
                option => option.value === data.leaveTypeID
              ) || null
            }
            onChange={(selected: SingleValue<SelectOption>) =>
              setData(prev => ({
                ...prev,
                leaveTypeID: selected?.value || '',
              }))
            }
            placeholder="Select leave type"
            classNamePrefix="react-select"
          />
        </Form.Group>

        {/* Dates */}
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">Start Date</Form.Label>
              <Form.Control
                type="date"
                value={data.startDate}
                onChange={e =>
                  setData(prev => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold">End Date</Form.Label>
              <Form.Control
                type="date"
                value={data.endDate}
                onChange={e =>
                  setData(prev => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Days info */}
        {data.numberOfDays > 0 && (
          <div className="mt-3 text-muted small">
            🗓 Total Days: <strong>{data.numberOfDays}</strong>
          </div>
        )}

        {/* Reason */}
        <Form.Group className="mt-3">
          <Form.Label className="fw-semibold">Reason</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Brief reason for leave"
            value={data.reason}
            onChange={e =>
              setData(prev => ({
                ...prev,
                reason: e.target.value,
              }))
            }
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="px-4"
          onClick={submit}
        >
          {editLeave ? 'Update' : 'Apply'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplyLeaveModal;
