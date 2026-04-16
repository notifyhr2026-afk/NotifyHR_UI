import React, { useState, useEffect } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import employeeService from "../../services/employeeService";
import performanceService from "../../services/performanceService";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface ReviewGridRow {
  ReviewID: number;
  EmployeeName: string;
  CycleName: string;
  TemplateName: string;
  ReviewDate: string;
  Status: string;
  Comments: string;
  ReviewStatus: string;
}

interface CriteriaRating {
  CriteriaID: number;
  CriteriaName: string;
  Rating: number;
  Feedback: string;
}

interface Employee {
  EmployeeID: number;
  EmployeeName: string;
}

interface ReviewCycle {
  PerformanceReviewCycleID: number;
  CycleName: string;
}

interface Template {
  PerformanceTemplateID: number;
  TemplateName: string;
}

/* ================= STATIC DATA (MOCK) ================= */

const statuses = ["Draft", "Submitted", "Approved", "Rejected"];

const reviewsMock: ReviewGridRow[] = [
  {
    ReviewID: 1,
    EmployeeName: "John Doe",
    CycleName: "FY 2024",
    TemplateName: "Annual Review",
    ReviewDate: "2024-12-31",
    Status: "Submitted",
    Comments: "Good performance overall",
    ReviewStatus: "Submitted",
  },
  {
    ReviewID: 2,
    EmployeeName: "Jane Smith",
    CycleName: "Mid-Year 2024",
    TemplateName: "Probation Review",
    ReviewDate: "2024-06-30",
    Status: "Approved",
    Comments: "Excellent progress during probation",
    ReviewStatus: "Submitted",
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
  const [comments, setComments] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"Draft" | "Submitted">("Draft");

  /* ================= API DATA STATE ================= */
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateCriteria, setTemplateCriteria] = useState<CriteriaRating[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH API DATA ================= */
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get organizationID from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;

        if (!organizationID) {
          setError("Organization ID not found");
          setLoading(false);
          return;
        }

        // Fetch employees
        const employeesData = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        const employeesArray = Array.isArray(employeesData) ? employeesData : employeesData?.Table || [];
        const mappedEmployees: Employee[] = employeesArray.map((emp: any) => ({
          EmployeeID: emp.EmployeeID || emp.id,
          EmployeeName: emp.EmployeeName || emp.name,
        }));
        setEmployees(mappedEmployees);

        // Fetch review cycles
        const cyclesData = await performanceService.getPerformanceReviewCyclesByOrganizationIDAsync(organizationID);
        const cyclesArray = Array.isArray(cyclesData) ? cyclesData : cyclesData?.Table || [];
        const mappedCycles: ReviewCycle[] = cyclesArray.map((cycle: any) => ({
          PerformanceReviewCycleID: cycle.PerformanceReviewCycleID || cycle.id,
          CycleName: cycle.CycleName || cycle.name,
        }));
        setCycles(mappedCycles);

        // Fetch templates
        const templatesData = await performanceService.getPerformanceTemplatesByOrganizationIDAsync(organizationID);
        const templatesArray = Array.isArray(templatesData) ? templatesData : templatesData?.Table || [];
        const mappedTemplates: Template[] = templatesArray.map((template: any) => ({
          PerformanceTemplateID: template.PerformanceTemplateID || template.id,
          TemplateName: template.TemplateName || template.name,
        }));
        setTemplates(mappedTemplates);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
        setError("Failed to load data. Please check the console for details.");
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  /* ================= FETCH CRITERIA WHEN TEMPLATE SELECTED ================= */
  useEffect(() => {
    const fetchTemplateCriteria = async () => {
      if (!selectedTemplate || !isNewReview) {
        return;
      }

      try {
        setCriteriaLoading(true);

        // Get organizationID from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;

        if (!organizationID) {
          console.error("Organization ID not found");
          setCriteriaLoading(false);
          return;
        }

        // Fetch criteria for the organization
        // (The backend can filter by template if needed)
        const criteriaData = await performanceService.getPerformanceCriteriaByOrganizationIDAsync(organizationID);
        const criteriaArray = Array.isArray(criteriaData) ? criteriaData : criteriaData?.Table || [];
        
        const mappedCriteria: CriteriaRating[] = criteriaArray.map((criteria: any) => ({
          CriteriaID: criteria.PerformanceCriteriaID || criteria.id,
          CriteriaName: criteria.CriteriaName || criteria.name,
          Rating: 0,
          Feedback: "",
        }));

        setTemplateCriteria(mappedCriteria);
        setCriteriaRatings(mappedCriteria);
        setCriteriaLoading(false);
      } catch (err) {
        console.error("Failed to fetch template criteria", err);
        setCriteriaLoading(false);
      }
    };

    fetchTemplateCriteria();
  }, [selectedTemplate, isNewReview]);

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
    setComments(review.Comments || "");
    setReviewStatus((review.ReviewStatus as "Draft" | "Submitted") || "Draft");

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
        Comments: comments,
        ReviewStatus: reviewStatus,
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
            ? { ...r, Status: selectedReview!.Status, Comments: comments, ReviewStatus: reviewStatus }
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

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="alert alert-info">
            Loading employees, cycles, and templates...
          </div>
        )}

        {/* NEW REVIEW BUTTON */}
        <button
          className="btn btn-primary mb-3"
          onClick={() => {
            setIsNewReview(true);
            setSelectedReview(null);
            setSelectedEmployee("");
            setSelectedCycle("");
            setSelectedTemplate("");
            setComments("");
            setReviewStatus("Draft");
            setCriteriaRatings([]);
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
                <option key={e.EmployeeID}>{e.EmployeeName}</option>
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
                <option key={c.PerformanceReviewCycleID}>{c.CycleName}</option>
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
        <table className="table table-hover table-dark-custom">
          <thead>
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
                          <option key={e.EmployeeID}>{e.EmployeeName}</option>
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
                          <option key={c.PerformanceReviewCycleID}>{c.CycleName}</option>
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
                          <option key={t.PerformanceTemplateID}>{t.TemplateName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* COMMENTS */}
                <div className="mb-3">
                  <label className="fw-bold">Comments</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter review comments..."
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                  />
                </div>

                {/* REVIEW STATUS */}
                <div className="mb-3">
                  <label className="fw-bold">Review Status</label>
                  <select
                    className="form-select"
                    value={reviewStatus}
                    onChange={e => setReviewStatus(e.target.value as "Draft" | "Submitted")}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>

                {/* CRITERIA RATINGS */}
                <h6 className="mb-3 fw-bold">Criteria Ratings</h6>
                {criteriaLoading ? (
                  <div className="alert alert-info">
                    Loading criteria for selected template...
                  </div>
                ) : criteriaRatings.length === 0 ? (
                  <div className="alert alert-warning">
                    {isNewReview && selectedTemplate
                      ? "No criteria found for this template"
                      : "Please select a template to load criteria"}
                  </div>
                ) : (
                  criteriaRatings.map(c => (
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
                            <option value="">Select Rating</option>
                            {[1, 2, 3, 4, 5].map(r => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-10">
                          <textarea
                            className="form-control"
                            placeholder="Enter feedback..."
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
                  ))
                )}
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
