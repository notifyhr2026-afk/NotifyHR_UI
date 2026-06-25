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
import noticePeriodPolicyService from "../../services/noticePeriodPolicyService";
import employeeService from "../../services/employeeService";
import positionService from "../../services/positionService";
import LoggedInUser from "../../types/LoggedInUser";

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
  const [employmentTypes, setEmploymentTypes] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
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
          employmentTypeID: p.EmploymentTypeID,
          positionID: p.PositionID,
          noticePeriodDays: p.NoticePeriodDays,
          isActive: p.IsActive,
        })) || [];

      setPolicies(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  const loadEmploymentTypes = async () => {
    try {
      const res =
        await employeeService.getEmploymentTypes();
      setEmploymentTypes(res?.Table ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadPositions = async () => {
    try {
      const res =
        await positionService.getPositionsAsync(
          organizationID
        );
      setPositions(res?.Table ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPolicies =
    selectedBranch === 0
      ? policies
      : policies.filter(
          (x) => x.branchID === selectedBranch
        );

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  const openEditModal = (policy: NoticePeriodPolicy) => {
    setEditPolicy(policy);
    setFormData(policy);
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

    try {
      const payload = {
        ...formData,
        organizationID,
        createdBy: user?.userID ?? 0,
      };

      const res =
        await noticePeriodPolicyService.postNoticePeriodPolicy(payload);

      if (res?.Value === 1 || res?.value === 1) {
        setToast({
          show: true,
          message: res?.Message || "Saved successfully",
          variant: "success",
        });

        setShowModal(false);
        loadPolicies();
      } else {
        setToast({
          show: true,
          message: res?.Message || "Save failed",
          variant: "warning",
        });
      }
    } catch {
      setToast({
        show: true,
        message: "Something went wrong",
        variant: "danger",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this policy?")) return;

    try {
      await noticePeriodPolicyService.deleteNoticePeriodPolicy(
        id,
        user?.userID ?? 0
      );

      loadPolicies();

      setToast({
        show: true,
        message: "Deleted successfully",
        variant: "success",
      });
    } catch {
      setToast({
        show: true,
        message: "Delete failed",
        variant: "danger",
      });
    }
  };

  const getEmploymentType = (id: number) =>
    employmentTypes.find((x) => x.id === id)?.name ?? "-";

  const getPosition = (id: number) =>
    positions.find((x) => x.id === id)?.name ?? "-";

  const getBranchName = (id: number) =>
    branches.find((x) => x.BranchID === id)?.BranchName ?? "-";

  return (
    <>
      {/* CARD CONTAINER */}
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
              <i className="bi bi-clock-history"></i>
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>
                Notice Period Policies
              </div>
              <div style={{ fontSize: ".8rem", opacity: 0.6 }}>
                Manage employee notice period rules
              </div>
            </div>
          </div>

          <Button
            onClick={openAddModal}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            {Icon(BsPlus, { className: "me-2" })}
            Add Policy
          </Button>
        </div>

        {/* FILTER */}
        <div className="mb-3">
          <Form.Select
            value={selectedBranch}
            onChange={(e) =>
              setSelectedBranch(Number(e.target.value))
            }
          >
            <option value={0}>All Branches</option>
            {branches.map((b) => (
              <option key={b.BranchID} value={b.BranchID}>
                {b.BranchName}
              </option>
            ))}
          </Form.Select>
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
                <th>Employment Type</th>
                <th>Position</th>
                <th>Notice Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((p) => (
                  <tr key={p.noticePeriodPolicyID}>
                    <td>{getBranchName(p.branchID)}</td>
                    <td>{getEmploymentType(p.employmentTypeID)}</td>
                    <td>{getPosition(p.positionID)}</td>
                    <td>{p.noticePeriodDays}</td>
                    <td>
                      <Badge bg={p.isActive ? "success" : "secondary"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            handleDelete(p.noticePeriodPolicyID)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-3">
                    No policies found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* MODAL + TOAST unchanged */}
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

      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          autohide
          delay={3000}
          onClose={() =>
            setToast((p) => ({ ...p, show: false }))
          }
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ManageNoticePeriodPolicies;