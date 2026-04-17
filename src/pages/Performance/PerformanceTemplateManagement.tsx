import React, { useEffect, useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";
import performanceService from "../../services/performanceService";

/* ================= TYPES ================= */

interface PerformanceTemplate {
  TemplateID: number;
  OrganizationID: number;
  TemplateName: string;
  Description: string;
  IsActive: boolean;
}

/* ================= COMPONENT ================= */

const PerformanceTemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<PerformanceTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
const organizationID: number | undefined = user?.organizationID;
  const [templateData, setTemplateData] = useState<PerformanceTemplate>({
    TemplateID: 0,
    OrganizationID: organizationID ?? 0, // replace with logged-in user's org ID
    TemplateName: "",
    Description: "",
    IsActive: true,
  });

  const [valid, setValid] = useState({
    TemplateName: null as boolean | null,
  });

  /* ================= FETCH TEMPLATES ================= */

  const fetchTemplates = async () => {
    try {
      const data = await performanceService.getPerformanceTemplatesByOrganizationIDAsync(
        templateData.OrganizationID
      );
      setTemplates(data);
    } catch (error) {
      ToastMessage.show("Failed to fetch templates.", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* ================= MODAL HANDLERS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setTemplateData({
      TemplateID: 0,
      OrganizationID: organizationID ?? 0,
      TemplateName: "",
      Description: "",
      IsActive: true,
    });
    setValid({ TemplateName: null });
    setShowModal(true);
  };

  const openEditModal = (template: PerformanceTemplate) => {
    setEditingId(template.TemplateID);
    setTemplateData(template);
    setValid({ TemplateName: true });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newValid = {
      TemplateName: templateData.TemplateName.trim().length > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every((v) => v === true);
  };

  /* ================= SAVE TEMPLATE ================= */

  const saveTemplate = async () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    try {
      const payload = {
        templateID: templateData.TemplateID,
        organizationID: templateData.OrganizationID,
        templateName: templateData.TemplateName,
        description: templateData.Description,
        createdBy: "Admin", // replace with logged-in user if needed
        isActive: templateData.IsActive,
      };

      const res = await performanceService.PostPerformanceTemplatesByAsync(payload);

      if (res.value === 1) {
        ToastMessage.show(res.message, "success");
        fetchTemplates(); // Refresh list from API
      } else {
        ToastMessage.show("Failed to save template.", "error");
      }
    } catch (error) {
      ToastMessage.show("Error saving template.", "error");
      console.error(error);
    }

    setShowModal(false);
  };

  /* ================= DELETE TEMPLATE ================= */

  const deleteTemplate = async () => {
  if (deleteId === null) return; // make sure we have a template ID

  try {
    const res = await performanceService.DeletePerformanceTemplatesByAsync(deleteId); // pass the template ID

    if (res[0]?.value === 1) {
      ToastMessage.show(res[0].message, "success");
      fetchTemplates(); // Refresh list
    } else {
      ToastMessage.show("Failed to delete template.", "error");
    }
  } catch (error) {
    ToastMessage.show("Error deleting template.", "error");
    console.error(error);
  }

  setShowDeleteModal(false);
};

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container">
        <h3 className="mb-3">Performance Template Management</h3>

        <button className="btn btn-primary mb-3" onClick={openCreateModal}>
          + Create Template
        </button>

        <table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.TemplateID}>
                <td>{template.TemplateName}</td>
                <td>{template.Description}</td>
                <td>
                  <span
                    className={`badge ${
                      template.IsActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {template.IsActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => openEditModal(template)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openDeleteModal(template.TemplateID)}
                  >
                    <i className="bi bi-trash"></i>
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
                  {editingId ? "Edit Template" : "Create Template"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* TEMPLATE NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Template Name</label>
                  <input
                    className={`form-control ${
                      valid.TemplateName === false
                        ? "is-invalid"
                        : valid.TemplateName
                        ? "is-valid"
                        : ""
                    }`}
                    value={templateData.TemplateName}
                    onChange={(e) =>
                      setTemplateData({
                        ...templateData,
                        TemplateName: e.target.value,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.TemplateName
                        ? "Valid template name"
                        : "Template name is required"
                    }
                    isValid={valid.TemplateName}
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={templateData.Description}
                    onChange={(e) =>
                      setTemplateData({
                        ...templateData,
                        Description: e.target.value,
                      })
                    }
                  />
                </div>

                {/* STATUS */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={templateData.IsActive}
                    onChange={(e) =>
                      setTemplateData({
                        ...templateData,
                        IsActive: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label">Is Active</label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-success" onClick={saveTemplate}>
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
                <h5>Delete Template</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this template?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={deleteTemplate}
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

export default PerformanceTemplateManagement;