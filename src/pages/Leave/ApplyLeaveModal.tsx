import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import {
  CalendarPlus,
  CalendarCheck,
  ClockHistory,
  Sun,
  Moon,
  InfoCircle,
  ExclamationTriangle,
  XCircle,
  CheckCircle,
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { Leave, LeaveBalance } from '../../types/Leaves';
import leaveService from '../../services/leaveService';
import OrgleaveTypesService from '../../services/OrgleaveTypesService';
import LeaveType from '../../types/LeaveType';
import { fireAudit } from '../../utils/auditUtils';

interface Props {
  show: boolean;
  onHide: () => void;
  editLeave: Leave | null;
  onSave: (leave: Leave) => void;
  preSelectedLeaveTypeID?: string;
  leaveBalances?: LeaveBalance[];
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
  preSelectedLeaveTypeID,
  leaveBalances = [],
}) => {
  const [loading, setLoading] = useState(false);

  // Get user details from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number | undefined = user?.employeeID;
  const employeeName: string | undefined = user?.fullName || user?.name || user?.username;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<any>({
    id: 0,
    employeeID: employeeID,
    leaveTypeID: '',
    startDate: '',
    endDate: '',
    numberOfDays: 0,
    status: 'Pending',
    reason: '',
    isHalfDay: false,
    halfDayType: 'FirstHalf',
    employeeName: employeeName,
  });

  const [dropdownLeaveTypes, setDropdownLeaveTypes] = useState<LeaveType[]>([]);

  // Fetch Leave Types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        if (!organizationID) return;
        const res = await OrgleaveTypesService.getOrgLeaveLeaveTypes(organizationID);
        if (Array.isArray(res)) {
          setDropdownLeaveTypes(res.filter((lt: LeaveType) => lt.OrgLeaveTypeID !== 0));
        }
      } catch (err) {
        console.error('Failed to load leave types', err);
      }
    };
    fetchLeaveTypes();
  }, [organizationID]);

  // Reset or Populate Form on Open / Edit
  useEffect(() => {
    if (show) {
      if (editLeave) {
        setData({
          ...editLeave,
          employeeID: employeeID,
          employeeName: employeeName,
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setData({
          id: 0,
          employeeID: employeeID,
          leaveTypeID: preSelectedLeaveTypeID || (dropdownLeaveTypes[0]?.LeaveTypeID?.toString() || ''),
          startDate: today,
          endDate: today,
          numberOfDays: 1,
          status: 'Pending',
          reason: '',
          isHalfDay: false,
          halfDayType: 'FirstHalf',
          employeeName: employeeName,
        });
      }
      setErrors({});
    }
  }, [show, editLeave, preSelectedLeaveTypeID, dropdownLeaveTypes, employeeID, employeeName]);

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
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      setData((prev: any) => ({
        ...prev,
        numberOfDays: diffDays > 0 ? diffDays : 0,
      }));
    }
  }, [data.startDate, data.endDate, data.isHalfDay]);

  const leaveTypeOptions: SelectOption[] = useMemo(() => {
    return dropdownLeaveTypes.map((lt) => ({
      value: lt.LeaveTypeID.toString(),
      label: lt.LeaveTypeName,
    }));
  }, [dropdownLeaveTypes]);

  // Find balance for selected leave type
  const selectedBalance = useMemo(() => {
    if (!data.leaveTypeID || !leaveBalances.length) return null;
    return leaveBalances.find((b) => b.LeaveTypeID.toString() === data.leaveTypeID.toString()) || null;
  }, [data.leaveTypeID, leaveBalances]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.leaveTypeID) {
      newErrors.leaveTypeID = 'Please select a leave type';
    }

    if (!data.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!data.isHalfDay && !data.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) < new Date(data.startDate)) {
        newErrors.endDate = 'End date cannot be earlier than start date';
      }
    }

    if (data.isHalfDay && !data.halfDayType) {
      newErrors.halfDayType = 'Please select First Half or Second Half';
    }

    if (!data.reason || !data.reason.trim()) {
      newErrors.reason = 'Please provide a reason for your leave';
    } else if (data.reason.trim().length < 5) {
      newErrors.reason = 'Reason should be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Leave to API
  const submit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);

      const payload = {
        OrganizationID: organizationID,
        EmployeeLeaveID: editLeave?.id ?? 0,
        EmployeeID: employeeID,
        LeaveTypeID: Number(data.leaveTypeID),
        StartDate: data.startDate,
        EndDate: data.endDate,
        NumberOfDays: data.numberOfDays,
        Reason: data.reason.trim(),
        IsHalfDay: data.isHalfDay,
        HalfDayType: data.isHalfDay ? data.halfDayType : null,
        EmployeeName: employeeName,
      };

      const res = await leaveService.PostApplyLeaveByAsync(payload);

      if (res?.value === 1 || res?.EmployeeLeaveID || res?.id || res?.success || res?.status === 200 || !res?.message?.includes('Failed')) {
        const selectedTypeName =
          dropdownLeaveTypes.find((lt) => lt.LeaveTypeID.toString() === data.leaveTypeID.toString())?.LeaveTypeName ||
          'Leave';

        const leaveToSave: Leave = {
          ...data,
          id: res?.EmployeeLeaveID || editLeave?.id || Date.now(),
          leaveTypeName: selectedTypeName,
        };

        onSave(leaveToSave);
        toast.success(editLeave ? 'Leave request updated successfully!' : 'Leave request applied successfully!');
        fireAudit(
          editLeave ? 'UPDATE' : 'CREATE',
          'Leave',
          editLeave,
          data,
          organizationID || 0,
          user?.name || user?.username || 'Employee',
          'ApplyLeaveModal'
        );
        onHide();
      } else {
        toast.error(res?.message || 'Failed to submit leave application');
      }
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      toast.error(error?.response?.data?.message || 'Unable to submit leave request. Please check your connection.');
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
      className="al-modal"
      size="lg"
    >
      <div className="al-modal-header d-flex justify-content-between align-items-center">
        <div className="al-modal-title-group">
          <div className="al-modal-icon">
            <CalendarPlus />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">
              {editLeave ? 'Edit Leave Application' : 'Apply for Leave'}
            </h5>
            <small className="text-muted">
              Submit a formal request for planned or emergency time off
            </small>
          </div>
        </div>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onHide}
          disabled={loading}
        />
      </div>

      <Modal.Body className="al-modal-body">
        {/* Live Balance Insight Banner */}
        {selectedBalance && (
          <div
            className={`al-balance-callout ${
              data.numberOfDays > selectedBalance.LeaveBalance ? 'warning' : ''
            }`}
          >
            <div className="d-flex align-items-center gap-2">
              <InfoCircle className="fs-5" />
              <div>
                <strong>{selectedBalance.LeaveTypeName} Balance:</strong>{' '}
                <span>{selectedBalance.LeaveBalance} days available</span>
                <span className="text-muted ms-2">
                  ({selectedBalance.UsedLeaves} approved, {selectedBalance.AppliedLeaves} pending)
                </span>
              </div>
            </div>
            {data.numberOfDays > selectedBalance.LeaveBalance && (
              <div className="d-flex align-items-center gap-1 text-danger fw-semibold small">
                <ExclamationTriangle />
                <span>Exceeds balance</span>
              </div>
            )}
          </div>
        )}

        {/* Leave Type Selector */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold text-dark">
            Leave Type <span className="text-danger">*</span>
          </Form.Label>
          <Select
            options={leaveTypeOptions}
            value={leaveTypeOptions.find((o) => o.value === data.leaveTypeID.toString()) || null}
            onChange={(selected: SingleValue<SelectOption>) => {
              setData((prev: any) => ({
                ...prev,
                leaveTypeID: selected?.value || '',
              }));
              setErrors((prev) => ({ ...prev, leaveTypeID: '' }));
            }}
            placeholder="Select leave category..."
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable={false}
          />
          {errors.leaveTypeID && (
            <div className="text-danger small mt-1 d-flex align-items-center gap-1">
              <XCircle size={13} /> {errors.leaveTypeID}
            </div>
          )}
        </Form.Group>

        {/* Half Day Option */}
        <div className="mb-3 p-3 bg-light rounded-3 border">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="fw-semibold text-dark d-block">Half Day Leave</span>
              <small className="text-muted">Take either the morning or afternoon off (0.5 day deduction)</small>
            </div>
            <Form.Check
              type="switch"
              id="half-day-switch"
              checked={data.isHalfDay}
              onChange={(e) =>
                setData((prev: any) => ({
                  ...prev,
                  isHalfDay: e.target.checked,
                  halfDayType: e.target.checked ? 'FirstHalf' : '',
                }))
              }
              style={{ transform: 'scale(1.2)' }}
            />
          </div>

          {data.isHalfDay && (
            <div className="al-segmented-halfday mt-3">
              <div
                className={`al-halfday-card ${data.halfDayType === 'FirstHalf' ? 'selected' : ''}`}
                onClick={() => setData((prev: any) => ({ ...prev, halfDayType: 'FirstHalf' }))}
              >
                <Sun className="fs-5 text-warning" />
                <div>
                  <div className="fw-semibold">First Half (Morning)</div>
                  <small className="text-muted">Typical hours: 9:00 AM – 1:00 PM</small>
                </div>
              </div>

              <div
                className={`al-halfday-card ${data.halfDayType === 'SecondHalf' ? 'selected' : ''}`}
                onClick={() => setData((prev: any) => ({ ...prev, halfDayType: 'SecondHalf' }))}
              >
                <Moon className="fs-5 text-indigo" />
                <div>
                  <div className="fw-semibold">Second Half (Afternoon)</div>
                  <small className="text-muted">Typical hours: 2:00 PM – 6:00 PM</small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dates Selection */}
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold text-dark">
                {data.isHalfDay ? 'Date' : 'Start Date'} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                value={data.startDate}
                isInvalid={!!errors.startDate}
                onChange={(e) => {
                  setData((prev: any) => ({
                    ...prev,
                    startDate: e.target.value,
                    endDate: prev.isHalfDay ? e.target.value : prev.endDate,
                  }));
                  setErrors((prev) => ({ ...prev, startDate: '' }));
                }}
              />
              <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-semibold text-dark">
                End Date {!data.isHalfDay && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="date"
                value={data.endDate}
                disabled={data.isHalfDay}
                isInvalid={!!errors.endDate}
                onChange={(e) => {
                  setData((prev: any) => ({
                    ...prev,
                    endDate: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, endDate: '' }));
                }}
              />
              <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Duration Calculation Summary Card */}
        {data.startDate && (
          <div className="al-duration-preview-card">
            <div>
              <div className="al-duration-preview-title">Calculated Duration</div>
              <div className="text-muted small mt-1">
                {data.isHalfDay
                  ? `Half Day (${data.halfDayType === 'FirstHalf' ? 'Morning session' : 'Afternoon session'})`
                  : `From ${data.startDate} to ${data.endDate || data.startDate}`}
              </div>
            </div>
            <div className="text-end">
              <div className="al-duration-preview-days">
                {data.numberOfDays} {data.numberOfDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>
        )}

        {/* Reason */}
        <Form.Group className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label className="fw-semibold text-dark mb-0">
              Reason for Leave <span className="text-danger">*</span>
            </Form.Label>
            <small className="text-muted">{data.reason?.length || 0} / 300 characters</small>
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={300}
            placeholder="Please mention the purpose or context for your time-off request..."
            value={data.reason}
            isInvalid={!!errors.reason}
            onChange={(e) => {
              setData((prev: any) => ({
                ...prev,
                reason: e.target.value,
              }));
              setErrors((prev) => ({ ...prev, reason: '' }));
            }}
          />
          <Form.Control.Feedback type="invalid">{errors.reason}</Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>

      <div className="al-modal-footer">
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button className="al-btn-primary" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Submitting...
            </>
          ) : editLeave ? (
            <>
              <CheckCircle className="me-1" /> Update Application
            </>
          ) : (
            <>
              <CalendarCheck className="me-1" /> Submit Application
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default ApplyLeaveModal;
