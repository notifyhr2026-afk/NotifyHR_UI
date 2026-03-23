import React, { useState } from 'react';
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

const CreateTicket: React.FC = () => {
  const [form, setForm] = useState({
    categoryId: '',
    priorityId: '',
    subject: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    // Simulate API
    setTimeout(() => {
      setMessage('✅ Ticket created successfully!');
      setLoading(false);
    }, 1000);
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

              {message && (
                <Alert variant="success" className="text-center">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>

                {/* CATEGORY + PRIORITY */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Category
                      </Form.Label>
                      <Form.Select
                        value={form.categoryId}
                        onChange={(e) =>
                          handleChange('categoryId', e.target.value)
                        }
                      >
                        <option value="">Select Category</option>
                        <option value="1">IT Support</option>
                        <option value="2">HR</option>
                        <option value="3">Finance</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Priority
                      </Form.Label>
                      <Form.Select
                        value={form.priorityId}
                        onChange={(e) =>
                          handleChange('priorityId', e.target.value)
                        }
                      >
                        <option value="">Select Priority</option>
                        <option value="1">🔴 High</option>
                        <option value="2">🟡 Medium</option>
                        <option value="3">🟢 Low</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* SUBJECT */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Subject</Form.Label>
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
                  <Form.Label className="fw-semibold">Description</Form.Label>
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

                {/* ACTION BUTTON */}
                <div className="d-grid">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #0d6efd, #4dabf7)',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                    }}
                  >
                    {loading ? (
                      <Spinner size="sm" />
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