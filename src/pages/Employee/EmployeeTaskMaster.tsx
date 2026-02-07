import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface EmployeeTask {
  id: number;
  employeeName: string;
  projectName: string;
  taskTitle: string;
  taskDescription: string;
  taskDate: string;
  noOfHours: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const EmployeeTaskMaster: React.FC = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([
    {
      id: 1,
      employeeName: 'John Doe',
      projectName: 'Project A',
      taskTitle: 'Design UI',
      taskDescription: 'Create wireframes for dashboard',
      taskDate: '2026-02-07',
      noOfHours: 4,
      status: 'Pending',
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      projectName: 'Project B',
      taskTitle: 'Backend API',
      taskDescription: 'Develop REST API endpoints',
      taskDate: '2026-02-07',
      noOfHours: 5,
      status: 'Approved',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<EmployeeTask | null>(null);
  const [validated, setValidated] = useState(false);

  const [formData, setFormData] = useState<EmployeeTask>({
    id: 0,
    employeeName: '',
    projectName: '',
    taskTitle: '',
    taskDescription: '',
    taskDate: '',
    noOfHours: 0,
    status: 'Pending',
  });

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === 'noOfHours' ? parseFloat(value) : value,
    }));
  };

  // Save Add/Edit
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (editTask) {
      setTasks((prev) =>
        prev.map((task) => (task.id === editTask.id ? formData : task))
      );
    } else {
      setTasks((prev) => [...prev, { ...formData, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
      employeeName: '',
      projectName: '',
      taskTitle: '',
      taskDescription: '',
      taskDate: '',
      noOfHours: 0,
      status: 'Pending',
    });
    setEditTask(null);
    setShowModal(true);
  };

  const handleEdit = (task: EmployeeTask) => {
    setEditTask(task);
    setFormData(task);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="employee-task-container mt-5">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Task
        </Button>
      </div>

      {tasks.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Project</th>
              <th>Task Title</th>
              <th>Description</th>
              <th>Date</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.employeeName}</td>
                <td>{task.projectName}</td>
                <td>{task.taskTitle}</td>
                <td>{task.taskDescription}</td>
                <td>{task.taskDate}</td>
                <td>{task.noOfHours}</td>
                <td>{task.status}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No tasks added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editTask ? 'Edit Task' : 'Add Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="employeeName">
                  <Form.Label>Employee Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter employee name
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="projectName">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.projectName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter project name
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="taskTitle">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.taskTitle}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter task title
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="taskDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.taskDate}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Select task date
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="taskDescription" className="mb-3">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.taskDescription}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="noOfHours" className="mb-3">
              <Form.Label>Hours Spent</Form.Label>
              <Form.Control
                required
                type="number"
                step="0.1"
                value={formData.noOfHours}
                onChange={handleInputChange}
              />
              <Form.Control.Feedback type="invalid">
                Enter hours spent
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="status" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editTask ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeTaskMaster;
