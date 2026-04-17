import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import { Leave } from '../../types/Leaves';
import leaveTypesService from '../../services/leaveTypesService';
import leaveService from '../../services/leaveService';
import OrgleaveTypesService from '../../services/OrgleaveTypesService';
import LeaveType from '../../types/LeaveType';

interface Props {
  show: boolean;
  onHide: () => void;
  editLeave: Leave | null;
  onSave: (leave: Leave) => void; // Pass leave object to parent
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
  const [loading, setLoading] = useState(false);
// Get organizationID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number | undefined = user?.employeeID;
  const [data, setData] = useState<any>({
    id: 0,
    employeeID: employeeID, // Static employee ID for now
    leaveTypeID: '',
    startDate: '',
    endDate: '',
    numberOfDays: 0,
    status: 'Pending',
    reason: '',
    isHalfDay: false,
    halfDayType: '',
  });

  const [dropdownLeaveTypes, setDropdownLeaveTypes] = useState<LeaveType[]>([]);

  // Load Leave Types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
          if (!organizationID) return;
        const res = await OrgleaveTypesService.getOrgLeaveLeaveTypes(organizationID);
        setDropdownLeaveTypes(res);
      } catch (err) {
        console.error('Failed to load leave types', err);
      }
    };
    fetchLeaveTypes();
  }, []);

  // Load Edit Leave Data
  useEffect(() => {
    if (editLeave) {
      setData({
        ...editLeave,
        employeeID: employeeID,
      });
    }
  }, [editLeave]);

  // Auto-calculate NumberOfDays
  useEffect(() => {
    if (data.isHalfDay) {
      if (data.startDate) {
        setData((prev: any) => ({
          ...prev,
          endDate: prev.startDate,
          numberOfDays: 0.5,
        }));
      }
    } else if (data.startDate && data.endDate) {
      const days =
        (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
        1;

      setData((prev: any) => ({
        ...prev,
        numberOfDays: days > 0 ? days : 0,
      }));
    }
  }, [data.startDate, data.endDate, data.isHalfDay]);

  const leaveTypeOptions: SelectOption[] = dropdownLeaveTypes.map(lt => ({
    value: lt.LeaveTypeID.toString(),
    label: lt.LeaveTypeName,
  }));

  const halfDayOptions: SelectOption[] = [
    { value: 'FirstHalf', label: 'First Half' },
    { value: 'SecondHalf', label: 'Second Half' },
  ];

  // Submit Leave to API
  const submit = async () => {
    try {
      setLoading(true);

      const payload = {
        EmployeeLeaveID: editLeave?.id ?? 0,
        EmployeeID: employeeID,
        LeaveTypeID: Number(data.leaveTypeID),
        StartDate: data.startDate,
        EndDate: data.endDate,
        NumberOfDays: data.numberOfDays,
        Reason: data.reason,
        IsHalfDay: data.isHalfDay,
        HalfDayType: data.isHalfDay ? data.halfDayType : null,
      };

      const res = await leaveService.PostApplyLeaveByAsync(payload);

      if (res?.value === 1) {
        const leaveToSave: Leave = { ...data }; // send back to parent
        onSave(leaveToSave);
        onHide();
      } else {
        alert(res?.message || 'Failed to submit leave');
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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
            value={leaveTypeOptions.find(option => option.value === data.leaveTypeID) || null}
            onChange={(selected: SingleValue<SelectOption>) =>
              setData((prev: any) => ({
                ...prev,
                leaveTypeID: selected?.value || '',
              }))
            }
            placeholder="Select leave type"
            className="org-select"
          classNamePrefix="org-select"
          />
        </Form.Group>

        {/* Half Day */}
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Apply for Half Day"
            checked={data.isHalfDay}
            onChange={e =>
              setData((prev: any) => ({
                ...prev,
                isHalfDay: e.target.checked,
                halfDayType: '',
              }))
            }
          />
        </Form.Group>

        {/* Half Day Type */}
        {data.isHalfDay && (
          <Form.Group className="mb-3">
            <Form.Label>Select Half</Form.Label>
            <Select
              options={halfDayOptions}
              value={halfDayOptions.find(option => option.value === data.halfDayType) || null}
              onChange={(selected: SingleValue<SelectOption>) =>
                setData((prev: any) => ({
                  ...prev,
                  halfDayType: selected?.value || '',
                }))
              }
              className="org-select"
          classNamePrefix="org-select"
            />
          </Form.Group>
        )}

        {/* Dates */}
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={data.startDate}
                onChange={e =>
                  setData((prev: any) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={data.endDate}
                disabled={data.isHalfDay}
                onChange={e =>
                  setData((prev: any) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Total Days */}
        {data.numberOfDays > 0 && (
          <div className="mt-3 text-muted small">
            🗓 Total Days: <strong>{data.numberOfDays}</strong>
          </div>
        )}

        {/* Reason */}
        <Form.Group className="mt-3">
          <Form.Label>Reason</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={data.reason}
            onChange={e =>
              setData((prev: any) => ({ ...prev, reason: e.target.value }))
            }
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" /> Saving...
            </>
          ) : editLeave ? (
            'Update'
          ) : (
            'Apply'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplyLeaveModal;