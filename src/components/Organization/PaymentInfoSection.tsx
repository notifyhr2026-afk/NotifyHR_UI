import React, { useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Table,
  Modal,
  Toast,
  ToastContainer,
  Badge,
} from "react-bootstrap";

interface Payment {
  id: number;
  invoiceId: string;
  paymentDate: string;
  amountPaid: boolean;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: string;
  notes: string;
}

const PaymentInfoSection: React.FC = () => {
  const emptyForm: Payment = {
    id: 0,
    invoiceId: "",
    paymentDate: "",
    amountPaid: false,
    paymentMethod: "",
    transactionId: "",
    paymentStatus: "",
    notes: "",
  };

  const [form, setForm] = useState<Payment>(emptyForm);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });

  const showToast = (message: string, bg: string = "success") =>
    setToast({ show: true, message, bg });

  // Change
  const change = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Validation
  const validateForm = () => {
    let temp: { [key: string]: string } = {};

    if (!form.invoiceId) temp.invoiceId = "Invoice ID is required.";
    if (!form.paymentDate) temp.paymentDate = "Payment date is required.";
    if (!form.paymentMethod) temp.paymentMethod = "Payment method is required.";
    if (!form.transactionId) temp.transactionId = "Transaction ID is required.";
    if (!form.paymentStatus) temp.paymentStatus = "Status is required.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Actions
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (item: Payment) => {
    setForm(item);
    setEditingId(item.id);
    setErrors({});
    setShowModal(true);
  };

  const deletePayment = (id: number) => {
    if (window.confirm("Delete this payment?")) {
      setPayments((prev) => prev.filter((p) => p.id !== id));
      showToast("Payment deleted", "danger");
    }
  };

  const savePayment = () => {
    if (!validateForm()) {
      showToast("Please fill required fields", "danger");
      return;
    }

    if (editingId) {
      // Update
      setPayments((prev) =>
        prev.map((p) => (p.id === editingId ? form : p))
      );
      showToast("Payment updated");
    } else {
      // Add
      const newItem = { ...form, id: Date.now() };
      setPayments((prev) => [...prev, newItem]);
      showToast("Payment added");
    }

    setShowModal(false);
  };

  return (
    <div className="mt-4">

      {/* Toast */}
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
          <h4 className="fw-bold">Payments</h4>
        </Col>
        <Col className="text-end">
          <Button onClick={openAddModal}>+ Add Payment</Button>
        </Col>
      </Row>

      {/* Table */}
      {payments.length > 0 ? (
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Paid?</th>
              <th>Method</th>
              <th>Transaction</th>
              <th>Status</th>
              <th>Notes</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.invoiceId}</td>
                <td>{p.paymentDate}</td>
                <td>{p.amountPaid ? "✔️" : "❌"}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.transactionId}</td>
                <td>
                  {p.paymentStatus === "paid" && <Badge bg="success">Paid</Badge>}
                  {p.paymentStatus === "pending" && <Badge bg="warning">Pending</Badge>}
                  {p.paymentStatus === "failed" && <Badge bg="danger">Failed</Badge>}
                </td>
                <td>{p.notes}</td>

                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => openEditModal(p)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deletePayment(p.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No payments added yet.</p>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Payment" : "Add Payment"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Invoice ID</Form.Label>
                  <Form.Control
                    name="invoiceId"
                    value={form.invoiceId}
                    onChange={change}
                    isInvalid={!!errors.invoiceId}
                    isValid={Boolean(form.invoiceId) && !errors.invoiceId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.invoiceId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="paymentDate"
                    value={form.paymentDate}
                    onChange={change}
                    isInvalid={!!errors.paymentDate}
                    isValid={Boolean(form.paymentDate) && !errors.paymentDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.paymentDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  name="amountPaid"
                  checked={form.amountPaid}
                  onChange={change}
                  label="Amount Paid"
                />
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={change}
                    isInvalid={!!errors.paymentMethod}
                    isValid={Boolean(form.paymentMethod) && !errors.paymentMethod}
                  >
                    <option value="">Select</option>
                    <option value="upi">UPI</option>
                    <option value="bankTransfer">Bank Transfer</option>
                    <option value="card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.paymentMethod}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Transaction ID</Form.Label>
                  <Form.Control
                    name="transactionId"
                    value={form.transactionId}
                    onChange={change}
                    isInvalid={!!errors.transactionId}
                    isValid={Boolean(form.transactionId) && !errors.transactionId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.transactionId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="paymentStatus"
                    value={form.paymentStatus}
                    onChange={change}
                    isInvalid={!!errors.paymentStatus}
                    isValid={Boolean(form.paymentStatus) && !errors.paymentStatus}
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.paymentStatus}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={form.notes}
                    onChange={change}
                  />
                </Form.Group>
              </Col>
            </Row>

          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button variant="primary" onClick={savePayment}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PaymentInfoSection;
