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
import {
    BsPlus
} from "react-icons/bs";

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

const Icon = (Component: any, props: any = {}) => (
  <Component {...props} />
);

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
  const [employmentTypes, setEmploymentTypes] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [positions, setPositions] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [departments, setDepartments] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);

  const [editRule, setEditRule] =
    useState<BenchPolicyRule | null>(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const [formData, setFormData] =
    useState<BenchPolicyRule>({
      benchPolicyRuleID: 0,
      branchID: 0,
      employmentTypeID: 0,
      positionID: 0,
      departmentID: 0,
      maxBenchDays: 30,
      warningAfterDays: 15,
      isActive: true,
    });

  useEffect(() => {
    loadBranches();
    loadRules();
    loadEmploymentTypes();
    loadPositions();
    loadDepartments();
  }, []);

  const loadBranches = async () => {
    try {
      const res =
        await branchService.getBranchesAsync(
          organizationID
        );

      setBranches(res?.Table ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadEmploymentTypes = async () => {
    try {
      const res = await employeeService.getEmploymentTypes();
      const list = normalizeLookupList(res);
      setEmploymentTypes(
        list.map((item: any) => ({
          id:
            item.EmploymentTypeID ||
            item.id ||
            item.EmploymentTypeId ||
            0,
          name:
            item.EmploymentTypeName ||
            item.name ||
            item.employmentTypeName ||
            item.EmploymentType ||
            "",
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadPositions = async () => {
    try {
      const res = await positionService.getPositionsAsync(
        organizationID
      );
      const list = normalizeLookupList(res);
      setPositions(
        list.map((item: any) => ({
          id:
            item.PositionID ||
            item.id ||
            item.positionId ||
            0,
          name:
            item.PositionTitle ||
            item.name ||
            item.positionName ||
            "",
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getdepartmentesAsync(
        organizationID
      );
      const list = normalizeLookupList(res);
      setDepartments(
        list.map((item: any) => ({
          id:
            item.DepartmentID ||
            item.id ||
            item.departmentID ||
            0,
          name:
            item.DepartmentName ||
            item.name ||
            item.departmentName ||
            "",
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const loadRules = async () => {
    try {
      const res =
        await benchPolicyRuleService.getBenchPolicyRules(
          organizationID
        );

      const mapped =
        (res || []).map((r: any) => ({
          benchPolicyRuleID:
            r.BenchPolicyRuleID,
          branchID: r.BranchID,
          employmentTypeID:
            r.EmploymentTypeID,
          positionID: r.PositionID,
          departmentID: r.DepartmentID,
          maxBenchDays:
            r.MaxBenchDays,
          warningAfterDays:
            r.WarningAfterDays,
          isActive: r.IsActive,
        })) || [];

      setRules(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredRules =
    selectedBranch === 0
      ? rules
      : rules.filter(
          (r) =>
            r.branchID === selectedBranch
        );

  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { name, value, type } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? e.target.checked
          : value,
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

  const openEditModal = (
    rule: BenchPolicyRule
  ) => {
    setEditRule(rule);
    setFormData(rule);
    setValidated(false);
    setShowModal(true);
  };

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const payload = {
        benchPolicyRuleID:
          formData.benchPolicyRuleID,
        organizationID,
        branchID: Number(
          formData.branchID
        ),
        employmentTypeID: Number(
          formData.employmentTypeID
        ),
        positionID: Number(
          formData.positionID
        ),
        departmentID: Number(
          formData.departmentID
        ),
        maxBenchDays: Number(
          formData.maxBenchDays
        ),
        warningAfterDays: Number(
          formData.warningAfterDays
        ),
        isActive:
          formData.isActive,
        createdBy:
          user?.userID ?? 0,
      };

      const res =
        await benchPolicyRuleService.postBenchPolicyRule(
          payload
        );

      if (
        res?.Value === 1 ||
        res?.value === 1
      ) {
        setToast({
          show: true,
          message:
            res?.Message ||
            "Bench policy saved successfully.",
          variant: "success",
        });

        setShowModal(false);
        loadRules();
      } else {
        setToast({
          show: true,
          message:
            res?.Message ||
            "Unable to save policy.",
          variant: "warning",
        });
      }
    } catch {
      setToast({
        show: true,
        message:
          "Something went wrong.",
        variant: "danger",
      });
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    if (
      !window.confirm(
        "Delete this bench policy?"
      )
    )
      return;

    try {
      const res =
        await benchPolicyRuleService.deleteBenchPolicyRule(
          id,
          user?.userID ?? 0
        );

      const result = Array.isArray(res)
        ? res[0]
        : res;

      if (
        result?.Value === 1 ||
        result?.value === 1
      ) {
        setToast({
          show: true,
          message:
            result?.Message ||
            "Deleted successfully.",
          variant: "success",
        });

        loadRules();
      }
    } catch {
      setToast({
        show: true,
        message:
          "Delete failed.",
        variant: "danger",
      });
    }
  };

  const getBranchName = (
    branchID: number
  ) =>
    branches.find(
      (x) =>
        x.BranchID === branchID
    )?.BranchName ?? "-";

  const getEmploymentType = (
    id: number
  ) =>
    employmentTypes.find(
      (x) => x.id === id
    )?.name ?? "-";

  const getPosition = (
    id: number
  ) =>
    positions.find(
      (x) => x.id === id
    )?.name ?? "-";

  const getDepartment = (
    id: number
  ) =>
    departments.find(
      (x) => x.id === id
    )?.name ?? "-";

  return (
    <div className="Container">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <h3>
            Manage Bench Policies
          </h3>
        </Col>

        <Col md={4}>
          <Form.Select
            value={selectedBranch}
            onChange={(e) =>
              setSelectedBranch(
                Number(e.target.value)
              )
            }
          >
            <option value={0}>
              All Branches
            </option>

            {branches.map((b) => (
              <option
                key={b.BranchID}
                value={b.BranchID}
              >
                {b.BranchName}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4} className="text-end">
          <Button
            variant="primary"
            onClick={openAddModal}
          >
            {Icon(BsPlus, {
              className: "me-1",
            })}
            Add Policy
          </Button>
        </Col>
      </Row>

      <Table className="table-hover table-dark-custom">
        <thead>
          <tr>
            <th>Branch</th>
            <th>Employment Type</th>
            <th>Position</th>
            <th>Department</th>
            <th>Max Bench Days</th>
            <th>Warning Days</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredRules.length >
          0 ? (
            filteredRules.map(
              (rule) => (
                <tr
                  key={
                    rule.benchPolicyRuleID
                  }
                >
                  <td>
                    {getBranchName(
                      rule.branchID
                    )}
                  </td>

                  <td>
                    {getEmploymentType(
                      rule.employmentTypeID
                    )}
                  </td>

                  <td>
                    {getPosition(
                      rule.positionID
                    )}
                  </td>

                  <td>
                    {getDepartment(
                      rule.departmentID
                    )}
                  </td>

                  <td>
                    {
                      rule.maxBenchDays
                    }
                  </td>

                  <td>
                    {
                      rule.warningAfterDays
                    }
                  </td>

                  <td>
                    <Badge
                      bg={
                        rule.isActive
                          ? "success"
                          : "danger"
                      }
                    >
                      {rule.isActive
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          openEditModal(
                            rule
                          )
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          handleDelete(
                            rule.benchPolicyRuleID
                          )
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={8}
                className="text-center"
              >
                No policies found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={() =>
          setShowModal(false)
        }
        centered
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSave}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editRule
                ? "Edit Bench Policy"
                : "Add Bench Policy"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Branch
              </Form.Label>

              <Form.Select
                required
                name="branchID"
                value={
                  formData.branchID
                }
                onChange={
                  handleInputChange
                }
              >
                <option value={0}>
                  Select Branch
                </option>

                {branches.map((b) => (
                  <option
                    key={
                      b.BranchID
                    }
                    value={
                      b.BranchID
                    }
                  >
                    {b.BranchName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Employment Type
              </Form.Label>

              <Form.Select
                required
                name="employmentTypeID"
                value={
                  formData.employmentTypeID
                }
                onChange={
                  handleInputChange
                }
              >
                <option value={0}>
                  Select
                </option>

                {employmentTypes.map(
                  (e) => (
                    <option
                      key={e.id}
                      value={e.id}
                    >
                      {e.name}
                    </option>
                  )
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Position
              </Form.Label>

              <Form.Select
                required
                name="positionID"
                value={
                  formData.positionID
                }
                onChange={
                  handleInputChange
                }
              >
                <option value={0}>
                  Select
                </option>

                {positions.map(
                  (p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.name}
                    </option>
                  )
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Department
              </Form.Label>

              <Form.Select
                required
                name="departmentID"
                value={
                  formData.departmentID
                }
                onChange={
                  handleInputChange
                }
              >
                <option value={0}>
                  Select
                </option>

                {departments.map(
                  (d) => (
                    <option
                      key={d.id}
                      value={d.id}
                    >
                      {d.name}
                    </option>
                  )
                )}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Max Bench Days
                  </Form.Label>

                  <Form.Control
                    required
                    type="number"
                    name="maxBenchDays"
                    value={
                      formData.maxBenchDays
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Warning After
                    Days
                  </Form.Label>

                  <Form.Control
                    required
                    type="number"
                    name="warningAfterDays"
                    value={
                      formData.warningAfterDays
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="switch"
              name="isActive"
              label="Active"
              checked={
                formData.isActive
              }
              onChange={
                handleInputChange
              }
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                setShowModal(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
            >
              {editRule
                ? "Update"
                : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer
        position="top-end"
        className="p-3"
      >
        <Toast
          bg={toast.variant}
          show={toast.show}
          delay={3000}
          autohide
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              show: false,
            }))
          }
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ManageBenchPolicyRules;

