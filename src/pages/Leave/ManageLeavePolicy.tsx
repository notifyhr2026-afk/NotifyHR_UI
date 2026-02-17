import React, { useEffect, useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";
import leavePolicyService from "../../services/leavePolicyService";

/* =========================
   INTERFACES
========================= */
export interface LeavePolicy {
  id: number;
  policyName: string;
  leaveTypeId: number;
  totalAnnualLeaves: number;
  maxCarryForward: number;
  encashable: boolean;
  allowNegativeBalance: boolean;
  effectiveFrom: string;
  effectiveTo: string;
}

interface LeaveType {
  id: number;
  name: string;
}

/* =========================
   STATIC LEAVE TYPES
========================= */
const leaveTypes: LeaveType[] = [
  { id: 1, name: "Annual Leave" },
  { id: 2, name: "Sick Leave" },
  { id: 3, name: "Casual Leave" },
];

/* =========================
   COMPONENT
========================= */
const ManageLeavePolicy: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [policyData, setPolicyData] = useState<LeavePolicy>({
    id: 0,
    policyName: "",
    leaveTypeId: 1,
    totalAnnualLeaves: 0,
    maxCarryForward: 0,
    encashable: false,
    allowNegativeBalance: false,
    effectiveFrom: "",
    effectiveTo: "",
  });

  const [valid, setValid] = useState({
    policyName: null as boolean | null,
    totalAnnualLeaves: null as boolean | null,
  });

  /* =========================
     API MAPPER
  ========================= */
  const mapApiToLeavePolicy = (item: any): LeavePolicy => ({
    id: item.LeavePolicyID,
    policyName: item.PolicyName,
    leaveTypeId: item.LeaveTypeID,
    totalAnnualLeaves: Number(item.TotalAnnualLeaves),
    maxCarryForward: Number(item.MaxCarryForward),
    encashable: item.Encashable,
    allowNegativeBalance: item.AllowNegativeBalance,
    effectiveFrom: "",
    effectiveTo: "",
  });

  /* =========================
     FETCH DATA
  ========================= */
  const fetchLeavePolicies = async () => {
    try {
      setLoading(true);
      const data = await leavePolicyService.getLeavePolicy();
      setPolicies(data.map(mapApiToLeavePolicy));
    } catch (error) {
      ToastMessage.show("Failed to load leave policies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavePolicies();
  }, []);

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    const newValid = {
      policyName: policyData.policyName.trim().length > 0,
      totalAnnualLeaves: policyData.totalAnnualLeaves > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every(v => v === true);
  };

  /* =========================
     SAVE OR UPDATE POLICY
  ========================= */
  const savePolicy = async () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    const payload = {
      leavePolicyID: policyData.id,
      policyName: policyData.policyName,
      leaveTypeID: policyData.leaveTypeId,
      totalAnnualLeaves: policyData.totalAnnualLeaves,
      maxCarryForward: policyData.maxCarryForward,
      encashable: policyData.encashable,
      allowNegativeBalance: policyData.allowNegativeBalance,
      isActive: true,
      createdBy: "admin", // You can replace with current user
    };

    try {
      const res = await leavePolicyService.PostLeavePolicyByAsync(payload);

      if (res.value === 1) {
        ToastMessage.show(res.message, "success");
        await fetchLeavePolicies();
        setShowModal(false);
      } else {
        ToastMessage.show(res.message || "Warning occurred.", "warning");
      }
    } catch (error) {
      ToastMessage.show("Failed to save leave policy", "error");
    }
  };

  /* =========================
     DELETE POLICY
  ========================= */
  const deletePolicy = async () => {
    if (!deleteId) return;

    try {
      const res = await leavePolicyService.DeleteLeavePolicyByAsync(deleteId);

      if (res[0]?.value === 1) {
        ToastMessage.show(res[0].message, "success");
        setPolicies(policies.filter(p => p.id !== deleteId));
      } else {
        ToastMessage.show(res[0]?.message || "Warning occurred", "warning");
      }
    } catch (error) {
      ToastMessage.show("Failed to delete leave policy", "error");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getLeaveTypeName = (id: number) =>
    leaveTypes.find(t => t.id === id)?.name || "-";

  /* =========================
     MODAL HELPERS
  ========================= */
  const openCreateModal = () => {
    setEditingId(null);
    setPolicyData({
      id: 0,
      policyName: "",
      leaveTypeId: 1,
      totalAnnualLeaves: 0,
      maxCarryForward: 0,
      encashable: false,
      allowNegativeBalance: false,
      effectiveFrom: "",
      effectiveTo: "",
    });
    setValid({ policyName: null, totalAnnualLeaves: null });
    setShowModal(true);
  };

  const openEditModal = (policy: LeavePolicy) => {
    setEditingId(policy.id);
    setPolicyData(policy);
    setValid({ policyName: true, totalAnnualLeaves: true });
    setShowModal(true);
  };

  /* =========================
     UI
  ========================= */
  return (
    <>
      <ToastProvider />

      <div className="container mt-5">
        <h3 className="mb-3">Manage Leave Policies</h3>

        <button className="btn btn-primary mb-3" onClick={openCreateModal}>
          + Create Leave Policy
        </button>

        {loading ? (
          <p>Loading leave policies...</p>
        ) : (
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Policy Name</th>
                <th>Leave Type</th>
                <th>Total Leaves</th>
                <th>Carry Forward</th>
                <th>Encashable</th>
                <th>Negative Balance</th>
                <th>Effective Period</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id}>
                  <td>{p.policyName}</td>
                  <td>{getLeaveTypeName(p.leaveTypeId)}</td>
                  <td>{p.totalAnnualLeaves}</td>
                  <td>{p.maxCarryForward}</td>
                  <td>{p.encashable ? "Yes" : "No"}</td>
                  <td>{p.allowNegativeBalance ? "Yes" : "No"}</td>
                  <td>
                    {p.effectiveFrom || "-"} → {p.effectiveTo || "-"}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeleteId(p.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingId ? "Edit Leave Policy" : "Create Leave Policy"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Policy Name</label>
                  <input
                    className={`form-control ${valid.policyName === false ? "is-invalid" : ""}`}
                    value={policyData.policyName}
                    onChange={e =>
                      setPolicyData({ ...policyData, policyName: e.target.value })
                    }
                  />
                  <ValidationMessage
                    message="Policy name is required"
                    isValid={valid.policyName}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Leave Type</label>
                  <select
                    className="form-select"
                    value={policyData.leaveTypeId}
                    onChange={e =>
                      setPolicyData({ ...policyData, leaveTypeId: Number(e.target.value) })
                    }
                  >
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label>Total Annual Leaves</label>
                    <input
                      type="number"
                      className="form-control"
                      value={policyData.totalAnnualLeaves}
                      onChange={e =>
                        setPolicyData({ ...policyData, totalAnnualLeaves: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Max Carry Forward</label>
                    <input
                      type="number"
                      className="form-control"
                      value={policyData.maxCarryForward}
                      onChange={e =>
                        setPolicyData({ ...policyData, maxCarryForward: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={policyData.encashable}
                    onChange={e =>
                      setPolicyData({ ...policyData, encashable: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Encashable</label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={policyData.allowNegativeBalance}
                    onChange={e =>
                      setPolicyData({ ...policyData, allowNegativeBalance: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Allow Negative Balance</label>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={savePolicy}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete Leave Policy</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                Are you sure you want to delete this policy?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={deletePolicy}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageLeavePolicy;
