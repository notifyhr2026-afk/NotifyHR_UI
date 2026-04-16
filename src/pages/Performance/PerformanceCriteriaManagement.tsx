import React, { useEffect, useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";
import performanceService from "../../services/performanceService";

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
  CreatedBy?: string;
}

/* ================= COMPONENT ================= */

const PerformanceCriteriaManagement: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;

  const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
  const [criteria, setCriteria] = useState<PerformanceCriteria[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [criteriaData, setCriteriaData] = useState<PerformanceCriteria>({
    CriteriaID: 0,
    TemplateID: 0,
    CriteriaName: "",
    Weight: 0,
    IsMandatory: false,
    IsActive: true,
    CreatedBy: user?.username || "Admin",
  });

  const [valid, setValid] = useState({
    CriteriaName: null as boolean | null,
    TemplateID: null as boolean | null,
  });

  /* ================= FETCH DATA ================= */

  const fetchTemplates = async () => {
    if (!organizationID) return;
    try {
      const data = await performanceService.getPerformanceTemplatesByOrganizationIDAsync(
        organizationID
      );
      setTemplates(data);
    } catch (error) {
      ToastMessage.show("Failed to fetch templates.", "error");
      console.error(error);
    }
  };

  const fetchCriteria = async () => {
    if (!organizationID) return;
    try {
      const data = await performanceService.getPerformanceCriteriaByOrganizationIDAsync(
        organizationID
      );
      setCriteria(data);
    } catch (error) {
      ToastMessage.show("Failed to fetch criteria.", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCriteria();
  }, []);

  /* ================= MODAL HANDLERS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setCriteriaData({
      CriteriaID: 0,
      TemplateID: 0,
      CriteriaName: "",
      Weight: 0,
      IsMandatory: false,
      IsActive: true,
      CreatedBy: user?.username || "Admin",
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

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newValid = {
      CriteriaName: criteriaData.CriteriaName.trim().length > 0,
      TemplateID: criteriaData.TemplateID > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every((v) => v === true);
  };

  /* ================= SAVE CRITERIA ================= */

  const saveCriteria = async () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    try {
      const payload = {
        criteriaID: criteriaData.CriteriaID,
        templateID: criteriaData.TemplateID,
        criteriaName: criteriaData.CriteriaName,
        weight: criteriaData.Weight,
        isMandatory: criteriaData.IsMandatory,
        isActive: criteriaData.IsActive,
        createdBy: 'Admin',
      };

      const res = await performanceService.PostPerformanceCriteriaByAsync(payload);

      if (res.value === 1) {
        ToastMessage.show(res.message, "success");
        fetchCriteria(); // Refresh list
        setShowModal(false);
      } else {
        ToastMessage.show("Failed to save criteria.", "error");
      }
    } catch (error) {
      ToastMessage.show("Error saving criteria.", "error");
      console.error(error);
    }
  };

  /* ================= DELETE CRITERIA ================= */

  const deleteCriteria = async () => {
    if (!deleteId) return;

    try {
      const res = await performanceService.DeletePerformanceCriteriaByAsync(deleteId);

      if (res[0]?.value === 1) {
        ToastMessage.show(res[0].message, "success");
        fetchCriteria(); // Refresh list
      } else {
        ToastMessage.show("Failed to delete criteria.", "error");
      }
    } catch (error) {
      ToastMessage.show("Error deleting criteria.", "error");
      console.error(error);
    }

    setShowDeleteModal(false);
  };

  const getTemplateName = (id: number) =>
    templates.find((t) => t.TemplateID === id)?.TemplateName || "-";

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container">
        <h3 className="mb-3">Performance Criteria Management</h3>

        <button className="btn btn-primary mb-3" onClick={openCreateModal}>
          + Create Criteria
        </button>

        <table className="table table-hover table-dark-custom">
          <thead>
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
            {criteria.map((item) => (
              <tr key={item.CriteriaID}>
                <td>{getTemplateName(item.TemplateID)}</td>
                <td>{item.CriteriaName}</td>
                <td>{item.Weight}</td>
                <td>{item.IsMandatory ? "Yes" : "No"}</td>
                <td>
                  <span
                    className={`badge ${
                      item.IsActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {item.IsActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openDeleteModal(item.CriteriaID)}
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
                  {editingId ? "Edit Criteria" : "Create Criteria"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                {/* TEMPLATE DROPDOWN */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Template</label>
                  <select
                    className={`form-select ${
                      valid.TemplateID === false
                        ? "is-invalid"
                        : valid.TemplateID
                        ? "is-valid"
                        : ""
                    }`}
                    value={criteriaData.TemplateID}
                    onChange={(e) =>
                      setCriteriaData({
                        ...criteriaData,
                        TemplateID: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>Select Template</option>
                    {templates.map((t) => (
                      <option key={t.TemplateID} value={t.TemplateID}>
                        {t.TemplateName}
                      </option>
                    ))}
                  </select>
                  <ValidationMessage
                    message={
                      valid.TemplateID ? "Valid template" : "Template is required"
                    }
                    isValid={valid.TemplateID}
                  />
                </div>

                {/* CRITERIA NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Criteria Name</label>
                  <input
                    className={`form-control ${
                      valid.CriteriaName === false
                        ? "is-invalid"
                        : valid.CriteriaName
                        ? "is-valid"
                        : ""
                    }`}
                    value={criteriaData.CriteriaName}
                    onChange={(e) =>
                      setCriteriaData({ ...criteriaData, CriteriaName: e.target.value })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.CriteriaName ? "Valid criteria name" : "Criteria name is required"
                    }
                    isValid={valid.CriteriaName}
                  />
                </div>

                {/* WEIGHT */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Weight</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    max={100}
                    value={criteriaData.Weight}
                    onChange={(e) =>
                      setCriteriaData({ ...criteriaData, Weight: Number(e.target.value) })
                    }
                  />
                </div>

                {/* MANDATORY */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={criteriaData.IsMandatory}
                    onChange={(e) =>
                      setCriteriaData({ ...criteriaData, IsMandatory: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Is Mandatory</label>
                </div>

                {/* STATUS */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={criteriaData.IsActive}
                    onChange={(e) =>
                      setCriteriaData({ ...criteriaData, IsActive: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Is Active</label>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={saveCriteria}>
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
                <button className="btn-close" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this criteria?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={deleteCriteria}>
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