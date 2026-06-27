import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import moment from 'moment';
import taskService from '../../services/taskService';
import employeeProjectService from "../../services/employeeProjectService";

interface EmployeeTask {
  employeeDailyTaskId: number;
  projectId: number;
  activityDate: string;
  taskDescription: string;
  startedAt: string;
  endedAt: string;
  hoursSpent: number;
  taskStatusId: number;
}

interface TaskFormData {
  employeeDailyTaskId: number;
  projectId: number;
  activityDate: string;
  taskDescription: string;
  startedAt: string;
  endedAt: string;
  hoursSpent: number;
  taskStatusId: number;
}

interface ProjectOption {
  ProjectId: number;
  ProjectName: string;
}

const STATUS_OPTIONS = [
  { id: 1, label: 'Pending' },
  { id: 2, label: 'In Progress' },
  { id: 3, label: 'Completed' },
  { id: 4, label: 'Approved' },
  { id: 5, label: 'Rejected' },
];

const getStatusLabel = (id: number) =>
  STATUS_OPTIONS.find((s) => s.id === id)?.label ?? String(id);

const EMPTY_FORM: TaskFormData = {
  employeeDailyTaskId: 0,
  projectId: 0,
  activityDate: '',
  taskDescription: '',
  startedAt: '',
  endedAt: '',
  hoursSpent: 0,
  taskStatusId: 1,
};

const toISOString = (value: string): string => {
  const m = value ? moment(value) : moment();
  return (m.isValid() ? m : moment()).toISOString();
};

const toDateTimeLocal = (value: string) =>
  value ? moment(value).format('YYYY-MM-DDTHH:mm') : '';

const EmployeeTaskMaster: React.FC = () => {

  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [employeeProjects, setEmployeeProjects] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<EmployeeTask | null>(null);
  const [validated, setValidated] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeId = user?.employeeID || 0;
  const organizationId = user?.organizationID || 0;
  const userId = user?.userID || user?.userId || user?.id || 0;

  const [formData, setFormData] = useState<TaskFormData>(EMPTY_FORM);

  /* ================= LOAD PROJECTS ================= */
  const loadEmployeeProjects = async () => {
  try {
    const res = await employeeProjectService.GetEmployeeProjectsByemployeeId(employeeId);

    const formatted = (res || []).map((p: any) => ({
      EmployeeProjectId: p.EmployeeProjectId,
      ProjectId: p.ProjectId,
      ProjectName: p.ProjectName,
      ProjectCode: p.ProjectCode,
    }));

    setEmployeeProjects(formatted);
  } catch (error) {
    console.error('Employee project load error:', error);
    setEmployeeProjects([]);
  }
};

  /* ================= FETCH TASKS ================= */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.GetEmployeeTasks(organizationId, employeeId);

      setTasks(
        data.map((item: any) => ({
          employeeDailyTaskId: item.EmployeeDailyTaskId,
          projectId: item.ProjectId,
          activityDate: item.ActivityDate,
          taskDescription: item.TaskDescription,
          startedAt: item.StartedAt,
          endedAt: item.EndedAt,
          hoursSpent: item.HoursSpent,
          taskStatusId: item.TaskStatusId,
        }))
      );
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    loadEmployeeProjects(); // ✅ ADDED
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'hoursSpent' ||
        id === 'projectId' ||
        id === 'taskStatusId'
          ? Number(value)
          : value,
    }));
  };

  /* ================= SAVE ================= */
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        employeeDailyTaskId: formData.employeeDailyTaskId,
        organizationId,
        employeeId,
        projectId: formData.projectId,
        activityDate: toISOString(formData.activityDate),
        taskDescription: formData.taskDescription,
        startedAt: toISOString(formData.startedAt),
        endedAt: toISOString(formData.endedAt),
        hoursSpent: formData.hoursSpent,
        taskStatusId: formData.taskStatusId,
        userId,
      };

      await taskService.TaskEntry(payload);

      setShowModal(false);
      setEditTask(null);
      setValidated(false);
      setFormData(EMPTY_FORM);
      fetchTasks();

    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  /* ================= ADD ================= */
  const handleAdd = () => {
    setFormData(EMPTY_FORM);
    setEditTask(null);
    setValidated(false);
    setShowModal(true);
  };

  /* ================= EDIT ================= */
  const handleEdit = (task: EmployeeTask) => {
    setEditTask(task);

    setFormData({
      employeeDailyTaskId: task.employeeDailyTaskId,
      projectId: task.projectId,
      activityDate: task.activityDate
        ? moment(task.activityDate).format('YYYY-MM-DD')
        : '',
      taskDescription: task.taskDescription,
      startedAt: toDateTimeLocal(task.startedAt),
      endedAt: toDateTimeLocal(task.endedAt),
      hoursSpent: task.hoursSpent,
      taskStatusId: task.taskStatusId,
    });

    setValidated(false);
    setShowModal(true);
  };

  /* ================= DELETE (UI ONLY) ================= */
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.employeeDailyTaskId !== id));
    }
  };

  /* ================= UI ================= */
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
              <th>#</th>
              <th>Project</th>
              <th>Description</th>
              <th>Activity Date</th>
              <th>Started At</th>
              <th>Ended At</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.employeeDailyTaskId}>
                <td>{task.employeeDailyTaskId}</td>
                <td>{task.projectId}</td>
                <td>{task.taskDescription}</td>
                <td>{moment(task.activityDate).format('YYYY-MM-DD')}</td>
                <td>{moment(task.startedAt).format('YYYY-MM-DD HH:mm')}</td>
                <td>{moment(task.endedAt).format('YYYY-MM-DD HH:mm')}</td>
                <td>{task.hoursSpent}</td>
                <td>{getStatusLabel(task.taskStatusId)}</td>
                <td>
                  <Button size="sm" variant="outline-primary" onClick={() => handleEdit(task)}>
                    Edit
                  </Button>{' '}
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(task.employeeDailyTaskId)}>
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
          <Modal.Title>{editTask ? 'Edit Task' : 'Add Task'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>

            <Row className="mb-3">

              {/* ✅ PROJECT DROPDOWN ADDED */}
              <Col md={12}>
               <Form.Group controlId="projectId">
  <Form.Label>Project</Form.Label>

  <Form.Select
    required
    value={formData.projectId}
    onChange={handleInputChange}
  >
    <option value="">Select Project</option>

    {employeeProjects.map((p) => (
      <option key={p.ProjectId} value={p.ProjectId}>
        {p.ProjectName} ({p.ProjectCode})
      </option>
    ))}
  </Form.Select>

  <Form.Control.Feedback type="invalid">
    Project is required.
  </Form.Control.Feedback>
</Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="activityDate">
                  <Form.Label>Activity Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.activityDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="taskDescription" className="mb-3">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={formData.taskDescription}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="startedAt">
                  <Form.Label>Started At</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    required
                    value={formData.startedAt}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="endedAt">
                  <Form.Label>Ended At</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    required
                    value={formData.endedAt}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="hoursSpent">
                  <Form.Label>Hours Spent</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min={0}
                    required
                    value={formData.hoursSpent}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="taskStatusId">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.taskStatusId}
                    onChange={handleInputChange}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner size="sm" animation="border" /> : editTask ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>

          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default EmployeeTaskMaster;