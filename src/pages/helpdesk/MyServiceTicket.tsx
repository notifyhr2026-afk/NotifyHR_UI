import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Badge,
  Form,
  Row,
  Col,
  Button,
  Modal,
} from 'react-bootstrap';
import ticketService from '../../services/ticketService';

interface Ticket {
  TicketId: number;
  TicketNumber: string;
  Subject: string;
  Description: string;
  CategoryName: string;
  Priority: string;
  StatusName: string;
}

const MyServiceTicket: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtered, setFiltered] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    categoryId: '',
    priorityId: '',
    subject: '',
    description: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // =============================
  // FETCH TICKETS
  // =============================
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const res = await ticketService.GetMyTicketsAsync(
        user.organizationID,
        Number(user.employeeID)
      );

      setTickets(res || []);
      setFiltered(res || []);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FETCH CATEGORIES
  // =============================
  const fetchCategories = async () => {
    try {
      const res =
        await ticketService.GetSupportCategoryByOrganization(
          user.organizationID
        );
      setCategories(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, []);

  // =============================
  // SEARCH
  // =============================
  useEffect(() => {
    const result = tickets.filter((t) =>
      `${t.TicketNumber} ${t.Subject} ${t.CategoryName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, tickets]);

  // =============================
  // FORM HANDLER
  // =============================
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // =============================
  // SUBMIT TICKET
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.categoryId || !form.priorityId || !form.subject) {
      setMessage('⚠️ Fill required fields');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const payload = {
        ticketNumber: `TKT-${Date.now()}`,
        organizationId: user.organizationID,
        requestedByUserId: user.employeeID,
        categoryId: Number(form.categoryId),
        priorityId: Number(form.priorityId),
        statusId: 1,
        subject: form.subject,
        description: form.description,
        createdByUserId: user.employeeID,
      };

      await ticketService.PostCreateSupportTicketByAsync(payload);

      setMessage('✅ Ticket created successfully!');

      // Reset
      setForm({
        categoryId: '',
        priorityId: '',
        subject: '',
        description: '',
      });

      // Refresh list
      fetchTickets();

      // Close modal after short delay
      setTimeout(() => {
        setShowModal(false);
        setMessage('');
      }, 1000);

    } catch (err) {
      setMessage('❌ Failed to create ticket');
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // PRIORITY BADGE
  // =============================
  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'dark';
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Container fluid className="mt-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">📋 My Tickets</h4>

        <Button onClick={() => setShowModal(true)}>
          ➕ Create Ticket
        </Button>
      </div>

      {/* SEARCH */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="🔍 Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {loading && <Spinner />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* TABLE */}
      {!loading && filtered.length > 0 && (
        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <Table className="table table-hover table-dark-custom">
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th>#</th>
                <th>Ticket</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, index) => (
                <tr key={t.TicketId}>
                  <td>{index + 1}</td>
                  <td className="fw-semibold">{t.TicketNumber}</td>
                  <td>{t.Subject}</td>
                  <td>{t.CategoryName}</td>
                  <td>
                    <Badge bg={getPriorityBadge(t.Priority)}>
                      {t.Priority}
                    </Badge>
                  </td>
                  <td>{t.StatusName}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Alert variant="info">No tickets found</Alert>
      )}

      {/* =============================
          MODAL (CREATE TICKET)
      ============================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🎫 Create Ticket</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {message && <Alert variant="info">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                value={form.categoryId}
                onChange={(e) =>
                  handleChange('categoryId', e.target.value)
                }
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.CategoryId} value={c.CategoryId}>
                    {c.CategoryName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority *</Form.Label>
              <Form.Select
                value={form.priorityId}
                onChange={(e) =>
                  handleChange('priorityId', e.target.value)
                }
              >
                <option value="">Select Priority</option>
                <option value="4">🔥 Critical</option>
                <option value="3">🔴 High</option>
                <option value="2">🟡 Medium</option>
                <option value="1">🟢 Low</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                value={form.subject}
                onChange={(e) =>
                  handleChange('subject', e.target.value)
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  handleChange('description', e.target.value)
                }
              />
            </Form.Group>

            <Button type="submit" disabled={saving} className="w-100">
              {saving ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MyServiceTicket;