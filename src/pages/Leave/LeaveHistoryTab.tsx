import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Badge, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  CalendarCheck,
  CalendarEvent,
  ClockHistory,
  HourglassSplit,
  CheckCircleFill,
  XCircleFill,
  PencilSquare,
  Trash,
  Search,
  Filter,
  PlusLg,
  InfoCircle,
} from 'react-bootstrap-icons';
import { Leave, LeaveBalance } from '../../types/Leaves';
import leaveService from '../../services/leaveService';
import ApplyLeaveModal from './ApplyLeaveModal';

interface Props {
  employeeID: number;
  onDelete: (id: number) => void;
  onEdit?: (leave: Leave) => void;
  refreshTrigger?: number;
  onLeavesLoaded?: (leaves: Leave[]) => void;
  onApplyNew?: () => void;
  leaveBalances?: LeaveBalance[];
}

const formatDate = (date?: string | null) => {
  if (!date) return '';
  try {
    const parts = date.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

const LeaveHistoryTab: React.FC<Props> = ({
  employeeID,
  onDelete,
  onEdit,
  refreshTrigger,
  onLeavesLoaded,
  onApplyNew,
  leaveBalances = [],
}) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fallback Internal Modal (if onEdit is not supplied)
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [internalEditLeave, setInternalEditLeave] = useState<Leave | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, [employeeID, refreshTrigger]);

  const fetchLeaves = async () => {
    if (!employeeID) return;
    try {
      setLoading(true);
      const data = await leaveService.GetEmployeeLeavesByAsync(employeeID);

      const mapped: Leave[] = (data || []).map((l: any) => ({
        id: l.EmployeeLeaveID || l.id,
        employeeID: String(l.EmployeeID || employeeID),
        leaveTypeID: String(l.LeaveTypeID),
        startDate: l.StartDate,
        endDate: l.EndDate,
        numberOfDays: l.NumberOfDays,
        status:
          l.LeaveStatusID === 1
            ? 'Approved'
            : l.LeaveStatusID === 2
            ? 'Rejected'
            : 'Pending',
        reason: l.Reason,
        isHalfDay: l.IsHalfDay,
        halfDayType: l.HalfDayType,
        leaveTypeName: l.LeaveTypeName || 'General Leave',
      }));

      // Sort newest first
      mapped.sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());

      setLeaves(mapped);
      if (onLeavesLoaded) {
        onLeavesLoaded(mapped);
      }
    } catch {
      setError('Failed to load your leave history. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (leave: Leave) => {
    if (onEdit) {
      onEdit(leave);
    } else {
      setInternalEditLeave(leave);
      setShowInternalModal(true);
    }
  };

  const handleInternalSave = (updatedLeave: Leave) => {
    setLeaves((prev) => {
      const exists = prev.some((l) => l.id === updatedLeave.id);
      if (exists) {
        return prev.map((l) => (l.id === updatedLeave.id ? updatedLeave : l));
      }
      return [updatedLeave, ...prev];
    });
  };

  // Status Filter Counts
  const counts = useMemo(() => {
    return {
      all: leaves.length,
      pending: leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
    };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (l.leaveTypeName && l.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.reason && l.reason.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || l.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [leaves, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="text-muted small mt-2">Loading leave history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="d-flex align-items-center justify-content-between">
        <div>{error}</div>
        <Button size="sm" variant="outline-danger" onClick={fetchLeaves}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <>
      {/* Search and Filters Toolbar */}
      <div className="al-toolbar-card">
        <div className="al-search-group">
          <Search className="al-search-icon" />
          <input
            type="text"
            className="al-search-input"
            placeholder="Search by leave type or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="al-filters-group">
          <button
            type="button"
            className={`al-filter-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Requests ({counts.all})
          </button>
          <button
            type="button"
            className={`al-filter-chip ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending ({counts.pending})
          </button>
          <button
            type="button"
            className={`al-filter-chip ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved ({counts.approved})
          </button>
          <button
            type="button"
            className={`al-filter-chip ${statusFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected ({counts.rejected})
          </button>
        </div>
      </div>

      {/* Main Table / Empty State */}
      {filteredLeaves.length === 0 ? (
        <div className="al-empty-state bg-white rounded-3 border">
          <div className="al-empty-icon">
            <CalendarEvent />
          </div>
          <div className="al-empty-title">No Leave Applications Found</div>
          <div className="al-empty-desc">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No leave requests match your search query or selected filter.'
              : 'You have not submitted any leave requests yet.'}
          </div>
          {onApplyNew && (
            <button type="button" className="al-btn-primary" onClick={onApplyNew}>
              <PlusLg /> Apply for Leave
            </button>
          )}
        </div>
      ) : (
        <div className="al-table-card">
          <div className="table-responsive">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Duration</th>
                  <th>Reason / Context</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span className="al-type-pill">
                        <CalendarCheck /> {l.leaveTypeName || 'Leave'}
                      </span>
                    </td>

                    <td>
                      <div className="al-date-range">
                        <span>{formatDate(l.startDate)}</span>
                        {l.startDate !== l.endDate && l.endDate && (
                          <>
                            <span className="al-date-arrow">→</span>
                            <span>{formatDate(l.endDate)}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="al-days-badge">
                        {l.numberOfDays} {l.numberOfDays === 1 ? 'Day' : 'Days'}
                      </span>
                      {l.isHalfDay && (
                        <span className="al-half-badge">
                          {l.halfDayType === 'FirstHalf' ? 'Morning' : 'Afternoon'}
                        </span>
                      )}
                    </td>

                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: '240px' }}
                        title={l.reason}
                      >
                        {l.reason || <span className="text-muted italic">No reason provided</span>}
                      </div>
                    </td>

                    <td>
                      {l.status === 'Approved' ? (
                        <span className="al-status-badge approved">
                          <CheckCircleFill /> Approved
                        </span>
                      ) : l.status === 'Rejected' ? (
                        <span className="al-status-badge rejected">
                          <XCircleFill /> Rejected
                        </span>
                      ) : (
                        <span className="al-status-badge pending">
                          <HourglassSplit /> Pending
                        </span>
                      )}
                    </td>

                    <td>
                      {l.status === 'Pending' ? (
                        <div className="al-action-btn-group">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit Application</Tooltip>}
                          >
                            <button
                              type="button"
                              className="al-btn-action edit"
                              onClick={() => handleEditClick(l)}
                              aria-label="Edit"
                            >
                              <PencilSquare />
                            </button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Withdraw Application</Tooltip>}
                          >
                            <button
                              type="button"
                              className="al-btn-action delete"
                              onClick={() => onDelete(l.id)}
                              aria-label="Withdraw"
                            >
                              <Trash />
                            </button>
                          </OverlayTrigger>
                        </div>
                      ) : (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              {l.status === 'Approved'
                                ? 'Leave approved. Cannot modify.'
                                : 'Request rejected.'}
                            </Tooltip>
                          }
                        >
                          <span className="text-muted small ps-2">
                            <InfoCircle /> Locked
                          </span>
                        </OverlayTrigger>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Internal Modal fallback */}
      {!onEdit && (
        <ApplyLeaveModal
          show={showInternalModal}
          onHide={() => setShowInternalModal(false)}
          editLeave={internalEditLeave}
          onSave={handleInternalSave}
          leaveBalances={leaveBalances}
        />
      )}
    </>
  );
};

export default LeaveHistoryTab;
