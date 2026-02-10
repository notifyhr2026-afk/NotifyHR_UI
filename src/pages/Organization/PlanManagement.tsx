// src/pages/Organization/PlanManagement.tsx
import React, { useState } from "react";
import { Plan } from "../../types/PlanTypes";
import { plansMock, featuresList } from "../../data/planData";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Select from "react-select";

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
    features: [],
  });
  const [valid, setValid] = useState({ name: null as boolean | null, price: null as boolean | null });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ------------------------
  // FUNCTIONS
  // ------------------------
  const openCreateModal = () => {
    setEditingId(null);
    setPlanData({
      id: 0,
      name: "",
      price: 0,
      billingCycle: "monthly",
      employeeLimit: 0,
      storageLimit: 0,
      apiLimit: 0,
      features: [],
    });
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
      price: planData.price > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every((v) => v === true);
  };

  const toggleFeature = (id: number) => {
    setPlanData({
      ...planData,
      features: planData.features.includes(id)
        ? planData.features.filter((f) => f !== id)
        : [...planData.features, id],
    });
  };

  const savePlan = () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    if (editingId) {
      const updated = plans.map((p) => (p.id === editingId ? planData : p));
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
      setPlans(plans.filter((p) => p.id !== deleteId));
      ToastMessage.show("Plan deleted successfully!", "success");
    }
    setShowDeleteModal(false);
  };

  // ------------------------
  // UI
  // ------------------------
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

        {/* PLAN LIST TABLE */}
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-striped align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Price ($)</th>
                <th>Limits</th>
                <th>Billing</th>
                <th>Features</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="fw-semibold">{plan.name}</td>
                  <td>${plan.price}</td>
                  <td>
                    <small>{plan.employeeLimit} Employees</small>
                    <br />
                    <small>{plan.storageLimit} GB</small>
                    <br />
                    <small>{plan.apiLimit} API</small>
                  </td>
                  <td className="text-capitalize">{plan.billingCycle}</td>
                  <td>
                    {plan.features
                      .map((fid) => featuresList.find((f) => f.id === fid)?.name)
                      .join(", ")}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-outline-warning btn-sm me-2"
                      title="Edit"
                      onClick={() => openEditModal(plan)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      title="Delete"
                      onClick={() => openDeleteModal(plan.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow rounded">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingId ? "Edit Plan" : "Create Plan"}
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* NAME */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Plan Name</label>
                    <input
                      className={`form-control ${
                        valid.name === false ? "is-invalid" : valid.name ? "is-valid" : ""
                      }`}
                      value={planData.name}
                      onChange={(e) =>
                        setPlanData({ ...planData, name: e.target.value })
                      }
                    />
                    <ValidationMessage
                      message={
                        valid.name ? "Valid name" : "Plan name is required"
                      }
                      isValid={valid.name}
                    />
                  </div>

                  {/* PRICE */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Price ($)</label>
                    <input
                      type="number"
                      className={`form-control ${
                        valid.price === false ? "is-invalid" : valid.price ? "is-valid" : ""
                      }`}
                      value={planData.price}
                      onChange={(e) =>
                        setPlanData({
                          ...planData,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                    <ValidationMessage
                      message={
                        valid.price ? "Valid price" : "Price must be greater than 0"
                      }
                      isValid={valid.price}
                    />
                  </div>

                  {/* LIMITS */}
                  <div className="col-md-4">
                    <label className="form-label">Employee Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={planData.employeeLimit}
                      onChange={(e) =>
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
                      onChange={(e) =>
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
                      onChange={(e) =>
                        setPlanData({ ...planData, apiLimit: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  {/* BILLING */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Billing Cycle</label>
                    <select
                      className="form-select"
                      value={planData.billingCycle}
                      onChange={(e) =>
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
{/* FEATURES */}
<div className="mb-3">
  <label className="form-label fw-bold">Features</label>
  <Select
    isMulti
    options={featuresList.map(f => ({ value: f.id, label: `${f.group} → ${f.name}` }))}
    value={featuresList
      .filter(f => planData.features.includes(f.id))
      .map(f => ({ value: f.id, label: `${f.group} → ${f.name}` }))}
    onChange={(selectedOptions) => {
      const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
      setPlanData({ ...planData, features: selectedIds });
    }}
    placeholder="Select features..."
    classNamePrefix="react-select"
  />
</div>

                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={savePlan}>
                  <i className="bi bi-check2 me-1"></i> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow rounded">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Delete Plan</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this plan?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={deletePlan}>
                  <i className="bi bi-trash me-1"></i> Delete
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
