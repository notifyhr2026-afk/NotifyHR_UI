import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Spinner,
  Card,
  Modal,
  Form,
} from 'react-bootstrap';

type Ticket = {
  ticketId: number;
  ticketNumber: string;
  subject: string;
  statusId: number;
  priorityId: number;
  createdAt: string;
};

const EmployeeTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [editStatus, setEditStatus] = useState<number>(1);
  const [comment, setComment] = useState('');

  // ✅ Mock Data
  useEffect(() => {
    setLoading(true);

    const mockData: Ticket[] = [
      { ticketId: 1, ticketNumber: 'TKT-001', subject: 'Network issue', statusId: 1, priorityId: 1, createdAt: new Date().toISOString() },
      { ticketId: 2, ticketNumber: 'TKT-002', subject: 'Server down', statusId: 2, priorityId: 1, createdAt: new Date().toISOString() },
      { ticketId: 3, ticketNumber: 'TKT-003', subject: 'Email issue', statusId: 5, priorityId: 2, createdAt: new Date().toISOString() },
      { ticketId: 4, ticketNumber: 'TKT-004', subject: 'Login issue', statusId: 4, priorityId: 3, createdAt: new Date().toISOString() },
    ];

    setTimeout(() => {
      setTickets(mockData);
      setLoading(false);
    }, 500);
  }, []);

  // ✅ SUMMARY COUNTS
  const openCount = tickets.filter((t) => t.statusId === 1).length;
  const inProgressCount = tickets.filter((t) => t.statusId === 2).length;
  const closedCount = tickets.filter(
    (t) => t.statusId === 4 || t.statusId === 5
  ).length;

  // ✅ View/Edit
  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.statusId);
    setComment('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedTicket) return;

    const updated = tickets.map((t) =>
      t.ticketId === selectedTicket.ticketId
        ? { ...t, statusId: editStatus }
        : t
    );

    setTickets(updated);
    setShowModal(false);

    console.log('Updated:', selectedTicket.ticketId, editStatus, comment);
  };

  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Badge bg="primary">Open</Badge>;
      case 2:
        return <Badge bg="warning">In Progress</Badge>;
      case 3:
        return <Badge bg="secondary">On Hold</Badge>;
      case 4:
        return <Badge bg="success">Resolved</Badge>;
      case 5:
        return <Badge bg="dark">Closed</Badge>;
      default:
        return <Badge bg="light">Unknown</Badge>;
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-3">My Tickets Dashboard</h3>

      {/* ✅ SUMMARY CARDS */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6>Open</h6>
              <h3>{openCount}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6>In Progress</h6>
              <h3>{inProgressCount}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h6>Closed</h6>
              <h3>{closedCount}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ TABLE */}
      {loading ? (
        <Spinner />
      ) : tickets.length === 0 ? (
        <p>No tickets found</p>
      ) : (
        <Table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticket No</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t, i) => (
              <tr key={t.ticketId}>
                <td>{i + 1}</td>
                <td>{t.ticketNumber}</td>
                <td>{t.subject}</td>
                <td>{getStatusBadge(t.statusId)}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => handleView(t)}
                    className="me-2"
                  >
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleView(t)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ✅ MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket && (
            <>
              <p><b>Ticket:</b> {selectedTicket.ticketNumber}</p>
              <p><b>Subject:</b> {selectedTicket.subject}</p>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(Number(e.target.value))}
                >
                  <option value="1">Open</option>
                  <option value="2">In Progress</option>
                  <option value="3">On Hold</option>
                  <option value="4">Resolved</option>
                  <option value="5">Closed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeTickets;