import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Toast,
  ToastContainer,
  Row,
  Col,
} from "react-bootstrap";
import { BsPlus } from "react-icons/bs";

import branchService from "../../services/branchService";
import benchPolicyRuleService from "../../services/benchPolicyRuleService";
import employeeService from "../../services/employeeService";
import positionService from "../../services/positionService";
import departmentService from "../../services/departmentService";
import LoggedInUser from "../../types/LoggedInUser";

const normalizeLookupList = (response: any) =>
  Array.isArray(response)
    ? response
    : response?.Table || response?.data || [];

const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface Branch {
  BranchID: number;
  BranchName: string;
}

interface BenchPolicyRule {
  benchPolicyRuleID: number;
  branchID: number;
  employmentTypeID: number;
  positionID: number;
  departmentID: number;
  maxBenchDays: number;
  warningAfterDays: number;
  isActive: boolean;
}

const ManageBenchPolicyRules: React.FC = () => {
  const userString = localStorage.getItem("user");

  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [rules, setRules] = useState<BenchPolicyRule[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<{ id: number; name: string }[]>([]);
  const [positions, setPositions] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editRule, setEditRule] = useState<BenchPolicyRule | null>(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });
const getBranchName = (branchID: number) =>
  branches.find((x) => x.BranchID === branchID)?.BranchName ?? "-";

const getEmploymentType = (id: number) =>
  employmentTypes.find((x) => x.id === id)?.name ?? "-";

const getPosition = (id: number) =>
  positions.find((x) => x.id === id)?.name ?? "-";

const getDepartment = (id: number) =>
  departments.find((x) => x.id === id)?.name ?? "-";
  const [formData, setFormData] = useState<BenchPolicyRule>({
    benchPolicyRuleID: 0,
    branchID: 0,
    employmentTypeID: 0,
    positionID: 0,
    departmentID: 0,
    maxBenchDays: 30,
    warningAfterDays: 15,
    isActive: true,
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    loadBranches();
    loadRules();
    loadEmploymentTypes();
    loadPositions();
    loadDepartments();
  }, []);

  const loadBranches = async () => {
    const res = await branchService.getBranchesAsync(organizationID);
    setBranches(res?.Table ?? []);
  };

  const loadRules = async () => {
    const res = await benchPolicyRuleService.getBenchPolicyRules(organizationID);

    const mapped =
      (res || []).map((r: any) => ({
        benchPolicyRuleID: r.BenchPolicyRuleID,
        branchID: r.BranchID,
        employmentTypeID: r.EmploymentTypeID,
        positionID: r.PositionID,
        departmentID: r.DepartmentID,
        maxBenchDays: r.MaxBenchDays,
        warningAfterDays: r.WarningAfterDays,
        isActive: r.IsActive,
      })) || [];

    setRules(mapped);
  };

  const loadEmploymentTypes = async () => {
    const res = await employeeService.getEmploymentTypes();
    const list = normalizeLookupList(res);

    setEmploymentTypes(
      list.map((item: any) => ({
        id: item.EmploymentTypeID || item.id || 0,
        name: item.EmploymentTypeName || item.name || "",
      }))
    );
  };

  const loadPositions = async () => {
    const res = await positionService.getPositionsAsync(organizationID);
    const list = normalizeLookupList(res);

    setPositions(
      list.map((item: any) => ({
        id: item.PositionID || item.id || 0,
        name: item.PositionTitle || item.name || "",
      }))
    );
  };

  const loadDepartments = async () => {
    const res = await departmentService.getdepartmentesAsync(organizationID);
    const list = normalizeLookupList(res);

    setDepartments(
      list.map((item: any) => ({
        id: item.DepartmentID || item.id || 0,
        name: item.DepartmentName || item.name || "",
      }))
    );
  };

  const filteredRules =
    selectedBranch === 0
      ? rules
      : rules.filter((r) => r.branchID === selectedBranch);

  /* ================= ORIGINAL FUNCTIONS (UNCHANGED) ================= */

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value,
    }));
  };

  const openAddModal = () => {
    setEditRule(null);

    setFormData({
      benchPolicyRuleID: 0,
      branchID: selectedBranch || 0,
      employmentTypeID: 0,
      positionID: 0,
      departmentID: 0,
      maxBenchDays: 30,
      warningAfterDays: 15,
      isActive: true,
    });

    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (rule: BenchPolicyRule) => {
    setEditRule(rule);
    setFormData(rule);
    setValidated(false);
    setShowModal(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      benchPolicyRuleID: formData.benchPolicyRuleID,
      organizationID,
      branchID: Number(formData.branchID),
      employmentTypeID: Number(formData.employmentTypeID),
      positionID: Number(formData.positionID),
      departmentID: Number(formData.departmentID),
      maxBenchDays: Number(formData.maxBenchDays),
      warningAfterDays: Number(formData.warningAfterDays),
      isActive: formData.isActive,
      createdBy: user?.userID ?? 0,
    };

    const res = await benchPolicyRuleService.postBenchPolicyRule(payload);

    if (res?.Value === 1 || res?.value === 1) {
      setToast({
        show: true,
        message: res?.Message || "Saved successfully",
        variant: "success",
      });

      setShowModal(false);
      loadRules();
    } else {
      setToast({
        show: true,
        message: res?.Message || "Save failed",
        variant: "warning",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this bench policy?")) return;

    await benchPolicyRuleService.deleteBenchPolicyRule(id, user?.userID ?? 0);
    loadRules();
  };

  /* ================= UI ONLY UPDATED ================= */

  return (
    <>
      <div
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: 12,
          padding: 24,
          border: "1px solid var(--border-color)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(13,110,253,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0d6efd",
              }}
            >
              <i className="bi bi-briefcase"></i>
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>Bench Policy Rules</div>
              <div style={{ fontSize: ".8rem", opacity: 0.6 }}>
                Manage bench allocation rules
              </div>
            </div>
          </div>

          <Button onClick={openAddModal} style={{ borderRadius: 8 }}>
            {Icon(BsPlus, { className: "me-1" })}
            Add Rule
          </Button>
        </div>

        {/* TABLE */}
        <div
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Table className="table-hover mb-0">
            <thead style={{ background: "rgba(0,0,0,.03)" }}>
              <tr>
                <th>Branch</th>
                <th>Type</th>
                <th>Position</th>
                <th>Department</th>
                <th>Max Days</th>
                <th>Warning</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-3">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRules.map((r) => (
                  <tr key={r.benchPolicyRuleID}>
                   <td>{getBranchName(r.branchID)}</td>
<td>{getEmploymentType(r.employmentTypeID)}</td>
<td>{getPosition(r.positionID)}</td>
<td>{getDepartment(r.departmentID)}</td>
                    <td>{r.maxBenchDays}</td>
                    <td>{r.warningAfterDays}</td>
                    <td>
                      <Badge bg={r.isActive ? "success" : "secondary"}>
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => openEditModal(r)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(r.benchPolicyRuleID)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* MODAL (ONLY STYLED, NO LOGIC CHANGE) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editRule ? "Edit Bench Policy" : "Add Bench Policy"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    name="branchID"
                    value={formData.branchID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.BranchID} value={b.BranchID}>
                        {b.BranchName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employment Type</Form.Label>
                  <Form.Select
                    name="employmentTypeID"
                    value={formData.employmentTypeID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select</option>
                    {employmentTypes.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Select
                    name="positionID"
                    value={formData.positionID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="departmentID"
                    value={formData.departmentID}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Select</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Bench Days</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxBenchDays"
                    value={formData.maxBenchDays}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warning After Days</Form.Label>
                  <Form.Control
                    type="number"
                    name="warningAfterDays"
                    value={formData.warningAfterDays}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="switch"
              name="isActive"
              label="Active"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="primary">
              {editRule ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* TOAST */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          delay={3000}
          autohide
          onClose={() => setToast((p) => ({ ...p, show: false }))}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ManageBenchPolicyRules;