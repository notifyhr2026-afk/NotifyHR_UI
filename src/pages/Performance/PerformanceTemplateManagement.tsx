import React, { useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface PerformanceTemplate {
  TemplateID: number;
  OrganizationID: number;
  TemplateName: string;
  Description: string;
  IsActive: boolean;
}

/* ================= MOCK DATA ================= */

const templatesMock: PerformanceTemplate[] = [
  {
    TemplateID: 1,
    OrganizationID: 1,
    TemplateName: "Annual Review",
    Description: "Yearly employee performance review",
    IsActive: true,
  },
  {
    TemplateID: 2,
    OrganizationID: 1,
    TemplateName: "Probation Review",
    Description: "3-month probation evaluation",
    IsActive: true,
  },
];

/* ================= COMPONENT ================= */

const PerformanceTemplateManagement: React.FC = () => {
  const [templates, setTemplates] =
    useState<PerformanceTemplate[]>(templatesMock);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [templateData, setTemplateData] =
    useState<PerformanceTemplate>({
      TemplateID: 0,
      OrganizationID: 1, // usually from logged-in user
      TemplateName: "",
      Description: "",
      IsActive: true,
    });

  const [valid, setValid] = useState({
    TemplateName: null as boolean | null,
  });

  /* ================= FUNCTIONS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setTemplateData({
      TemplateID: 0,
      OrganizationID: 1,
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

  const validate = () => {
    const newValid = {
      TemplateName: templateData.TemplateName.trim().length > 0,
    };
    setValid(newValid);
    return Object.values(newValid).every(v => v === true);
  };

  const saveTemplate = () => {
    if (!validate()) {
      ToastMessage.show("Please fix validation errors.", "error");
      return;
    }

    if (editingId) {
      setTemplates(prev =>
        prev.map(t =>
          t.TemplateID === editingId ? templateData : t
        )
      );
      ToastMessage.show(
        "Template updated successfully!",
        "success"
      );
    } else {
      setTemplates(prev => [
        ...prev,
        { ...templateData, TemplateID: Date.now() },
      ]);
      ToastMessage.show(
        "Template created successfully!",
        "success"
      );
    }

    setShowModal(false);
  };

  const deleteTemplate = () => {
    if (deleteId) {
      setTemplates(prev =>
        prev.filter(t => t.TemplateID !== deleteId)
      );
      ToastMessage.show(
        "Template deleted successfully!",
        "success"
      );
    }
    setShowDeleteModal(false);
  };

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container mt-5">
        <h3 className="mb-3">
          Performance Template Management
        </h3>

        <button
          className="btn btn-primary mb-3"
          onClick={openCreateModal}
        >
          + Create Template
        </button>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Template Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <tr key={template.TemplateID}>
                <td>{template.TemplateName}</td>
                <td>{template.Description}</td>
                <td>
                  <span
                    className={`badge ${
                      template.IsActive
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {template.IsActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() =>
                      openEditModal(template)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      openDeleteModal(
                        template.TemplateID
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
                    ? "Edit Template"
                    : "Create Template"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* TEMPLATE NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Template Name
                  </label>
                  <input
                    className={`form-control ${
                      valid.TemplateName === false
                        ? "is-invalid"
                        : valid.TemplateName
                        ? "is-valid"
                        : ""
                    }`}
                    value={templateData.TemplateName}
                    onChange={e =>
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
                  <label className="form-label fw-bold">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={templateData.Description}
                    onChange={e =>
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
                    onChange={e =>
                      setTemplateData({
                        ...templateData,
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
                  onClick={saveTemplate}
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
                <h5>Delete Template</h5>
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
                  template?
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
