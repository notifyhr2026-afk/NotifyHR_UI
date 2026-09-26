import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  People,
  PersonGear,
  ShieldCheck,
  Key,
  ArrowRepeat,
  Download,
  PlusLg,
  Search,
  Grid3x3Gap,
  Table,
  Envelope,
  Telephone,
  Building,
  GeoAlt,
  CheckCircleFill,
  XCircleFill,
  PencilSquare,
  ArrowCounterclockwise,
  Trash,
  Eye,
  Clipboard,
  ClipboardCheck,
  ShieldLock,
} from 'react-bootstrap-icons';
import Select from 'react-select';
import userService from '../../services/userService';
import employeeService from '../../services/employeeService';
import * as roleService from '../../services/roleService';
import branchService from '../../services/branchService';
import departmentService from '../../services/departmentService';
import Swal from 'sweetalert2';
import { resetUserPasswordByAdmin } from '../../services/Changepassword';
import '../../css/ManageUsers.css';

// ---------------------- Interfaces ----------------------

interface User {
  id: number;
  branchID: number | null;
  branchName?: string;
  divisionID: number | null;
  departmentID: number | null;
  departmentName?: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  passwordHash: string;
  isPasswordReset: boolean;
  passwordResetDate: string | null;
  isActive: boolean;
  isCompanyEmail: boolean;
  roles: string[];
}

interface DropdownItem {
  id: number;
  name: string;
}

type ViewMode = 'table' | 'grid';

// Helper to get initials
const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const ManageUsers: React.FC = () => {
  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID: number = userFromStorage?.organizationID ?? 0;

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [resetFilter, setResetFilter] = useState<'ALL' | 'RESET_REQUIRED' | 'VERIFIED'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dropdowns
  const [branches, setBranches] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);

  // Modals & Drawers
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Reset Password State
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedResetUser, setSelectedResetUser] = useState<User | null>(null);
  const [resetting, setResetting] = useState(false);

  // Clipboard copy tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form Data
  const defaultFormData: User = {
    id: 0,
    branchID: null,
    divisionID: null,
    departmentID: null,
    fullName: '',
    email: '',
    phone: '',
    username: '',
    passwordHash: '',
    isPasswordReset: false,
    passwordResetDate: null,
    isActive: true,
    isCompanyEmail: false,
    roles: [],
  };
  const [userFormData, setUserFormData] = useState<User>(defaultFormData);

  // ================= LOAD DATA =================

  const loadUsers = async () => {
    if (!organizationID) return;
    setLoading(true);
    try {
      const data = await userService.getUsersByOrganizationIdAsync(organizationID);

      const mapped: User[] = (data || []).map((u: any) => ({
        id: u.UserID ?? u.id,
        branchID: u.BranchID || null,
        branchName: u.BranchName || '',
        divisionID: u.DivisionID || null,
        departmentID: u.DepartmentID || null,
        departmentName: u.DepartmentName || '',
        fullName: u.FullName || '',
        email: u.Email || '',
        phone: u.Phone || '',
        username: u.Username || '',
        passwordHash: '',
        isPasswordReset: !!u.IsPasswordReset,
        passwordResetDate: u.PasswordResetDate || null,
        isActive: u.IsActive !== false,
        isCompanyEmail: !!u.IsCompanyEmail,
        roles: u.Roles ? u.Roles.split(',').map((r: string) => r.trim()) : [],
      }));

      setUsers(mapped);
    } catch (err) {
      console.error('Error loading users:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Users',
        text: 'Failed to retrieve organization users directory.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!organizationID) return;
    try {
      const res = await roleService.GetRolesByorganizationIDAsync(organizationID);
      const list = Array.isArray(res) ? res : res?.Table || res?.data || [];

      setRoleOptions(
        list.map((r: any) => {
          const roleName =
            r.RoleName || r.roleName || r.Role || r.name || String(r.RoleID || r.id || '');
          return { value: roleName, label: roleName };
        })
      );
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const loadBranches = async () => {
    if (!organizationID) return;
    try {
      const res = await branchService.getBranchesAsync(organizationID);
      const list = Array.isArray(res) ? res : res?.Table || res?.data || [];
      const mapped = list.map((b: any) => ({
        id: Number(b.BranchID ?? b.id),
        name: String(b.BranchName ?? b.name ?? `Branch #${b.BranchID}`),
      }));
      setBranches(mapped);
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  };

  const loadDepartments = async () => {
    if (!organizationID) return;
    try {
      const res = await departmentService.getdepartmentesAsync(organizationID);
      const list = Array.isArray(res) ? res : res?.Table || res?.data || [];
      const mapped = list.map((d: any) => ({
        id: Number(d.DepartmentID ?? d.id),
        name: String(d.DepartmentName ?? d.name ?? `Department #${d.DepartmentID}`),
      }));
      setDepartments(mapped);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadBranches();
    loadDepartments();
  }, [organizationID]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadUsers(), loadRoles(), loadBranches(), loadDepartments()]);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // ================= COPY HELPER =================
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(`${label}-${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ================= FILTERS & COMPUTED DATA =================

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.phone.toLowerCase().includes(query) ||
        u.roles.some((r) => r.toLowerCase().includes(query));

      const matchesBranch = selectedBranch === '' || u.branchID === selectedBranch;
      const matchesDept = selectedDepartment === '' || u.departmentID === selectedDepartment;
      const matchesRole = selectedRole === '' || u.roles.includes(selectedRole);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.isActive) ||
        (statusFilter === 'INACTIVE' && !u.isActive);

      const matchesReset =
        resetFilter === 'ALL' ||
        (resetFilter === 'RESET_REQUIRED' && u.isPasswordReset) ||
        (resetFilter === 'VERIFIED' && !u.isPasswordReset);

      return matchesSearch && matchesBranch && matchesDept && matchesRole && matchesStatus && matchesReset;
    });
  }, [users, searchTerm, selectedBranch, selectedDepartment, selectedRole, statusFilter, resetFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const resetPending = users.filter((u) => u.isPasswordReset).length;

    const allRoles = new Set<string>();
    users.forEach((u) => u.roles.forEach((r) => allRoles.add(r)));

    return {
      total,
      active,
      rolesCount: allRoles.size,
      resetPending,
    };
  }, [users]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const indexOfLast = currentPage * pageSize;
  const currentUsers = filteredUsers.slice(indexOfLast - pageSize, indexOfLast);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBranch, selectedDepartment, selectedRole, statusFilter, resetFilter, pageSize]);

  // ================= BULK GENERATE LOGINS =================
  const handleGenerateLogins = async () => {
    const confirm = await Swal.fire({
      title: 'Generate Employee Logins?',
      text: 'This will automatically provision system login credentials for all registered employees who do not yet have access.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Generate Logins',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      setGenerating(true);

      const employees = await employeeService.getEmployeeByOrganizationIdAsync(organizationID);

      const res = await userService.PostGenerateLoginsAsync({
        employeeJsonData: JSON.stringify(employees),
        createdBy: userFromStorage?.userName || 'Admin',
      });

      await employeeService.PutUpdateEmployeeUserIdAsync({
        jsonData: JSON.stringify(res),
        createdBy: userFromStorage?.userName || 'Admin',
      });

      await loadUsers();

      Swal.fire({
        icon: 'success',
        title: 'Logins Generated Successfully!',
        text: 'Employee accounts have been provisioned and synced with the user directory.',
        confirmButtonColor: '#3b82f6',
      });
    } catch (err) {
      console.error('Error generating logins:', err);
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: 'Could not generate employee user credentials. Please check backend services.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setGenerating(false);
    }
  };

  // ================= FORM & MODAL HANDLERS =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setUserFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const openAddUser = () => {
    setEditUser(null);
    setUserFormData({
      ...defaultFormData,
      id: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditUser = (user: User) => {
    setEditUser(user);
    setUserFormData({ ...user });
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!userFormData.fullName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Full Name is required.' });
      return;
    }
    if (!userFormData.email.trim()) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Email is required.' });
      return;
    }

    if (editUser) {
      setUsers((prev) => prev.map((u) => (u.id === userFormData.id ? { ...userFormData } : u)));
      Swal.fire({
        icon: 'success',
        title: 'User Updated',
        text: `User details for ${userFormData.fullName} have been updated.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      const newUser: User = {
        ...userFormData,
        id: Date.now(),
        branchName: branches.find((b) => b.id === userFormData.branchID)?.name || '',
        departmentName: departments.find((d) => d.id === userFormData.departmentID)?.name || '',
      };
      setUsers((prev) => [newUser, ...prev]);
      Swal.fire({
        icon: 'success',
        title: 'User Created',
        text: `New user ${userFormData.fullName} has been created.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setShowModal(false);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setConfirmDelete(false);
    setUserToDelete(null);
    Swal.fire({
      icon: 'success',
      title: 'User Deleted',
      text: 'The user has been removed from the directory.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // ================= CSV EXPORT =================
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Data to Export',
        text: 'There are no user records matching your current filter criteria.',
      });
      return;
    }

    const headers = [
      'User ID',
      'Full Name',
      'Username',
      'Email',
      'Phone',
      'Roles',
      'Branch',
      'Department',
      'Account Status',
      'Password Reset Required',
      'Company Email',
    ];

    const rows = filteredUsers.map((u) => {
      const branchLabel = branches.find((b) => b.id === u.branchID)?.name || u.branchName || '';
      const deptLabel = departments.find((d) => d.id === u.departmentID)?.name || u.departmentName || '';

      return [
        u.id,
        `"${u.fullName.replace(/"/g, '""')}"`,
        `"${u.username.replace(/"/g, '""')}"`,
        `"${u.email.replace(/"/g, '""')}"`,
        `"${u.phone.replace(/"/g, '""')}"`,
        `"${u.roles.join(', ')}"`,
        `"${branchLabel.replace(/"/g, '""')}"`,
        `"${deptLabel.replace(/"/g, '""')}"`,
        u.isActive ? 'Active' : 'Inactive',
        u.isPasswordReset ? 'Yes' : 'No',
        u.isCompanyEmail ? 'Yes' : 'No',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for role badge colors
  const getRoleBadgeClass = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin') || r.includes('super')) return 'admin';
    if (r.includes('hr') || r.includes('human')) return 'hr';
    return '';
  };

  return (
    <div className="manage-users-page">
      <div className="container-fluid px-4">
        {/* ================= PAGE HEADER ================= */}
        <div className="mu-header">
          <div>
            <div className="mu-breadcrumb">
              <span>Administration</span>
              <span className="mu-breadcrumb-dot" />
              <span>Access Control</span>
              <span className="mu-breadcrumb-dot" />
              <span>User Accounts</span>
            </div>
            <div className="mu-title-wrap">
              <div className="mu-title-icon-box">
                <PersonGear />
              </div>
              <div>
                <h1 className="mu-title">User Management & Directory</h1>
                <p className="mu-subtitle">
                  Configure corporate credentials, role assignments, security status, and login provisioning.
                </p>
              </div>
            </div>
          </div>

          <div className="mu-header-actions">
            <button
              type="button"
              className="mu-btn mu-btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh users and role catalogs"
            >
              <ArrowRepeat className={isRefreshing ? 'mu-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="mu-btn mu-btn-secondary"
              onClick={handleExportCSV}
              title="Export filtered directory to CSV"
            >
              <Download />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              className="mu-btn mu-btn-secondary"
              onClick={handleGenerateLogins}
              disabled={generating}
              title="Auto-provision accounts for registered staff"
            >
              {generating ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <>
                  <Key />
                  <span>Generate Logins</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="mu-btn mu-btn-primary"
              onClick={openAddUser}
              title="Create a new user account"
            >
              <PlusLg />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* ================= TOP KPI CARDS STRIP ================= */}
        <div className="mu-kpi-grid">
          <div className="mu-kpi-card">
            <div className="mu-kpi-info">
              <span className="mu-kpi-label">Total Users</span>
              <span className="mu-kpi-value">{kpis.total}</span>
              <span className="mu-kpi-subtext">Registered corporate accounts</span>
            </div>
            <div className="mu-kpi-icon-wrap blue">
              <People />
            </div>
          </div>

          <div className="mu-kpi-card">
            <div className="mu-kpi-info">
              <span className="mu-kpi-label">Active Accounts</span>
              <span className="mu-kpi-value">{kpis.active}</span>
              <span className="mu-kpi-subtext">Active system login permissions</span>
            </div>
            <div className="mu-kpi-icon-wrap emerald">
              <CheckCircleFill />
            </div>
          </div>

          <div className="mu-kpi-card">
            <div className="mu-kpi-info">
              <span className="mu-kpi-label">Active Roles</span>
              <span className="mu-kpi-value">{kpis.rolesCount}</span>
              <span className="mu-kpi-subtext">Unique role mappings defined</span>
            </div>
            <div className="mu-kpi-icon-wrap indigo">
              <ShieldCheck />
            </div>
          </div>

          <div className="mu-kpi-card">
            <div className="mu-kpi-info">
              <span className="mu-kpi-label">Reset Required</span>
              <span className="mu-kpi-value">{kpis.resetPending}</span>
              <span className="mu-kpi-subtext">Must reset password on next login</span>
            </div>
            <div className="mu-kpi-icon-wrap amber">
              <Key />
            </div>
          </div>
        </div>

        {/* ================= CONTROLS & FILTER BAR ================= */}
        <div className="mu-control-bar">
          {/* View Toggle */}
          <div className="mu-view-toggle-group">
            <button
              type="button"
              className={`mu-view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <Table /> Matrix Table
            </button>
            <button
              type="button"
              className={`mu-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <Grid3x3Gap /> Bento Cards
            </button>
          </div>

          {/* Search Box */}
          <div className="mu-search-wrap">
            <Search className="mu-search-icon" />
            <input
              type="text"
              className="mu-search-input"
              placeholder="Search by name, email, username, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="mu-filters-row">
            {/* Branch Filter */}
            <select
              className="mu-select-filter"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              className="mu-select-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              className="mu-select-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles ({roleOptions.length})</option>
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="mu-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            {/* Password Reset Filter */}
            <select
              className="mu-select-filter"
              value={resetFilter}
              onChange={(e) => setResetFilter(e.target.value as any)}
            >
              <option value="ALL">All Security Status</option>
              <option value="RESET_REQUIRED">Reset Pending</option>
              <option value="VERIFIED">Verified / Normal</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm ||
              selectedBranch !== '' ||
              selectedDepartment !== '' ||
              selectedRole !== '' ||
              statusFilter !== 'ALL' ||
              resetFilter !== 'ALL') && (
              <button
                type="button"
                className="mu-btn mu-btn-secondary"
                style={{ padding: '0.425rem 0.75rem', fontSize: '0.8125rem' }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBranch('');
                  setSelectedDepartment('');
                  setSelectedRole('');
                  setStatusFilter('ALL');
                  setResetFilter('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ================= LOADING STATE ================= */}
        {loading && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
            <span className="text-muted small mt-2">Loading user accounts directory...</span>
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!loading && filteredUsers.length === 0 && (
          <div className="mu-empty-state">
            <div className="mu-empty-icon">
              <People />
            </div>
            <div className="mu-empty-title">No User Accounts Found</div>
            <div className="mu-empty-desc">
              {searchTerm || selectedBranch !== '' || selectedDepartment !== '' || selectedRole !== ''
                ? 'No user records match your active search and filter options.'
                : 'No users have been registered yet in this organization. You can add users manually or click "Generate Logins".'}
            </div>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="mu-btn mu-btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBranch('');
                  setSelectedDepartment('');
                  setSelectedRole('');
                  setStatusFilter('ALL');
                  setResetFilter('ALL');
                }}
              >
                Reset Filters
              </button>
              <button type="button" className="mu-btn mu-btn-primary" onClick={openAddUser}>
                <PlusLg /> Add First User
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 1: MATRIX TABLE ================= */}
        {!loading && filteredUsers.length > 0 && viewMode === 'table' && (
          <div className="mu-table-card">
            <div className="table-responsive">
              <table className="mu-table">
                <thead>
                  <tr>
                    <th>User Identity</th>
                    <th>Contact Information</th>
                    <th>Branch & Dept</th>
                    <th>Assigned Roles</th>
                    <th>Status</th>
                    <th>Security</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((u) => {
                    const branchName = branches.find((b) => b.id === u.branchID)?.name || u.branchName;
                    const deptName = departments.find((d) => d.id === u.departmentID)?.name || u.departmentName;

                    return (
                      <tr key={u.id}>
                        {/* Identity */}
                        <td>
                          <div className="mu-user-cell">
                            <div className={`mu-avatar ${!u.isActive ? 'inactive' : ''}`}>
                              {getInitials(u.fullName)}
                              <span className={`mu-avatar-status ${u.isActive ? 'active' : 'inactive'}`} />
                            </div>
                            <div>
                              <div className="mu-user-name">
                                {u.fullName}
                                {u.isCompanyEmail && (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Official Company Domain Account</Tooltip>}
                                  >
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-1 py-0" style={{ fontSize: '0.65rem' }}>
                                      Corp
                                    </span>
                                  </OverlayTrigger>
                                )}
                              </div>
                              <div className="mu-username-pill">@{u.username || 'user'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td>
                          <div className="d-flex flex-column gap-1" style={{ fontSize: '0.8125rem' }}>
                            <div className="d-flex align-items-center gap-2">
                              <Envelope size={13} className="text-muted" />
                              <span className="text-dark">{u.email || '-'}</span>
                              {u.email && (
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-muted"
                                  onClick={() => handleCopy(u.email, 'email')}
                                  title="Copy Email"
                                >
                                  {copiedKey === `email-${u.email}` ? (
                                    <ClipboardCheck size={13} className="text-success" />
                                  ) : (
                                    <Clipboard size={13} />
                                  )}
                                </button>
                              )}
                            </div>
                            {u.phone && (
                              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.75rem' }}>
                                <Telephone size={12} />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Branch & Dept */}
                        <td>
                          <div style={{ fontSize: '0.825rem' }}>
                            <div className="fw-medium text-dark d-flex align-items-center gap-1">
                              <GeoAlt size={12} className="text-primary" /> {branchName || '-'}
                            </div>
                            <div className="text-muted small d-flex align-items-center gap-1 mt-1">
                              <Building size={12} /> {deptName || '-'}
                            </div>
                          </div>
                        </td>

                        {/* Roles */}
                        <td>
                          <div className="mu-roles-wrap">
                            {u.roles.length > 0 ? (
                              u.roles.map((role) => (
                                <span key={role} className={`mu-role-chip ${getRoleBadgeClass(role)}`}>
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted small italic">Standard User</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`mu-status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                            {u.isActive ? (
                              <>
                                <CheckCircleFill size={10} /> Active
                              </>
                            ) : (
                              <>
                                <XCircleFill size={10} /> Inactive
                              </>
                            )}
                          </span>
                        </td>

                        {/* Security / Password Reset */}
                        <td>
                          {u.isPasswordReset ? (
                            <span className="mu-pw-reset-badge pending" title="User will reset password upon login">
                              <Key size={12} /> Reset Required
                            </span>
                          ) : (
                            <span className="mu-pw-reset-badge ok" title="Password verified">
                              <ShieldCheck size={12} /> Verified
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="d-inline-flex align-items-center gap-1">
                            <OverlayTrigger placement="top" overlay={<Tooltip>View Details</Tooltip>}>
                              <button
                                type="button"
                                className="mu-icon-btn primary"
                                onClick={() => setViewingUser(u)}
                              >
                                <Eye />
                              </button>
                            </OverlayTrigger>

                            <OverlayTrigger placement="top" overlay={<Tooltip>Edit Account</Tooltip>}>
                              <button
                                type="button"
                                className="mu-icon-btn primary"
                                onClick={() => openEditUser(u)}
                              >
                                <PencilSquare />
                              </button>
                            </OverlayTrigger>

                            <OverlayTrigger placement="top" overlay={<Tooltip>Reset Password</Tooltip>}>
                              <button
                                type="button"
                                className="mu-icon-btn warning"
                                onClick={() => {
                                  setSelectedResetUser(u);
                                  setShowResetModal(true);
                                }}
                              >
                                <ArrowCounterclockwise />
                              </button>
                            </OverlayTrigger>

                            <OverlayTrigger placement="top" overlay={<Tooltip>Delete User</Tooltip>}>
                              <button
                                type="button"
                                className="mu-icon-btn danger"
                                onClick={() => {
                                  setUserToDelete(u);
                                  setConfirmDelete(true);
                                }}
                              >
                                <Trash />
                              </button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: BENTO CARDS ================= */}
        {!loading && filteredUsers.length > 0 && viewMode === 'grid' && (
          <div className="mu-grid">
            {currentUsers.map((u) => {
              const branchName = branches.find((b) => b.id === u.branchID)?.name || u.branchName;
              const deptName = departments.find((d) => d.id === u.departmentID)?.name || u.departmentName;

              return (
                <div className="mu-card" key={u.id}>
                  <div className="mu-card-top">
                    <div className={`mu-card-avatar ${!u.isActive ? 'inactive' : ''}`}>
                      {getInitials(u.fullName)}
                    </div>
                    <div className="mu-card-meta">
                      <div className="mu-card-name-row">
                        <h5 className="mu-card-name" title={u.fullName}>
                          {u.fullName}
                        </h5>
                        <span className={`mu-status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mu-card-username">@{u.username || 'user'}</div>
                    </div>
                  </div>

                  {/* Info table */}
                  <div className="mu-card-info-table">
                    <div className="mu-info-row">
                      <span className="mu-info-label">Email:</span>
                      <span className="mu-info-val" title={u.email}>
                        {u.email || '-'}
                      </span>
                    </div>
                    <div className="mu-info-row">
                      <span className="mu-info-label">Phone:</span>
                      <span className="mu-info-val">{u.phone || '-'}</span>
                    </div>
                    <div className="mu-info-row">
                      <span className="mu-info-label">Branch:</span>
                      <span className="mu-info-val">{branchName || '-'}</span>
                    </div>
                    <div className="mu-info-row">
                      <span className="mu-info-label">Department:</span>
                      <span className="mu-info-val">{deptName || '-'}</span>
                    </div>
                    <div className="mu-info-row">
                      <span className="mu-info-label">Security:</span>
                      <span className="mu-info-val">
                        {u.isPasswordReset ? (
                          <span className="text-warning fw-bold">Reset Required</span>
                        ) : (
                          <span className="text-success fw-bold">Verified</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="mu-card-roles-box">
                    {u.roles.length > 0 ? (
                      u.roles.map((role) => (
                        <span key={role} className={`mu-role-chip ${getRoleBadgeClass(role)}`}>
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">No roles assigned</span>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mu-card-footer">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border text-primary fw-semibold d-flex align-items-center gap-1"
                      onClick={() => setViewingUser(u)}
                    >
                      <Eye size={13} /> Full Profile
                    </button>

                    <div className="mu-action-icons">
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit Account</Tooltip>}>
                        <button
                          type="button"
                          className="mu-icon-btn primary"
                          onClick={() => openEditUser(u)}
                        >
                          <PencilSquare />
                        </button>
                      </OverlayTrigger>

                      <OverlayTrigger placement="top" overlay={<Tooltip>Reset Password</Tooltip>}>
                        <button
                          type="button"
                          className="mu-icon-btn warning"
                          onClick={() => {
                            setSelectedResetUser(u);
                            setShowResetModal(true);
                          }}
                        >
                          <ArrowCounterclockwise />
                        </button>
                      </OverlayTrigger>

                      <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                        <button
                          type="button"
                          className="mu-icon-btn danger"
                          onClick={() => {
                            setUserToDelete(u);
                            setConfirmDelete(true);
                          }}
                        >
                          <Trash />
                        </button>
                      </OverlayTrigger>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= PAGINATION BAR ================= */}
        {!loading && filteredUsers.length > 0 && (
          <div className="mu-pagination-bar">
            <div className="mu-page-info">
              Showing <span className="fw-bold">{indexOfLast - pageSize + 1}</span> to{' '}
              <span className="fw-bold">{Math.min(indexOfLast, filteredUsers.length)}</span> of{' '}
              <span className="fw-bold">{filteredUsers.length}</span> user accounts
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="mu-page-select-wrap">
                <span>Per Page:</span>
                <select
                  className="mu-select-filter py-1"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="d-flex align-items-center gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &lsaquo; Prev
                </button>
                <span className="mx-2 small fw-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next &rsaquo;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADD / EDIT USER MODAL ================= */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className="border-bottom pb-3">
            <Modal.Title className="fs-5 fw-bold text-dark d-flex align-items-center gap-2">
              <PersonGear className="text-primary" /> {editUser ? 'Edit User Account' : 'Add New User'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="fullName">
                    <Form.Label className="small fw-bold text-secondary">
                      Full Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={userFormData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="username">
                    <Form.Label className="small fw-bold text-secondary">
                      Username <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. eleanor.vance"
                      value={userFormData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="email">
                    <Form.Label className="small fw-bold text-secondary">
                      Email Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="user@organization.com"
                      value={userFormData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="phone">
                    <Form.Label className="small fw-bold text-secondary">Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={userFormData.phone}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="branchID">
                    <Form.Label className="small fw-bold text-secondary">Assigned Branch</Form.Label>
                    <Form.Select
                      value={userFormData.branchID ?? ''}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          branchID: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Select Branch...</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="departmentID">
                    <Form.Label className="small fw-bold text-secondary">Assigned Department</Form.Label>
                    <Form.Select
                      value={userFormData.departmentID ?? ''}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          departmentID: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary">Assigned Roles</Form.Label>
                    <Select
                      isMulti
                      options={roleOptions}
                      placeholder="Select security and access roles..."
                      value={roleOptions.filter((r) => userFormData.roles.includes(r.value))}
                      onChange={(selectedOptions) => {
                        const roles = selectedOptions.map((opt) => opt.value);
                        setUserFormData((prev) => ({ ...prev, roles }));
                      }}
                    />
                  </Form.Group>
                </Col>

                {!editUser && (
                  <Col md={12}>
                    <Form.Group controlId="passwordHash">
                      <Form.Label className="small fw-bold text-secondary">Initial Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Leave blank to auto-generate standard password"
                        value={userFormData.passwordHash}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <hr className="my-4" />

              {/* Toggles */}
              <div className="d-flex flex-wrap gap-4">
                <Form.Check
                  type="switch"
                  id="isActive"
                  label={<span className="fw-semibold text-dark">Active Account</span>}
                  checked={userFormData.isActive}
                  onChange={handleInputChange}
                />

                <Form.Check
                  type="switch"
                  id="isCompanyEmail"
                  label={<span className="fw-semibold text-dark">Company Email</span>}
                  checked={userFormData.isCompanyEmail}
                  onChange={handleInputChange}
                />

                <Form.Check
                  type="switch"
                  id="isPasswordReset"
                  label={<span className="fw-semibold text-dark">Force Password Reset on Next Login</span>}
                  checked={userFormData.isPasswordReset}
                  onChange={handleInputChange}
                />
              </div>
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-top pt-3">
            <button type="button" className="mu-btn mu-btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="button" className="mu-btn mu-btn-primary" onClick={handleSaveUser}>
              {editUser ? 'Update Account' : 'Create User'}
            </button>
          </Modal.Footer>
        </Modal>

        {/* ================= VIEW USER DETAILS DRAWER / MODAL ================= */}
        <Modal show={!!viewingUser} onHide={() => setViewingUser(null)} size="lg" centered>
          {viewingUser && (
            <>
              <div className="mu-drawer-header">
                <div className={`mu-drawer-avatar ${!viewingUser.isActive ? 'inactive' : ''}`}>
                  {getInitials(viewingUser.fullName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h3 className="mu-drawer-name">{viewingUser.fullName}</h3>
                    <span className={`mu-status-pill ${viewingUser.isActive ? 'active' : 'inactive'}`}>
                      {viewingUser.isActive ? 'Active User' : 'Inactive User'}
                    </span>
                  </div>
                  <div className="text-muted small">@{viewingUser.username || 'user'}</div>
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {viewingUser.roles.map((role) => (
                      <span key={role} className={`mu-role-chip ${getRoleBadgeClass(role)}`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Modal.Body className="p-4">
                <div className="mu-detail-grid">
                  <div className="mu-detail-box">
                    <div className="mu-detail-label">Email Address</div>
                    <div className="mu-detail-value d-flex align-items-center justify-content-between">
                      <span className="text-truncate">{viewingUser.email || '-'}</span>
                      {viewingUser.email && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => handleCopy(viewingUser.email, 'email')}
                        >
                          <Clipboard size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mu-detail-box">
                    <div className="mu-detail-label">Phone Number</div>
                    <div className="mu-detail-value d-flex align-items-center justify-content-between">
                      <span>{viewingUser.phone || '-'}</span>
                      {viewingUser.phone && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 text-decoration-none"
                          onClick={() => handleCopy(viewingUser.phone, 'phone')}
                        >
                          <Clipboard size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mu-detail-box">
                    <div className="mu-detail-label">Assigned Branch</div>
                    <div className="mu-detail-value">
                      {branches.find((b) => b.id === viewingUser.branchID)?.name || viewingUser.branchName || '-'}
                    </div>
                  </div>

                  <div className="mu-detail-box">
                    <div className="mu-detail-label">Assigned Department</div>
                    <div className="mu-detail-value">
                      {departments.find((d) => d.id === viewingUser.departmentID)?.name || viewingUser.departmentName || '-'}
                    </div>
                  </div>

                  <div className="mu-detail-box">
                    <div className="mu-detail-label">Security Flag</div>
                    <div className="mu-detail-value">
                      {viewingUser.isPasswordReset ? (
                        <span className="text-warning fw-bold d-flex align-items-center gap-1">
                          <Key size={14} /> Password Reset Pending
                        </span>
                      ) : (
                        <span className="text-success fw-bold d-flex align-items-center gap-1">
                          <ShieldCheck size={14} /> Password Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mu-detail-box">
                    <div className="mu-detail-label">Company Email Domain</div>
                    <div className="mu-detail-value">
                      {viewingUser.isCompanyEmail ? 'Corporate Domain Account' : 'External / Personal Mailbox'}
                    </div>
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="border-top pt-3">
                <button
                  type="button"
                  className="mu-btn mu-btn-secondary"
                  onClick={() => setViewingUser(null)}
                >
                  Close Profile
                </button>
                <button
                  type="button"
                  className="mu-btn mu-btn-primary"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    openEditUser(u);
                  }}
                >
                  <PencilSquare /> Edit Account
                </button>
              </Modal.Footer>
            </>
          )}
        </Modal>

        {/* ================= RESET PASSWORD CONFIRMATION MODAL ================= */}
        <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
          <Modal.Header closeButton className="border-bottom">
            <Modal.Title className="fs-5 fw-bold text-dark d-flex align-items-center gap-2">
              <Key className="text-warning" /> Confirm Password Reset
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-2">
              Are you sure you want to trigger an administrative password reset for{' '}
              <strong>{selectedResetUser?.fullName}</strong>?
            </p>
            <div className="p-3 bg-light rounded-3 border text-muted small">
              The user account flag will be toggled to <strong>Reset Required</strong>. On their next sign-in
              attempt, the system will prompt them to establish a new password.
            </div>
          </Modal.Body>
          <Modal.Footer className="border-top">
            <button
              type="button"
              className="mu-btn mu-btn-secondary"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="mu-btn mu-btn-primary"
              style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
              disabled={resetting}
              onClick={async () => {
                if (!selectedResetUser) return;
                try {
                  setResetting(true);
                  await resetUserPasswordByAdmin({
                    userID: selectedResetUser.id,
                    organizationID,
                    modifiedBy: userFromStorage?.userName || 'admin',
                  });

                  setUsers((prev) =>
                    prev.map((u) => (u.id === selectedResetUser.id ? { ...u, isPasswordReset: true } : u))
                  );
                  setShowResetModal(false);

                  Swal.fire({
                    icon: 'success',
                    title: 'Password Reset Initiated',
                    text: `${selectedResetUser.fullName} will be prompted to change their password on next login.`,
                    confirmButtonColor: '#3b82f6',
                  });
                } catch (err) {
                  console.error('Error resetting password:', err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Password Reset Failed',
                    text: 'Unable to communicate with the authentication server.',
                    confirmButtonColor: '#3b82f6',
                  });
                } finally {
                  setResetting(false);
                }
              }}
            >
              {resetting ? (
                <>
                  <Spinner animation="border" size="sm" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Key />
                  <span>Confirm Reset</span>
                </>
              )}
            </button>
          </Modal.Footer>
        </Modal>

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
          <Modal.Header closeButton className="border-bottom">
            <Modal.Title className="fs-5 fw-bold text-danger d-flex align-items-center gap-2">
              <Trash /> Confirm Account Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-2">
              Are you sure you want to delete the user account for <strong>{userToDelete?.fullName}</strong> (
              {userToDelete?.email})?
            </p>
            <div className="p-3 bg-danger-subtle text-danger-emphasis rounded-3 border border-danger-subtle small">
              <strong>Warning:</strong> This will revoke all role permissions and system access immediately for this
              user.
            </div>
          </Modal.Body>
          <Modal.Footer className="border-top">
            <button
              type="button"
              className="mu-btn mu-btn-secondary"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="mu-btn mu-btn-primary"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              onClick={handleDeleteUser}
            >
              <Trash /> Delete User
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ManageUsers;
