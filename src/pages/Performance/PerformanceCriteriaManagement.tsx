import React, { useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface PerformanceTemplate {
  TemplateID: number;
  TemplateName: string;
}

interface PerformanceCriteria {
  CriteriaID: number;
  TemplateID: number;
  CriteriaName: string;
  Weight: number;
  IsMandatory: boolean;
  IsActive: boolean;
}

/* ================= MOCK DATA ================= */

const templatesMock: PerformanceTemplate[] = [
  { TemplateID: 1, TemplateName: "Annual Review" },
  { TemplateID: 2, TemplateName: "Probation Review" },
];

const criteriaMock: PerformanceCriteria[] = [
  {
    CriteriaID: 1,
    TemplateID: 1,
    CriteriaName: "Technical Skills",
    Weight: 40,
    IsMandatory: true,
    IsActive: true,
  },
  {
    CriteriaID: 2,
    TemplateID: 1,
    CriteriaName: "Communication",
    Weight: 20,
    IsMandatory: false,
    IsActive: true,
  },
];

/* ================= COMPONENT ================= */

const PerformanceCriteriaManagement: React.FC = () => {
  const [criteria, setCriteria] =
    useState<PerformanceCriteria[]>(criteriaMock);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [criteriaData, setCriteriaData] =
    useState<PerformanceCriteria>({
      CriteriaID: 0,
      TemplateID: 0,
      CriteriaName: "",
      Weight: 0,
      IsMandatory: false,
      IsActive: true,
    });

  const [valid, setValid] = useState({
    CriteriaName: null as boolean | null,
    TemplateID: null as boolean | null,
  });

  /* ================= FUNCTIONS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setCriteriaData({
      CriteriaID: 0,
      TemplateID: 0,
      CriteriaName: "",
      Weight: 0,
      IsMandatory: false,
      IsActive: true,
    });
    setValid({ CriteriaName: null, TemplateID: null });
    setShowModal(true);
  };

  const openEditModal = (item: PerformanceCriteria) => {
    setEditingId(item.CriteriaID);
    setCriteriaData(item);
    setValid({ CriteriaName: true, TemplateID: true });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const validate = () => {
    const newValid = {
      CriteriaName:
        criteriaData.CriteriaName.trim().length > 0,
      TemplateID: criteriaData.TemplateID > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every(v => v === true);
  };

  const saveCriteria = () => {
    if (!validate()) {
      ToastMessage.show(
        "Please fix validation errors.",
        "error"
      );
      return;
    }

    if (editingId) {
      setCriteria(prev =>
        prev.map(c =>
          c.CriteriaID === editingId
            ? criteriaData
            : c
        )
      );
      ToastMessage.show(
        "Criteria updated successfully!",
        "success"
      );
    } else {
      setCriteria(prev => [
        ...prev,
        { ...criteriaData, CriteriaID: Date.now() },
      ]);
      ToastMessage.show(
        "Criteria created successfully!",
        "success"
      );
    }

    setShowModal(false);
  };

  const deleteCriteria = () => {
    if (deleteId) {
      setCriteria(prev =>
        prev.filter(c => c.CriteriaID !== deleteId)
      );
      ToastMessage.show(
        "Criteria deleted successfully!",
        "success"
      );
    }
    setShowDeleteModal(false);
  };

  const getTemplateName = (id: number) =>
    templatesMock.find(t => t.TemplateID === id)
      ?.TemplateName || "-";

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container mt-5">
        <h3 className="mb-3">
          Performance Criteria Management
        </h3>

        <button
          className="btn btn-primary mb-3"
          onClick={openCreateModal}
        >
          + Create Criteria
        </button>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Template</th>
              <th>Criteria Name</th>
              <th>Weight</th>
              <th>Mandatory</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map(item => (
              <tr key={item.CriteriaID}>
                <td>
                  {getTemplateName(item.TemplateID)}
                </td>
                <td>{item.CriteriaName}</td>
                <td>{item.Weight}</td>
                <td>
                  {item.IsMandatory ? "Yes" : "No"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      item.IsActive
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {item.IsActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() =>
                      openEditModal(item)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      openDeleteModal(
                        item.CriteriaID
                      )
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
                  {editingId
                    ? "Edit Criteria"
                    : "Create Criteria"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* TEMPLATE */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Template
                  </label>
                  <select
                    className={`form-select ${
                      valid.TemplateID === false
                        ? "is-invalid"
                        : valid.TemplateID
                        ? "is-valid"
                        : ""
                    }`}
                    value={criteriaData.TemplateID}
                    onChange={e =>
                      setCriteriaData({
                        ...criteriaData,
                        TemplateID: Number(
                          e.target.value
                        ),
                      })
                    }
                  >
                    <option value={0}>
                      Select Template
                    </option>
                    {templatesMock.map(t => (
                      <option
                        key={t.TemplateID}
                        value={t.TemplateID}
                      >
                        {t.TemplateName}
                      </option>
                    ))}
                  </select>
                  <ValidationMessage
                    message={
                      valid.TemplateID
                        ? "Valid template"
                        : "Template is required"
                    }
                    isValid={valid.TemplateID}
                  />
                </div>

                {/* CRITERIA NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Criteria Name
                  </label>
                  <input
                    className={`form-control ${
                      valid.CriteriaName === false
                        ? "is-invalid"
                        : valid.CriteriaName
                        ? "is-valid"
                        : ""
                    }`}
                    value={criteriaData.CriteriaName}
                    onChange={e =>
                      setCriteriaData({
                        ...criteriaData,
                        CriteriaName: e.target.value,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.CriteriaName
                        ? "Valid criteria name"
                        : "Criteria name is required"
                    }
                    isValid={valid.CriteriaName}
                  />
                </div>

                {/* WEIGHT */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Weight
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    max={100}
                    value={criteriaData.Weight}
                    onChange={e =>
                      setCriteriaData({
                        ...criteriaData,
                        Weight: Number(
                          e.target.value
                        ),
                      })
                    }
                  />
                </div>

                {/* MANDATORY */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={criteriaData.IsMandatory}
                    onChange={e =>
                      setCriteriaData({
                        ...criteriaData,
                        IsMandatory:
                          e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label">
                    Is Mandatory
                  </label>
                </div>

                {/* STATUS */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={criteriaData.IsActive}
                    onChange={e =>
                      setCriteriaData({
                        ...criteriaData,
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
                  onClick={saveCriteria}
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
                <h5>Delete Criteria</h5>
                <button
                  className="btn-close"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete
                  this criteria?
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
                  onClick={deleteCriteria}
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

export default PerformanceCriteriaManagement;
