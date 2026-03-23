import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
} from 'react-bootstrap';
import departmentService from '../../services/departmentService';

type Department = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  departmentId: number;
};

type Mapping = {
  departmentId: number;
  categoryIds: number[];
};

const DepartmentCategoryMapping: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 1,  departmentId: 1,name: 'Network Issue' },
    { id: 2,  departmentId: 1, name: 'Server Issue' },
    { id: 3, departmentId: 1, name: 'Application Bug' },
    { id: 4, departmentId: 1, name: 'Software Installation' },
    { id: 5, departmentId: 1, name: 'Email Issue' },
    { id: 6, departmentId: 1, name: 'Database Issue' },
    { id: 7, departmentId: 1, name: 'Hardware Issue' },
    { id: 8, departmentId: 1, name: 'Printer Issue' },
    { id: 9, departmentId: 1, name: 'System Access' },
    { id: 10, departmentId: 1, name: 'Access Revocation' },
    { id: 11, departmentId: 1, name: 'Password Reset' },
    { id: 12, departmentId: 1, name: 'Security Incident' },
    { id: 13, departmentId: 1, name: 'Compliance Request' },
    { id: 14, departmentId: 1, name: 'Deployment Issue' },
    { id: 15, departmentId: 1, name: 'Cloud Infrastructure' },
    { id: 16, departmentId: 1, name: 'CI/CD Pipeline Issue' },
    { id: 17, departmentId: 1, name: 'Performance Issue' },
    { id: 18, departmentId: 1, name: 'Monitoring Alert' },
    { id: 19, departmentId: 1, name: 'Third-Party Integration' },
    { id: 20, departmentId: 1, name: 'Data Request' },
    { id: 21, departmentId: 1, name: 'Change Request' },
    { id: 22, departmentId: 1, name: 'New Requirement' },
    { id: 23, departmentId: 1, name: 'Backup & Recovery' },
    { id: 24, departmentId: 1, name: 'License Issue' },

    { id: 25, departmentId: 2, name: 'Leave Request Issue' },
    { id: 26, departmentId: 2, name: 'Payroll Query' },
    { id: 27, departmentId: 2, name: 'Attendance Issue' },
    { id: 28, departmentId: 2, name: 'Employee Onboarding' },
    { id: 29, departmentId: 2, name: 'Employee Offboarding' },
    { id: 30, departmentId: 2, name: 'Policy Clarification' },
    { id: 31, departmentId: 2, name: 'Benefits Query' },
    { id: 32, departmentId: 2, name: 'Document Request' },
  ];

  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteDeptId, setDeleteDeptId] = useState<number | null>(null);

  // ✅ FETCH DEPARTMENTS FROM API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const organizationID = user.organizationID;

        if (!organizationID) {
          setError('Organization ID not found');
          setLoading(false);
          return;
        }

        console.log('Fetching departments for organizationID:', organizationID);
        const deptData = await departmentService.getdepartmentesAsync(organizationID);
        let deptArray = Array.isArray(deptData) ? deptData : deptData?.Table || [];

        const mappedDepts = deptArray.map((dept: any) => ({
          id: dept.DepartmentID || dept.id,
          name: dept.DepartmentName || dept.name,
        }));

        console.log('Mapped departments:', mappedDepts);
        setDepartments(mappedDepts);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setError('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!selectedDepartment) return [];
    return categories //.filter((c) => c.departmentId === selectedDepartment);
  }, [selectedDepartment]);

  // ✅ AUTO SELECT ALL CATEGORIES WHEN DEPARTMENT CHANGES
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);

    setSelectedDepartment(val);

    if (val) {
      const allCategoryIds = categories
        .filter((c) => c.departmentId === val)
        .map((c) => c.id);

      setSelectedCategories(allCategoryIds);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleCategoryChange = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!selectedDepartment || selectedCategories.length === 0) {
      alert('Please select department and categories');
      return;
    }

    setMappings((prev) => [
      ...prev.filter((m) => m.departmentId !== selectedDepartment),
      {
        departmentId: selectedDepartment,
        categoryIds: selectedCategories,
      },
    ]);

    setSelectedCategories([]);
    setSelectedDepartment('');
  };

  const confirmDelete = () => {
    if (deleteDeptId !== null) {
      setMappings((prev) =>
        prev.filter((m) => m.departmentId !== deleteDeptId)
      );
    }
    setShowModal(false);
    setDeleteDeptId(null);
  };

  const getDeptName = (id: number) =>
    departments.find((d) => d.id === id)?.name || '';

  const getCatName = (id: number) =>
    categories.find((c) => c.id === id)?.name || '';

  return (
    <Container className="mt-4">
      <h3 className="mb-4">Department → Category Mapping</h3>

      {loading && <p className="text-muted">Loading departments...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <Row>
          <Col md={4}>
            <Form.Label>Department</Form.Label>
            {departments.length === 0 ? (
              <p className="text-warning">No departments available</p>
            ) : (
              <Form.Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Col>

          <Col md={8}>
            <Form.Label>Categories</Form.Label>

            <div className="border rounded p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {selectedDepartment ? (
                filteredCategories.length > 0 ? (
                  filteredCategories.map((c) => (
                    <Form.Check
                      key={c.id}
                      type="checkbox"
                      label={`${getDeptName(c.departmentId)} - ${c.name}`}
                      checked={selectedCategories.includes(c.id)}
                      onChange={() => handleCategoryChange(c.id)}
                    />
                  ))
                ) : (
                <small>No categories available</small>
              )
            ) : (
              <small>Select a department first</small>
            )}
          </div>
        </Col>
        </Row>
        )}

      <Button className="mt-3" onClick={handleSave}>
        Save Mapping
      </Button>

      <hr className="my-4" />
      <h5>Mappings</h5>

      {mappings.length === 0 ? (
        <p>No mappings found</p>
      ) : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Department</th>
              <th>Categories</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => (
              <tr key={m.departmentId}>
                <td>{i + 1}</td>
                <td>{getDeptName(m.departmentId)}</td>
                <td>
                  {m.categoryIds.map((id) => (
                    <Badge key={id} bg="secondary" className="me-1">
                      {getCatName(id)}
                    </Badge>
                  ))}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setDeleteDeptId(m.departmentId);
                      setShowModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Confirm Delete</h5>
              <p>Are you sure you want to delete this mapping?</p>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default DepartmentCategoryMapping;