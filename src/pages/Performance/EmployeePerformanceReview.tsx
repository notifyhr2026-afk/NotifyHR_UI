import React, { useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface ReviewGridRow {
  ReviewID: number;
  EmployeeName: string;
  CycleName: string;
  TemplateName: string;
  ReviewDate: string;
  Status: string;
}

interface CriteriaRating {
  CriteriaID: number;
  CriteriaName: string;
  Rating: number;
  Feedback: string;
}

/* ================= STATIC DATA (MOCK) ================= */

const employees = ["John Doe", "Jane Smith"];
const cycles = ["FY 2024", "Mid-Year 2024"];
const templates = ["Annual Review", "Probation Review"];
const statuses = ["Draft", "Submitted", "Approved", "Rejected"];

const reviewsMock: ReviewGridRow[] = [
  {
    ReviewID: 1,
    EmployeeName: "John Doe",
    CycleName: "FY 2024",
    TemplateName: "Annual Review",
    ReviewDate: "2024-12-31",
    Status: "Submitted",
  },
  {
    ReviewID: 2,
    EmployeeName: "Jane Smith",
    CycleName: "Mid-Year 2024",
    TemplateName: "Probation Review",
    ReviewDate: "2024-06-30",
    Status: "Approved",
  },
];

/* ================= COMPONENT ================= */

const SubmittedPerformanceReviews: React.FC = () => {
  /* ================= STATE ================= */
  const [reviews, setReviews] = useState<ReviewGridRow[]>(reviewsMock);

  const [filters, setFilters] = useState({
    employee: "",
    cycle: "",
    status: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedReview, setSelectedReview] = useState<ReviewGridRow | null>(null);
  const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRating[]>([]);

  const [isNewReview, setIsNewReview] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  /* ================= FILTER LOGIC ================= */

  const filteredReviews = reviews.filter(r =>
    (!filters.employee || r.EmployeeName === filters.employee) &&
    (!filters.cycle || r.CycleName === filters.cycle) &&
    (!filters.status || r.Status === filters.status)
  );

  /* ================= ACTIONS ================= */

  const openEdit = (review: ReviewGridRow) => {
    setIsNewReview(false);
    setSelectedReview(review);
    setSelectedCycle(review.CycleName);
    setSelectedTemplate(review.TemplateName);
    setSelectedEmployee(review.EmployeeName);

    setCriteriaRatings([
      {
        CriteriaID: 1,
        CriteriaName: "Technical Skills",
        Rating: 4,
        Feedback: "Good knowledge",
      },
      {
        CriteriaID: 2,
        CriteriaName: "Communication",
        Rating: 3,
        Feedback: "Needs improvement",
      },
    ]);

    setShowEditModal(true);
  };

  const saveReviewChanges = () => {
    if (!selectedEmployee || !selectedCycle || !selectedTemplate) {
      ToastMessage.show("Please fill all required fields.", "error");
      return;
    }

    if (isNewReview) {
      const newReview: ReviewGridRow = {
        ReviewID: Date.now(),
        EmployeeName: selectedEmployee,
        CycleName: selectedCycle,
        TemplateName: selectedTemplate,
        ReviewDate: new Date().toISOString().split("T")[0],
        Status: "Submitted",
      };

      setReviews(prev => [...prev, newReview]);

      console.log("Insert TblPerformanceReviews", newReview);
      console.log("Insert TblReviewCriteriaRatings", criteriaRatings);

      ToastMessage.show("Review submitted successfully!", "success");
    } else {
      console.log("Update TblPerformanceReviews", selectedReview);
      console.log("Update TblReviewCriteriaRatings", criteriaRatings);

      setReviews(prev =>
        prev.map(r =>
          r.ReviewID === selectedReview!.ReviewID
            ? { ...r, Status: selectedReview!.Status }
            : r
        )
      );

      ToastMessage.show("Review updated successfully!", "success");
    }

    setShowEditModal(false);
  };

  const confirmDelete = (review: ReviewGridRow) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const deleteReview = () => {
    if (!selectedReview) return;

    setReviews(prev => prev.filter(r => r.ReviewID !== selectedReview.ReviewID));

    console.log("Deleted ReviewID:", selectedReview.ReviewID);

    ToastMessage.show("Review deleted successfully!", "success");
    setShowDeleteModal(false);
  };

  const updateStatus = (id: number, status: string) => {
    setReviews(prev =>
      prev.map(r => (r.ReviewID === id ? { ...r, Status: status } : r))
    );

    ToastMessage.show("Status updated", "success");
  };

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container mt-4">
        <h3 className="mb-3">Submitted Performance Reviews</h3>

        {/* NEW REVIEW BUTTON */}
        <button
          className="btn btn-primary mb-3"
          onClick={() => {
            setIsNewReview(true);
            setSelectedReview(null);
            setSelectedEmployee("");
            setSelectedCycle("");
            setSelectedTemplate("");
            setCriteriaRatings([
              {
                CriteriaID: 1,
                CriteriaName: "Technical Skills",
                Rating: 0,
                Feedback: "",
              },
              {
                CriteriaID: 2,
                CriteriaName: "Communication",
                Rating: 0,
                Feedback: "",
              },
            ]);
            setShowEditModal(true);
          }}
        >
          + New Performance Review
        </button>

        {/* FILTERS */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <select
              className="form-select"
              onChange={e =>
                setFilters({ ...filters, employee: e.target.value })
              }
            >
              <option value="">All Employees</option>
              {employees.map(e => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              onChange={e =>
                setFilters({ ...filters, cycle: e.target.value })
              }
            >
              <option value="">All Cycles</option>
              {cycles.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              onChange={e =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              {statuses.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* GRID */}
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              <th>Cycle</th>
              <th>Template</th>
              <th>Review Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(r => (
              <tr key={r.ReviewID}>
                <td>{r.EmployeeName}</td>
                <td>{r.CycleName}</td>
                <td>{r.TemplateName}</td>
                <td>{r.ReviewDate}</td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={r.Status}
                    onChange={e => updateStatus(r.ReviewID, e.target.value)}
                  >
                    {statuses.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => openEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => confirmDelete(r)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= EDIT / NEW MODAL ================= */}

      {showEditModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>
                  {isNewReview ? "New Review" : `Edit Review – ${selectedReview?.EmployeeName}`}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>

              <div className="modal-body">
                {/* NEW FIELDS: Employee / Cycle / Template */}
                {isNewReview && (
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="fw-bold">Employee</label>
                      <select
                        className="form-select"
                        value={selectedEmployee}
                        onChange={e => setSelectedEmployee(e.target.value)}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(e => (
                          <option key={e}>{e}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="fw-bold">Review Cycle</label>
                      <select
                        className="form-select"
                        value={selectedCycle}
                        onChange={e => setSelectedCycle(e.target.value)}
                      >
                        <option value="">Select Cycle</option>
                        {cycles.map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="fw-bold">Template</label>
                      <select
                        className="form-select"
                        value={selectedTemplate}
                        onChange={e => setSelectedTemplate(e.target.value)}
                      >
                        <option value="">Select Template</option>
                        {templates.map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* CRITERIA RATINGS */}
                {criteriaRatings.map(c => (
                  <div key={c.CriteriaID} className="mb-3">
                    <strong>{c.CriteriaName}</strong>
                    <div className="row mt-2">
                      <div className="col-md-2">
                        <select
                          className="form-select"
                          value={c.Rating}
                          onChange={e =>
                            setCriteriaRatings(prev =>
                              prev.map(x =>
                                x.CriteriaID === c.CriteriaID
                                  ? { ...x, Rating: Number(e.target.value) }
                                  : x
                              )
                            )
                          }
                        >
                          {[1, 2, 3, 4, 5].map(r => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-10">
                        <textarea
                          className="form-control"
                          value={c.Feedback}
                          onChange={e =>
                            setCriteriaRatings(prev =>
                              prev.map(x =>
                                x.CriteriaID === c.CriteriaID
                                  ? { ...x, Feedback: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={saveReviewChanges}
                >
                  {isNewReview ? "Submit Review" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}

      {showDeleteModal && selectedReview && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Delete Review</h5>
              </div>
              <div className="modal-body">
                Are you sure you want to delete review for{" "}
                <b>{selectedReview.EmployeeName}</b>?
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
                  onClick={deleteReview}
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

export default SubmittedPerformanceReviews;
