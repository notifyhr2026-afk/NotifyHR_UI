import React, { useState } from "react";
import { Plan } from "../../types/PlanTypes";
import { plansMock, featuresList } from "../../data/planData";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";

const PlanManagement: React.FC = () => {
  // ------------------------
  // STATE
  // ------------------------
  const [plans, setPlans] = useState<Plan[]>(plansMock);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [planData, setPlanData] = useState<Plan>({
    id: 0,
    name: "",
    price: 0,
    billingCycle: "monthly",
    employeeLimit: 0,
    storageLimit: 0,
    apiLimit: 0,
    features: []
  });
  const [valid, setValid] = useState({ name: null as boolean | null, price: null as boolean | null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ------------------------
  // FUNCTIONS
  // ------------------------
  const openCreateModal = () => {
    setEditingId(null);
    setPlanData({ id: 0, name: "", price: 0, billingCycle: "monthly", employeeLimit: 0, storageLimit: 0, apiLimit: 0, features: [] });
    setValid({ name: null, price: null });
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingId(plan.id);
    setPlanData(plan);
    setValid({ name: true, price: true });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const validate = () => {
    const newValid = {
      name: planData.name.trim().length > 0,
      price: planData.price > 0
    };
    setValid(newValid);
    return Object.values(newValid).every(v => v === true);
  };

  const toggleFeature = (id: number) => {
    setPlanData({
      ...planData,
      features: planData.features.includes(id)
        ? planData.features.filter(f => f !== id)
        : [...planData.features, id],
    });
  };

  const savePlan = () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    if (editingId) {
      const updated = plans.map(p => (p.id === editingId ? planData : p));
      setPlans(updated);
      ToastMessage.show("Plan updated successfully!", "success");
    } else {
      const newPlan = { ...planData, id: Date.now() };
      setPlans([...plans, newPlan]);
      ToastMessage.show("Plan created successfully!", "success");
    }

    setShowModal(false);
  };

  const deletePlan = () => {
    if (deleteId) {
      setPlans(plans.filter(p => p.id !== deleteId));
      ToastMessage.show("Plan deleted successfully!", "success");
    }
    setShowDeleteModal(false);
  };

  // ------------------------
  // UI
  // ------------------------
  return (
    <>
      {/* ToastProvider to show all toasts */}
      <ToastProvider />

      <div className="container mt-5">
        <h3 className="mb-3">Subscription Plan Management</h3>
        <button className="btn btn-primary mb-3" onClick={openCreateModal}>
          + Create Plan
        </button>

        {/* PLAN LIST TABLE */}
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Limits</th>
              <th>Billing</th>
              <th>Features</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.id}>
                <td>{plan.name}</td>
                <td>${plan.price}</td>
                <td>
                  {plan.employeeLimit} Employees<br />
                  {plan.storageLimit} GB<br />
                  {plan.apiLimit} API
                </td>
                <td>{plan.billingCycle}</td>
                <td>
                  {plan.features
                    .map(fid => featuresList.find(f => f.id === fid)?.name)
                    .join(", ")}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => openEditModal(plan)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openDeleteModal(plan.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------------- */}
      {/* CREATE / EDIT MODAL   */}
      {/* ---------------------- */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Edit Plan" : "Create Plan"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">

                {/* NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Plan Name</label>
                  <input
                    className={`form-control ${
                      valid.name === false ? "is-invalid" : valid.name ? "is-valid" : ""
                    }`}
                    value={planData.name}
                    onChange={e => setPlanData({ ...planData, name: e.target.value })}
                  />
                  <ValidationMessage
                    message={valid.name ? "Valid name" : "Plan name is required"}
                    isValid={valid.name}
                  />
                </div>

                {/* PRICE */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Price ($)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      valid.price === false ? "is-invalid" : valid.price ? "is-valid" : ""
                    }`}
                    value={planData.price}
                    onChange={e =>
                      setPlanData({ ...planData, price: parseFloat(e.target.value) })
                    }
                  />
                  <ValidationMessage
                    message={valid.price ? "Valid price" : "Price must be greater than 0"}
                    isValid={valid.price}
                  />
                </div>

                {/* LIMITS */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Employee Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={planData.employeeLimit}
                      onChange={e =>
                        setPlanData({ ...planData, employeeLimit: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Storage (GB)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={planData.storageLimit}
                      onChange={e =>
                        setPlanData({ ...planData, storageLimit: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">API Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={planData.apiLimit}
                      onChange={e =>
                        setPlanData({ ...planData, apiLimit: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {/* BILLING */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Billing Cycle</label>
                  <select
                    className="form-select"
                    value={planData.billingCycle}
                    onChange={e =>
                      setPlanData({
                        ...planData,
                        billingCycle: e.target.value as Plan["billingCycle"],
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* FEATURES */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Features</label>
                  {featuresList.map(f => (
                    <div key={f.id}>
                      <input
                        type="checkbox"
                        checked={planData.features.includes(f.id)}
                        onChange={() => toggleFeature(f.id)}
                      />{" "}
                      {f.group} → {f.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={savePlan}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- */}
      {/* DELETE CONFIRM MODAL  */}
      {/* ---------------------- */}
      {showDeleteModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete Plan</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this plan?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
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
