import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  Card,
  InputGroup,
} from 'react-bootstrap';
import {
  Briefcase,
  PlusLg,
  Search,
  PencilSquare,
  Trash,
  ArrowClockwise,
  CheckCircleFill,
  XCircleFill,
  Building,
  Filter,
  X,
  SortAlphaDown,
  SortAlphaUp,
} from 'react-bootstrap-icons';
import departmentService from '../../services/departmentService';
import positionService from '../../services/positionService';
import LoggedInUser from '../../types/LoggedInUser';
import Select from 'react-select';

interface Department {
  DepartmentID: number;
  DepartmentName: string;
}

interface Position {
  id: number;
  positionCode: string;
  positionName: string;
  description: string;
  departmentId: number;
  isActive: boolean;
}

type SortField = 'positionCode' | 'positionName' | 'department' | 'status';
type SortOrder = 'asc' | 'desc';

const ManagePositions: React.FC = () => {
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  const emptyForm: Position = {
    id: 0,
    positionCode: '',
    positionName: '',
    description: '',
    departmentId: 0,
    isActive: true,
  };

  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [validated, setValidated] = useState<boolean>(false);
  const [departmentError, setDepartmentError] = useState<boolean>(false);

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'danger' | 'warning'>('success');

  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [positionFormData, setPositionFormData] = useState<Position>(emptyForm);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('positionName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ================= LOAD =================
  const loadPositions = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await positionService.getPositionsAsync(organizationID);

      const mapped = (Array.isArray(res) ? res : []).map((item: any) => ({
        id: item.PositionID,
        positionCode: item.PositionCode || '',
        positionName: item.PositionTitle || '',
        description: item.Description || '',
        departmentId: item.DepartmentID || 0,
        isActive: Boolean(item.IsActive),
      }));

      setPositions(mapped);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setMessage('Failed to load positions. Please try again.');
      setMessageType('danger');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [organizationID]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await departmentService.getdepartmentesAsync(organizationID);
      setDepartments(res?.Table ?? []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  }, [organizationID]);

  useEffect(() => {
    if (organizationID > 0) {
      loadDepartments();
      loadPositions();
    }
  }, [organizationID, loadDepartments, loadPositions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadDepartments(), loadPositions(true)]);
  };

  // ================= HELPERS =================
  const getDepartmentName = useCallback(
    (departmentId: number): string =>
      departments.find((d) => d.DepartmentID === departmentId)?.DepartmentName || 'Unassigned',
    [departments]
  );

  // Statistics calculation
  const stats = useMemo(() => {
    const total = positions.length;
    const active = positions.filter((p) => p.isActive).length;
    const inactive = total - active;
    const uniqueDepts = new Set(positions.map((p) => p.departmentId).filter(Boolean)).size;
    return { total, active, inactive, uniqueDepts };
  }, [positions]);

  // Filtered & Sorted Positions
  const filteredAndSortedPositions = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    const filtered = positions.filter((p) => {
      const deptName = getDepartmentName(p.departmentId).toLowerCase();
      const matchesSearch =
        !query ||
        p.positionCode.toLowerCase().includes(query) ||
        p.positionName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        deptName.includes(query);

      const matchesDept = filterDepartment === 0 || p.departmentId === filterDepartment;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && p.isActive) ||
        (filterStatus === 'inactive' && !p.isActive);

      return matchesSearch && matchesDept && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'positionCode':
          valA = a.positionCode.toLowerCase();
          valB = b.positionCode.toLowerCase();
          break;
        case 'positionName':
          valA = a.positionName.toLowerCase();
          valB = b.positionName.toLowerCase();
          break;
        case 'department':
          valA = getDepartmentName(a.departmentId).toLowerCase();
          valB = getDepartmentName(b.departmentId).toLowerCase();
          break;
        case 'status':
          valA = a.isActive ? 1 : 0;
          valB = b.isActive ? 1 : 0;
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [positions, searchTerm, filterDepartment, filterStatus, sortField, sortOrder, getDepartmentName]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const hasActiveFilters = Boolean(searchTerm || filterDepartment !== 0 || filterStatus !== 'all');

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment(0);
    setFilterStatus('all');
  };

  // ================= INPUT =================
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setPositionFormData((prev) => ({
        ...prev,
        [id]: target.checked,
      }));
    } else {
      setPositionFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // ================= SAVE =================
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const isDeptValid = positionFormData.departmentId > 0;
    setDepartmentError(!isDeptValid);

    if (!form.checkValidity() || !isDeptValid) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        positionID: positionFormData.id,
        organizationID,
        positionCode: positionFormData.positionCode.trim(),
        positionTitle: positionFormData.positionName.trim(),
        description: positionFormData.description.trim(),
        departmentID: positionFormData.departmentId,
        isActive: positionFormData.isActive,
        createdBy: user?.userID ? String(user.userID) : 'Admin',
      };

      const response = await positionService.createOrUpdatePositionAsync(payload);

      if (response && response.length > 0) {
        const result = response[0];
        setMessage(result.MSG || (editPosition ? 'Position updated successfully.' : 'Position created successfully.'));
        setMessageType(result.value === 1 ? 'success' : 'warning');

        if (result.value === 1) {
          loadPositions(true);
          setShowModal(false);
          setPositionFormData(emptyForm);
          setEditPosition(null);
        }
      } else {
        setMessage('Position saved successfully.');
        setMessageType('success');
        loadPositions(true);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('Failed to save position. Please check your inputs.');
      setMessageType('danger');
    } finally {
      setSaving(false);
      setValidated(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!positionToDelete) return;

    try {
      setIsDeleting(true);
      await positionService.deletePositionAsync(positionToDelete.id);
      setMessage(`Position "${positionToDelete.positionName}" deleted successfully.`);
      setMessageType('success');
      loadPositions(true);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete position. It may be assigned to employees.');
      setMessageType('danger');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
      setPositionToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditPosition(null);
    setPositionFormData(emptyForm);
    setValidated(false);
    setDepartmentError(false);
    setShowModal(true);
  };

  const openEditModal = (p: Position) => {
    setEditPosition(p);
    setPositionFormData(p);
    setValidated(false);
    setDepartmentError(false);
    setShowModal(true);
  };

  const openDeleteModal = (p: Position) => {
    setPositionToDelete(p);
    setConfirmDelete(true);
  };

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      {/* HEADER BAR */}
      <div
        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom"
        id="manage-positions-header"
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-primary"
            style={{
              width: 48,
              height: 48,
              background: 'rgba(13, 110, 253, 0.1)',
            }}
          >
            <Briefcase size={24} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Manage Positions</h4>
            <div className="text-muted small">
              Define and structure job titles, roles, and departmental assignments
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-2 px-3 py-2 fw-medium rounded-3"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            title="Refresh positions list"
            id="refresh-positions-btn"
          >
            <ArrowClockwise className={isRefreshing ? 'spin' : ''} size={16} />
            <span className="d-none d-sm-inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>

          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm rounded-3"
            onClick={openAddModal}
            id="add-position-btn"
          >
            <PlusLg size={16} />
            <span>Add Position</span>
          </Button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <Row className="g-3 mb-4" id="position-stats-cards">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Total Positions</div>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats.total}</h3>
              </div>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center text-primary"
                style={{ background: 'rgba(13, 110, 253, 0.1)', width: 42, height: 42 }}
              >
                <Briefcase size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Active Roles</div>
                <h3 className="fw-bold text-success mb-0 mt-1">{stats.active}</h3>
              </div>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center text-success"
                style={{ background: 'rgba(25, 135, 84, 0.1)', width: 42, height: 42 }}
              >
                <CheckCircleFill size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Inactive Roles</div>
                <h3 className="fw-bold text-secondary mb-0 mt-1">{stats.inactive}</h3>
              </div>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center text-secondary"
                style={{ background: 'rgba(108, 117, 125, 0.1)', width: 42, height: 42 }}
              >
                <XCircleFill size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-medium">Departments</div>
                <h3 className="fw-bold text-info mb-0 mt-1">{stats.uniqueDepts}</h3>
              </div>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center text-info"
                style={{ background: 'rgba(13, 202, 240, 0.1)', width: 42, height: 42 }}
              >
                <Building size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ALERT BANNER */}
      {message && (
        <Alert
          variant={messageType}
          onClose={() => setMessage(null)}
          dismissible
          className="shadow-sm rounded-3 d-flex align-items-center justify-content-between mb-4"
          id="positions-feedback-alert"
        >
          <div className="d-flex align-items-center gap-2">
            {messageType === 'success' ? (
              <CheckCircleFill size={18} className="text-success flex-shrink-0" />
            ) : (
              <XCircleFill size={18} className="text-danger flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        </Alert>
      )}

      {/* FILTER & SEARCH CARD */}
      <Card className="border-0 shadow-sm rounded-3 mb-4 bg-white" id="positions-filter-bar">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            {/* Search Input */}
            <Col xs={12} md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <Search size={15} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by code, title, department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0"
                  id="search-positions-input"
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    className="border-start-0"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <X size={18} />
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Department Filter */}
            <Col xs={12} sm={6} md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light text-muted small">
                  <Building size={14} className="me-1" /> Dept
                </InputGroup.Text>
                <Form.Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(Number(e.target.value))}
                  id="filter-department-select"
                >
                  <option value={0}>All Departments</option>
                  {departments.map((d) => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>
                      {d.DepartmentName}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>

            {/* Status Filter */}
            <Col xs={8} sm={4} md={2}>
              <InputGroup>
                <InputGroup.Text className="bg-light text-muted small">
                  <Filter size={14} className="me-1" /> Status
                </InputGroup.Text>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  id="filter-status-select"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </InputGroup>
            </Col>

            {/* Clear Filters / Count Indicator */}
            <Col xs={4} sm={2} md={2} className="text-end">
              {hasActiveFilters ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearFilters}
                  className="d-inline-flex align-items-center gap-1 w-100 justify-content-center rounded-2 py-2"
                  id="clear-filters-btn"
                >
                  <X size={16} />
                  <span>Reset</span>
                </Button>
              ) : (
                <div className="text-muted small pe-1">
                  {filteredAndSortedPositions.length} role{filteredAndSortedPositions.length === 1 ? '' : 's'}
                </div>
              )}
            </Col>
          </Row>

          {hasActiveFilters && (
            <div className="d-flex align-items-center justify-content-between pt-2 mt-2 border-top small text-muted">
              <span>
                Showing <strong>{filteredAndSortedPositions.length}</strong> of{' '}
                <strong>{positions.length}</strong> total positions
              </span>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* TABLE CARD */}
      <Card className="border-0 shadow-sm rounded-3 bg-white overflow-hidden" id="positions-table-container">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status" />
            <div className="text-muted mt-2 small">Loading positions...</div>
          </div>
        ) : filteredAndSortedPositions.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light text-secondary border-bottom">
                <tr>
                  <th
                    style={{ cursor: 'pointer', width: '15%' }}
                    onClick={() => handleSort('positionCode')}
                    className="py-3 px-3 text-nowrap"
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span>Code</span>
                      {sortField === 'positionCode' &&
                        (sortOrder === 'asc' ? <SortAlphaDown size={14} /> : <SortAlphaUp size={14} />)}
                    </div>
                  </th>
                  <th
                    style={{ cursor: 'pointer', width: '25%' }}
                    onClick={() => handleSort('positionName')}
                    className="py-3 px-3 text-nowrap"
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span>Position Title</span>
                      {sortField === 'positionName' &&
                        (sortOrder === 'asc' ? <SortAlphaDown size={14} /> : <SortAlphaUp size={14} />)}
                    </div>
                  </th>
                  <th
                    style={{ cursor: 'pointer', width: '20%' }}
                    onClick={() => handleSort('department')}
                    className="py-3 px-3 text-nowrap"
                  >
                    <div className="d-flex align-items-center gap-1">
                      <span>Department</span>
                      {sortField === 'department' &&
                        (sortOrder === 'asc' ? <SortAlphaDown size={14} /> : <SortAlphaUp size={14} />)}
                    </div>
                  </th>
                  <th className="py-3 px-3" style={{ width: '25%' }}>
                    Description
                  </th>
                  <th
                    style={{ cursor: 'pointer', width: '10%' }}
                    onClick={() => handleSort('status')}
                    className="py-3 px-3 text-nowrap text-center"
                  >
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <span>Status</span>
                      {sortField === 'status' &&
                        (sortOrder === 'asc' ? <SortAlphaDown size={14} /> : <SortAlphaUp size={14} />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-end" style={{ width: '100px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedPositions.map((p) => (
                  <tr key={p.id} className="transition-all">
                    <td className="px-3">
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        {p.positionCode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3">
                      <div className="fw-semibold text-dark">{p.positionName}</div>
                    </td>
                    <td className="px-3">
                      <div className="d-flex align-items-center gap-1 text-secondary">
                        <Building size={14} className="text-muted flex-shrink-0" />
                        <span className="fw-medium text-truncate" style={{ maxWidth: 200 }}>
                          {getDepartmentName(p.departmentId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3">
                      <div
                        className="text-muted small text-truncate"
                        style={{ maxWidth: 300 }}
                        title={p.description}
                      >
                        {p.description || <span className="fst-italic opacity-50">No description provided</span>}
                      </div>
                    </td>
                    <td className="px-3 text-center">
                      {p.isActive ? (
                        <Badge
                          bg="success"
                          className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1"
                        >
                          <span
                            className="bg-success rounded-circle d-inline-block"
                            style={{ width: 6, height: 6 }}
                          />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          bg="secondary"
                          className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill fw-medium d-inline-flex align-items-center gap-1"
                        >
                          <span
                            className="bg-secondary rounded-circle d-inline-block"
                            style={{ width: 6, height: 6 }}
                          />
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 text-end">
                      <div className="d-inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="d-inline-flex align-items-center justify-content-center p-2 rounded-2"
                          onClick={() => openEditModal(p)}
                          title={`Edit ${p.positionName}`}
                          id={`edit-position-${p.id}`}
                        >
                          <PencilSquare size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="d-inline-flex align-items-center justify-content-center p-2 rounded-2"
                          onClick={() => openDeleteModal(p)}
                          title={`Delete ${p.positionName}`}
                          id={`delete-position-${p.id}`}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5 px-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-muted"
              style={{ width: 64, height: 64, background: 'rgba(0,0,0,0.04)' }}
            >
              <Briefcase size={32} />
            </div>
            {hasActiveFilters ? (
              <>
                <h5 className="fw-semibold text-dark mb-1">No matching positions</h5>
                <p className="text-muted small mb-3">
                  No positions match your current search or filter criteria.
                </p>
                <Button variant="outline-primary" size="sm" onClick={clearFilters}>
                  Clear Search & Filters
                </Button>
              </>
            ) : (
              <>
                <h5 className="fw-semibold text-dark mb-1">No positions defined yet</h5>
                <p className="text-muted small mb-3">
                  Get started by creating your organization's first job position or role.
                </p>
                <Button variant="primary" size="sm" onClick={openAddModal}>
                  <PlusLg size={14} className="me-1" />
                  Add Position
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      {/* ADD / EDIT MODAL */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        backdrop="static"
        id="position-form-modal"
      >
        <Modal.Header closeButton className="border-bottom pb-3">
          <Modal.Title className="d-flex align-items-center gap-2 h5 mb-0 fw-bold">
            <div
              className="rounded-2 p-2 d-flex align-items-center justify-content-center text-primary"
              style={{ background: 'rgba(13, 110, 253, 0.1)' }}
            >
              <Briefcase size={18} />
            </div>
            <span>{editPosition ? 'Update Position' : 'Create New Position'}</span>
          </Modal.Title>
        </Modal.Header>

        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Body className="py-3">
            <Row className="g-3">
              {/* Position Code */}
              <Col md={6}>
                <Form.Group controlId="positionCode">
                  <Form.Label className="fw-semibold small text-secondary">
                    Position Code <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g. ENG-001"
                    value={positionFormData.positionCode}
                    onChange={handleInputChange}
                    className="font-monospace"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a position code.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Position Name */}
              <Col md={6}>
                <Form.Group controlId="positionName">
                  <Form.Label className="fw-semibold small text-secondary">
                    Position Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={positionFormData.positionName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a position title.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Department Selector */}
              <Col xs={12}>
                <Form.Group controlId="departmentSelect">
                  <Form.Label className="fw-semibold small text-secondary">
                    Department <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    placeholder="Select or search department..."
                    options={departments.map((d) => ({
                      value: d.DepartmentID,
                      label: d.DepartmentName,
                    }))}
                    value={
                      positionFormData.departmentId
                        ? {
                            value: positionFormData.departmentId,
                            label: getDepartmentName(positionFormData.departmentId),
                          }
                        : null
                    }
                    onChange={(option: any) => {
                      setPositionFormData((prev) => ({
                        ...prev,
                        departmentId: option?.value || 0,
                      }));
                      if (option?.value) {
                        setDepartmentError(false);
                      }
                    }}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: departmentError
                          ? '#dc3545'
                          : state.isFocused
                          ? '#86b7fe'
                          : '#dee2e6',
                        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
                        borderRadius: 6,
                      }),
                    }}
                  />
                  {departmentError && (
                    <div className="text-danger small mt-1">Please select a department.</div>
                  )}
                </Form.Group>
              </Col>

              {/* Description */}
              <Col xs={12}>
                <Form.Group controlId="description">
                  <Form.Label className="fw-semibold small text-secondary">
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    placeholder="Summarize key responsibilities, qualifications or role scope..."
                    value={positionFormData.description}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a brief description.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Status Switch */}
              <Col xs={12}>
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <div>
                    <div className="fw-semibold small text-dark">Active Status</div>
                    <div className="text-muted small">
                      {positionFormData.isActive
                        ? 'Position is available for assignment to staff.'
                        : 'Position is archived/disabled.'}
                    </div>
                  </div>
                  <Form.Check
                    type="switch"
                    id="isActive"
                    checked={positionFormData.isActive}
                    onChange={handleInputChange}
                    className="fs-5 mb-0"
                  />
                </div>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-top pt-3">
            <Button
              variant="light"
              className="border"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="d-inline-flex align-items-center gap-2 px-4"
              id="submit-position-btn"
            >
              {saving ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editPosition ? 'Update Position' : 'Save Position'}</span>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
        id="delete-position-modal"
      >
        <Modal.Header closeButton className="border-bottom pb-3">
          <Modal.Title className="h5 fw-bold text-danger d-flex align-items-center gap-2">
            <Trash size={18} />
            <span>Confirm Delete</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-2">
            Are you sure you want to delete this position?
          </p>
          {positionToDelete && (
            <div className="p-3 bg-light rounded-3 border">
              <div className="fw-bold text-dark">{positionToDelete.positionName}</div>
              <div className="text-muted small font-monospace">Code: {positionToDelete.positionCode}</div>
              <div className="text-muted small">
                Department: {getDepartmentName(positionToDelete.departmentId)}
              </div>
            </div>
          )}
          <p className="text-danger small mt-3 mb-0">
            Note: If this position is currently assigned to any active employee records, the system may prevent deletion.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          <Button
            variant="light"
            className="border"
            onClick={() => setConfirmDelete(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            className="d-inline-flex align-items-center gap-2"
            id="confirm-delete-btn"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" animation="border" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Position</span>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagePositions;
