import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';

interface DailyTask {
  id: number;
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  taskDescription: string;
  startedAt: string;
  endedAt: string;
  hoursSpent: number;
  taskStatusId: number;
  taskStatusName: string;
}

// Mock employee, project, and status options
const employeeOptions = [
  { id: 101, name: 'John Doe' },
  { id: 102, name: 'Priya Sharma' },
  { id: 103, name: 'Amit Kumar' }
];

const projectOptions = [
  { id: 1, name: 'Project A' },
  { id: 2, name: 'Project B' }
];

const taskStatusOptions = [
  { id: 1, name: 'Planned' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'Completed' }
];

const EmployeeDailyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [editTask, setEditTask] = useState<DailyTask | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<DailyTask>({
    id: 0,
    employeeId: 0,
    employeeName: '',
    projectId: 0,
    projectName: '',
    taskDescription: '',
    startedAt: '',
    endedAt: '',
    hoursSpent: 0,
    taskStatusId: 1,
    taskStatusName: 'Planned'
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Calculate hours between start and end
  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
    return diff > 0 ? Number(diff.toFixed(2)) : 0;
  };

  // Save or update task
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const employee = employeeOptions.find(e => e.id === Number(formData.employeeId));
    const project = projectOptions.find(p => p.id === Number(formData.projectId));
    const status = taskStatusOptions.find(s => s.id === Number(formData.taskStatusId));

    const updatedTask = {
      ...formData,
      employeeName: employee?.name || '',
      projectName: project?.name || '',
      taskStatusName: status?.name || '',
      hoursSpent: calculateHours(formData.startedAt, formData.endedAt)
    };

    if (editTask) {
      setTasks(prev => prev.map(t => (t.id === editTask.id ? updatedTask : t)));
    } else {
      setTasks(prev => [...prev, { ...updatedTask, id: Date.now() }]);
    }

    setValidated(false);
    setShowModal(false);
  };

  // Open modal to add new task
  const handleAdd = () => {
    setFormData({
      id: 0,
      employeeId: 0,
      employeeName: '',
      projectId: 0,
      projectName: '',
      taskDescription: '',
      startedAt: '',
      endedAt: '',
      hoursSpent: 0,
      taskStatusId: 1,
      taskStatusName: 'Planned'
    });
    setEditTask(null);
    setShowModal(true);
  };

  // Delete task handling
  const handleDelete = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    setTasks(prev => prev.filter(t => t.id !== deleteId));
    setConfirmDelete(false);
  };

  return (
    <div className="p-3 mt-4">
      <div className="text-end mb-5">
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
              <th>Task</th>
              <th>Start</th>
              <th>End</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.employeeName}</td>
                <td>{task.projectName}</td>
                <td>{task.taskDescription}</td>
                <td>{task.startedAt}</td>
                <td>{task.endedAt}</td>
                <td>{task.hoursSpent}</td>
                <td>{task.taskStatusName}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setEditTask(task);
                      setFormData(task);
                      setShowModal(true);
                    }}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editTask ? 'Edit Task' : 'Add Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="employeeId">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    required
                    value={formData.employeeId}
                    onChange={handleChange}
                  >
                    <option value="">Select Employee</option>
                    {employeeOptions.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select employee.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="projectId">
                  <Form.Label>Project</Form.Label>
                  <Form.Select
                    required
                    value={formData.projectId}
                    onChange={handleChange}
                  >
                    <option value="">Select Project</option>
                    {projectOptions.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select project.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>           
              <Col md={4}>
                <Form.Group controlId="taskStatusId">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.taskStatusId}
                    onChange={handleChange}
                  >
                    {taskStatusOptions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="taskDescription">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={formData.taskDescription}
                onChange={handleChange}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="startedAt">
                  <Form.Label>Started At</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.startedAt}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="endedAt">
                  <Form.Label>Ended At</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.endedAt}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

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

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteAction}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeDailyTasks;
