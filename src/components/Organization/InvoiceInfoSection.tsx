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

interface Invoice {
  id: number;
  orgSubscriptionId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  status: string;
  notes: string;
}

const InvoiceInfoSection: React.FC = () => {
  const emptyForm: Invoice = {
    id: 0,
    orgSubscriptionId: "",
    invoiceDate: "",
    dueDate: "",
    totalAmount: "",
    status: "",
    notes: "",
  };

  const [invoiceForm, setInvoiceForm] = useState<Invoice>(emptyForm);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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

  // Form Change
  const change = (e: any) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validation
  const validateForm = () => {
    let temp: { [key: string]: string } = {};

    if (!invoiceForm.orgSubscriptionId)
      temp.orgSubscriptionId = "Subscription ID is required.";

    if (!invoiceForm.invoiceDate)
      temp.invoiceDate = "Invoice date is required.";

    if (!invoiceForm.dueDate) temp.dueDate = "Due date is required.";

    if (!invoiceForm.totalAmount)
      temp.totalAmount = "Total amount is required.";

    if (!invoiceForm.status) temp.status = "Status is required.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleAdd = () => {
    setEditingId(null);
    setInvoiceForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (item: Invoice) => {
    setEditingId(item.id);
    setInvoiceForm(item);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete invoice?")) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      showToast("Invoice deleted", "danger");
    }
  };

  const saveInvoice = () => {
    if (!validateForm()) {
      showToast("Please fill required fields", "danger");
      return;
    }

    if (editingId) {
      setInvoices((prev) =>
        prev.map((i) => (i.id === editingId ? invoiceForm : i))
      );
      showToast("Invoice updated");
    } else {
      const newItem = { ...invoiceForm, id: Date.now() };
      setInvoices((prev) => [...prev, newItem]);
      showToast("Invoice added");
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
          <h4 className="fw-bold">Invoices</h4>
        </Col>
        <Col className="text-end">
          <Button onClick={handleAdd}>+ Add Invoice</Button>
        </Col>
      </Row>

      {/* Table */}
      {invoices.length > 0 ? (
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Subscription</th>
              <th>Invoice Date</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Notes</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.orgSubscriptionId}</td>
                <td>{inv.invoiceDate}</td>
                <td>{inv.dueDate}</td>
                <td>{inv.totalAmount}</td>
                <td>
                  {inv.status === "paid" && <Badge bg="success">Paid</Badge>}
                  {inv.status === "unpaid" && <Badge bg="warning">Unpaid</Badge>}
                  {inv.status === "overdue" && <Badge bg="danger">Overdue</Badge>}
                </td>
                <td>{inv.notes}</td>

                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(inv)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(inv.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No invoices added yet.</p>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Invoice" : "Add Invoice"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Subscription ID</Form.Label>
                  <Form.Control
                    name="orgSubscriptionId"
                    value={invoiceForm.orgSubscriptionId}
                    onChange={change}
                    isInvalid={!!errors.orgSubscriptionId}
                    isValid={Boolean(invoiceForm.orgSubscriptionId) && !errors.orgSubscriptionId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.orgSubscriptionId}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Invoice Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="invoiceDate"
                    value={invoiceForm.invoiceDate}
                    onChange={change}
                    isInvalid={!!errors.invoiceDate}
                    isValid={Boolean(invoiceForm.invoiceDate) && !errors.invoiceDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.invoiceDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={invoiceForm.dueDate}
                    onChange={change}
                    isInvalid={!!errors.dueDate}
                    isValid={Boolean(invoiceForm.dueDate) && !errors.dueDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dueDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    name="totalAmount"
                    value={invoiceForm.totalAmount}
                    onChange={change}
                    isInvalid={!!errors.totalAmount}
                    isValid={Boolean(invoiceForm.totalAmount) && !errors.totalAmount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.totalAmount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={invoiceForm.status}
                    onChange={change}
                    isInvalid={!!errors.status}
                    isValid={Boolean(invoiceForm.status) && !errors.status}
                  >
                    <option value="">Select</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={invoiceForm.notes}
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
          <Button variant="primary" onClick={saveInvoice}>
            Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceInfoSection;
