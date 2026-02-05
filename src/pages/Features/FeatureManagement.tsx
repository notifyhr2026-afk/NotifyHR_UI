import React, { useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  FeatureType: string;
  IsActive: boolean;
  Icon: string;
  OrderBy: number; // ✅ NEW
}

/* ================= STATIC DATA ================= */

const featureTypes = [
  { value: "Core", label: "Core" },
  { value: "Security", label: "Security" },
  { value: "Analytics", label: "Analytics" },
  { value: "Integration", label: "Integration" },
  { value: "Customization", label: "Customization" },
];

const featuresMock: Feature[] = [
  {
    FeatureID: 1,
    FeatureName: "User Management",
    Description: "Manage users and roles",
    FeatureType: "Core",
    IsActive: true,
    Icon: "bi-people",
    OrderBy: 1,
  },
  {
    FeatureID: 2,
    FeatureName: "Audit Logs",
    Description: "Track system activities",
    FeatureType: "Security",
    IsActive: true,
    Icon: "bi-shield-lock",
    OrderBy: 2,
  },
];

/* ================= COMPONENT ================= */

const FeatureManagement: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>(featuresMock);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [featureData, setFeatureData] = useState<Feature>({
    FeatureID: 0,
    FeatureName: "",
    Description: "",
    FeatureType: "",
    IsActive: true,
    Icon: "",
    OrderBy: 0,
  });

  const [valid, setValid] = useState({
    FeatureName: null as boolean | null,
    FeatureType: null as boolean | null,
  });

  /* ================= FUNCTIONS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setFeatureData({
      FeatureID: 0,
      FeatureName: "",
      Description: "",
      FeatureType: "",
      IsActive: true,
      Icon: "",
      OrderBy: 0,
    });
    setValid({ FeatureName: null, FeatureType: null });
    setShowModal(true);
  };

  const openEditModal = (feature: Feature) => {
    setEditingId(feature.FeatureID);
    setFeatureData(feature);
    setValid({ FeatureName: true, FeatureType: true });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const validate = () => {
    const newValid = {
      FeatureName: featureData.FeatureName.trim().length > 0,
      FeatureType: featureData.FeatureType.trim().length > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every(v => v === true);
  };

  const saveFeature = () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    if (editingId) {
      setFeatures(prev =>
        prev.map(f => (f.FeatureID === editingId ? featureData : f))
      );
      ToastMessage.show("Feature updated successfully!", "success");
    } else {
      setFeatures(prev => [
        ...prev,
        { ...featureData, FeatureID: Date.now() },
      ]);
      ToastMessage.show("Feature created successfully!", "success");
    }

    setShowModal(false);
  };

  const deleteFeature = () => {
    if (deleteId) {
      setFeatures(prev => prev.filter(f => f.FeatureID !== deleteId));
      ToastMessage.show("Feature deleted successfully!", "success");
    }
    setShowDeleteModal(false);
  };

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container mt-5">
        <h3 className="mb-3">Feature Management</h3>

        <button className="btn btn-primary mb-3" onClick={openCreateModal}>
          + Create Feature
        </button>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Order</th>
              <th>Feature Name</th>
              <th>Description</th>
              <th>Feature Type</th>
              <th>Status</th>
              <th>Icon</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {features
              .slice()
              .sort((a, b) => a.OrderBy - b.OrderBy)
              .map(feature => (
                <tr key={feature.FeatureID}>
                  <td>{feature.OrderBy}</td>
                  <td>{feature.FeatureName}</td>
                  <td>{feature.Description}</td>
                  <td>{feature.FeatureType}</td>
                  <td>
                    <span
                      className={`badge ${
                        feature.IsActive ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {feature.IsActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <i className={`bi ${feature.Icon}`} />
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => openEditModal(feature)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        openDeleteModal(feature.FeatureID)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= CREATE / EDIT MODAL ================= */}

      {showModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Edit Feature" : "Create Feature"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* FEATURE NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Feature Name
                  </label>
                  <input
                    className={`form-control ${
                      valid.FeatureName === false
                        ? "is-invalid"
                        : valid.FeatureName
                        ? "is-valid"
                        : ""
                    }`}
                    value={featureData.FeatureName}
                    onChange={e =>
                      setFeatureData({
                        ...featureData,
                        FeatureName: e.target.value,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.FeatureName
                        ? "Valid feature name"
                        : "Feature name is required"
                    }
                    isValid={valid.FeatureName}
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={featureData.Description}
                    onChange={e =>
                      setFeatureData({
                        ...featureData,
                        Description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* FEATURE TYPE */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Feature Type
                  </label>
                  <select
                    className={`form-select ${
                      valid.FeatureType === false
                        ? "is-invalid"
                        : valid.FeatureType
                        ? "is-valid"
                        : ""
                    }`}
                    value={featureData.FeatureType}
                    onChange={e =>
                      setFeatureData({
                        ...featureData,
                        FeatureType: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Feature Type</option>
                    {featureTypes.map(type => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ValidationMessage
                    message={
                      valid.FeatureType
                        ? "Valid feature type"
                        : "Feature type is required"
                    }
                    isValid={valid.FeatureType}
                  />
                </div>

                {/* ORDER BY */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Order By
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={featureData.OrderBy}
                    min={0}
                    onChange={e =>
                      setFeatureData({
                        ...featureData,
                        OrderBy: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* ICON */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Icon (Bootstrap Icon)
                  </label>
                  <input
                    className="form-control"
                    placeholder="e.g. bi-shield-lock"
                    value={featureData.Icon}
                    onChange={e =>
                      setFeatureData({
                        ...featureData,
                        Icon: e.target.value,
                      })
                    }
                  />
                </div>

                {/* STATUS */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={featureData.IsActive}
                    onChange={e =>
                      setFeatureData({
                        ...featureData,
                        IsActive: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label">
                    Is Active
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={saveFeature}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}

      {showDeleteModal && (
        <div className="modal show fade d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete Feature</h5>
                <button
                  className="btn-close"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this
                  feature?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={deleteFeature}
                >
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

export default FeatureManagement;
