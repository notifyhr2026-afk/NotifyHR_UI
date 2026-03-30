import React, { useState, useMemo } from "react";
import { Row, Col, Card, ListGroup, Button, Form } from "react-bootstrap";

// Groups
const groupsData = [
  { id: 1, name: "HR Team" },
  { id: 2, name: "Night Shift Team" },
];

// Filters
const branches = ["HQ", "Branch1"];
const departments = ["HR", "IT"];
const divisions = ["Admin", "Tech"];

// Employees
const employeesData = [
  { id: 1, name: "John Doe", branch: "HQ", department: "HR", division: "Admin" },
  { id: 2, name: "Samantha Red", branch: "Branch1", department: "IT", division: "Tech" },
  { id: 3, name: "Michael Adams", branch: "HQ", department: "IT", division: "Tech" },
  { id: 4, name: "Priya Sharma", branch: "Branch1", department: "HR", division: "Admin" },
  { id: 5, name: "Ravi Kumar", branch: "HQ", department: "HR", division: "Admin" },
];

const GroupEmployeeMapping: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // ✅ Persistent mapping
  const [groupMap, setGroupMap] = useState<{ [key: number]: any[] }>({});

  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedAssigned, setSelectedAssigned] = useState<number[]>([]);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [search, setSearch] = useState("");

  // Get assigned employees
  const groupEmployees = selectedGroup ? groupMap[selectedGroup.id] || [] : [];

  // Available employees (exclude assigned)
  const availableEmployees = useMemo(() => {
    const assignedIds = groupEmployees.map(e => e.id);

    return employeesData.filter(emp => {
      return (
        !assignedIds.includes(emp.id) &&
        (!selectedBranch || emp.branch === selectedBranch) &&
        (!selectedDepartment || emp.department === selectedDepartment) &&
        (!selectedDivision || emp.division === selectedDivision) &&
        emp.name.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [groupEmployees, selectedBranch, selectedDepartment, selectedDivision, search]);

  // Select group
  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group);
    setSelectedAvailable([]);
    setSelectedAssigned([]);
  };

  // Add employees
  const handleAdd = () => {
    if (!selectedGroup) return;

    const toAdd = availableEmployees.filter(emp =>
      selectedAvailable.includes(emp.id)
    );

    const updated = [...groupEmployees, ...toAdd];

    setGroupMap(prev => ({
      ...prev,
      [selectedGroup.id]: updated,
    }));

    setSelectedAvailable([]);
  };

  // Remove employees
  const handleRemove = () => {
    if (!selectedGroup) return;

    const updated = groupEmployees.filter(
      emp => !selectedAssigned.includes(emp.id)
    );

    setGroupMap(prev => ({
      ...prev,
      [selectedGroup.id]: updated,
    }));

    setSelectedAssigned([]);
  };

  // Select All Available
  const handleSelectAllAvailable = (checked: boolean) => {
    setSelectedAvailable(
      checked ? availableEmployees.map(emp => emp.id) : []
    );
  };

  // Select All Assigned
  const handleSelectAllAssigned = (checked: boolean) => {
    setSelectedAssigned(
      checked ? groupEmployees.map(emp => emp.id) : []
    );
  };

  return (
    <div className="container mt-5">
      <h4 className="mb-3">Assign Employees to Groups</h4>

      <Row>
        {/* LEFT PANEL */}
        <Col md={3}>
          <Card>
            <Card.Header>Groups</Card.Header>
            <ListGroup variant="flush">
              {groupsData.map(group => (
                <ListGroup.Item
                  key={group.id}
                  action
                  active={selectedGroup?.id === group.id}
                  onClick={() => handleSelectGroup(group)}
                >
                  {group.name}{" "}
                  <span className="text-muted">
                    ({groupMap[group.id]?.length || 0})
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* RIGHT PANEL */}
        <Col md={9}>
          {!selectedGroup ? (
            <Card className="p-4 text-center text-muted">
              Select a group to assign employees
            </Card>
          ) : (
            <Card>
              <Card.Header>
                Assign → <strong>{selectedGroup.name}</strong>
              </Card.Header>

              <Card.Body>
                {/* Filters */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Select onChange={e => setSelectedBranch(e.target.value)}>
                      <option value="">All Branches</option>
                      {branches.map(b => <option key={b}>{b}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Select onChange={e => setSelectedDivision(e.target.value)}>
                      <option value="">All Divisions</option>
                      {divisions.map(d => <option key={d}>{d}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Select onChange={e => setSelectedDepartment(e.target.value)}>
                      <option value="">All Departments</option>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Control
                      placeholder="Search..."
                      onChange={e => setSearch(e.target.value)}
                    />
                  </Col>
                </Row>

                <Row>
                  {/* AVAILABLE */}
                  <Col md={5}>
                    <h6>
                      Available ({availableEmployees.length})
                    </h6>

                    <Form.Check
                      type="checkbox"
                      label="Select All"
                      onChange={(e) => handleSelectAllAvailable(e.target.checked)}
                    />

                    <ListGroup style={{ height: 350, overflowY: "auto" }}>
                      {availableEmployees.length === 0 && (
                        <div className="text-muted p-2">No employees found</div>
                      )}

                      {availableEmployees.map(emp => (
                        <ListGroup.Item key={emp.id}>
                          <Form.Check
                            type="checkbox"
                            label={`${emp.name} (${emp.department} | ${emp.branch})`}
                            checked={selectedAvailable.includes(emp.id)}
                            onChange={() =>
                              setSelectedAvailable(prev =>
                                prev.includes(emp.id)
                                  ? prev.filter(id => id !== emp.id)
                                  : [...prev, emp.id]
                              )
                            }
                          />
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>

                  {/* ACTIONS */}
                  <Col md={2} className="d-flex flex-column justify-content-center align-items-center">
                    <Button className="mb-2" onClick={handleAdd}>
                      &gt;&gt;
                    </Button>
                    <Button variant="secondary" onClick={handleRemove}>
                      &lt;&lt;
                    </Button>
                  </Col>

                  {/* ASSIGNED */}
                  <Col md={5}>
                    <h6>
                      Group Members ({groupEmployees.length})
                    </h6>

                    <Form.Check
                      type="checkbox"
                      label="Select All"
                      onChange={(e) => handleSelectAllAssigned(e.target.checked)}
                    />

                    <ListGroup style={{ height: 350, overflowY: "auto" }}>
                      {groupEmployees.length === 0 && (
                        <div className="text-muted p-2">No employees assigned</div>
                      )}

                      {groupEmployees.map(emp => (
                        <ListGroup.Item key={emp.id}>
                          <Form.Check
                            type="checkbox"
                            label={`${emp.name} (${emp.department} | ${emp.branch})`}
                            checked={selectedAssigned.includes(emp.id)}
                            onChange={() =>
                              setSelectedAssigned(prev =>
                                prev.includes(emp.id)
                                  ? prev.filter(id => id !== emp.id)
                                  : [...prev, emp.id]
                              )
                            }
                          />
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default GroupEmployeeMapping;