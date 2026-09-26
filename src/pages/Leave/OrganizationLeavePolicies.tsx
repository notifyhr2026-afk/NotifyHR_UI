import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  PlusLg as BsPlusLg,
  PencilSquare as BsPencilSquare,
  Trash as BsTrash,
  Search as BsSearch,
  Sliders as BsSliders,
  ShieldCheck as BsShieldCheck,
  CalendarCheck as BsCalendarCheck,
  CalendarRange as BsCalendarRange,
  CashStack as BsCashStack,
  ArrowClockwise as BsArrowClockwise,
  Layers as BsLayers,
  Tags as BsTags,
  Eye as BsEye,
  CheckCircleFill as BsCheckCircleFill,
  XCircleFill as BsXCircleFill,
  X as BsX,
  Check2 as BsCheck2,
  InfoCircle as BsInfoCircle,
  ArrowRight as BsArrowRight,
  Building as BsBuilding,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import OrgleaveTypesService from "../../services/OrgleaveTypesService";
import leavePolicyService from "../../services/leavePolicyService";
import OrgLeaveType from "../../types/LeaveType";
import LeavePolicy from "../../types/LeavePolicy";
import OrgLeavePolicy from "../../types/OrgLeavePolicy";
import { fireAudit } from "../../utils/auditUtils";
import "../../css/LeavePolicies.css";

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

  // Data states
  const [orgLeaveTypes, setOrgLeaveTypes] = useState<OrgLeaveType[]>([]);
  const [systemLeavePolicies, setSystemLeavePolicies] = useState<LeavePolicy[]>([]);
  const [orgLeavePolicies, setOrgLeavePolicies] = useState<OrgLeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<"assigned" | "available" | "types">("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterRule, setFilterRule] = useState<"all" | "encashable" | "negativeBalance" | "carryForward">("all");
  const [showAllLeaveTypes, setShowAllLeaveTypes] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editID, setEditID] = useState<number | null>(null);
  const [policyForm, setPolicyForm] = useState(emptyPolicyForm);
  const [saving, setSaving] = useState(false);

  // Detail view modal
  const [previewPolicy, setPreviewPolicy] = useState<OrgLeavePolicy | null>(null);

  const fetchOrgLeavePolicies = async () => {
    if (!organizationID) return;
    const data = await leavePolicyService.getOrgLeavePolicy(organizationID);
    setOrgLeavePolicies(Array.isArray(data) ? data : []);
  };

  const loadAllData = async (isManualRefresh = false) => {
    if (!organizationID) {
      setLoading(false);
      return;
    }

    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);

      const [leaveTypes, orgPolicies, systemPolicies] = await Promise.all([
        OrgleaveTypesService.getOrgLeaveLeaveTypes(organizationID),
        leavePolicyService.getOrgLeavePolicy(organizationID),
        leavePolicyService.getLeavePolicy(),
      ]);

      setOrgLeaveTypes(Array.isArray(leaveTypes) ? leaveTypes : []);
      setOrgLeavePolicies(Array.isArray(orgPolicies) ? orgPolicies : []);
      setSystemLeavePolicies(Array.isArray(systemPolicies) ? systemPolicies : []);

      if (isManualRefresh) {
        toast.success("Leave policy data refreshed successfully");
      }
    } catch (error) {
      console.error("Failed to load leave policy data", error);
      toast.error("Failed to load leave policy data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  // Unassigned system policies available for active leave types
  const availableSystemPolicies = useMemo(() => {
    return systemLeavePolicies.filter((p) => {
      if (addedPolicyIds.has(p.LeavePolicyID)) return false;
      if (filterLeaveType) return p.LeaveTypeID === Number(filterLeaveType);
      return activeLeaveTypeIds.includes(p.LeaveTypeID);
    });
  }, [systemLeavePolicies, addedPolicyIds, filterLeaveType, activeLeaveTypeIds]);

  // Helpers
  const getLeaveTypeName = (leaveTypeId: number | Number) => {
    const numericId = Number(leaveTypeId);
    return orgLeaveTypes.find((t) => t.LeaveTypeID === numericId)?.LeaveTypeName || "—";
  };

  // Filtered assigned policies
  const filteredOrgPolicies = useMemo(() => {
    return orgLeavePolicies.filter((p) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const typeName = getLeaveTypeName(p.LeaveTypeID).toLowerCase();
        const policyName = (p.PolicyName || "").toLowerCase();
        const match = policyName.includes(q) || typeName.includes(q);
        if (!match) return false;
      }

      // Leave type filter
      if (filterLeaveType && Number(p.LeaveTypeID) !== Number(filterLeaveType)) {
        return false;
      }

      // Status filter
      if (filterStatus === "active" && !p.IsActive) return false;
      if (filterStatus === "inactive" && p.IsActive) return false;

      // Rule filter
      if (filterRule === "encashable" && !p.Encashable) return false;
      if (filterRule === "negativeBalance" && !p.AllowNegativeBalance) return false;
      if (filterRule === "carryForward" && (!p.MaxCarryForward || p.MaxCarryForward <= 0)) return false;

      return true;
    });
  }, [orgLeavePolicies, searchQuery, filterLeaveType, filterStatus, filterRule, orgLeaveTypes]);

  // Filtered available policies
  const filteredAvailablePolicies = useMemo(() => {
    return availableSystemPolicies.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const typeName = (p.LeaveTypeName || "").toLowerCase();
        const policyName = (p.PolicyName || "").toLowerCase();
        if (!policyName.includes(q) && !typeName.includes(q)) return false;
      }
      return true;
    });
  }, [availableSystemPolicies, searchQuery]);

  // Filtered leave types
  const filteredLeaveTypes = useMemo(() => {
    return orgLeaveTypes.filter((lt) => {
      if (!showAllLeaveTypes && !lt.IsActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (lt.LeaveTypeName || "").toLowerCase();
        const desc = (lt.Description || "").toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
  }, [orgLeaveTypes, showAllLeaveTypes, searchQuery]);

  // KPI calculations
  const flexibleRulesCount = useMemo(() => {
    return orgLeavePolicies.filter(
      (p) => p.Encashable || p.AllowNegativeBalance || (p.MaxCarryForward && p.MaxCarryForward > 0)
    ).length;
  }, [orgLeavePolicies]);

  // Actions
  const handleToggleStatus = async (lt: OrgLeaveType) => {
    if (!organizationID) return;

    const actionText = lt.IsActive ? "deactivate" : "activate";
    const result = await Swal.fire({
      title: `${lt.IsActive ? "Deactivate" : "Activate"} Leave Type?`,
      text: `Are you sure you want to ${actionText} "${lt.LeaveTypeName}"? Policies associated with inactive leave types cannot be assigned.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: lt.IsActive ? "#ef4444" : "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

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
      toast.success(`Leave type "${lt.LeaveTypeName}" ${lt.IsActive ? "deactivated" : "activated"}`);
    } catch (error) {
      console.error("Failed to update leave type status", error);
      toast.error("Failed to update leave type status");
    }
  };

  const openAddModal = (row?: Partial<OrgLeavePolicy & LeavePolicy>) => {
    setEditID(null);
    if (row) {
      setPolicyForm({
        LeaveTypeID: String(row.LeaveTypeID ?? ""),
        LeavePolicyID: String(row.LeavePolicyID ?? ""),
        TotalAnnualLeaves: String(row.TotalAnnualLeaves ?? "12"),
        MaxCarryForward: String(row.MaxCarryForward ?? "0"),
        EffectiveFrom: row.EffectiveFrom || new Date().toISOString().slice(0, 10),
        EffectiveTo: row.EffectiveTo || "",
        Encashable: row.Encashable ?? false,
        AllowNegativeBalance: row.AllowNegativeBalance ?? false,
        IsActive: row.IsActive ?? true,
        CreatedBy: "Admin",
      });
    } else {
      // Default empty
      const firstAvailable = availableSystemPolicies[0];
      setPolicyForm({
        ...emptyPolicyForm,
        LeaveTypeID: firstAvailable ? String(firstAvailable.LeaveTypeID) : "",
        LeavePolicyID: firstAvailable ? String(firstAvailable.LeavePolicyID) : "",
        TotalAnnualLeaves: firstAvailable ? String(firstAvailable.TotalAnnualLeaves) : "12",
        MaxCarryForward: firstAvailable ? String(firstAvailable.MaxCarryForward) : "0",
        EffectiveFrom: new Date().toISOString().slice(0, 10),
      });
    }
    setShowModal(true);
  };

  const openEditModal = (row: OrgLeavePolicy) => {
    setEditID(row.OrgLeavePolicyID);
    setPolicyForm({
      LeaveTypeID: String(row.LeaveTypeID),
      LeavePolicyID: String(row.LeavePolicyID),
      TotalAnnualLeaves: String(row.TotalAnnualLeaves ?? ""),
      MaxCarryForward: String(row.MaxCarryForward ?? ""),
      EffectiveFrom: row.EffectiveFrom ? row.EffectiveFrom.slice(0, 10) : "",
      EffectiveTo: row.EffectiveTo ? row.EffectiveTo.slice(0, 10) : "",
      Encashable: row.Encashable ?? false,
      AllowNegativeBalance: row.AllowNegativeBalance ?? false,
      IsActive: row.IsActive ?? true,
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

    if (!policyForm.TotalAnnualLeaves || Number(policyForm.TotalAnnualLeaves) < 0) {
      toast.error("Please provide valid annual leave days (0 or greater)");
      return;
    }

    const record = {
      OrganizationID: organizationID,
      OrgLeavePolicyID: editID ?? 0,
      PolicyName: sysPolicy.PolicyName,
      LeaveTypeID: Number(policyForm.LeaveTypeID),
      LeavePolicyID: Number(policyForm.LeavePolicyID),
      TotalAnnualLeaves: Number(policyForm.TotalAnnualLeaves),
      MaxCarryForward: Number(policyForm.MaxCarryForward || 0),
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

      toast.success(editID ? "Policy updated successfully" : "Policy assigned successfully");
      closeModal();
    } catch (error) {
      console.error("Error saving leave policy:", error);
      toast.error("Failed to save policy");
    } finally {
      setSaving(false);
    }
  };

  const deletePolicy = async (id: number) => {
    const policyToDelete = orgLeavePolicies.find((p) => p.OrgLeavePolicyID === id);
    const policyName = policyToDelete?.PolicyName || "this policy";

    const result = await Swal.fire({
      title: "Remove Policy from Organization?",
      text: `Are you sure you want to remove "${policyName}"? Employees will no longer receive allowances under this policy.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Remove Policy",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

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

      toast.success("Policy removed successfully");
    } catch (error) {
      console.error("Error deleting policy:", error);
      toast.error("Failed to delete policy");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterLeaveType("");
    setFilterStatus("all");
    setFilterRule("all");
  };

  const hasActiveFilters = searchQuery !== "" || filterLeaveType !== "" || filterStatus !== "all" || filterRule !== "all";

  if (loading) {
    return (
      <Container className="leave-policies-page">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5 className="text-muted fw-semibold">Loading leave policies and configuration...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="leave-policies-page">
      {/* Executive Header */}
      <div className="leave-policies-header-container">
        <div className="leave-policies-title-group">
          <h2>
            <BsShieldCheck className="header-icon" />
            Leave Policies & Entitlements
          </h2>
          <p className="leave-policies-subtitle">
            Configure organization-wide annual leave rules, carry-forward caps, encashment, and leave types.
          </p>
        </div>

        <div className="leave-header-actions">
          <Button
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-2 bg-white"
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
          >
            <BsArrowClockwise className={isRefreshing ? "spin-icon" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
            onClick={() => {
              if (availableSystemPolicies.length > 0) {
                openAddModal(availableSystemPolicies[0]);
              } else {
                openAddModal();
              }
            }}
          >
            <BsPlusLg />
            Assign New Policy
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="leave-kpi-grid">
        <div className="leave-kpi-card">
          <div className="leave-kpi-info">
            <span className="leave-kpi-label">Assigned Policies</span>
            <span className="leave-kpi-value">{orgLeavePolicies.length}</span>
            <span className="leave-kpi-hint">
              <BsBuilding />
              Active in organization
            </span>
          </div>
          <div className="leave-kpi-icon-box kpi-indigo">
            <BsShieldCheck />
          </div>
        </div>

        <div className="leave-kpi-card">
          <div className="leave-kpi-info">
            <span className="leave-kpi-label">Active Leave Types</span>
            <span className="leave-kpi-value">
              {orgLeaveTypes.filter((lt) => lt.IsActive).length}
            </span>
            <span className="leave-kpi-hint">
              <BsTags />
              Configured categories
            </span>
          </div>
          <div className="leave-kpi-icon-box kpi-teal">
            <BsTags />
          </div>
        </div>

        <div className="leave-kpi-card">
          <div className="leave-kpi-info">
            <span className="leave-kpi-label">Available Templates</span>
            <span className="leave-kpi-value">{availableSystemPolicies.length}</span>
            <span className="leave-kpi-hint">
              <BsLayers />
              Ready to assign
            </span>
          </div>
          <div className="leave-kpi-icon-box kpi-amber">
            <BsLayers />
          </div>
        </div>

        <div className="leave-kpi-card">
          <div className="leave-kpi-info">
            <span className="leave-kpi-label">Flexible Rules</span>
            <span className="leave-kpi-value">{flexibleRulesCount}</span>
            <span className="leave-kpi-hint">
              <BsCashStack />
              Encash / Carry-forward
            </span>
          </div>
          <div className="leave-kpi-icon-box kpi-emerald">
            <BsCashStack />
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="leave-tabs-container">
        <button
          type="button"
          className={`leave-tab-button ${activeTab === "assigned" ? "active" : ""}`}
          onClick={() => setActiveTab("assigned")}
        >
          <BsShieldCheck />
          Assigned Policies
          <span className="leave-tab-badge">{orgLeavePolicies.length}</span>
        </button>

        <button
          type="button"
          className={`leave-tab-button ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          <BsLayers />
          Available System Templates
          <span className="leave-tab-badge">{availableSystemPolicies.length}</span>
        </button>

        <button
          type="button"
          className={`leave-tab-button ${activeTab === "types" ? "active" : ""}`}
          onClick={() => setActiveTab("types")}
        >
          <BsTags />
          Leave Types Directory
          <span className="leave-tab-badge">
            {orgLeaveTypes.filter((lt) => lt.IsActive).length} / {orgLeaveTypes.length}
          </span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="leave-toolbar-card">
        <div className="leave-search-group">
          <BsSearch className="leave-search-icon" />
          <input
            type="text"
            className="leave-search-input"
            placeholder={
              activeTab === "types"
                ? "Search leave types or descriptions..."
                : "Search by policy name, leave type, or ID..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="leave-search-clear"
              onClick={() => setSearchQuery("")}
            >
              <BsX />
            </button>
          )}
        </div>

        <div className="leave-filters-group">
          {activeTab !== "types" && (
            <>
              <select
                className="leave-filter-select"
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                <option value="">All Leave Types</option>
                {orgLeaveTypes
                  .filter((lt) => lt.IsActive)
                  .map((lt) => (
                    <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                      {lt.LeaveTypeName}
                    </option>
                  ))}
              </select>

              {activeTab === "assigned" && (
                <>
                  <select
                    className="leave-filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">Status: All</option>
                    <option value="active">Status: Active Only</option>
                    <option value="inactive">Status: Inactive Only</option>
                  </select>

                  <select
                    className="leave-filter-select"
                    value={filterRule}
                    onChange={(e) => setFilterRule(e.target.value as any)}
                  >
                    <option value="all">Rules: All</option>
                    <option value="encashable">Encashable Allowed</option>
                    <option value="carryForward">Carry Forward &gt; 0</option>
                    <option value="negativeBalance">Negative Balance Allowed</option>
                  </select>
                </>
              )}
            </>
          )}

          {activeTab === "types" && (
            <div className="d-flex align-items-center gap-2">
              <Form.Check
                type="switch"
                id="leave-type-mode-switch"
                label="Show Inactive Types"
                checked={showAllLeaveTypes}
                onChange={(e) => setShowAllLeaveTypes(e.target.checked)}
                className="user-select-none fw-semibold text-secondary"
              />
            </div>
          )}

          {hasActiveFilters && (
            <Button
              variant="link"
              className="text-decoration-none text-danger p-0 fw-semibold"
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Assigned Policies */}
      {activeTab === "assigned" && (
        <div className="leave-content-card">
          <div className="leave-content-card-header">
            <h3 className="leave-content-card-title">
              <BsShieldCheck className="text-primary" />
              Assigned Organization Leave Policies
            </h3>
            <span className="text-muted small">
              Showing {filteredOrgPolicies.length} of {orgLeavePolicies.length} policies
            </span>
          </div>

          <div className="table-responsive">
            <Table className="leave-modern-table mb-0">
              <thead>
                <tr>
                  <th>Policy Name</th>
                  <th>Leave Type</th>
                  <th>Annual Entitlement</th>
                  <th>Max Carry Forward</th>
                  <th>Effective Validity</th>
                  <th>Encashable</th>
                  <th>Negative Balance</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgPolicies.length > 0 ? (
                  filteredOrgPolicies.map((p) => (
                    <tr key={p.OrgLeavePolicyID}>
                      <td>
                        <div className="policy-name-cell">
                          <span className="policy-primary-name">{p.PolicyName}</span>
                          <span className="policy-meta-id">ID: #{p.OrgLeavePolicyID}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-leave-type">
                          <BsTags />
                          {getLeaveTypeName(p.LeaveTypeID)}
                        </span>
                      </td>
                      <td>
                        <span className="allowance-pill highlight">
                          {p.TotalAnnualLeaves ?? 0} days / yr
                        </span>
                      </td>
                      <td>
                        <span className="allowance-pill">
                          {p.MaxCarryForward && p.MaxCarryForward > 0
                            ? `Max ${p.MaxCarryForward} days`
                            : "None"}
                        </span>
                      </td>
                      <td>
                        <span className="date-range-badge">
                          <BsCalendarRange />
                          {p.EffectiveFrom ? p.EffectiveFrom.slice(0, 10) : "Immediate"}
                          {" → "}
                          {p.EffectiveTo ? p.EffectiveTo.slice(0, 10) : "No expiry"}
                        </span>
                      </td>
                      <td>
                        <span className={`rule-check-tag ${p.Encashable ? "allowed" : "disallowed"}`}>
                          {p.Encashable ? <BsCheck2 /> : <BsX />}
                          {p.Encashable ? "Allowed" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`rule-check-tag ${
                            p.AllowNegativeBalance ? "allowed" : "disallowed"
                          }`}
                        >
                          {p.AllowNegativeBalance ? <BsCheck2 /> : <BsX />}
                          {p.AllowNegativeBalance ? "Allowed" : "No"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${p.IsActive ? "active" : "inactive"}`}>
                          <span className="status-dot" />
                          {p.IsActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-group">
                          <button
                            type="button"
                            className="btn-action-icon btn-view"
                            title="View Policy Summary"
                            onClick={() => setPreviewPolicy(p)}
                          >
                            <BsEye />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon btn-edit"
                            title="Edit Policy"
                            onClick={() => openEditModal(p)}
                          >
                            <BsPencilSquare />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon btn-delete"
                            title="Remove Policy"
                            onClick={() => deletePolicy(p.OrgLeavePolicyID)}
                          >
                            <BsTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="leave-empty-state-box">
                        <div className="empty-state-icon">
                          <BsShieldCheck />
                        </div>
                        <h4 className="empty-state-title">
                          {hasActiveFilters ? "No matching leave policies found" : "No leave policies assigned yet"}
                        </h4>
                        <p className="empty-state-text">
                          {hasActiveFilters
                            ? "Try adjusting your search keywords or clearing active filters to see more policies."
                            : "Your organization does not have any policies assigned. Browse the available system templates to get started quickly."}
                        </p>
                        {hasActiveFilters ? (
                          <Button variant="outline-primary" onClick={resetFilters}>
                            Clear Filters
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() => setActiveTab("available")}
                            className="d-inline-flex align-items-center gap-2"
                            style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
                          >
                            <BsLayers />
                            Browse Available System Templates
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab 2: Available System Templates */}
      {activeTab === "available" && (
        <div className="leave-content-card">
          <div className="leave-content-card-header">
            <h3 className="leave-content-card-title">
              <BsLayers className="text-warning" />
              Available System Leave Policy Templates
            </h3>
            <span className="text-muted small">
              {filteredAvailablePolicies.length} templates available to adopt
            </span>
          </div>

          {filteredAvailablePolicies.length > 0 ? (
            <div className="template-cards-grid">
              {filteredAvailablePolicies.map((p) => (
                <div key={p.LeavePolicyID} className="template-card">
                  <div>
                    <div className="template-card-header">
                      <h4 className="template-card-title">{p.PolicyName}</h4>
                      <span className="badge-leave-type">
                        <BsTags />
                        {p.LeaveTypeName}
                      </span>
                    </div>

                    <div className="template-card-stats">
                      <div className="template-stat-item">
                        <span className="template-stat-label">Annual Entitlement</span>
                        <span className="template-stat-value">{p.TotalAnnualLeaves} Days</span>
                      </div>
                      <div className="template-stat-item">
                        <span className="template-stat-label">Max Carry Forward</span>
                        <span className="template-stat-value">
                          {p.MaxCarryForward > 0 ? `${p.MaxCarryForward} Days` : "0 Days"}
                        </span>
                      </div>
                    </div>

                    <div className="template-card-rules">
                      <span className={`rule-check-tag ${p.Encashable ? "allowed" : "disallowed"}`}>
                        {p.Encashable ? <BsCheck2 /> : <BsX />}
                        Encashable: {p.Encashable ? "Yes" : "No"}
                      </span>
                      <span
                        className={`rule-check-tag ${
                          p.AllowNegativeBalance ? "allowed" : "disallowed"
                        }`}
                      >
                        {p.AllowNegativeBalance ? <BsCheck2 /> : <BsX />}
                        Negative Bal: {p.AllowNegativeBalance ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-100 d-inline-flex align-items-center justify-content-center gap-2 mt-2"
                    style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
                    onClick={() => openAddModal(p)}
                  >
                    <BsPlusLg />
                    Assign to Organization
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="leave-empty-state-box">
              <div className="empty-state-icon">
                <BsCheckCircleFill className="text-success" />
              </div>
              <h4 className="empty-state-title">
                {searchQuery ? "No templates match your search" : "All Available Templates Assigned"}
              </h4>
              <p className="empty-state-text">
                {searchQuery
                  ? "Try searching for a different leave policy or clear your query."
                  : "Every system template for your active leave types is currently assigned to your organization."}
              </p>
              {searchQuery && (
                <Button variant="outline-primary" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Leave Types Directory */}
      {activeTab === "types" && (
        <div className="leave-content-card">
          <div className="leave-content-card-header">
            <h3 className="leave-content-card-title">
              <BsTags className="text-info" />
              Organization Leave Types Directory
            </h3>
            <span className="text-muted small">
              Showing {filteredLeaveTypes.length} types
            </span>
          </div>

          <div className="table-responsive">
            <Table className="leave-modern-table mb-0">
              <thead>
                <tr>
                  <th>Leave Type Name</th>
                  <th>Gender Applicability</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaveTypes.length > 0 ? (
                  filteredLeaveTypes.map((lt) => {
                    const genderLower = (lt.GenderType || "").toLowerCase();
                    const genderClass = genderLower.includes("female")
                      ? "gender-female"
                      : genderLower.includes("male")
                      ? "gender-male"
                      : "gender-all";

                    return (
                      <tr key={lt.OrgLeaveTypeID}>
                        <td className="fw-semibold text-dark">{lt.LeaveTypeName}</td>
                        <td>
                          <span className={`badge-gender ${genderClass}`}>
                            {lt.GenderType || "All Employees"}
                          </span>
                        </td>
                        <td className="text-secondary">{lt.Description || "—"}</td>
                        <td>
                          <span className={`status-pill ${lt.IsActive ? "active" : "inactive"}`}>
                            <span className="status-dot" />
                            {lt.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant={lt.IsActive ? "outline-danger" : "outline-success"}
                            className="fw-semibold"
                            onClick={() => handleToggleStatus(lt)}
                          >
                            {lt.IsActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="leave-empty-state-box">
                        <div className="empty-state-icon">
                          <BsTags />
                        </div>
                        <h4 className="empty-state-title">No leave types found</h4>
                        <p className="empty-state-text">
                          {searchQuery
                            ? "No leave types matched your search term."
                            : "Turn on 'Show Inactive Types' to see inactive categories."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* Add / Edit Policy Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered className="leave-modal">
        <Modal.Header closeButton className="leave-modal-header">
          <Modal.Title className="leave-modal-title">
            <BsShieldCheck className="leave-modal-title-icon" />
            {editID ? "Edit Organization Policy" : "Assign Leave Policy"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            {/* Section 1: Template Selection */}
            <div className="modal-section-card">
              <div className="modal-section-header">
                <BsBuilding />
                Policy Identity & Category
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="form-label-custom">Leave Type</Form.Label>
                  <Form.Select
                    name="LeaveTypeID"
                    value={policyForm.LeaveTypeID}
                    onChange={handleFormChange}
                    disabled
                    className="form-control-custom"
                  >
                    <option value="">Select Leave Type</option>
                    {orgLeaveTypes.map((lt) => (
                      <option key={lt.LeaveTypeID} value={lt.LeaveTypeID}>
                        {lt.LeaveTypeName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label className="form-label-custom">System Template</Form.Label>
                  <Form.Select
                    name="LeavePolicyID"
                    value={policyForm.LeavePolicyID}
                    onChange={handleFormChange}
                    disabled
                    className="form-control-custom"
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

            {/* Section 2: Entitlements & Limits */}
            <div className="modal-section-card">
              <div className="modal-section-header">
                <BsCalendarCheck />
                Leave Allowances & Caps
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="form-label-custom">
                    Total Annual Leaves (Days) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.5"
                    name="TotalAnnualLeaves"
                    value={policyForm.TotalAnnualLeaves}
                    onChange={handleFormChange}
                    placeholder="e.g. 14"
                    className="form-control-custom"
                  />
                  <Form.Text className="text-muted small">
                    Annual days credited to eligible employees.
                  </Form.Text>
                </Col>

                <Col md={6}>
                  <Form.Label className="form-label-custom">
                    Max Carry Forward (Days)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1"
                    name="MaxCarryForward"
                    value={policyForm.MaxCarryForward}
                    onChange={handleFormChange}
                    placeholder="e.g. 5 (0 for none)"
                    className="form-control-custom"
                  />
                  <Form.Text className="text-muted small">
                    Maximum unused days that roll over to next year.
                  </Form.Text>
                </Col>
              </Row>
            </div>

            {/* Section 3: Validity Schedule */}
            <div className="modal-section-card">
              <div className="modal-section-header">
                <BsCalendarRange />
                Policy Validity Period
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="form-label-custom">Effective From</Form.Label>
                  <Form.Control
                    type="date"
                    name="EffectiveFrom"
                    value={policyForm.EffectiveFrom}
                    onChange={handleFormChange}
                    className="form-control-custom"
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="form-label-custom">Effective To (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    name="EffectiveTo"
                    value={policyForm.EffectiveTo}
                    onChange={handleFormChange}
                    className="form-control-custom"
                  />
                </Col>
              </Row>
            </div>

            {/* Section 4: Rules & Flags */}
            <div className="modal-section-card">
              <div className="modal-section-header">
                <BsSliders />
                Rules & Employee Permissions
              </div>
              <Row className="g-3">
                <Col md={4}>
                  <div
                    className={`toggle-option-card ${policyForm.Encashable ? "checked" : ""}`}
                    onClick={() =>
                      setPolicyForm((prev) => ({ ...prev, Encashable: !prev.Encashable }))
                    }
                  >
                    <div>
                      <div className="toggle-option-title">Encashable</div>
                      <div className="toggle-option-desc">Allow payout for unused leaves</div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="encashable-switch"
                      checked={policyForm.Encashable}
                      onChange={() => {}}
                    />
                  </div>
                </Col>

                <Col md={4}>
                  <div
                    className={`toggle-option-card ${
                      policyForm.AllowNegativeBalance ? "checked" : ""
                    }`}
                    onClick={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        AllowNegativeBalance: !prev.AllowNegativeBalance,
                      }))
                    }
                  >
                    <div>
                      <div className="toggle-option-title">Negative Balance</div>
                      <div className="toggle-option-desc">Allow advance leave overdraft</div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="negative-bal-switch"
                      checked={policyForm.AllowNegativeBalance}
                      onChange={() => {}}
                    />
                  </div>
                </Col>

                <Col md={4}>
                  <div
                    className={`toggle-option-card ${policyForm.IsActive ? "checked" : ""}`}
                    onClick={() =>
                      setPolicyForm((prev) => ({ ...prev, IsActive: !prev.IsActive }))
                    }
                  >
                    <div>
                      <div className="toggle-option-title">Policy Status</div>
                      <div className="toggle-option-desc">Active and available to staff</div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="active-policy-switch"
                      checked={policyForm.IsActive}
                      onChange={() => {}}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="px-4 py-3 bg-light border-top">
          <Button variant="outline-secondary" onClick={closeModal} className="px-4">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSavePolicy}
            disabled={saving}
            className="px-4 d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5" }}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" />
                Saving...
              </>
            ) : editID ? (
              "Save Changes"
            ) : (
              "Assign Policy"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Quick Details Preview Modal */}
      {previewPolicy && (
        <Modal
          show={!!previewPolicy}
          onHide={() => setPreviewPolicy(null)}
          centered
          className="leave-modal"
        >
          <Modal.Header closeButton className="leave-modal-header">
            <Modal.Title className="leave-modal-title">
              <BsInfoCircle className="text-primary" />
              Policy Summary: {previewPolicy.PolicyName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="modal-section-card mb-3">
              <Row className="g-3">
                <Col sm={6}>
                  <span className="text-muted small d-block">Leave Category</span>
                  <span className="fw-semibold text-dark">
                    {getLeaveTypeName(previewPolicy.LeaveTypeID)}
                  </span>
                </Col>
                <Col sm={6}>
                  <span className="text-muted small d-block">Status</span>
                  <span className={`status-pill ${previewPolicy.IsActive ? "active" : "inactive"}`}>
                    <span className="status-dot" />
                    {previewPolicy.IsActive ? "Active" : "Inactive"}
                  </span>
                </Col>
                <Col sm={6}>
                  <span className="text-muted small d-block">Annual Entitlement</span>
                  <span className="fw-bold fs-5 text-primary">
                    {previewPolicy.TotalAnnualLeaves ?? 0} Days / Year
                  </span>
                </Col>
                <Col sm={6}>
                  <span className="text-muted small d-block">Max Carry Forward</span>
                  <span className="fw-bold fs-5 text-secondary">
                    {previewPolicy.MaxCarryForward ?? 0} Days
                  </span>
                </Col>
              </Row>
            </div>

            <div className="modal-section-card mb-0">
              <div className="modal-section-header">
                <BsSliders />
                Rules & Eligibility
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                  <span className="text-secondary small">Leave Encashment</span>
                  <span className={`rule-check-tag ${previewPolicy.Encashable ? "allowed" : "disallowed"}`}>
                    {previewPolicy.Encashable ? "Allowed" : "Not Permitted"}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                  <span className="text-secondary small">Negative Balance / Overdraft</span>
                  <span
                    className={`rule-check-tag ${
                      previewPolicy.AllowNegativeBalance ? "allowed" : "disallowed"
                    }`}
                  >
                    {previewPolicy.AllowNegativeBalance ? "Allowed" : "Not Permitted"}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span className="text-secondary small">Effective Dates</span>
                  <span className="small text-dark fw-semibold">
                    {previewPolicy.EffectiveFrom ? previewPolicy.EffectiveFrom.slice(0, 10) : "Start"}
                    {" → "}
                    {previewPolicy.EffectiveTo ? previewPolicy.EffectiveTo.slice(0, 10) : "Indefinite"}
                  </span>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-light px-4 py-3">
            <Button
              variant="outline-primary"
              className="me-auto"
              onClick={() => {
                const pol = previewPolicy;
                setPreviewPolicy(null);
                openEditModal(pol);
              }}
            >
              <BsPencilSquare className="me-2" />
              Edit Policy
            </Button>
            <Button variant="secondary" onClick={() => setPreviewPolicy(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default OrganizationLeavePolicies;
