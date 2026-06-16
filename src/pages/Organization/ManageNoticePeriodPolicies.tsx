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
  BsPencilSquare,
  BsPlus,
  BsTrash,
} from "react-icons/bs";

import branchService from "../../services/branchService";
import noticePeriodPolicyService from "../../services/noticePeriodPolicyService";
import employeeService from "../../services/employeeService";
import positionService from "../../services/positionService";
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

interface NoticePeriodPolicy {
  noticePeriodPolicyID: number;
  branchID: number;
  employmentTypeID: number;
  positionID: number;
  noticePeriodDays: number;
  isActive: boolean;
}

const ManageNoticePeriodPolicies: React.FC = () => {
  const userString = localStorage.getItem("user");

  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [policies, setPolicies] = useState<NoticePeriodPolicy[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [positions, setPositions] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);

  const [editPolicy, setEditPolicy] =
    useState<NoticePeriodPolicy | null>(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const [formData, setFormData] =
    useState<NoticePeriodPolicy>({
      noticePeriodPolicyID: 0,
      branchID: 0,
      employmentTypeID: 0,
      positionID: 0,
      noticePeriodDays: 30,
      isActive: true,
    });

  useEffect(() => {
    loadBranches();
    loadPolicies();
    loadEmploymentTypes();
    loadPositions();
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

  const loadPolicies = async () => {
    try {
      const res =
        await noticePeriodPolicyService.getNoticePeriodPolicies(
          organizationID
        );

      const mapped =
        (res || []).map((p: any) => ({
          noticePeriodPolicyID:
            p.NoticePeriodPolicyID,
          branchID: p.BranchID,
          employmentTypeID:
            p.EmploymentTypeID,
          positionID: p.PositionID,
          noticePeriodDays:
            p.NoticePeriodDays,
          isActive: p.IsActive,
        })) || [];

      setPolicies(mapped);
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

  const filteredPolicies =
    selectedBranch === 0
      ? policies
      : policies.filter(
          (x) =>
            x.branchID === selectedBranch
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
    setEditPolicy(null);

    setFormData({
      noticePeriodPolicyID: 0,
      branchID: selectedBranch || 0,
      employmentTypeID: 0,
      positionID: 0,
      noticePeriodDays: 30,
      isActive: true,
    });

    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (
    policy: NoticePeriodPolicy
  ) => {
    setEditPolicy(policy);
    setFormData(policy);
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
        noticePeriodPolicyID:
          formData.noticePeriodPolicyID,
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
        noticePeriodDays: Number(
          formData.noticePeriodDays
        ),
        isActive: formData.isActive,
        createdBy:
          user?.userID ?? 0,
      };

      const res =
        await noticePeriodPolicyService.postNoticePeriodPolicy(
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
            "Policy saved successfully.",
          variant: "success",
        });

        setShowModal(false);
        loadPolicies();
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
        "Delete this policy?"
      )
    )
      return;

    try {
      const res =
        await noticePeriodPolicyService.deleteNoticePeriodPolicy(
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

        loadPolicies();
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

  const getEmploymentType = (
    id: number
  ) =>
    employmentTypes.find(
      (x) => x.id === id
    )?.name ?? "-";

  const getPosition = (id: number) =>
    positions.find(
      (x) => x.id === id
    )?.name ?? "-";

  const getBranchName = (
    branchID: number
  ) =>
    branches.find(
      (x) =>
        x.BranchID === branchID
    )?.BranchName ?? "-";

  return (
    <div className="Container">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <h3>
            Notice Period Policies
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
            <th>Notice Days</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredPolicies.length >
          0 ? (
            filteredPolicies.map(
              (policy) => (
                <tr
                  key={
                    policy.noticePeriodPolicyID
                  }
                >
                  <td>
                    {getBranchName(
                      policy.branchID
                    )}
                  </td>

                  <td>
                    {getEmploymentType(
                      policy.employmentTypeID
                    )}
                  </td>

                  <td>
                    {getPosition(
                      policy.positionID
                    )}
                  </td>

                  <td>
                    {
                      policy.noticePeriodDays
                    }
                  </td>

                  <td>
                    <Badge
                      bg={
                        policy.isActive
                          ? "success"
                          : "danger"
                      }
                    >
                      {policy.isActive
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
                            policy
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
                            policy.noticePeriodPolicyID
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
                colSpan={6}
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
              {editPolicy
                ? "Edit Policy"
                : "Add Policy"}
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
                Notice Period
                (Days)
              </Form.Label>

              <Form.Control
                required
                type="number"
                name="noticePeriodDays"
                value={
                  formData.noticePeriodDays
                }
                onChange={
                  handleInputChange
                }
              />
            </Form.Group>

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
              type="submit"
            >
              {editPolicy
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
          autohide
          delay={3000}
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

export default ManageNoticePeriodPolicies;
