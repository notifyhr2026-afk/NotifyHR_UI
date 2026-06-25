import React, { useState, useEffect, useMemo } from "react";
import {
  Accordion,
  Table,
  Form,
  Row,
  Col,
  Button,
  Container,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  BsPlusLg,
  BsPencilSquare,
  BsTrash,
} from "react-icons/bs";
import { toast } from "react-toastify";
import OrgleaveTypesService from "../../services/OrgleaveTypesService";
import leavePolicyService from "../../services/leavePolicyService";
import OrgLeaveType from "../../types/LeaveType";
import LeavePolicy from "../../types/LeavePolicy";
import OrgLeavePolicy from "../../types/OrgLeavePolicy";
import { fireAudit } from "../../utils/auditUtils";
import "../../css/LeavePolicies.css";

const Icon = (Component: any, props: any = {}) => <Component {...props} />;

const emptyPolicyForm = {
  LeaveTypeID: "",
  LeavePolicyID: "",
  TotalAnnualLeaves: "",
  MaxCarryForward: "",
  EffectiveFrom: "",
  EffectiveTo: "",
  Encashable: false,
  AllowNegativeBalance: false,
  IsActive: true,
  CreatedBy: "Admin",
};

const OrganizationLeavePolicies: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;

  const [orgLeaveTypes, setOrgLeaveTypes] = useState<OrgLeaveType[]>([]);
  const [systemLeavePolicies, setSystemLeavePolicies] = useState<LeavePolicy[]>([]);
  const [orgLeavePolicies, setOrgLeavePolicies] = useState<OrgLeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editID, setEditID] = useState<number | null>(null);
  const [policyForm, setPolicyForm] = useState(emptyPolicyForm);
  const [saving, setSaving] = useState(false);

  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [showAllLeaveTypes, setShowAllLeaveTypes] = useState(false);

  const fetchOrgLeavePolicies = async () => {
    if (!organizationID) return;
    const data = await leavePolicyService.getOrgLeavePolicy(organizationID);
    setOrgLeavePolicies(Array.isArray(data) ? data : []);
  };

  const loadAllData = async () => {
    if (!organizationID) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [leaveTypes, orgPolicies, systemPolicies] = await Promise.all([
        OrgleaveTypesService.getOrgLeaveLeaveTypes(organizationID),
        leavePolicyService.getOrgLeavePolicy(organizationID),
        leavePolicyService.getLeavePolicy(),
      ]);

      setOrgLeaveTypes(Array.isArray(leaveTypes) ? leaveTypes : []);
      setOrgLeavePolicies(Array.isArray(orgPolicies) ? orgPolicies : []);
      setSystemLeavePolicies(Array.isArray(systemPolicies) ? systemPolicies : []);
    } catch (error) {
      console.error("Failed to load leave policy data", error);
      toast.error("Failed to load leave policy data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [organizationID]);

  const addedPolicyIds = useMemo(
    () => new Set(orgLeavePolicies.map((p) => p.LeavePolicyID)),
    [orgLeavePolicies]
  );

  const activeLeaveTypeIds = useMemo(
    () => orgLeaveTypes.filter((lt) => lt.IsActive).map((lt) => lt.LeaveTypeID),
    [orgLeaveTypes]
  );

  const availableSystemPolicies = useMemo(() => {
    return systemLeavePolicies.filter((p) => {
      if (addedPolicyIds.has(p.LeavePolicyID)) return false;
      if (filterLeaveType) return p.LeaveTypeID === Number(filterLeaveType);
      return activeLeaveTypeIds.includes(p.LeaveTypeID);
    });
  }, [systemLeavePolicies, addedPolicyIds, filterLeaveType, activeLeaveTypeIds]);

  const handleToggleStatus = async (lt: OrgLeaveType) => {
    if (!organizationID) return;

    const confirmMsg = lt.IsActive
      ? "Are you sure you want to deactivate this leave type?"
      : "Are you sure you want to activate this leave type?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const payload: OrgLeaveType = {
        ...lt,
        OrganizationID: organizationID,
        IsActive: !lt.IsActive,
        CreatedBy: "Admin",
        OrgLeaveTypeID: lt.OrgLeaveTypeID,
      };

      await OrgleaveTypesService.postOrgLeaveTypeByAsync(payload);

      setOrgLeaveTypes((prev) =>
        prev.map((item) =>
          item.OrgLeaveTypeID === lt.OrgLeaveTypeID
            ? { ...item, IsActive: !lt.IsActive }
            : item
        )
      );
      toast.success(`Leave type ${lt.IsActive ? "deactivated" : "activated"}`);
    } catch (error) {
      console.error("Failed to update leave type status", error);
      toast.error("Failed to update leave type status");
    }
  };

  const openAddModal = (row: Partial<OrgLeavePolicy & LeavePolicy>) => {
    setEditID(null);
    setPolicyForm({
      LeaveTypeID: String(row.LeaveTypeID ?? ""),
      LeavePolicyID: String(row.LeavePolicyID ?? ""),
      TotalAnnualLeaves: String(row.TotalAnnualLeaves ?? ""),
      MaxCarryForward: String(row.MaxCarryForward ?? ""),
      EffectiveFrom: row.EffectiveFrom || "",
      EffectiveTo: row.EffectiveTo || "",
      Encashable: row.Encashable ?? false,
      AllowNegativeBalance: row.AllowNegativeBalance ?? false,
      IsActive: row.IsActive ?? true,
      CreatedBy: "Admin",
    });
    setShowModal(true);
  };

  const openEditModal = (row: OrgLeavePolicy) => {
    setEditID(row.OrgLeavePolicyID);
    setPolicyForm({
      LeaveTypeID: String(row.LeaveTypeID),
      LeavePolicyID: String(row.LeavePolicyID),
      TotalAnnualLeaves: String(row.TotalAnnualLeaves ?? ""),
      MaxCarryForward: String(row.MaxCarryForward ?? ""),
      EffectiveFrom: row.EffectiveFrom || "",
      EffectiveTo: row.EffectiveTo || "",
      Encashable: row.Encashable,
      AllowNegativeBalance: row.AllowNegativeBalance,
      IsActive: row.IsActive,
      CreatedBy: "Admin",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditID(null);
    setPolicyForm(emptyPolicyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type } = e.target;
    setPolicyForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSavePolicy = async () => {
    const sysPolicy = systemLeavePolicies.find(
      (p) => p.LeavePolicyID === Number(policyForm.LeavePolicyID)
    );

    if (!sysPolicy) {
      toast.error("Please select a system leave policy");
      return;
    }

    const record = {
      OrganizationID: organizationID,
      OrgLeavePolicyID: editID ?? 0,
      PolicyName: sysPolicy.PolicyName,
      LeaveTypeID: Number(policyForm.LeaveTypeID),
      LeavePolicyID: Number(policyForm.LeavePolicyID),
      TotalAnnualLeaves: policyForm.TotalAnnualLeaves,
      MaxCarryForward: policyForm.MaxCarryForward,
      EffectiveFrom: policyForm.EffectiveFrom || null,
      EffectiveTo: policyForm.EffectiveTo || null,
      Encashable: policyForm.Encashable,
      AllowNegativeBalance: policyForm.AllowNegativeBalance,
      IsActive: policyForm.IsActive,
      CreatedBy: "Admin",
    };

    setSaving(true);
    try {
      await leavePolicyService.PostOrgLeavePolicyByAsync(record);
      await fetchOrgLeavePolicies();

      const oldData = editID
        ? orgLeavePolicies.find((p) => p.OrgLeavePolicyID === editID)
        : null;
      fireAudit(
        editID ? "UPDATE" : "CREATE",
        "OrgLeavePolicy",
        oldData,
        record,
        organizationID || 0,
        "Admin",
        "OrganizationLeavePolicies"
      );

      toast.success(editID ? "Policy updated successfully" : "Policy added successfully");
      closeModal();
    } catch (error) {
      console.error("Error saving leave policy:", error);
      toast.error("Failed to save policy");
    } finally {
      setSaving(false);
    }
  };

  const deletePolicy = async (id: number) => {
    if (!window.confirm("Delete this organization policy?")) return;

    try {
      const oldData = orgLeavePolicies.find((p) => p.OrgLeavePolicyID === id);
      await leavePolicyService.DeleteOrgLeavePolicyByAsync(id);
      await fetchOrgLeavePolicies();

      fireAudit(
        "DELETE",
        "OrgLeavePolicy",
        oldData,
        null,
        organizationID || 0,
        "Admin",
        "OrganizationLeavePolicies"
      );

      toast.success("Policy deleted successfully");
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Failed to delete policy");
    }
  };

  const getLeaveTypeName = (leaveTypeId: number) =>
    orgLeaveTypes.find((t) => t.LeaveTypeID === leaveTypeId)?.LeaveTypeName || "—";

  const BoolBadge: React.FC<{ value: boolean; trueLabel?: string; falseLabel?: string }> = ({
    value,
    trueLabel = "Yes",
    falseLabel = "No",
  }) => (
    <Badge bg={value ? "success" : "secondary"}>{value ? trueLabel : falseLabel}</Badge>
  );

  if (loading) {
    return (
      <Container className="leave-policies-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="me-2" />
          Loading leave policies...
        </div>
      </Container>
    );
  }

  return (
    <Container className="leave-policies-page">
      <div className="leave-policies-header">
        <div>
          <h2>Organization Leave Policies</h2>
          <p className="leave-policies-subtitle">
            Configure leave types and assign system policies to your organization
          </p>
        </div>
      </div>

      <div className="leave-policies-stats">
        <div className="leave-stat-card">
          <div className="leave-stat-label">Leave Types</div>
          <div className="leave-stat-value">{orgLeaveTypes.filter((lt) => lt.IsActive).length}</div>
        </div>
        <div className="leave-stat-card">
          <div className="leave-stat-label">Assigned Policies</div>
          <div className="leave-stat-value">{orgLeavePolicies.length}</div>
        </div>
        <div className="leave-stat-card">
          <div className="leave-stat-label">Available to Add</div>
          <div className="leave-stat-value">{availableSystemPolicies.length}</div>
        </div>
      </div>

      <Accordion defaultActiveKey="1" className="leave-policies-accordion">
        {/* Leave Types */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Leave Types</Accordion.Header>
          <Accordion.Body>
            <div className="leave-section-toolbar">
              <div className="leave-mode-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={showAllLeaveTypes}
                    onChange={(e) => setShowAllLeaveTypes(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontWeight: 500, color: showAllLeaveTypes ? "#28a745" : "#555" }}>
                  {showAllLeaveTypes ? "Manage Mode (All Types)" : "View Mode (Active Only)"}
                </span>
              </div>
            </div>

            <div className="leave-table-card">
              <Table className="table table-hover table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    {showAllLeaveTypes && <th>Status</th>}
                    {showAllLeaveTypes && <th className="text-end">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {orgLeaveTypes.filter((lt) => showAllLeaveTypes || lt.IsActive).length > 0 ? (
                    orgLeaveTypes
                      .filter((lt) => showAllLeaveTypes || lt.IsActive)
                      .map((lt) => (
                        <tr key={lt.LeaveTypeID}>
                          <td className="fw-semibold">{lt.LeaveTypeName}</td>
                          <td>{lt.Description || "—"}</td>
                          {showAllLeaveTypes && (
                            <td>
                              <Badge bg={lt.IsActive ? "success" : "danger"}>
                                {lt.IsActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                          )}
                          {showAllLeaveTypes && (
                            <td className="text-end">
                              <Button
                                size="sm"
                                variant={lt.IsActive ? "outline-danger" : "outline-success"}
                                onClick={() => handleToggleStatus(lt)}
                              >
                                {lt.IsActive ? "Deactivate" : "Activate"}
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={showAllLeaveTypes ? 4 : 2}>
                        <div className="leave-empty-state">No leave types found.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Organization Leave Policies */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Organization Leave Policies</Accordion.Header>
          <Accordion.Body>
            <div className="leave-table-card">
              <Table className="table table-hover table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th>Policy</th>
                    <th>Leave Type</th>
                    <th>Total</th>
                    <th>Carry Forward</th>
                    <th>Effective From</th>
                    <th>Effective To</th>
                    <th>Encash</th>
                    <th>-Ve Balance</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgLeavePolicies.length > 0 ? (
                    orgLeavePolicies.map((p) => (
                      <tr key={p.OrgLeavePolicyID}>
                        <td className="fw-semibold">{p.PolicyName}</td>
                        <td>{getLeaveTypeName(Number(p.LeaveTypeID))}</td>
                        <td>{p.TotalAnnualLeaves ?? "—"}</td>
                        <td>{p.MaxCarryForward ?? "—"}</td>
                        <td>{p.EffectiveFrom?.slice(0, 10) || "—"}</td>
                        <td>{p.EffectiveTo?.slice(0, 10) || "—"}</td>
                        <td><BoolBadge value={p.Encashable} /></td>
                        <td><BoolBadge value={p.AllowNegativeBalance} /></td>
                        <td>
                          <Badge bg={p.IsActive ? "success" : "danger"}>
                            {p.IsActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => openEditModal(p)}
                          >
                            {Icon(BsPencilSquare)}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deletePolicy(p.OrgLeavePolicyID)}
                          >
                            {Icon(BsTrash)}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10}>
                        <div className="leave-empty-state">
                          No policies assigned yet. Add policies from the section below.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Manage Leave Policies - only policies NOT yet added */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Manage Leave Policies</Accordion.Header>
          <Accordion.Body>
            <div className="leave-section-toolbar">
              <div className="leave-filter-field">
                <Form.Label className="small fw-semibold mb-1">Filter by Leave Type</Form.Label>
                <Form.Select
                  value={filterLeaveType}
                  onChange={(e) => setFilterLeaveType(e.target.value)}
                >
                  <option value="">All active leave types</option>
                  {orgLeaveTypes
                    .filter((lt) => lt.IsActive)
                    .map((lt) => (
                      <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                        {lt.LeaveTypeName}
                      </option>
                    ))}
                </Form.Select>
              </div>
              <Badge bg="info" className="align-self-end">
                {availableSystemPolicies.length} available
              </Badge>
            </div>

            <div className="leave-table-card">
              <Table className="table table-hover table-dark-custom mb-0">
                <thead>
                  <tr>
                    <th>Policy</th>
                    <th>Leave Type</th>
                    <th>Total</th>
                    <th>Carry Forward</th>
                    <th>Encash</th>
                    <th>-Ve Balance</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSystemPolicies.length > 0 ? (
                    availableSystemPolicies.map((p) => (
                      <tr key={p.LeavePolicyID}>
                        <td className="fw-semibold">{p.PolicyName}</td>
                        <td>{p.LeaveTypeName}</td>
                        <td>{p.TotalAnnualLeaves}</td>
                        <td>{p.MaxCarryForward}</td>
                        <td><BoolBadge value={p.Encashable} /></td>
                        <td><BoolBadge value={p.AllowNegativeBalance} /></td>
                        <td>
                          <Badge bg={p.IsActive ? "success" : "danger"}>
                            {p.IsActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openAddModal(p)}
                          >
                            {Icon(BsPlusLg, { className: "me-1" })}
                            Add Policy
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="leave-empty-state">
                          {addedPolicyIds.size > 0
                            ? "All available policies have been added to your organization."
                            : "No system policies available for your active leave types."}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Policy Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editID ? "Edit Organization Policy" : "Add Organization Policy"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="app-form-section">
              <div className="app-form-section-title">Policy Details</div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Leave Type</Form.Label>
                  <Form.Select
                    name="LeaveTypeID"
                    value={policyForm.LeaveTypeID}
                    onChange={handleFormChange}
                    disabled
                  >
                    <option value="">Select Leave Type</option>
                    {orgLeaveTypes
                      .filter((lt) => lt.IsActive)
                      .map((lt) => (
                        <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                          {lt.LeaveTypeName}
                        </option>
                      ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>System Leave Policy</Form.Label>
                  <Form.Select
                    name="LeavePolicyID"
                    value={policyForm.LeavePolicyID}
                    onChange={handleFormChange}
                    disabled
                  >
                    <option value="">Select System Policy</option>
                    {systemLeavePolicies.map((p) => (
                      <option key={p.LeavePolicyID} value={p.LeavePolicyID}>
                        {p.PolicyName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </div>

            <div className="app-form-section">
              <div className="app-form-section-title">Leave Limits</div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Total Annual Leaves</Form.Label>
                  <Form.Control
                    type="number"
                    name="TotalAnnualLeaves"
                    value={policyForm.TotalAnnualLeaves}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Max Carry Forward</Form.Label>
                  <Form.Control
                    type="number"
                    name="MaxCarryForward"
                    value={policyForm.MaxCarryForward}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Effective From</Form.Label>
                  <Form.Control
                    type="date"
                    name="EffectiveFrom"
                    value={policyForm.EffectiveFrom}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Effective To</Form.Label>
                  <Form.Control
                    type="date"
                    name="EffectiveTo"
                    value={policyForm.EffectiveTo}
                    onChange={handleFormChange}
                  />
                </Col>
              </Row>
            </div>

            <div className="app-form-section">
              <div className="app-form-section-title">Options</div>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    label="Encashable"
                    name="Encashable"
                    checked={policyForm.Encashable}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    label="Allow Negative Balance"
                    name="AllowNegativeBalance"
                    checked={policyForm.AllowNegativeBalance}
                    onChange={handleFormChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    label="Active"
                    name="IsActive"
                    checked={policyForm.IsActive}
                    onChange={handleFormChange}
                  />
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSavePolicy} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : editID ? (
              "Update Policy"
            ) : (
              "Save Policy"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrganizationLeavePolicies;
