import React, { useState, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import {
  CalendarCheck,
  PlusLg,
  ArrowRepeat,
  ClockHistory,
  CheckCircle,
  ShieldCheck,
  People,
  CalendarEvent,
  JournalText,
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import { Leave, LeaveBalance, LeaveTypeOption } from '../../types/Leaves';
import leaveService from '../../services/leaveService';
import { fireAudit } from '../../utils/auditUtils';

import LeaveHistoryTab from './LeaveHistoryTab';
import LeaveBalanceTab from './LeaveBalanceTab';
import ApproveLeavesTab from './ApproveLeavesTab';
import EmployeeLeavesTab from './EmployeeLeavesTab';
import ApplyLeaveModal from './ApplyLeaveModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import '../../css/ApplyLeave.css';

const ApplyLeave: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');

  const isReportingManager = Array.isArray(roles)
    ? roles.some((r: any) => r.roleName === 'ReportingManager' || r.name === 'ReportingManager')
    : false;

  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number = user?.employeeID;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'history' | 'balance' | 'approve' | 'employee'>('history');

  // Trigger data reload across tabs
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cached data for top metric cards
  const [leavesHistory, setLeavesHistory] = useState<Leave[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);
  const [preSelectedLeaveTypeID, setPreSelectedLeaveTypeID] = useState<string>('');

  // Delete / Cancellation State
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fallback mock leave options for EmployeeLeavesTab if needed
  const leaveTypeOptions: LeaveTypeOption[] = [
    { value: '1', label: 'Casual Leave', totalLeaves: 12 },
    { value: '2', label: 'Sick Leave', totalLeaves: 10 },
    { value: '3', label: 'Earned Leave', totalLeaves: 15 },
  ];

  // Top KPI calculations
  const metrics = useMemo(() => {
    const totalAvailableDays = leaveBalances.reduce((acc, b) => acc + (b.LeaveBalance || 0), 0);
    const pendingCount = leavesHistory.filter((l) => l.status === 'Pending').length;
    const approvedDays = leavesHistory
      .filter((l) => l.status === 'Approved')
      .reduce((acc, l) => acc + (Number(l.numberOfDays) || 0), 0);
    const totalPolicies = leaveBalances.length;

    return {
      availableDays: totalAvailableDays,
      pendingRequests: pendingCount,
      approvedDays: approvedDays,
      policyCount: totalPolicies,
    };
  }, [leaveBalances, leavesHistory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.info('Leave data refreshed');
    }, 600);
  };

  const handleOpenApplyModal = (typeID?: number) => {
    setEditLeave(null);
    if (typeID) {
      setPreSelectedLeaveTypeID(String(typeID));
    } else {
      setPreSelectedLeaveTypeID('');
    }
    setShowModal(true);
  };

  const handleEditLeave = (leave: Leave) => {
    setEditLeave(leave);
    setPreSelectedLeaveTypeID(String(leave.leaveTypeID));
    setShowModal(true);
  };

  const handleSaveLeave = () => {
    setShowModal(false);
    setEditLeave(null);
    setPreSelectedLeaveTypeID('');
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeletePrompt = (id: number) => {
    setLeaveToDelete(id);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (leaveToDelete !== null) {
      try {
        setIsDeleting(true);
        await leaveService.DeleteEmployeeLeaveAsync(leaveToDelete);
        toast.success('Leave request withdrawn successfully');
        fireAudit(
          'DELETE',
          'Leave',
          { id: leaveToDelete },
          null,
          organizationID || 0,
          user?.name || user?.username || 'Employee',
          'ApplyLeave'
        );
        setRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to withdraw leave:', err);
        toast.error('Unable to withdraw leave request');
      } finally {
        setIsDeleting(false);
        setConfirmDelete(false);
        setLeaveToDelete(null);
      }
    }
  };

  return (
    <div className="apply-leave-page">
      <Container fluid="lg">
        {/* Page Header */}
        <div className="al-header">
          <div>
            <div className="al-breadcrumb">
              <span>Time & Attendance</span>
              <span className="al-breadcrumb-dot" />
              <span>Leave Management</span>
            </div>
            <div className="al-title-wrap">
              <div className="al-title-icon-box">
                <CalendarCheck />
              </div>
              <div>
                <h1 className="al-title">Leave Management</h1>
                <p className="al-subtitle">
                  Apply for time off, monitor approval statuses, and check remaining leave quotas.
                </p>
              </div>
            </div>
          </div>

          <div className="al-header-actions">
            <button
              type="button"
              className="al-btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh leave data"
            >
              <ArrowRepeat className={isRefreshing ? 'al-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="al-btn-primary"
              onClick={() => handleOpenApplyModal()}
            >
              <PlusLg />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="al-kpi-grid">
          <div className="al-kpi-card">
            <div className="al-kpi-info">
              <span className="al-kpi-label">Available Balance</span>
              <span className="al-kpi-value">{metrics.availableDays}</span>
              <span className="al-kpi-subtext">Total days across active quotas</span>
            </div>
            <div className="al-kpi-icon-wrap indigo">
              <ShieldCheck />
            </div>
          </div>

          <div className="al-kpi-card">
            <div className="al-kpi-info">
              <span className="al-kpi-label">Pending Approvals</span>
              <span className="al-kpi-value">{metrics.pendingRequests}</span>
              <span className="al-kpi-subtext">
                {metrics.pendingRequests === 1 ? '1 request' : `${metrics.pendingRequests} requests`} awaiting review
              </span>
            </div>
            <div className="al-kpi-icon-wrap amber">
              <ClockHistory />
            </div>
          </div>

          <div className="al-kpi-card">
            <div className="al-kpi-info">
              <span className="al-kpi-label">Leaves Taken</span>
              <span className="al-kpi-value">{metrics.approvedDays}</span>
              <span className="al-kpi-subtext">Total approved days recorded</span>
            </div>
            <div className="al-kpi-icon-wrap emerald">
              <CheckCircle />
            </div>
          </div>

          <div className="al-kpi-card">
            <div className="al-kpi-info">
              <span className="al-kpi-label">Leave Policies</span>
              <span className="al-kpi-value">{metrics.policyCount}</span>
              <span className="al-kpi-subtext">Active categories assigned</span>
            </div>
            <div className="al-kpi-icon-wrap cyan">
              <JournalText />
            </div>
          </div>
        </div>

        {/* Custom Segmented Navigation Tabs */}
        <div className="al-tabs-wrapper">
          <ul className="al-nav-pills" role="tablist">
            <li>
              <button
                type="button"
                className={`al-nav-pill-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <ClockHistory />
                <span>My Leave History</span>
                <span className="al-pill-badge">{leavesHistory.length}</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                className={`al-nav-pill-btn ${activeTab === 'balance' ? 'active' : ''}`}
                onClick={() => setActiveTab('balance')}
              >
                <ShieldCheck />
                <span>Leave Balance</span>
                <span className="al-pill-badge">{metrics.availableDays} Days</span>
              </button>
            </li>

            {isReportingManager && (
              <li>
                <button
                  type="button"
                  className={`al-nav-pill-btn ${activeTab === 'approve' ? 'active' : ''}`}
                  onClick={() => setActiveTab('approve')}
                >
                  <CalendarEvent />
                  <span>Approve Requests</span>
                </button>
              </li>
            )}

            {isReportingManager && (
              <li>
                <button
                  type="button"
                  className={`al-nav-pill-btn ${activeTab === 'employee' ? 'active' : ''}`}
                  onClick={() => setActiveTab('employee')}
                >
                  <People />
                  <span>Team Leave Records</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Tab Contents */}
        {activeTab === 'history' && (
          <LeaveHistoryTab
            employeeID={employeeID}
            refreshTrigger={refreshTrigger}
            onDelete={handleDeletePrompt}
            onEdit={handleEditLeave}
            onLeavesLoaded={(leaves) => setLeavesHistory(leaves)}
            onApplyNew={() => handleOpenApplyModal()}
            leaveBalances={leaveBalances}
          />
        )}

        {activeTab === 'balance' && (
          <LeaveBalanceTab
            refreshTrigger={refreshTrigger}
            onApplyForType={handleOpenApplyModal}
            onBalancesLoaded={(balances) => setLeaveBalances(balances)}
          />
        )}

        {isReportingManager && activeTab === 'approve' && <ApproveLeavesTab />}

        {isReportingManager && activeTab === 'employee' && (
          <EmployeeLeavesTab leaveTypes={leaveTypeOptions} />
        )}

        {/* Unified Application & Edit Modal */}
        <ApplyLeaveModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEditLeave(null);
            setPreSelectedLeaveTypeID('');
          }}
          editLeave={editLeave}
          onSave={handleSaveLeave}
          preSelectedLeaveTypeID={preSelectedLeaveTypeID}
          leaveBalances={leaveBalances}
        />

        {/* Cancellation & Delete Confirmation Modal */}
        <DeleteConfirmModal
          show={confirmDelete}
          onHide={() => {
            setConfirmDelete(false);
            setLeaveToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Withdraw Leave Request"
          message="Are you sure you want to withdraw this leave request? This request will be cancelled immediately."
          confirmLabel="Yes, Withdraw"
          loading={isDeleting}
        />
      </Container>
    </div>
  );
};

export default ApplyLeave;
