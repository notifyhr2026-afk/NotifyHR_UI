import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import ticketService from '../../services/ticketService';

const CreateTicket: React.FC = () => {
  const [form, setForm] = useState({
    categoryId: '',
    priorityId: '',
    subject: '',
    description: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number | undefined = user?.employeeID;
  // =============================
  // HANDLE INPUT CHANGE
  // =============================
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // =============================
  // FETCH CATEGORIES
  // =============================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const organizationID = user.organizationID;

        const res =
          await ticketService.GetSupportCategoryByOrganization(
            organizationID
          );

        setCategories(res || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    fetchCategories();
  }, []);

  // =============================
  // HANDLE SUBMIT
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.categoryId || !form.priorityId || !form.subject) {
      setMessage('⚠️ Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      

      const payload = {
        ticketNumber: `TKT-${Date.now()}`,
        organizationId: organizationID,
        requestedByUserId: employeeID,
        categoryId: Number(form.categoryId),
        priorityId: Number(form.priorityId),
        statusId: 1, // Default Open
        subject: form.subject,
        description: form.description,
        createdByUserId: employeeID,
      };

      await ticketService.PostCreateSupportTicketByAsync(payload);

      setMessage('✅ Ticket created successfully!');

      // Reset form
      setForm({
        categoryId: '',
        priorityId: '',
        subject: '',
        description: '',
      });
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              {/* HEADER */}
              <div className="mb-4 text-center">
                <h4 className="fw-bold">🎫 Create Ticket</h4>
                <p className="text-muted mb-0">
                  Submit your issue and our team will help you
                </p>
              </div>

              {/* MESSAGE */}
              {message && (
                <Alert
                  variant={message.includes('success') ? 'success' : 'danger'}
                  className="text-center"
                >
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* CATEGORY + PRIORITY */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Category *
                      </Form.Label>
                      <Form.Select
                        value={form.categoryId}
                        onChange={(e) =>
                          handleChange('categoryId', e.target.value)
                        }
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option
                            key={cat.CategoryId}
                            value={cat.CategoryId}
                          >
                            {cat.CategoryName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Priority *
                      </Form.Label>
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
                  </Col>
                </Row>

                {/* SUBJECT */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Subject *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter a short subject"
                    value={form.subject}
                    onChange={(e) =>
                      handleChange('subject', e.target.value)
                    }
                  />
                </Form.Group>

                {/* DESCRIPTION */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={form.description}
                    onChange={(e) =>
                      handleChange('description', e.target.value)
                    }
                  />
                </Form.Group>

                {/* SUBMIT BUTTON */}
                <div className="d-grid">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    style={{
                      background:
                        'linear-gradient(135deg, #0d6efd, #4dabf7)',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Submitting...
                      </>
                    ) : (
                      '🚀 Submit Ticket'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateTicket;