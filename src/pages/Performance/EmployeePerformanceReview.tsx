import React, { useState, useEffect } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import employeeService from "../../services/employeeService";
import performanceService from "../../services/performanceService";
import "bootstrap/dist/css/bootstrap.min.css";

/* ================= TYPES ================= */

interface ReviewGridRow {
  ReviewID: number;
  EmployeeID?: number;
  ReviewerID?: number;
  TemplateID?: number;
  ReviewCycleID?: number;
  EmployeeName: string;
  CycleName: string;
  TemplateName: string;  
  Status: string;
  Comments: string;
  ReviewStatus: string;
  Ratings?: any[];
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

/* ================= COMPONENT ================= */

const SubmittedPerformanceReviews: React.FC = () => {
  /* ================= STATE ================= */
  const [reviews, setReviews] = useState<ReviewGridRow[]>([]);

  const [filters, setFilters] = useState({
    employee: "",
    cycle: "",
    status: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedReview, setSelectedReview] = useState<ReviewGridRow | null>(null);
  const [criteriaRatings, setCriteriaRatings] = useState<CriteriaRating[]>([]);
  const [existingReviewID, setExistingReviewID] = useState<number | null>(null);

  const [isNewReview, setIsNewReview] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedCycleID, setSelectedCycleID] = useState<string>("");
  const [selectedTemplateID, setSelectedTemplateID] = useState<string>("");
  const [selectedEmployeeID, setSelectedEmployeeID] = useState<string>("");
  const [comments, setComments] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"Draft" | "Submitted">("Draft");

  /* ================= API DATA STATE ================= */
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
     // Get organizationID from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;
        const logedInUserid = user.employeeID;

  const normalizeApiRecord = (record: any) => {
    if (!record || typeof record !== "object") return record;
    const jsonKey = Object.keys(record).find(key => key.startsWith("JSON_"));
    if (jsonKey && typeof record[jsonKey] === "string") {
      try {
        return JSON.parse(record[jsonKey]);
      } catch {
        return record;
      }
    }
    return record;
  };

  const normalizeApiResponse = (response: any) => {
    if (!response) return [];
    if (Array.isArray(response)) return response.map(normalizeApiRecord);

    if (typeof response === "string") {
      try {
        const parsed = JSON.parse(response);
        return Array.isArray(parsed)
          ? parsed.map(normalizeApiRecord)
          : [normalizeApiRecord(parsed)];
      } catch {
        return [];
      }
    }

    if (typeof response === "object") {
      const jsonKey = Object.keys(response).find(key => key.startsWith("JSON_"));
      if (jsonKey && typeof response[jsonKey] === "string") {
        try {
          const parsed = JSON.parse(response[jsonKey]);
          return Array.isArray(parsed)
            ? parsed.map(normalizeApiRecord)
            : [normalizeApiRecord(parsed)];
        } catch {
          return [];
        }
      }

      if (Array.isArray(response.Table)) return response.Table.map(normalizeApiRecord);
      if (Array.isArray(response.data)) return response.data.map(normalizeApiRecord);
      return [normalizeApiRecord(response)];
    }

    return [];
  };

  const normalizeRatings = (ratings: any) => {
    if (!ratings) return [];
    if (Array.isArray(ratings)) return ratings;
    if (typeof ratings === "string") {
      try {
        const parsed = JSON.parse(ratings);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (typeof ratings === "object") return [ratings];
    return [];
  };

  const getCriteriaNames = (ratings: any) => {
    const normalized = normalizeRatings(ratings);
    return normalized
      .map((rating: any) => rating.CriteriaName || rating.criteriaName || "")
      .filter(Boolean)
      .join(", ");
  };

  const getCriteriaSummary = (ratings: any) => {
    const normalized = normalizeRatings(ratings);
    return normalized
      .map((rating: any) => {
        const name = rating.CriteriaName || rating.criteriaName || rating.Criteria || rating.Name || "";
        const value = rating.Rating != null ? ` (${rating.Rating})` : "";
        return name ? `${name}${value}` : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  const getEmployeeName = (employeeID: number | string | undefined) => {
    const id = employeeID != null ? String(employeeID) : "";
    return employees.find(emp => String(emp.EmployeeID) === id)?.EmployeeName || "";
  };

  const getCycleName = (cycleID: number | string | undefined) => {
    const id = cycleID != null ? String(cycleID) : "";
    return cycles.find(c => String(c.PerformanceReviewCycleID) === id)?.CycleName || "";
  };

  const getTemplateName = (templateID: number | string | undefined) => {
    const id = templateID != null ? String(templateID) : "";
    return templates.find(t => String(t.PerformanceTemplateID) === id)?.TemplateName || "";
  };

  /* ================= FETCH API DATA ================= */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!organizationID) {
          setError("Organization ID not found");
          setLoading(false);
          return;
        }

        const employeesData = await employeeService.getEmployeesByOrganizationIdAsync(organizationID);
        const employeesArray = Array.isArray(employeesData) ? employeesData : employeesData?.Table || [];
        const mappedEmployees: Employee[] = employeesArray.map((emp: any) => ({
          EmployeeID:
            emp.EmployeeID ?? emp.EmployeeId ?? emp.id ?? emp.ID ?? "",
          EmployeeName:
            emp.EmployeeName || emp.Name || emp.name || emp.Employee || "",
        }));
        setEmployees(mappedEmployees);

        const cyclesData = await performanceService.getPerformanceReviewCyclesByOrganizationIDAsync(organizationID);
        const cyclesArray = Array.isArray(cyclesData)
          ? cyclesData
          : cyclesData?.Table || cyclesData?.Table1 || cyclesData?.data || [];
        const mappedCycles: ReviewCycle[] = cyclesArray.map((cycle: any) => ({
          PerformanceReviewCycleID:
            cycle.PerformanceReviewCycleID ?? cycle.ReviewCycleID ?? cycle.id ?? cycle.ID ?? "",
          CycleName: cycle.CycleName || cycle.Cycle || cycle.name || cycle.Name || "",
        }));
        setCycles(mappedCycles);

        const templatesData = await performanceService.getPerformanceTemplatesByOrganizationIDAsync(organizationID);
        const templatesArray = Array.isArray(templatesData)
          ? templatesData
          : templatesData?.Table || templatesData?.Table1 || templatesData?.data || [];
        const mappedTemplates: Template[] = templatesArray.map((template: any) => ({
          PerformanceTemplateID:
            template.PerformanceTemplateID ?? template.TemplateID ?? template.id ?? template.ID ?? "",
          TemplateName:
            template.TemplateName || template.Template || template.name || template.Name || "",
        }));
        setTemplates(mappedTemplates);

        if (logedInUserid) {
          const response = await performanceService.GetPerformanceReviewByIDAsync(logedInUserid);
          const responseArray = normalizeApiResponse(response);

          const normalizedReviews = responseArray
            .map((rawReview: any) => normalizeApiRecord(rawReview))
            .map((review: any) => ({
              ReviewID: Number(review.ReviewID || 0),
              EmployeeID: review.EmployeeID,
              ReviewerID: review.ReviewerID,
              TemplateID: review.TemplateID,
              ReviewCycleID: review.ReviewCycleID,
              EmployeeName: review.EmployeeName || mappedEmployees.find(emp => String(emp.EmployeeID) === String(review.EmployeeID))?.EmployeeName || "",
              CycleName: review.CycleName || mappedCycles.find(c => String(c.PerformanceReviewCycleID) === String(review.ReviewCycleID))?.CycleName || "",
              TemplateName: review.TemplateName || mappedTemplates.find(t => String(t.PerformanceTemplateID) === String(review.TemplateID))?.TemplateName || "",
              Status: review.Status || "",
              Comments: review.Comments || "",
              ReviewStatus: review.ReviewStatus || review.Status || "",
              Ratings: normalizeRatings(review.Ratings || review.Rating || review.RatingList || review.ReviewRatings),
            }));

          setReviews(normalizedReviews);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dropdown or reviewer data", err);
        setError("Failed to load data. Please check the console for details.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [logedInUserid]);

  /* ================= FETCH TEMPLATE REVIEW OR CRITERIA ================= */
  useEffect(() => {
    const fetchExistingReviewOrCriteria = async () => {
      if (!isNewReview || selectedTemplateID === "") {
        return;
      }

      if (!selectedEmployeeID || !selectedCycleID) {
        setCriteriaRatings([]);
        return;
      }

      if (existingReviewID !== null) {
        return;
      }

      const selectedTemplateNum = Number(selectedTemplateID);
      if (Number.isNaN(selectedTemplateNum)) {
        setCriteriaRatings([]);
        return;
      }

      try {
        setCriteriaLoading(true);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const organizationID = user.organizationID;

        if (!organizationID) {
          console.error("Organization ID not found");
          setCriteriaLoading(false);
          return;
        }

        const payload = {
          employeeID: Number(selectedEmployeeID),
          reviewerID: Number(logedInUserid),
          reviewCycleID: Number(selectedCycleID),
          templateID: selectedTemplateNum,
        };

        const existingReview = await performanceService.GetEmployeeReviewsAsync(payload);
        const rawReviewRecord = Array.isArray(existingReview)
          ? existingReview[0]
          : existingReview;
        const reviewRecord = normalizeApiRecord(rawReviewRecord);

        if (reviewRecord && reviewRecord.ReviewID) {
          const ratingsArray = Array.isArray(reviewRecord.Ratings)
            ? reviewRecord.Ratings
            : [];

          setExistingReviewID(Number(reviewRecord.ReviewID));
          setComments(reviewRecord.Comments || "");
          setReviewStatus((reviewRecord.Status as "Draft" | "Submitted") || reviewStatus);
          setCriteriaRatings(
            ratingsArray.map((criteria: any) => ({
              CriteriaID: criteria.CriteriaID || criteria.PerformanceCriteriaID || criteria.id,
              CriteriaName: criteria.CriteriaName || criteria.CriteriaName || criteria.criteriaName || criteria.name || "",
              Rating: criteria.Rating || 0,
              Feedback: criteria.Feedback || "",
            }))
          );
        } else {
          const criteriaData = await performanceService.CriteriaByTemplateAsync(
            organizationID,
            selectedTemplateNum
          );
          const criteriaArray = Array.isArray(criteriaData)
            ? criteriaData
            : criteriaData?.Table || criteriaData?.Table1 || criteriaData?.data || [];

          const mappedCriteria: CriteriaRating[] = criteriaArray.map((criteria: any) => ({
            CriteriaID: criteria.PerformanceCriteriaID || criteria.CriteriaID || criteria.id,
            CriteriaName: criteria.CriteriaName || criteria.name || criteria.criteriaName || criteria.CriteriaName || "",
            Rating: 0,
            Feedback: "",
          }));

          setCriteriaRatings(mappedCriteria);
        }

        setCriteriaLoading(false);
      } catch (err) {
        console.error("Failed to load review or template criteria", err);
        setCriteriaLoading(false);
      }
    };

    fetchExistingReviewOrCriteria();
  }, [selectedTemplateID, selectedEmployeeID, selectedCycleID, isNewReview, existingReviewID, reviewStatus]);

  /* ================= FILTER LOGIC ================= */

  const filteredReviews = reviews.filter(r =>
    (!filters.employee || r.EmployeeName === filters.employee) &&
    (!filters.cycle || r.CycleName === filters.cycle) &&
    (!filters.status || r.Status === filters.status)
  );

  /* ================= ACTIONS ================= */

const openEdit = (review: ReviewGridRow) => {
      const detailRecord = normalizeApiRecord(review);
      const cycleID = String(detailRecord.ReviewCycleID || detailRecord.CycleID || "");
      const templateID = String(detailRecord.TemplateID || detailRecord.PerformanceTemplateID || "");
      const employeeID = String(detailRecord.EmployeeID || "");

      setIsNewReview(false);
      setSelectedReview(review);
      setSelectedCycle(detailRecord.CycleName || review.CycleName || "");
      setSelectedTemplate(detailRecord.TemplateName || review.TemplateName || "");
      setSelectedEmployee(detailRecord.EmployeeName || review.EmployeeName || "");
      setSelectedCycleID(cycleID);
      setSelectedTemplateID(templateID);
      setSelectedEmployeeID(employeeID);
      setExistingReviewID(review.ReviewID);
      setComments(detailRecord.Comments || review.Comments || "");
      setReviewStatus((detailRecord.ReviewStatus as "Draft" | "Submitted") || review.ReviewStatus || "Draft");
      setCriteriaRatings(
        Array.isArray(detailRecord.Ratings)
          ? detailRecord.Ratings.map((criteria: any) => ({
              CriteriaID: criteria.PerformanceCriteriaID || criteria.CriteriaID || criteria.id,
              CriteriaName: criteria.CriteriaName || criteria.name || "",
              Rating: criteria.Rating || 0,
              Feedback: criteria.Feedback || "",
            }))
          : []
      );
      setShowEditModal(true);
    };

  const saveReviewChanges = async () => {
    if (!selectedEmployeeID || !selectedCycleID || !selectedTemplateID) {
      ToastMessage.show("Employee, cycle and template are required.", "error");
      return;
    }

    const ratingsPayload = criteriaRatings.map(c => ({
      RatingID: 0,
      CriteriaID: c.CriteriaID,
      Rating: c.Rating,
      Feedback: c.Feedback,
    }));

    const reviewIDToSave = existingReviewID ?? (isNewReview ? 0 : selectedReview?.ReviewID);
    const isUpdate = reviewIDToSave !== 0 && reviewIDToSave !== undefined;

    const payload = {
      ReviewID: reviewIDToSave,
      EmployeeID: selectedEmployeeID || undefined,
      ReviewCycleID: selectedCycleID || undefined,
      TemplateID: selectedTemplateID || undefined,
      EmployeeName: selectedEmployee,
      CycleName: selectedCycle,
      TemplateName: selectedTemplate,
      Status: reviewStatus,
      Comments: comments,
      ReviewStatus: reviewStatus,
      ReviewerID: logedInUserid,
      Ratings: ratingsPayload,
    };

    try {
      const response = await performanceService.SaveEmployeeReviewAsync(payload);
      const result = Array.isArray(response) ? response[0] : response;

      if (result?.value === 1 || result?.success === true || result?.status === "success") {
        if (!isUpdate) {
          const newReview: ReviewGridRow = {
            ReviewID: result?.reviewID || Date.now(),
            EmployeeName: selectedEmployee,
            CycleName: selectedCycle,
            TemplateName: selectedTemplate,
            Status: reviewStatus,
            Comments: comments,
            ReviewStatus: reviewStatus,
          };
          setReviews(prev => [...prev, newReview]);
          ToastMessage.show("Review submitted successfully!", "success");
        } else {
          setReviews(prev =>
            prev.map(r =>
              r.ReviewID === reviewIDToSave
                ? { ...r, Status: reviewStatus, Comments: comments, ReviewStatus: reviewStatus }
                : r
            )
          );
          ToastMessage.show("Review updated successfully!", "success");
        }
        setShowEditModal(false);
      } else {
        ToastMessage.show(result?.msg || "Unable to save review.", "error");
      }
    } catch (err) {
      console.error("Failed to save review", err);
      ToastMessage.show("Failed to save review. Please try again.", "error");
    }
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

      <div className="container">
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
            setSelectedEmployeeID("");
            setSelectedCycleID("");
            setSelectedTemplateID("");
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
              className="form-select org-select"
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
              <th>Criteria</th>
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
                <td>
                  {getCriteriaSummary(r.Ratings) || "No criteria"}
                </td>
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
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => openEdit(r)}
                  >
                    <i className="bi bi-pencil-square"></i>
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
                        value={selectedEmployeeID}
                        onChange={e => {
                          const id = e.target.value || "";
                          setExistingReviewID(null);
                          setSelectedEmployeeID(id);
                          const employee = employees.find(emp => String(emp.EmployeeID) === id);
                          setSelectedEmployee(employee?.EmployeeName || "");
                        }}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(e => (
                          <option key={e.EmployeeID} value={String(e.EmployeeID || "")}>
                            {e.EmployeeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="fw-bold">Review Cycle</label>
                      <select
                        className="form-select"
                        value={selectedCycleID}
                        onChange={e => {
                          const id = e.target.value || "";
                          setExistingReviewID(null);
                          setSelectedCycleID(id);
                          const cycle = cycles.find(
                            c => String(c.PerformanceReviewCycleID) === id
                          );
                          setSelectedCycle(cycle?.CycleName || "");
                        }}
                      >
                        <option value="">Select Cycle</option>
                        {cycles.map(c => (
                          <option key={c.PerformanceReviewCycleID} value={String(c.PerformanceReviewCycleID || "")}>
                            {c.CycleName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="fw-bold">Template</label>
                      <select
                        className="form-select"
                        value={selectedTemplateID}
                        disabled={!selectedEmployeeID || !selectedCycleID}
                        onChange={e => {
                          const id = e.target.value || "";
                          setExistingReviewID(null);
                          setSelectedTemplateID(id);
                          const template = templates.find(
                            t => String(t.PerformanceTemplateID) === id
                          );
                          setSelectedTemplate(template?.TemplateName || "");
                        }}
                      >
                        <option value="">Select Template</option>
                        {templates.map(t => (
                          <option key={t.PerformanceTemplateID} value={String(t.PerformanceTemplateID || "")}>
                            {t.TemplateName}
                          </option>
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
                  className="btn btn-outline-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-outline-success"
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
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-outline-danger"
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
