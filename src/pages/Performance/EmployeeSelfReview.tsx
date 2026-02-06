import React, { useState } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface SelfReviewRow {
  SelfReviewID: number;
  EmployeeName: string;
  CycleName: string;
  OverallRating: number;
  Comments: string;
  Status: "Draft" | "Submitted";
}

interface CriteriaRating {
  CriteriaID: number;
  CriteriaName: string;
  SelfRating: number;
  Feedback: string;
}

/* ================= MOCK DATA ================= */

const reviewCycles = ["FY 2024", "Mid-Year 2024"];
const criteriaList = [
  { CriteriaID: 1, CriteriaName: "Technical Skills" },
  { CriteriaID: 2, CriteriaName: "Communication" },
  { CriteriaID: 3, CriteriaName: "Teamwork" },
];

const statuses: ("Draft" | "Submitted")[] = ["Draft", "Submitted"];

const selfReviewsMock: SelfReviewRow[] = [
  {
    SelfReviewID: 1,
    EmployeeName: "John Doe",
    CycleName: "FY 2024",
    OverallRating: 4,
    Comments: "Good year overall",
    Status: "Submitted",
  },
];

/* ================= COMPONENT ================= */

const EmployeeSelfReview: React.FC = () => {
  /* ================= STATE ================= */
  const [selfReviews, setSelfReviews] = useState<SelfReviewRow[]>(selfReviewsMock);

  const [filters, setFilters] = useState({ cycle: "", status: "" });

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedReview, setSelectedReview] = useState<SelfReviewRow | null>(null);
  const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRating[]>([]);

  const [isNewReview, setIsNewReview] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [comments, setComments] = useState("");
  const loggedInEmployee = "John Doe"; // mock logged-in user
  const [status, setStatus] = useState<"Draft" | "Submitted">("Draft");

  /* ================= FILTERED DATA ================= */
  const filteredReviews = selfReviews.filter(r =>
    (!filters.cycle || r.CycleName === filters.cycle) &&
    (!filters.status || r.Status === filters.status)
  );

  /* ================= ACTIONS ================= */

  const openEdit = (review: SelfReviewRow) => {
    setIsNewReview(false);
    setSelectedReview(review);
    setSelectedCycle(review.CycleName);
    setOverallRating(review.OverallRating);
    setComments(review.Comments);
    setStatus(review.Status as "Draft" | "Submitted");

    setCriteriaRatings(
      criteriaList.map(c => ({
        CriteriaID: c.CriteriaID,
        CriteriaName: c.CriteriaName,
        SelfRating: 0,
        Feedback: "",
      }))
    );

    setShowModal(true);
  };

  const saveReview = () => {
    if (!selectedCycle) {
      ToastMessage.show("Please select review cycle.", "error");
      return;
    }

    if (isNewReview) {
      const newReview: SelfReviewRow = {
        SelfReviewID: Date.now(),
        EmployeeName: loggedInEmployee,
        CycleName: selectedCycle,
        OverallRating: overallRating,
        Comments: comments,
        Status: status,
      };
      setSelfReviews(prev => [...prev, newReview]);
      console.log("Insert TblEmployeeSelfReviews", newReview);
      console.log("Insert Criteria Ratings", criteriaRatings);

      ToastMessage.show("Self review submitted successfully!", "success");
    } else {
      if (selectedReview) {
        setSelfReviews(prev =>
          prev.map(r =>
            r.SelfReviewID === selectedReview.SelfReviewID
              ? {
                  ...r,
                  CycleName: selectedCycle,
                  OverallRating: overallRating,
                  Comments: comments,
                  Status: status,
                }
              : r
          )
        );
        console.log("Update TblEmployeeSelfReviews", selectedReview);
        console.log("Update Criteria Ratings", criteriaRatings);

        ToastMessage.show("Self review updated successfully!", "success");
      }
    }

    setShowModal(false);
  };

  const confirmDelete = (review: SelfReviewRow) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const deleteReview = () => {
    if (!selectedReview) return;
    setSelfReviews(prev => prev.filter(r => r.SelfReviewID !== selectedReview.SelfReviewID));
    ToastMessage.show("Self review deleted successfully!", "success");
    setShowDeleteModal(false);
  };

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container mt-4">
        <h3 className="mb-3">Employee Self Review</h3>

        {/* NEW SELF REVIEW BUTTON */}
        <button
          className="btn btn-primary mb-3"
          onClick={() => {
            setIsNewReview(true);
            setSelectedReview(null);
            setSelectedCycle("");
            setOverallRating(0);
            setComments("");
            setStatus("Draft");
            setCriteriaRatings(
              criteriaList.map(c => ({
                CriteriaID: c.CriteriaID,
                CriteriaName: c.CriteriaName,
                SelfRating: 0,
                Feedback: "",
              }))
            );
            setShowModal(true);
          }}
        >
          + New Self Review
        </button>

        {/* FILTERS */}
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <select
              className="form-select"
              onChange={e => setFilters({ ...filters, cycle: e.target.value })}
            >
              <option value="">All Cycles</option>
              {reviewCycles.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              onChange={e => setFilters({ ...filters, status: e.target.value })}
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
              <th>Cycle</th>
              <th>Overall Rating</th>
              <th>Comments</th>
              <th>Status</th>
              <th style={{ width: "180px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(r => (
              <tr key={r.SelfReviewID}>
                <td>{r.CycleName}</td>
                <td>{r.OverallRating}</td>
                <td>{r.Comments}</td>
                <td>{r.Status}</td>
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

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{isNewReview ? "New Self Review" : "Edit Self Review"}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="fw-bold">Review Cycle</label>
                    <select
                      className="form-select"
                      value={selectedCycle}
                      onChange={e => setSelectedCycle(e.target.value)}
                    >
                      <option value="">Select Cycle</option>
                      {reviewCycles.map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="fw-bold">Employee</label>
                    <input
                      className="form-control"
                      value={loggedInEmployee}
                      disabled
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="fw-bold">Overall Self Rating</label>
                    <select
                      className="form-select"
                      value={overallRating}
                      onChange={e => setOverallRating(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold">Comments</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-bold">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={e => setStatus(e.target.value as "Draft" | "Submitted")}
                  >
                    {statuses.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <hr />

                <h6>Criteria Ratings</h6>
                {criteriaRatings.map(c => (
                  <div key={c.CriteriaID} className="mb-3">
                    <strong>{c.CriteriaName}</strong>
                    <div className="row mt-2">
                      <div className="col-md-2">
                        <select
                          className="form-select"
                          value={c.SelfRating}
                          onChange={e =>
                            setCriteriaRatings(prev =>
                              prev.map(x =>
                                x.CriteriaID === c.CriteriaID
                                  ? { ...x, SelfRating: Number(e.target.value) }
                                  : x
                              )
                            )
                          }
                        >
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-10">
                        <textarea
                          className="form-control"
                          placeholder="Feedback"
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
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={saveReview}
                >
                  {isNewReview ? "Submit Self Review" : "Save Changes"}
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
                <h5>Delete Self Review</h5>
              </div>
              <div className="modal-body">
                Are you sure you want to delete the self review for <b>{selectedReview.EmployeeName}</b>?
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

export default EmployeeSelfReview;
