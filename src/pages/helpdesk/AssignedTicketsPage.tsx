import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ticketService from '../../services/ticketService';
import LoggedInUser from '../../types/LoggedInUser';

interface Ticket {
  AssignmentId: number;  
  TicketId: number;
  TicketNumber: string;
  Subject: string;
  Description: string;
  CategoryName: string;
  PriorityName: string;
  StatusId: number;
  AssignedToUserId: number;
  CreatedAt: string;
  UpdatedAt?: string | null;
  ClosedAt?: string | null;
}

interface UpdateTicketPayload {
  ticketId: number;
  employeeId: number;
  statusId: number;
  commentText?: string;
  assignmentId?: number;
}

const AssignedTicketsPage: React.FC = () => {
  const userString = localStorage.getItem('user');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizationID = user?.organizationID;
  const userID = user?.employeeID;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Dashboard stats
  const [totalAssigned, setTotalAssigned] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await ticketService.GetAssignedTicketsAsync(organizationID, userID);
      setTickets(res ?? []);
      calculateStats(res ?? []);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tickets: Ticket[]) => {
    setTotalAssigned(tickets.length);
    setClosedCount(tickets.filter(t => t.StatusId === 3).length); // StatusId 3 = Closed
    setInProgressCount(tickets.filter(t => t.StatusId === 2).length); // StatusId 2 = In Progress
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const handleOpenActionModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCommentText('');
    setSelectedStatus(ticket.StatusId);
    setShowActionModal(true);
  };

  const handleSaveAction = async () => {
    if (!selectedTicket) return;

    try {
      setStatusUpdating(true);
      const payload: UpdateTicketPayload = {
        assignmentId: selectedTicket.AssignmentId,
        ticketId: selectedTicket.TicketId,
        employeeId: userID,
        statusId: selectedStatus,
        commentText: commentText || undefined
      };
      await ticketService.UpdateTicketStatusAsync(payload); // API call
      setShowActionModal(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <Container>
      <h4 className="fw-bold mb-4">📝 My Assigned Tickets</h4>

      {/* Dashboard Stats */}
      <Row className="mb-4">
        <Col md={3}><Badge bg="primary" className="p-2 w-100">Total Assigned: {totalAssigned}</Badge></Col>
        <Col md={3}><Badge bg="info" className="p-2 w-100">In Progress: {inProgressCount}</Badge></Col>
        <Col md={3}><Badge bg="success" className="p-2 w-100">Closed: {closedCount}</Badge></Col>
      </Row>

      {/* Loading / Error */}
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tickets Table */}
      {!loading && tickets.length > 0 && (
        <Table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticket Number</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, idx) => (
              <tr key={t.TicketId}>
                <td>{idx + 1}</td>
                <td>{t.TicketNumber}</td>
                <td>{t.Subject}</td>
                <td>{t.CategoryName}</td>
                <td><Badge bg={getPriorityBadge(t.PriorityName)}>{t.PriorityName}</Badge></td>
                <td>
                {t.StatusId === 1 && <Badge bg="secondary">Open</Badge>}
                {t.StatusId === 2 && <Badge bg="info">In Progress</Badge>}
                {t.StatusId === 3 && <Badge bg="warning">On Hold</Badge>}
                {t.StatusId === 4 && <Badge bg="primary">Resolved</Badge>}
                {t.StatusId === 5 && <Badge bg="success">Closed</Badge>}
                </td>
                <td>{new Date(t.CreatedAt).toLocaleString()}</td>
                <td>
                  <Button size="sm" variant="primary" onClick={() => handleOpenActionModal(t)}>Action</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {!loading && tickets.length === 0 && <Alert variant="info">No tickets assigned</Alert>}

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <>
              <Row className="mb-3">
                <Col>
                  <strong>Ticket:</strong> {selectedTicket.TicketNumber} - {selectedTicket.Subject}
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select value={selectedStatus} onChange={e => setSelectedStatus(Number(e.target.value))}>
                <option value={1}>Open</option>
                <option value={2}>In Progress</option>
                <option value={3}>On Hold</option>
                <option value={4}>Resolved</option>
                <option value={5}>Closed</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add comment (optional)"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveAction} disabled={statusUpdating}>
            {statusUpdating ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AssignedTicketsPage;