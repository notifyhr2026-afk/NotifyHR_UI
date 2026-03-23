import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, ProgressBar } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaUsers, FaUserPlus, FaClock, FaUmbrellaBeach, FaMoneyBillWave, FaBirthdayCake, FaTrophy, FaPlane, FaPlus, FaCheck, FaTimes, FaCreditCard } from 'react-icons/fa';

const Dashboard = () => {
  // Static data for demonstration
  const [stats] = useState({
    totalEmployees: 245,
    newJoiners: 12,
    presentToday: 198,
    absentToday: 47,
    pendingLeaves: 8,
    payrollStatus: 'Processing'
  });

  const [employeeGrowthData] = useState([
    { month: 'Jan', joiners: 15, exits: 3 },
    { month: 'Feb', joiners: 22, exits: 5 },
    { month: 'Mar', joiners: 18, exits: 7 },
    { month: 'Apr', joiners: 25, exits: 4 },
    { month: 'May', joiners: 20, exits: 6 },
    { month: 'Jun', joiners: 28, exits: 8 }
  ]);

  const [pendingActions] = useState([
    { id: 1, type: 'leave', employee: 'John Smith', reason: 'Vacation', days: 5, status: 'pending' },
    { id: 2, type: 'leave', employee: 'Sarah Johnson', reason: 'Medical', days: 2, status: 'pending' },
    { id: 3, type: 'attendance', employee: 'Mike Davis', reason: 'Late arrival', status: 'pending' },
    { id: 4, type: 'leave', employee: 'Emma Wilson', reason: 'Personal', days: 1, status: 'pending' }
  ]);

  const [employeeHighlights] = useState({
    birthdays: [
      { name: 'Alice Brown', department: 'HR' },
      { name: 'Bob Wilson', department: 'IT' }
    ],
    anniversaries: [
      { name: 'Charlie Davis', years: 5, department: 'Finance' },
      { name: 'Diana Miller', years: 3, department: 'Marketing' }
    ],
    onLeave: [
      { name: 'Eve Johnson', reason: 'Vacation', days: 3 },
      { name: 'Frank Garcia', reason: 'Sick Leave', days: 1 }
    ]
  });

  const [subscription] = useState({
    planName: 'Professional Plan',
    expiryDate: '2024-12-31',
    employeeLimit: 300,
    employeesUsed: 245
  });

  const handleApprove = (id: number) => {
    console.log('Approved action:', id);
    // In real implementation, this would call an API
  };

  const handleReject = (id: number) => {
    console.log('Rejected action:', id);
    // In real implementation, this would call an API
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // In real implementation, this would navigate or call APIs
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary mb-4">
            <FaUsers className="me-2" />
            Organization Dashboard
          </h2>
        </Col>
      </Row>

      {/* Top Cards */}
      <Row className="mb-4">
        <Col md={2} sm={6} className="mb-3">
          <Card className="text-center h-100 border-primary">
            <Card.Body>
              <FaUsers size={30} className="text-primary mb-2" />
              <h4 className="text-primary">{stats.totalEmployees}</h4>
              <Card.Text className="text-muted">Total Employees</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={6} className="mb-3">
          <Card className="text-center h-100 border-success">
            <Card.Body>
              <FaUserPlus size={30} className="text-success mb-2" />
              <h4 className="text-success">{stats.newJoiners}</h4>
              <Card.Text className="text-muted">New Joiners (This Month)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={6} className="mb-3">
          <Card className="text-center h-100 border-info">
            <Card.Body>
              <FaClock size={30} className="text-info mb-2" />
              <h4 className="text-info">{stats.presentToday}</h4>
              <Card.Text className="text-muted">Present Today</Card.Text>
              <small className="text-danger">{stats.absentToday} Absent</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={6} className="mb-3">
          <Card className="text-center h-100 border-warning">
            <Card.Body>
              <FaUmbrellaBeach size={30} className="text-warning mb-2" />
              <h4 className="text-warning">{stats.pendingLeaves}</h4>
              <Card.Text className="text-muted">Pending Leave Requests</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={6} className="mb-3">
          <Card className="text-center h-100 border-secondary">
            <Card.Body>
              <FaMoneyBillWave size={30} className="text-secondary mb-2" />
              <h4 className="text-secondary">{stats.payrollStatus}</h4>
              <Card.Text className="text-muted">Payroll Status</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaUsers className="me-2 text-primary" />
                Employee Growth (Monthly Joiners vs Exits)
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="joiners" fill="#28a745" name="Joiners" />
                  <Bar dataKey="exits" fill="#dc3545" name="Exits" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Pending Actions */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="bg-warning text-white">
              <h5 className="mb-0">
                <FaClock className="me-2" />
                Pending Actions
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {pendingActions.map((action) => (
                  <ListGroup.Item key={action.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{action.employee}</strong>
                      <br />
                      <small className="text-muted">
                        {action.type === 'leave' ? `${action.reason} (${action.days} days)` : action.reason}
                      </small>
                      <Badge bg={action.type === 'leave' ? 'warning' : 'info'} className="ms-2">
                        {action.type}
                      </Badge>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => handleApprove(action.id)}
                      >
                        <FaCheck />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(action.id)}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Employee Highlights */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <FaTrophy className="me-2" />
                Employee Highlights
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Birthdays */}
              <div className="mb-3">
                <h6 className="text-primary">
                  <FaBirthdayCake className="me-2" />
                  Birthdays Today
                </h6>
                {employeeHighlights.birthdays.map((person, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{person.name}</span>
                    <Badge bg="primary">{person.department}</Badge>
                  </div>
                ))}
              </div>

              {/* Work Anniversaries */}
              <div className="mb-3">
                <h6 className="text-success">
                  <FaTrophy className="me-2" />
                  Work Anniversaries
                </h6>
                {employeeHighlights.anniversaries.map((person, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{person.name}</span>
                    <Badge bg="success">{person.years} Years</Badge>
                  </div>
                ))}
              </div>

              {/* Employees on Leave */}
              <div>
                <h6 className="text-warning">
                  <FaPlane className="me-2" />
                  Employees on Leave Today
                </h6>
                {employeeHighlights.onLeave.map((person, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{person.name}</span>
                    <Badge bg="warning">{person.days} days</Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Quick Actions */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaPlus className="me-2" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-primary"
                    className="w-100 h-100 d-flex flex-column align-items-center p-3"
                    onClick={() => handleQuickAction('add-employee')}
                  >
                    <FaPlus size={24} className="mb-2" />
                    <span>Add Employee</span>
                  </Button>
                </Col>
                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-success"
                    className="w-100 h-100 d-flex flex-column align-items-center p-3"
                    onClick={() => handleQuickAction('approve-leaves')}
                  >
                    <FaCheck size={24} className="mb-2" />
                    <span>Approve Leaves</span>
                  </Button>
                </Col>
                <Col md={4} className="mb-3">
                  <Button
                    variant="outline-secondary"
                    className="w-100 h-100 d-flex flex-column align-items-center p-3"
                    onClick={() => handleQuickAction('run-payroll')}
                  >
                    <FaMoneyBillWave size={24} className="mb-2" />
                    <span>Run Payroll</span>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Subscription Info */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">
                <FaCreditCard className="me-2" />
                Subscription Info
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Plan:</strong> {subscription.planName}
              </div>
              <div className="mb-3">
                <strong>Expiry Date:</strong> {subscription.expiryDate}
              </div>
              <div className="mb-3">
                <strong>Employee Usage:</strong>
                <div className="mt-2">
                  <ProgressBar
                    now={(subscription.employeesUsed / subscription.employeeLimit) * 100}
                    label={`${subscription.employeesUsed}/${subscription.employeeLimit}`}
                    variant="info"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
