import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import employeeIdRuleService from "../../services/employeeIdRuleService";
import departmentService from "../../services/departmentService";
import LoggedInUser from "../../types/LoggedInUser";

// ===== Types =====
interface EmployeeIdRule {
  id: number;
  organizationID: number;
  ruleName: string;
  prefix: string;
  includeYear: boolean;
  includeDepartmentCode: boolean;
  sequenceLength: number;
  separator: string;
  departmentCode: string;
  preview: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
}

// ===== Department Options =====
// Departments will be loaded from API based on organizationID

const EmployeeIdRulesPage: React.FC = () => {
  // ===== Organization ID =====
  const userString = localStorage.getItem("user");
    const user: LoggedInUser | null = userString
      ? JSON.parse(userString)
      : null;
  
    const organizationID = user?.organizationID ?? 0;

  // ===== Logged User =====
  const loginUser = "admin";

  // ===== States =====
  const [rules, setRules] = useState<EmployeeIdRule[]>([]);

  const [departments, setDepartments] = useState<
    {
      DepartmentID: number;
      DepartmentCode: string;
      DepartmentName: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState<number | null>(
    null
  );

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteRuleId, setDeleteRuleId] = useState<
    number | null
  >(null);

  const [formData, setFormData] = useState({
    ruleName: "",
    prefix: "",
    includeYear: true,
    includeDepartmentCode: true,
    sequenceLength: 4,
    separator: "-",
    departmentCode: "",
    status: "Active",
  });

  // ======================================================
  // LOAD DATA
  // ======================================================
  useEffect(() => {
    getEmployeeIdRules();
    getDepartments();
  }, []);

  // ======================================================
  // GET DEPARTMENTS
  // ======================================================
  const getDepartments = async () => {
    try {
      const data = await departmentService.getdepartmentesAsync(
        organizationID
      );

      setDepartments(data?.Table || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load departments");
    }
  };

  // ======================================================
  // GET RULES
  // ======================================================
const getEmployeeIdRules = async () => {
  try {
    setLoading(true);

    const response =
      await employeeIdRuleService.GetEmployeeIdRules(
        organizationID
      );

    const mappedRules: EmployeeIdRule[] = (
      response || []
    ).map((item: any) => ({
      id: item.Id,
      organizationID: item.OrganizationID,
      ruleName: item.RuleName,
      prefix: item.Prefix,
      includeYear: item.IncludeYear,
      includeDepartmentCode:
        item.IncludeDepartmentCode,
      sequenceLength: item.SequenceLength,
      separator: item.Separator ?? "",
      departmentCode:
        item.DepartmentCode ?? "",
      preview: item.Preview ?? "",
      status: item.Status ?? "Active",
      createdBy: item.CreatedBy,
      updatedBy: item.UpdatedBy,
    }));

    setRules(mappedRules);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load rules");
  } finally {
    setLoading(false);
  }
};

  // ======================================================
  // HANDLE CHANGE
  // ======================================================
  const handleChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // ======================================================
  // GENERATE PREVIEW
  // ======================================================
  const generatePreview = () => {
  const parts: string[] = [];

  if (formData.prefix) {
    parts.push(formData.prefix);
  }

  if (
    formData.includeDepartmentCode &&
    formData.departmentCode
  ) {
    parts.push(formData.departmentCode);
  }

  if (formData.includeYear) {
    parts.push(new Date().getFullYear().toString());
  }

  parts.push(
    "1".padStart(
      Number(formData.sequenceLength),
      "0"
    )
  );

  return formData.separator
    ? parts.join(formData.separator)
    : parts.join("");
};

  // ======================================================
  // RESET FORM
  // ======================================================
  const resetForm = () => {
    setFormData({
      ruleName: "",
      prefix: "",
      includeYear: true,
      includeDepartmentCode: true,
      sequenceLength: 4,
      separator: "-",
      departmentCode: "",
      status: "Active",
    });

    setEditId(null);
  };

  // ======================================================
  // SAVE / UPDATE
  // ======================================================
  const handleSaveRule = async () => {
    try {
      if (!formData.ruleName.trim()) {
        toast.warning("Please enter Rule Name");
        return;
      }

      if (!formData.prefix.trim()) {
        toast.warning("Please enter Prefix");
        return;
      }

      const payload = {
        id: editId || 0,
        organizationID: organizationID,
        ruleName: formData.ruleName,
        prefix: formData.prefix,
        includeYear: formData.includeYear,
        includeDepartmentCode:
          formData.includeDepartmentCode,
        sequenceLength: Number(
          formData.sequenceLength
        ),
        separator: formData.separator,
        departmentCode: formData.departmentCode,
        preview: generatePreview(),
        status: formData.status,
        createdBy: loginUser,
        updatedBy: loginUser,
      };

      const response =
        await employeeIdRuleService.PostEmployeeIdRulesAsync(
          payload
        );

      if (response?.value === 1) {
        toast.success(response.message);

        resetForm();

        getEmployeeIdRules();
      } else {
        toast.error(
          response?.message ||
            "Failed to save rule"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    }
  };

  // ======================================================
  // EDIT
  // ======================================================
const handleEdit = (rule: EmployeeIdRule) => {
  setEditId(rule.id);

  setFormData({
    ruleName: rule.ruleName || "",
    prefix: rule.prefix || "",
    includeYear: rule.includeYear,
    includeDepartmentCode:
      rule.includeDepartmentCode,
    sequenceLength: rule.sequenceLength,
    separator: rule.separator || "",
    departmentCode:
      rule.departmentCode || "",
    status: rule.status || "Active",
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  // ======================================================
  // OPEN DELETE
  // ======================================================
  const openDeleteModal = (id: number) => {
    setDeleteRuleId(id);

    setShowDeleteModal(true);
  };

  // ======================================================
  // DELETE
  // ======================================================
  const handleDelete = async () => {
    try {
      if (!deleteRuleId) return;

      const response =
        await employeeIdRuleService.DeleteEmployeeIdRulesAsync(
          deleteRuleId
        );

      if (response?.value === 1) {
        toast.success(response.message);

        getEmployeeIdRules();
      } else {
        toast.error(
          response?.message ||
            "Failed to delete rule"
        );
      }

      setShowDeleteModal(false);

      setDeleteRuleId(null);

      if (editId === deleteRuleId) {
        resetForm();
      }
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}
      <div className="mb-4">
        <h3 className="mb-1">
          Employee ID Generation Rules
        </h3>

        <p className="text-muted mb-0">
          Configure custom employee ID generation
          rules for your organization
        </p>
      </div>

      {/* ====================================================== */}
      {/* FORM */}
      {/* ====================================================== */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">
              {editId
                ? "Edit Employee Rule"
                : "Create New Rule"}
            </h5>

            {editId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
          </div>

          <Row>
            {/* Rule Name */}
            <Col md={6} className="mb-3">
              <Form.Label>Rule Name</Form.Label>

              <Form.Control
                type="text"
                name="ruleName"
                value={formData.ruleName}
                onChange={handleChange}
                placeholder="Enter rule name"
              />
            </Col>

            {/* Prefix */}
            <Col md={6} className="mb-3">
              <Form.Label>Prefix</Form.Label>

              <Form.Control
                type="text"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                placeholder="Example: EMP"
              />
            </Col>

            {/* Separator */}
            <Col md={4} className="mb-3">
              <Form.Label>
                Separator
              </Form.Label>

              <Form.Select
                name="separator"
                value={formData.separator}
                onChange={handleChange}
              >
                <option value="">
                  No Separator
                </option>

                <option value="-">-</option>

                <option value="/">/</option>

                <option value="_">_</option>
              </Form.Select>
            </Col>

            {/* Sequence Length */}
            <Col md={4} className="mb-3">
              <Form.Label>
                Sequence Length
              </Form.Label>

              <Form.Select
                name="sequenceLength"
                value={formData.sequenceLength}
                onChange={handleChange}
              >
                <option value={3}>
                  3 Digits
                </option>

                <option value={4}>
                  4 Digits
                </option>

                <option value={5}>
                  5 Digits
                </option>

                <option value={6}>
                  6 Digits
                </option>
              </Form.Select>
            </Col>

            {/* Department */}
            <Col md={4} className="mb-3">
            <Form.Label>Department Code</Form.Label>

            <Form.Select
              name="departmentCode"
              value={formData.departmentCode}
              onChange={handleChange}
              disabled={!formData.includeDepartmentCode}
            >
              <option value="">
                Select Department
              </option>

              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentCode}>
                  {d.DepartmentCode} {d.DepartmentName ? `- ${d.DepartmentName}` : ''}
                </option>
              ))}
            </Form.Select>
          </Col>
          </Row>

          {/* CHECKBOXES */}
          <Row className="mt-2">
            <Col md={4} className="mb-3">
              <Form.Check
                type="checkbox"
                label="Include Year"
                name="includeYear"
                checked={formData.includeYear}
                onChange={handleChange}
              />
            </Col>

            <Col md={4} className="mb-3">
              <Form.Check
                type="checkbox"
                label="Include Department Code"
                name="includeDepartmentCode"
                checked={
                  formData.includeDepartmentCode
                }
                onChange={handleChange}
              />
            </Col>

            <Col md={4} className="mb-3">
              <Form.Label>Status</Form.Label>

              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </Form.Select>
            </Col>
          </Row>

          {/* PREVIEW */}
          <Card className="bg-light border-0 mt-3">
            <Card.Body>
              <h6 className="mb-2">
                Generated Employee ID Preview
              </h6>

              <div
                className="fw-bold text-primary"
                style={{
                  fontSize: "20px",
                  letterSpacing: "1px",
                }}
              >
                {generatePreview()}
              </div>
            </Card.Body>
          </Card>

          {/* BUTTONS */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            {editId && (
              <Button
                variant="outline-secondary"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}

            <Button
              variant={
                editId ? "warning" : "primary"
              }
              onClick={handleSaveRule}
            >
              {editId
                ? "Update Rule"
                : "Save Rule"}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}
        <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Rules List</h5>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Prefix</th>
                  <th>Dept</th>
                  <th>Year</th>
                  <th>Separator</th>
                  <th>Seq</th>
                  <th>Preview</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.ruleName}</td>
                    <td>{rule.prefix}</td>
                    <td>{rule.departmentCode || "-"}</td>
                    <td>{rule.includeYear ? "Yes" : "No"}</td>
                    <td>{rule.separator || "None"}</td>
                    <td>{rule.sequenceLength}</td>
                    <td className="text-primary fw-bold">
                      {rule.preview}
                    </td>
                    <td>
                      <Badge bg={rule.status === "Active" ? "success" : "secondary"}>
                        {rule.status}
                      </Badge>
                    </td>
                    <td>
                      <Button size="sm" variant="warning" onClick={() => handleEdit(rule)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openDeleteModal(rule.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* ====================================================== */}
      {/* DELETE MODAL */}
      {/* ====================================================== */}
      <Modal
        show={showDeleteModal}
        onHide={() =>
          setShowDeleteModal(false)
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Delete Rule
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this
          employee ID rule?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setShowDeleteModal(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeIdRulesPage;