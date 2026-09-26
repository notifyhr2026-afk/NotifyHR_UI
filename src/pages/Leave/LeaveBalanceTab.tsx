import React, { useEffect, useState, useMemo } from 'react';
import { Table, Badge, Spinner, Alert, Card, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import {
  CalendarCheck,
  CheckCircleFill,
  ClockFill,
  ShieldCheck,
  GridFill,
  ListUl,
  Search,
  ExclamationCircle,
  PlusLg,
} from 'react-bootstrap-icons';
import employeeService from '../../services/leaveService';
import { LeaveBalance } from '../../types/Leaves';

interface Props {
  refreshTrigger?: number;
  onApplyForType?: (leaveTypeID: number) => void;
  onBalancesLoaded?: (balances: LeaveBalance[]) => void;
}

const LeaveBalanceTab: React.FC<Props> = ({ refreshTrigger, onApplyForType, onBalancesLoaded }) => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

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
        if (Array.isArray(data)) {
          setLeaveBalance(data);
          if (onBalancesLoaded) {
            onBalancesLoaded(data);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load leave balance.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, [organizationID, employeeID, refreshTrigger]);

  const filteredBalances = useMemo(() => {
    if (!searchTerm.trim()) return leaveBalance;
    return leaveBalance.filter((b) =>
      b.LeaveTypeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaveBalance, searchTerm]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="text-muted small mt-2">Loading leave balances...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="d-flex align-items-center gap-2">
        <ExclamationCircle className="fs-5 flex-shrink-0" />
        <div>{error}</div>
      </Alert>
    );
  }

  if (!leaveBalance.length) {
    return (
      <div className="al-empty-state bg-white rounded-3 border">
        <div className="al-empty-icon">
          <CalendarCheck />
        </div>
        <div className="al-empty-title">No Leave Policies Assigned</div>
        <div className="al-empty-desc">
          Your organization has not assigned any active leave policies to your employee account yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar & View Toggle */}
      <div className="al-toolbar-card">
        <div className="al-search-group">
          <Search className="al-search-icon" />
          <input
            type="text"
            className="al-search-input"
            placeholder="Search leave types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group" aria-label="View switch">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <GridFill className="me-1" /> Cards
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListUl className="me-1" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="al-balance-grid">
          {filteredBalances.map((lt) => {
            const usedPct = lt.TotalLeaves > 0 ? (lt.UsedLeaves / lt.TotalLeaves) * 100 : 0;
            const pendingPct = lt.TotalLeaves > 0 ? (lt.AppliedLeaves / lt.TotalLeaves) * 100 : 0;
            const balanceStatus =
              lt.LeaveBalance <= 0
                ? { label: 'Exhausted', bg: 'bg-danger-subtle text-danger' }
                : lt.LeaveBalance <= 2
                ? { label: 'Low Balance', bg: 'bg-warning-subtle text-warning-emphasis' }
                : { label: 'Available', bg: 'bg-success-subtle text-success' };

            return (
              <div key={lt.LeaveTypeID} className="al-balance-card">
                <div className="al-balance-card-header">
                  <div className="al-balance-title-group">
                    <div className="al-balance-icon-box">
                      <ShieldCheck />
                    </div>
                    <div>
                      <h6 className="al-balance-name">{lt.LeaveTypeName}</h6>
                      <small className="text-muted">Annual Quota: {lt.TotalLeaves} days</small>
                    </div>
                  </div>
                  <span className={`al-balance-status-tag ${balanceStatus.bg}`}>
                    {balanceStatus.label}
                  </span>
                </div>

                <div className="al-balance-stats-row">
                  <div className="al-stat-col">
                    <span className="al-stat-col-label">Total</span>
                    <span className="al-stat-col-val">{lt.TotalLeaves}</span>
                  </div>
                  <div className="al-stat-col">
                    <span className="al-stat-col-label">Approved</span>
                    <span className="al-stat-col-val used">{lt.UsedLeaves}</span>
                  </div>
                  <div className="al-stat-col">
                    <span className="al-stat-col-label">Pending</span>
                    <span className="al-stat-col-val pending">{lt.AppliedLeaves}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="al-progress-wrap">
                  <div className="al-progress-labels">
                    <span>Utilization</span>
                    <span>
                      {lt.UsedLeaves + lt.AppliedLeaves} / {lt.TotalLeaves} Days
                    </span>
                  </div>
                  <div className="al-progress-bar-track">
                    <div
                      className="al-progress-fill-used"
                      style={{ width: `${Math.min(usedPct, 100)}%` }}
                      title={`Used: ${lt.UsedLeaves} days`}
                    />
                    <div
                      className="al-progress-fill-pending"
                      style={{ width: `${Math.min(pendingPct, 100 - usedPct)}%` }}
                      title={`Pending: ${lt.AppliedLeaves} days`}
                    />
                  </div>
                </div>

                {/* Action Footer */}
                <div className="al-balance-action-row">
                  <div className="al-balance-days-badge">
                    Available: <span>{lt.LeaveBalance}</span> days
                  </div>

                  {onApplyForType && (
                    <button
                      type="button"
                      className="al-btn-apply-type"
                      onClick={() => onApplyForType(lt.LeaveTypeID)}
                      title={`Apply for ${lt.LeaveTypeName}`}
                    >
                      <PlusLg className="me-1" /> Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="al-table-card">
          <div className="table-responsive">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Total Allocated</th>
                  <th>Approved (Used)</th>
                  <th>Pending Approval</th>
                  <th>Remaining Balance</th>
                  {onApplyForType && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBalances.map((lt) => (
                  <tr key={lt.LeaveTypeID}>
                    <td>
                      <span className="al-type-pill">
                        <ShieldCheck /> {lt.LeaveTypeName}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{lt.TotalLeaves} Days</span>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Leaves approved and taken</Tooltip>}
                      >
                        <span className="badge bg-info-subtle text-info-emphasis px-2.5 py-1.5 rounded-pill">
                          <CheckCircleFill className="me-1" /> {lt.UsedLeaves} Days
                        </span>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Leaves pending manager review</Tooltip>}
                      >
                        <span className="badge bg-warning-subtle text-warning-emphasis px-2.5 py-1.5 rounded-pill">
                          <ClockFill className="me-1" /> {lt.AppliedLeaves} Days
                        </span>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          lt.LeaveBalance <= 0
                            ? 'bg-danger-subtle text-danger'
                            : lt.LeaveBalance <= 2
                            ? 'bg-warning-subtle text-warning-emphasis'
                            : 'bg-success-subtle text-success'
                        } px-3 py-1.5 rounded-pill fs-7 fw-bold`}
                      >
                        {lt.LeaveBalance} Days
                      </span>
                    </td>
                    {onApplyForType && (
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill px-3 py-1"
                          onClick={() => onApplyForType(lt.LeaveTypeID)}
                        >
                          <PlusLg className="me-1" /> Apply
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalanceTab;
