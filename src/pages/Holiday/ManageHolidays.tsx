import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import { BsPencilSquare, BsPlus, BsTrash } from "react-icons/bs";
import { toast } from "react-toastify";
import branchService from "../../services/branchService";
import holidayService from "../../services/holidayService";
import LoggedInUser from "../../types/LoggedInUser";

const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface Holiday {
  id: number;
  branchID: number;
  holidayName: string;
  holidayDate: string;
  isOptional: boolean;
  isActive: boolean;
}

interface Branch {
  BranchID: number;
  BranchName: string;
}

const ManageHolidays: React.FC = () => {
  const userString = localStorage.getItem("user");
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;
  const organizationID = user?.organizationID ?? 0;

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [validated, setValidated] = useState(false);

  const [holidayFormData, setHolidayFormData] = useState<Holiday>({
    id: 0,
    branchID: 0,
    holidayName: "",
    holidayDate: "",
    isOptional: false,
    isActive: true,
  });

  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteHolidayId, setDeleteHolidayId] = useState<number | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadBranches();
    loadHolidays();
  }, []);

  const loadBranches = async () => {
    try {
      const res = await branchService.getBranchesAsync(organizationID);
      setBranches(res?.Table ?? []);
    } catch (error) {
      console.error("Failed to load branches", error);
    }
  };

  const loadHolidays = async () => {
    debugger;
    try {
      const res = await holidayService.getOrgholidays(organizationID);
      const data = res;

      const mapped: Holiday[] = data.map((h: any) => ({
        id: h.HolidayID,
        branchID: h.BranchID,
        holidayName: h.HolidayName,
        holidayDate: h.HolidayDate?.split("T")[0],
        isOptional: h.IsOptional,
        isActive: h.IsActive,
      }));

      setHolidays(mapped);
    } catch (error) {
      console.error("Failed to load holidays", error);
    }
  };

  /* ================= FILTERED DATA ================= */

  const filteredHolidays =
    selectedBranch === 0
      ? holidays
      : holidays.filter((h) => h.branchID === selectedBranch || h.branchID === 0);

  /* ================= FORM HANDLING ================= */

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type } = e.target;

    if (type === "checkbox") {
      setHolidayFormData((prev) => ({
        ...prev,
        [id]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setHolidayFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const openAddModal = () => {
    setEditHoliday(null);
    setValidated(false);
    setHolidayFormData({
      id: 0,
      branchID: selectedBranch || 0,
      holidayName: "",
      holidayDate: "",
      isOptional: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (holiday: Holiday) => {
    setEditHoliday(holiday);
    setValidated(false);
    setHolidayFormData(holiday);
    setShowModal(true);
  };

  const handleDeleteClick = (holidayId: number) => {
    setDeleteHolidayId(holidayId);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteHolidayId) return;
    try {
      const res = await holidayService.DeleteHolidayByAsync(deleteHolidayId);
      // If API call succeeds (200 status), treat as success
      const result = Array.isArray(res) ? res[0] : res;
      const message = result?.MSG || result?.message || result?.msg || "Holiday deleted successfully!";
      toast.success(message);
      await loadHolidays();
      setConfirmDelete(false);
      setDeleteHolidayId(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete holiday");
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const payload = {
        holidayID: holidayFormData.id,
        organizationID,
        branchID: holidayFormData.branchID,
        holidayName: holidayFormData.holidayName,
        holidayDate: holidayFormData.holidayDate,
        isOptional: holidayFormData.isOptional,
        isActive: holidayFormData.isActive,
        createdBy: "Admin",
      };

      const res = await holidayService.saveHolidayAsync(payload);
      // If API call succeeds (200 status), treat as success
      const result = Array.isArray(res) ? res[0] : res;
      const message = result?.MSG || result?.message || result?.msg || (editHoliday ? "Holiday updated successfully!" : "Holiday added successfully!");
      toast.success(message);
      setValidated(false);
      setShowModal(false);
      await loadHolidays();
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save holiday");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="Container">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <h3>Manage Holidays</h3>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
          >
            <option value={0}>All Branches</option>
            {branches.map((b) => (
              <option key={b.BranchID} value={b.BranchID}>
                {b.BranchName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4} className="text-end">
          <Button onClick={openAddModal}>
            {Icon(BsPlus, { className: "me-1" })}
            Add Holiday
          </Button>
        </Col>
      </Row>

      <Table className="table table-hover table-dark-custom">
        <thead>
          <tr>
            <th>Holiday</th>
            <th>Date</th>
            <th>Optional</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredHolidays.map((h) => (
            <tr key={h.id}>
              <td>{h.holidayName}</td>
              <td>
                <Badge bg="secondary">{h.holidayDate}</Badge>
              </td>
              <td>
                <Badge bg={h.isOptional ? "info" : "dark"}>
                  {h.isOptional ? "Yes" : "No"}
                </Badge>
              </td>
              <td>
                <Badge bg={h.isActive ? "success" : "danger"}>
                  {h.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => openEditModal(h)}
                  className="me-2"
                >
                  {Icon(BsPencilSquare)}
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleDeleteClick(h.id)}
                >
                  {Icon(BsTrash)}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ================= MODAL ================= */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editHoliday ? "Edit Holiday" : "Add Holiday"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Branch *</Form.Label>
              <Form.Select
                id="branchID"
                required
                value={holidayFormData.branchID}
                onChange={(e) =>
                  setHolidayFormData((prev) => ({
                    ...prev,
                    branchID: Number(e.target.value),
                  }))
                }
              >
                <option value={0}>Select Branch</option>
                {branches.map((b) => (
                  <option key={b.BranchID} value={b.BranchID}>
                    {b.BranchName}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select branch.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Holiday Name *</Form.Label>
              <Form.Control
                id="holidayName"
                required
                value={holidayFormData.holidayName}
                onChange={handleInputChange}
              />
              <Form.Control.Feedback type="invalid">
                Holiday name required.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date *</Form.Label>
              <Form.Control
                type="date"
                id="holidayDate"
                required
                value={holidayFormData.holidayDate}
                onChange={handleInputChange}
              />
              <Form.Control.Feedback type="invalid">
                Date required.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Check
              type="switch"
              id="isOptional"
              label="Optional Holiday"
              checked={holidayFormData.isOptional}
              onChange={handleInputChange}
            />

            <Form.Check
              type="switch"
              id="isActive"
              label="Active Holiday"
              checked={holidayFormData.isActive}
              onChange={handleInputChange}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editHoliday ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}

      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this holiday? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  );
};

export default ManageHolidays;
