import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsPlus } from "react-icons/bs";
import branchService from "../../services/branchService";
import holidayService from "../../services/holidayService";
import LoggedInUser from '../../types/LoggedInUser'
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

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

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
    try {
      const res = await holidayService.GetHolidaysAsync(organizationID);
      const data = res?.Table ?? [];

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

  /* ================= FORM HANDLING ================= */

  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {
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
      branchID: 0,
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

      if (res[0]?.value === 1) {
        setToast({
          show: true,
          message: res[0]?.MSG,
          variant: "success",
        });
        loadHolidays();
        setShowModal(false);
      } else {
        setToast({
          show: true,
          message: res[0]?.MSG,
          variant: "warning",
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: "Something went wrong!",
        variant: "danger",
      });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between mb-4">
        <h3>Manage Holidays</h3>
        <Button onClick={openAddModal}>
          {Icon(BsPlus, { className: "me-1" })}
          Add Holiday
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Branch</th>
            <th>Holiday</th>
            <th>Date</th>
            <th>Optional</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((h) => (
            <tr key={h.id}>
              <td>
                {
                  branches.find((b) => b.BranchID === h.branchID)
                    ?.BranchName
                }
              </td>
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
                >
                  {Icon(BsPencilSquare)}
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

      {/* ================= TOAST ================= */}

      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          delay={3000}
          autohide
          onClose={() => setToast({ ...toast, show: false })}
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ManageHolidays;
