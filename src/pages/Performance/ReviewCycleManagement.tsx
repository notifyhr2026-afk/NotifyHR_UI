import React, { useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface ReviewCycle {
  ReviewCycleID: number;
  OrganizationID: number;
  CycleName: string;
  FromDate: string;
  ToDate: string;
  IsActive: boolean;
}

/* ================= MOCK DATA ================= */

const reviewCyclesMock: ReviewCycle[] = [
  {
    ReviewCycleID: 1,
    OrganizationID: 1,
    CycleName: "FY 2024 Annual Review",
    FromDate: "2024-01-01",
    ToDate: "2024-12-31",
    IsActive: true,
  },
  {
    ReviewCycleID: 2,
    OrganizationID: 1,
    CycleName: "Mid-Year Review 2024",
    FromDate: "2024-06-01",
    ToDate: "2024-06-30",
    IsActive: true,
  },
];

/* ================= COMPONENT ================= */

const ReviewCycleManagement: React.FC = () => {
  const [cycles, setCycles] =
    useState<ReviewCycle[]>(reviewCyclesMock);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [cycleData, setCycleData] =
    useState<ReviewCycle>({
      ReviewCycleID: 0,
      OrganizationID: 1, // usually from login context
      CycleName: "",
      FromDate: "",
      ToDate: "",
      IsActive: true,
    });

  const [valid, setValid] = useState({
    CycleName: null as boolean | null,
    FromDate: null as boolean | null,
    ToDate: null as boolean | null,
  });

  /* ================= FUNCTIONS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setCycleData({
      ReviewCycleID: 0,
      OrganizationID: 1,
      CycleName: "",
      FromDate: "",
      ToDate: "",
      IsActive: true,
    });
    setValid({
      CycleName: null,
      FromDate: null,
      ToDate: null,
    });
    setShowModal(true);
  };

  const openEditModal = (cycle: ReviewCycle) => {
    setEditingId(cycle.ReviewCycleID);
    setCycleData(cycle);
    setValid({
      CycleName: true,
      FromDate: true,
      ToDate: true,
    });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const validate = () => {
    const newValid = {
      CycleName: cycleData.CycleName.trim().length > 0,
      FromDate: cycleData.FromDate.length > 0,
      ToDate:
        cycleData.ToDate.length > 0 &&
        cycleData.ToDate >= cycleData.FromDate,
    };
    setValid(newValid);
    return Object.values(newValid).every(v => v === true);
  };

  const saveCycle = () => {
    if (!validate()) {
      ToastMessage.show(
        "Please fix validation errors.",
        "error"
      );
      return;
    }

    if (editingId) {
      setCycles(prev =>
        prev.map(c =>
          c.ReviewCycleID === editingId
            ? cycleData
            : c
        )
      );
      ToastMessage.show(
        "Review cycle updated successfully!",
        "success"
      );
    } else {
      setCycles(prev => [
        ...prev,
        {
          ...cycleData,
          ReviewCycleID: Date.now(),
        },
      ]);
      ToastMessage.show(
        "Review cycle created successfully!",
        "success"
      );
    }

    setShowModal(false);
  };

  const deleteCycle = () => {
    if (deleteId) {
      setCycles(prev =>
        prev.filter(
          c => c.ReviewCycleID !== deleteId
        )
      );
      ToastMessage.show(
        "Review cycle deleted successfully!",
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
          Review Cycle Management
        </h3>

        <button
          className="btn btn-primary mb-3"
          onClick={openCreateModal}
        >
          + Create Review Cycle
        </button>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Cycle Name</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map(cycle => (
              <tr key={cycle.ReviewCycleID}>
                <td>{cycle.CycleName}</td>
                <td>{cycle.FromDate}</td>
                <td>{cycle.ToDate}</td>
                <td>
                  <span
                    className={`badge ${
                      cycle.IsActive
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {cycle.IsActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() =>
                      openEditModal(cycle)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      openDeleteModal(
                        cycle.ReviewCycleID
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
                    ? "Edit Review Cycle"
                    : "Create Review Cycle"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* CYCLE NAME */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Cycle Name
                  </label>
                  <input
                    className={`form-control ${
                      valid.CycleName === false
                        ? "is-invalid"
                        : valid.CycleName
                        ? "is-valid"
                        : ""
                    }`}
                    value={cycleData.CycleName}
                    onChange={e =>
                      setCycleData({
                        ...cycleData,
                        CycleName: e.target.value,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.CycleName
                        ? "Valid cycle name"
                        : "Cycle name is required"
                    }
                    isValid={valid.CycleName}
                  />
                </div>

                {/* FROM DATE */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    From Date
                  </label>
                  <input
                    type="date"
                    className={`form-control ${
                      valid.FromDate === false
                        ? "is-invalid"
                        : valid.FromDate
                        ? "is-valid"
                        : ""
                    }`}
                    value={cycleData.FromDate}
                    onChange={e =>
                      setCycleData({
                        ...cycleData,
                        FromDate: e.target.value,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.FromDate
                        ? "Valid from date"
                        : "From date is required"
                    }
                    isValid={valid.FromDate}
                  />
                </div>

                {/* TO DATE */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    To Date
                  </label>
                  <input
                    type="date"
                    className={`form-control ${
                      valid.ToDate === false
                        ? "is-invalid"
                        : valid.ToDate
                        ? "is-valid"
                        : ""
                    }`}
                    value={cycleData.ToDate}
                    min={cycleData.FromDate}
                    onChange={e =>
                      setCycleData({
                        ...cycleData,
                        ToDate: e.target.value,
                      })
                    }
                  />
                  <ValidationMessage
                    message={
                      valid.ToDate
                        ? "Valid to date"
                        : "To date must be after From date"
                    }
                    isValid={valid.ToDate}
                  />
                </div>

                {/* STATUS */}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={cycleData.IsActive}
                    onChange={e =>
                      setCycleData({
                        ...cycleData,
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
                  onClick={saveCycle}
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
                <h5>Delete Review Cycle</h5>
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
                  this review cycle?
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
                  onClick={deleteCycle}
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

export default ReviewCycleManagement;
