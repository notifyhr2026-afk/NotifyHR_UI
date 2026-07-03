import React, { useEffect, useState } from "react";
import { Container, Spinner, Card, Badge, Form, Row, Col, Pagination } from "react-bootstrap";
import  employeeService  from "../../services/employeeService";

// ---------------------- Interfaces ----------------------

interface EmployeeTree {
  TotalRecords: number;
  EmployeeID: number;
  EmployeeCode: string;
  EmployeeName: string;
  Gender: string;
  MaritalStatus: string;
  DateOfJoining: string;
  PersonalPhone: string;
  PersonalEmail: string;
  EffectiveFrom: string;
  EffectiveTo: string | null;
  IsCurrent: boolean;
  EmploymentTypeName: string;
  PositionTitle: string;
  DepartmentName: string;
  DivisionName: string;
  BranchName: string;
  ReportingManagerCode: string;
  ReportingManagerName: string;
}

// ---------------------- Component ----------------------

const EmployeeTree: React.FC = () => {
  const [data, setData] = useState<EmployeeTree[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;

  // ---------------------- API Call ----------------------

  const loadEmployees = async () => {
    if (!organizationID) return;

    setLoading(true);

    try {
      const payload = {
        organizationID,
        pageNumber,
        pageSize,
        employeeName: search,
      };

      const res = await employeeService.GetEmployeeTreeAsync(payload);

      setData(res || []);
      setTotalRecords(res?.[0]?.TotalRecords || 0);
    } catch (err) {
      console.error("Error loading employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [pageNumber]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPageNumber(1);
      loadEmployees();
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);
  // ---------------------- Handlers ----------------------

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // ---------------------- Pagination Calculation ----------------------

  const totalPages = Math.ceil(totalRecords / pageSize);

  const getPaginationItems = () => {
    const items = [];

    const startPage = Math.max(1, pageNumber - 2);
    const endPage = Math.min(totalPages, pageNumber + 2);

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    return items;
  };

  // ---------------------- UI Helpers ----------------------

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Container fluid className="py-3">

      {/* ---------------- HEADER ---------------- */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Employee Diary</h4>

        <Badge bg="primary">
          Total Records: {totalRecords}
        </Badge>
      </div>

      {/* ---------------- SEARCH BOX ---------------- */}
      <Row className="mb-3">
        <Col md={8}></Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by Employee Name..."
            value={search}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      {/* ---------------- LOADING ---------------- */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {/* ---------------- EMPTY STATE ---------------- */}
      {!loading && data.length === 0 && (
        <div className="text-center text-muted py-5">
          No employees found
        </div>
      )}
            {/* ---------------- EMPLOYEE CARDS ---------------- */}
      {!loading && data.length > 0 && (
        <Row>
          {data.map((emp, index) => {
            const isActive = emp.IsCurrent;

            return (
              <Col lg={4} md={6} sm={12} key={`${emp.EmployeeID}-${index}`} className="mb-4">
                
                <Card
                  className={`shadow-sm border-0 h-100 employee-card ${
                    isActive ? "active-card" : ""
                  }`}
                  style={{ borderRadius: "14px" }}
                >
                  <Card.Body>

                    {/* HEADER */}
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div>
                        <h5 className="mb-0 fw-semibold">
                          {emp.EmployeeName}
                        </h5>
                        <small className="text-muted">
                          {emp.EmployeeCode} | {emp.Gender} | {emp.MaritalStatus} 
                        </small>
                      </div>

                      {isActive && (
                        <Badge bg="success">Active</Badge>
                      )}
                    </div>

                    {/* POSITION INFO */}
                    <div className="mb-2">
                      <div className="fw-semibold text-primary">
                        {emp.PositionTitle}
                      </div>
                      <small className="text-muted">
                        {emp.DepartmentName} 
                      </small>
                    </div>

                    {/* DETAILS */}
                    <div className="small text-muted">
                      <div><b>Division:</b> {emp.DivisionName}</div>
                      <div><b>Branch:</b> {emp.BranchName}</div>
                      <div><b>Employment:</b> {emp.EmploymentTypeName}</div>
                      <div><b>DOJ:</b> {formatDate(emp.DateOfJoining)}</div>
                    </div>

                    <hr />

                    {/* CONTACT */}
                    <div className="small">
                      <div>
                        📞 {emp.PersonalPhone || "-"}
                      </div>
                      <div>
                        ✉️ {emp.PersonalEmail || "-"}
                      </div>
                    </div>

                    <hr />

                    {/* MANAGER INFO */}
                    <div className="small">
                      <div className="fw-semibold text-secondary">
                        Reporting Manager
                      </div>
                      <div>
                        {emp.ReportingManagerName || "-"}
                      </div>
                      <div className="text-muted">
                        {emp.ReportingManagerCode || ""}
                      </div>
                    </div>

                  </Card.Body>
                </Card>

              </Col>
            );
          })}
        </Row>
      )}
            {/* ---------------- PAGINATION ---------------- */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>

            {/* Previous */}
            <Pagination.Prev
              disabled={pageNumber === 1}
              onClick={() => handlePageChange(pageNumber - 1)}
            />

            {/* Page Numbers */}
            {getPaginationItems().map((page) => (
              <Pagination.Item
                key={page}
                active={page === pageNumber}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}

            {/* Next */}
            <Pagination.Next
              disabled={pageNumber === totalPages}
              onClick={() => handlePageChange(pageNumber + 1)}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default EmployeeTree;