import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import departmentService from '../../services/departmentService';
import ticketService from '../../services/ticketService';

type Department = {
  id: number;
  name: string;
};

type Category = {
  CategoryId: number;
  CategoryName: string;
  DepartmentId: number | null;
};

type Mapping = {
  departmentId: number;
  categoryIds: number[];
};

const DepartmentCategoryMapping: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [mappings, setMappings] = useState<Mapping[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // =============================
  // FETCH DATA
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const organizationID = user.organizationID;

        // Departments
        const deptData =
          await departmentService.getdepartmentesAsync(organizationID);

        const deptArray = Array.isArray(deptData)
          ? deptData
          : deptData?.Table || [];

        const mappedDepts = deptArray.map((dept: any) => ({
          id: dept.DepartmentID || dept.id,
          name: dept.DepartmentName || dept.name,
        }));

        setDepartments(mappedDepts);

        // Categories
        const catRes =
          await ticketService.GetSupportCategoryByOrganization(
            organizationID
          );

        setCategories(catRes || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =============================
  // FILTER CATEGORIES
  // =============================
  const filteredCategories = useMemo(() => {
    if (!selectedDepartment) return [];

    return categories.filter(
      (c) =>
        c.DepartmentId === selectedDepartment || c.DepartmentId === null
    );
  }, [selectedDepartment, categories]);

  // =============================
  // HANDLE DEPARTMENT CHANGE
  // =============================
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = Number(e.target.value);
    setSelectedDepartment(deptId);

    if (deptId) {
      const preSelected = categories
        .filter((c) => c.DepartmentId === deptId)
        .map((c) => c.CategoryId);

      setSelectedCategories(preSelected);
    } else {
      setSelectedCategories([]);
    }
  };

  // =============================
  // CATEGORY SELECT
  // =============================
  const handleCategoryChange = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // =============================
  // SAVE (API INTEGRATION)
  // =============================
  const handleSave = async () => {
    if (!selectedDepartment || selectedCategories.length === 0) {
      setError('Please select department and categories');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
        organizationId: user.organizationID,
        departmentId: selectedDepartment,
        categoryIds: selectedCategories,
      };

      await ticketService.PostDepartmentCategoryMappingByAsync(payload);

      setMessage('✅ Mapping saved successfully');

      // Optional: update local UI
      setMappings((prev) => [
        ...prev.filter((m) => m.departmentId !== selectedDepartment),
        {
          departmentId: selectedDepartment,
          categoryIds: selectedCategories,
        },
      ]);

      // Reset
      setSelectedDepartment('');
      setSelectedCategories([]);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to save mapping');
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // HELPERS
  // =============================
  const getDeptName = (id: number) =>
    departments.find((d) => d.id === id)?.name || '';

  const getCatName = (id: number) =>
    categories.find((c) => c.CategoryId === id)?.CategoryName || '';

  return (
    <Container className="mt-4">
      <h3 className="mb-4">Department → Category Mapping</h3>

      {/* MESSAGE */}
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {loading && <Spinner />}

      {!loading && (
        <>
          <Row>
            {/* DEPARTMENT */}
            <Col md={4}>
              <Form.Label>Department</Form.Label>
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
            </Col>

            {/* CATEGORIES */}
            <Col md={8}>
              <Form.Label>Categories</Form.Label>

              <div
                className="border rounded p-2"
                style={{ maxHeight: 250, overflowY: 'auto' }}
              >
                {selectedDepartment ? (
                  filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <Form.Check
                        key={c.CategoryId}
                        type="checkbox"
                        label={c.CategoryName}
                        checked={selectedCategories.includes(c.CategoryId)}
                        onChange={() =>
                          handleCategoryChange(c.CategoryId)
                        }
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

          {/* SAVE BUTTON */}
          <Button
            className="mt-3"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Mapping'
            )}
          </Button>

          <hr className="my-4" />

          {/* LOCAL VIEW */}
          <h5>Recent Mappings</h5>

          {mappings.length === 0 ? (
            <p>No mappings yet</p>
          ) : (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Department</th>
                  <th>Categories</th>
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
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          
        </>
      )}
    </Container>
  );
};

export default DepartmentCategoryMapping;