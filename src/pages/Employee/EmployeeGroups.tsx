import React, { useState } from 'react';
import { Button, Table, Modal, Form, Row, Col, Accordion, Card, InputGroup } from 'react-bootstrap';

// ---------- Types ----------
interface Group {
  groupID: number;
  groupName: string;
  description: string;
  category?: string;
}

interface Employee {
  id: number;
  name: string;
  branch: string;
  division: string;
  department: string;
  groupID: number; // Assigned group
}

// ---------- Sample Data ----------
const initialGroups: Group[] = [
  { groupID: 1, groupName: 'HR Team', description: 'Handles HR operations', category: 'Department' },
  { groupID: 2, groupName: 'Finance Team', description: 'Handles accounts', category: 'Department' },
];

const initialEmployees: Employee[] = [
  { id: 1, name: 'John Doe', branch: 'HQ', division: 'Admin', department: 'HR', groupID: 1 },
  { id: 2, name: 'Samantha Red', branch: 'Branch1', division: 'IT', department: 'IT', groupID: 2 },
  { id: 3, name: 'Michael Adams', branch: 'Branch2', division: 'Sales', department: 'Finance', groupID: 2 },
  { id: 4, name: 'Alice Green', branch: 'HQ', division: 'Admin', department: 'HR', groupID: 1 },
];

// ---------- Component ----------
const EmployeeGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [employees] = useState<Employee[]>(initialEmployees);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState<Group>({ groupID: 0, groupName: '', description: '' });

  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [groupSearch, setGroupSearch] = useState('');

  // ---------- View Employees ----------
  const [viewGroup, setViewGroup] = useState<Group | null>(null);

  // ---------- Handlers ----------
  const handleGroupChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setGroupForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!groupForm.groupName.trim()) return alert('Group name is required');

    if (editGroup) {
      setGroups(prev => prev.map(g => (g.groupID === editGroup.groupID ? groupForm : g)));
    } else {
      setGroups(prev => [...prev, { ...groupForm, groupID: Date.now() }]);
    }

    setShowGroupModal(false);
    setEditGroup(null);
  };

  const handleEditGroup = (group: Group) => {
    setEditGroup(group);
    setGroupForm(group);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = (id: number) => {
    setDeleteGroupId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    setGroups(prev => prev.filter(g => g.groupID !== deleteGroupId));
    setConfirmDelete(false);
    setDeleteGroupId(null);
  };

  const filteredGroups = groups.filter(g =>
    g.groupName.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const categories = Array.from(new Set(filteredGroups.map(g => g.category || 'Others')));

  const employeesInGroup = (groupID: number) =>
    employees.filter(emp => emp.groupID === groupID);

  return (
    <div className="container mt-5">
      <h3>Employee Groups</h3>

      {/* Top Controls */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search group..."
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Button
            variant="success"
            onClick={() => { setEditGroup(null); setGroupForm({ groupID: 0, groupName: '', description: '' }); setShowGroupModal(true); }}
          >
            + Add Group
          </Button>
        </Col>
      </Row>

      {/* Groups Accordion */}
      <Accordion>
        {categories.map(cat => (
          <Card key={cat}>
            <Accordion.Item eventKey={cat}>
              <Accordion.Header>{cat}</Accordion.Header>
              <Accordion.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table hover size="sm" responsive>
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.filter(g => (g.category || 'Others') === cat).map(group => (
                      <tr key={group.groupID}>
                        <td>{group.groupName}</td>
                        <td>{group.description}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => setViewGroup(group)}
                          >
                            View Employees
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => handleEditGroup(group)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteGroup(group.groupID)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        ))}
      </Accordion>

      {/* ---------- Group Modal ---------- */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editGroup ? 'Edit Group' : 'Add Group'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveGroup}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="groupName">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                value={groupForm.groupName}
                onChange={handleGroupChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={groupForm.description}
                onChange={handleGroupChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGroupModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editGroup ? 'Update' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ---------- Delete Confirmation ---------- */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this group?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDeleteAction}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* ---------- View Employees Modal ---------- */}
      <Modal show={!!viewGroup} onHide={() => setViewGroup(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Employees in "{viewGroup?.groupName}"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>Name</th>
                <th>Branch</th>
                <th>Division</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {viewGroup && employeesInGroup(viewGroup.groupID).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">No employees assigned</td>
                </tr>
              ) : (
                viewGroup && employeesInGroup(viewGroup.groupID).map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.branch}</td>
                    <td>{emp.division}</td>
                    <td>{emp.department}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewGroup(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeGroups;