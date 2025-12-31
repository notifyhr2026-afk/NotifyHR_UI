import React, { useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Table,
  Modal,
  Badge,
  Toast,
  ToastContainer,
} from "react-bootstrap";

interface Subscription {
  id: number;
  planId: string;
  billingCycleId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
  totalEmployees: string;
  totalCost: string;
}

const SubscriptionInfoSection: React.FC = () => {
  const emptyForm: Subscription = {
    id: 0,
    planId: "",
    billingCycleId: "",
    startDate: "",
    endDate: "",
    isActive: false,
    autoRenew: false,
    totalEmployees: "",
    totalCost: "",
  };

  const [subscriptionForm, setSubscriptionForm] = useState<Subscription>(emptyForm);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });

  const showToast = (message: string, bg: string = "success") => {
    setToast({ show: true, message, bg });
  };

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};

    if (!subscriptionForm.planId) tempErrors.planId = "Plan is required.";
    if (!subscriptionForm.billingCycleId)
      tempErrors.billingCycleId = "Billing cycle is required.";
    if (!subscriptionForm.startDate)
      tempErrors.startDate = "Start date is required.";
    if (!subscriptionForm.endDate)
      tempErrors.endDate = "End date is required.";
    if (!subscriptionForm.totalEmployees)
      tempErrors.totalEmployees = "Total employees required.";
    if (!subscriptionForm.totalCost)
      tempErrors.totalCost = "Total cost is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAdd = () => {
    setEditingId(null);
    setSubscriptionForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setSubscriptionForm(sub);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      showToast("Subscription deleted successfully", "danger");
    }
  };

  const change = (e: any) => {
    const { name, value, type, checked } = e.target;
    setSubscriptionForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSubscription = () => {
    if (!validateForm()) {
      showToast("Please fill the required fields.", "danger");
      return;
    }

    if (editingId) {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === editingId ? subscriptionForm : s))
      );
      showToast("Subscription updated successfully");
    } else {
      const newEntry = { ...subscriptionForm, id: Date.now() };
      setSubscriptions((prev) => [...prev, newEntry]);
      showToast("Subscription added successfully");
    }

    setShowModal(false);
  };

  return (
    <div className="mt-4">

      {/* Toasts */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          bg={toast.bg}
          show={toast.show}
          delay={2500}
          autohide
          onClose={() => setToast({ ...toast, show: false })}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <Row className="mb-3">
        <Col>
          <h4 className="fw-bold">Subscriptions</h4>
        </Col>
        <Col className="text-end">
          <Button onClick={handleAdd}>+ Add Subscription</Button>
        </Col>
      </Row>

      {/* Table */}
      {subscriptions.length > 0 ? (
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Cycle</th>
              <th>Start</th>
              <th>End</th>
              <th>Active</th>
              <th>Auto Renew</th>
              <th>Employees</th>
              <th>Cost</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id}>
                <td>{s.planId}</td>
                <td>{s.billingCycleId}</td>
                <td>{s.startDate}</td>
                <td>{s.endDate}</td>
                <td>
                  {s.isActive ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Badge bg="secondary">Inactive</Badge>
                  )}
                </td>
                <td>{s.autoRenew ? "✔️" : "❌"}</td>
                <td>{s.totalEmployees}</td>
                <td>{s.totalCost}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No subscriptions added yet.</p>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Subscription" : "Add Subscription"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>

            {/* ROW 1 */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plan</Form.Label>
                  <Form.Select
                    name="planId"
                    value={subscriptionForm.planId}
                    onChange={change}
                    isInvalid={!!errors.planId}
                    isValid={Boolean(subscriptionForm.planId) && !errors.planId}
                  >
                    <option value="">Select Plan</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.planId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Billing Cycle</Form.Label>
                  <Form.Select
                    name="billingCycleId"
                    value={subscriptionForm.billingCycleId}
                    onChange={change}
                    isInvalid={!!errors.billingCycleId}
                    isValid={Boolean(subscriptionForm.billingCycleId) && !errors.billingCycleId}
                  >
                    <option value="">Select Cycle</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.billingCycleId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ROW 2 */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={subscriptionForm.startDate}
                    onChange={change}
                    isInvalid={!!errors.startDate}
                    isValid={Boolean(subscriptionForm.startDate) && !errors.startDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={subscriptionForm.endDate}
                    onChange={change}
                    isInvalid={!!errors.endDate}
                    isValid={Boolean(subscriptionForm.endDate) && !errors.endDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ROW 3 */}
            <Row className="mb-3">
              <Col>
                <Form.Check
                  name="isActive"
                  checked={subscriptionForm.isActive}
                  onChange={change}
                  label="Active"
                />
              </Col>
              <Col>
                <Form.Check
                  name="autoRenew"
                  checked={subscriptionForm.autoRenew}
                  onChange={change}
                  label="Auto Renew"
                />
              </Col>
            </Row>

            {/* ROW 4 */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Employees</Form.Label>
                  <Form.Control
                    name="totalEmployees"
                    value={subscriptionForm.totalEmployees}
                    onChange={change}
                    isInvalid={!!errors.totalEmployees}
                    isValid={Boolean(subscriptionForm.totalEmployees) && !errors.totalEmployees}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.totalEmployees}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Cost</Form.Label>
                  <Form.Control
                    name="totalCost"
                    value={subscriptionForm.totalCost}
                    onChange={change}
                    isInvalid={!!errors.totalCost}
                    isValid={Boolean(subscriptionForm.totalCost) && !errors.totalCost}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.totalCost}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveSubscription}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubscriptionInfoSection;
