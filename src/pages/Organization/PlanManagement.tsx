import React, { useEffect, useState } from "react";
import planService from "../../services/planService";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

interface Plan {
  planID: number;
  planName: string;
  pricePerMonth: number;
  includedEmployees: number;
  extraEmployeeCost: number;
  billingCycleID: number;
}

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [planData, setPlanData] = useState<Plan>({
    planID: 0,
    planName: "",
    pricePerMonth: 0,
    includedEmployees: 0,
    extraEmployeeCost: 0,
    billingCycleID: 1,
  });

  const [valid, setValid] = useState({
    name: null as boolean | null,
    price: null as boolean | null,
  });

  const [deleteId, setDeleteId] = useState<number>(0);

  // =========================
  // MAPPER (API → UI)
  // =========================
  const mapPlan = (item: any): Plan => ({
    planID: item.PlanID,
    planName: item.PlanName,
    pricePerMonth: item.PricePerMonth,
    includedEmployees: item.IncludedEmployees,
    extraEmployeeCost: item.ExtraEmployeeCost,
    billingCycleID: item.BillingCycleID,
  });

  // =========================
  // LOAD PLANS
  // =========================
  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await planService.GePlansAsync();
      const mapped = res.map(mapPlan);
      setPlans(mapped);
    } catch (error) {
      ToastMessage.show("Failed to load plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // =========================
  // MODAL HANDLERS
  // =========================
  const openCreateModal = () => {
    setPlanData({
      planID: 0,
      planName: "",
      pricePerMonth: 0,
      includedEmployees: 0,
      extraEmployeeCost: 0,
      billingCycleID: 1,
    });
    setValid({ name: null, price: null });
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setPlanData({ ...plan });
    setValid({ name: true, price: true });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    const newValid = {
      name: planData.planName.trim().length > 0,
      price: planData.pricePerMonth > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every(Boolean);
  };

  // =========================
  // SAVE (CREATE / UPDATE)
  // =========================
  const savePlan = async () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    try {
      const payload = {
        planID: planData.planID,
        planName: planData.planName,
        pricePerMonth: planData.pricePerMonth,
        includedEmployees: planData.includedEmployees,
        extraEmployeeCost: planData.extraEmployeeCost,
        billingCycleID: planData.billingCycleID,
      };

      const response = await planService.PostplanByAsync(payload);

      if (response.value === 1) {
        ToastMessage.show(response.message, "success");
        setShowModal(false);
        loadPlans();
      } else {
        ToastMessage.show(response.message, "warning");
      }
    } catch (error) {
      ToastMessage.show("Save failed.", "error");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deletePlan = async () => {
    try {
      const response = await planService.DeleteplanByAsync(deleteId);

      if (response.value === 1) {
        ToastMessage.show(response.message, "success");
        loadPlans();
      } else {
        ToastMessage.show(response.message, "warning");
      }
    } catch (error) {
      ToastMessage.show("Delete failed.", "error");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <>
      <ToastProvider />

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Subscription Plan Management</h3>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <i className="bi bi-plus-lg me-1"></i> Create Plan
          </button>
        </div>

        <div className="table-responsive shadow-sm rounded">
          <table className="table table-striped align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Price ($)</th>
                <th>Included Employees</th>
                <th>Extra Cost</th>
                <th>Billing Cycle</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    No plans found.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.planID}>
                    <td className="fw-semibold">{plan.planName}</td>
                    <td>${plan.pricePerMonth}</td>
                    <td>{plan.includedEmployees}</td>
                    <td>${plan.extraEmployeeCost}</td>
                    <td>{plan.billingCycleID === 1 ? "Monthly" : "Other"}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-warning btn-sm me-2"
                        onClick={() => openEditModal(plan)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openDeleteModal(plan.planID)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow rounded">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {planData.planID === 0 ? "Create Plan" : "Edit Plan"}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Plan Name</label>
                  <input
                    className={`form-control ${
                      valid.name === false
                        ? "is-invalid"
                        : valid.name
                        ? "is-valid"
                        : ""
                    }`}
                    value={planData.planName}
                    onChange={(e) =>
                      setPlanData({ ...planData, planName: e.target.value })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.name ? "Valid name" : "Plan name is required"
                    }
                    isValid={valid.name}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Price Per Month</label>
                  <input
                    type="number"
                    className={`form-control ${
                      valid.price === false
                        ? "is-invalid"
                        : valid.price
                        ? "is-valid"
                        : ""
                    }`}
                    value={planData.pricePerMonth}
                    onChange={(e) =>
                      setPlanData({
                        ...planData,
                        pricePerMonth: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.price
                        ? "Valid price"
                        : "Price must be greater than 0"
                    }
                    isValid={valid.price}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Included Employees</label>
                  <input
                    type="number"
                    className="form-control"
                    value={planData.includedEmployees}
                    onChange={(e) =>
                      setPlanData({
                        ...planData,
                        includedEmployees: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Extra Employee Cost</label>
                  <input
                    type="number"
                    className="form-control"
                    value={planData.extraEmployeeCost}
                    onChange={(e) =>
                      setPlanData({
                        ...planData,
                        extraEmployeeCost: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Billing Cycle ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={planData.billingCycleID}
                    onChange={(e) =>
                      setPlanData({
                        ...planData,
                        billingCycleID: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={savePlan}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow rounded">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Delete Plan</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body">
                Are you sure you want to delete this plan?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={deletePlan}>
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

export default PlanManagement;
