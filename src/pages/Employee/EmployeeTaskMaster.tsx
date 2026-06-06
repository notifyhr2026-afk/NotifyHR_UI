import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import taskService from '../../services/taskService';

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
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<EmployeeTask | null>(null);
  const [validated, setValidated] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeId = user?.employeeID || 0;
  const organizationId = user?.organizationID || 0;

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

  // =========================
  // BUILD PAYLOAD
  // =========================
  const buildPayload = (fromDate?: string | null, toDate?: string | null) => {
    return {
      organizationId,
      employeeId,
      fromDate: fromDate || null,
      toDate: toDate || null,
    };
  };

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);

      const payload = buildPayload(fromDate, toDate);

      const data =
        await taskService.GetEmployeeDailyTasksByDateRange(payload);

      setTasks(
        data.map((item: any) => ({
          id: item.id || item.taskId,
          employeeName: item.employeeName,
          projectName: item.projectName,
          taskTitle: item.taskTitle,
          taskDescription: item.taskDescription,
          taskDate: item.taskDate,
          noOfHours: item.noOfHours,
          status: item.status,
        }))
      );
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(); // initial load (null dates)
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: id === 'noOfHours' ? parseFloat(value) : value,
    }));
  };

  // =========================
  // SAVE (CREATE / UPDATE)
  // =========================
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const payload = {
        ...formData,
        id: editTask ? editTask.id : 0,
        organizationId,
        employeeId,
      };

      await taskService.TaskEntry(payload);

      setShowModal(false);
      setEditTask(null);
      setValidated(false);

      fetchTasks();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // =========================
  // ADD
  // =========================
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

  // =========================
  // EDIT
  // =========================
  const handleEdit = (task: EmployeeTask) => {
    setEditTask(task);
    setFormData(task);
    setShowModal(true);
  };

  // =========================
  // DELETE (UI ONLY - API optional)
  // =========================
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="container">

      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Task
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : tasks.length ? (
        <Table className="table table-hover table-dark-custom">
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
        <p>No tasks found</p>
      )}

      {/* ================= MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editTask ? 'Edit Task' : 'Add Task'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="employeeName">
                  <Form.Label>Employee Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.employeeName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="projectName">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.projectName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="taskTitle">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    required
                    value={formData.taskTitle}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="taskDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.taskDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="taskDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.taskDescription}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="noOfHours">
                  <Form.Label>Hours</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    required
                    value={formData.noOfHours}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="status">
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
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
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