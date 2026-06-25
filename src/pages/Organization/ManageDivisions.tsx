import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import divisionService from '../../services/divisionService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Division {
  DivisionID: number;
  OrganizationID: number;
  DivisionCode: string;
  DivisionName: string;
  ParentDivisionID: number | null;
  IsActive: boolean;
  IsDeleted: boolean;
  CreatedBy: string;
}

const ManageDivisions: React.FC = () => {
   const user = JSON.parse(localStorage.getItem('user') || '{}');
const organizationID: number | undefined = user?.organizationID;
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [divisionFormData, setDivisionFormData] = useState<Division>({
    DivisionID: 0,
    OrganizationID: organizationID || 0,
    DivisionCode: '',
    DivisionName: '',
    ParentDivisionID: null,
    IsActive: true,
    IsDeleted: false,
    CreatedBy: 'admin',
  });

  const [editDivision, setEditDivision] = useState<Division | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);

  // ✅ Load divisions on mount
  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const data = await divisionService.getdivisionesAsync(divisionFormData.OrganizationID);
      setDivisions(data?.Table || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      toast.error('Failed to load divisions.');
    }
  };

  // ✅ Fixed input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;

    setDivisionFormData((prev) => ({
      ...prev,
      [id]:
        type === 'checkbox'
          ? checked
          : id === 'ParentDivisionID'
          ? value === '' ? null : Number(value)
          : value,
    }));
  };

  // ✅ Save or update division
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      // toast.warn('Please fill all required fields correctly.');
      return;
    }

    try {
      const saved = await divisionService.createOrUpdatedivisionAsync(divisionFormData);

      if (editDivision) {
        // ✅ Update existing division
        setDivisions((prev) =>
          prev.map((d) => (d.DivisionID === divisionFormData.DivisionID ? divisionFormData : d))
        );
        toast.success('Division updated successfully!');
      } else {
        // ✅ Add new division
        const newId = saved?.[0]?.DivisionID || 0;
        setDivisions((prev) => [...prev, { ...divisionFormData, DivisionID: newId }]);
        toast.success('Division added successfully!');
      }

      setShowModal(false);
      setValidated(false);
      fetchDivisions();
    } catch (error) {
      console.error('Error saving division:', error);
      toast.error('Error saving division. Please try again.');
    }
  };

  const openAddModal = () => {
    setEditDivision(null);
    setDivisionFormData({
      DivisionID: 0,
      OrganizationID: organizationID || 0,
      DivisionCode: '',
      DivisionName: '',
      ParentDivisionID: null,
      IsActive: true,
      IsDeleted: false,
      CreatedBy: 'admin',
    });
    setShowModal(true);
  };

  const openEditModal = (division: Division) => {
    setEditDivision(division);
    setDivisionFormData(division);
    setShowModal(true);
  };

  const confirmDeleteDivision = (id: number) => {
    setDivisionToDelete(id);
    setConfirmDelete(true);
  };

  // ✅ Delete division
  const handleDelete = async () => {
    if (divisionToDelete !== null) {
      try {
        await divisionService.deletedivisionAsync(divisionToDelete);
        setDivisions((prev) => prev.filter((d) => d.DivisionID !== divisionToDelete));
        setDivisionToDelete(null);
        setConfirmDelete(false);
        toast.success('Division deleted successfully!');
      } catch (error) {
        console.error('Error deleting division:', error);
        toast.error('Failed to delete division.');
      }
    }
  };


return (
  <>
    <ToastContainer position="top-right" autoClose={3000} />

    <div
      style={{
        background: "var(--card-bg, #fff)",
        borderRadius: 12,
        padding: 24,
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(13,110,253,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0d6efd",
            }}
          >
            <i className="bi bi-diagram-3"></i>
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Manage Divisions
            </div>

            <div
              style={{
                fontSize: ".8rem",
                opacity: 0.6,
              }}
            >
              Create and manage organizational divisions
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            padding: "8px 18px",
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Division
        </Button>
      </div>

      {/* Table */}
      {divisions.length > 0 ? (
        <div
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Table
            hover
            responsive
            className="mb-0"
            style={{
              verticalAlign: "middle",
            }}
          >
            <thead
              style={{
                background: "rgba(0,0,0,.03)",
              }}
            >
              <tr>
                <th>Division Code</th>
                <th>Division Name</th>
                <th>Parent Division</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {divisions.map((d) => (
                <tr key={d.DivisionID}>
                  <td>{d.DivisionCode}</td>

                  <td
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {d.DivisionName}
                  </td>

                  <td>
                    {divisions.find(
                      (p) => p.DivisionID === d.ParentDivisionID
                    )?.DivisionName || "N/A"}
                  </td>

                  <td>
                    {d.IsActive ? (
                      <span className="badge bg-primary">
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(d)}
                        style={{
                          borderRadius: 8,
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          confirmDeleteDivision(d.DivisionID)
                        }
                        style={{
                          borderRadius: 8,
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "50px 20px",
            border: "1px dashed var(--border-color)",
            borderRadius: 10,
            opacity: 0.7,
          }}
        >
          <i
            className="bi bi-inbox"
            style={{
              fontSize: "2rem",
            }}
          ></i>

          <div className="mt-2">No divisions found.</div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editDivision
              ? "Edit Division"
              : "Add Division"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSave}
          >
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="DivisionCode">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Division Code *
                  </Form.Label>

                  <Form.Control
                    required
                    type="text"
                    value={divisionFormData.DivisionCode}
                    onChange={handleInputChange}
                    placeholder="Enter code"
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    Division code is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="DivisionName">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Division Name *
                  </Form.Label>

                  <Form.Control
                    required
                    type="text"
                    value={divisionFormData.DivisionName}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  />

                  <Form.Control.Feedback type="invalid">
                    Division name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="ParentDivisionID">
                  <Form.Label
                    style={{
                      fontWeight: 600,
                      fontSize: ".85rem",
                    }}
                  >
                    Parent Division
                  </Form.Label>

                  <Form.Select
                    value={
                      divisionFormData.ParentDivisionID ?? ""
                    }
                    onChange={handleInputChange}
                    style={{
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <option value="">
                      -- None --
                    </option>

                    {divisions
                      .filter(
                        (d) =>
                          d.DivisionID !==
                          divisionFormData.DivisionID
                      )
                      .map((d) => (
                        <option
                          key={d.DivisionID}
                          value={d.DivisionID}
                        >
                          {d.DivisionName}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col
                md={6}
                className="d-flex align-items-center"
              >
                <Form.Check
                  id="IsActive"
                  type="checkbox"
                  label="Is Active"
                  checked={divisionFormData.IsActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop:
                  "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Button
                variant="outline-secondary"
                onClick={() => setShowModal(false)}
                style={{
                  borderRadius: 8,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {editDivision
                  ? "Update Division"
                  : "Save Division"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this
          division?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setConfirmDelete(false)}
            style={{
              borderRadius: 8,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            style={{
              borderRadius: 8,
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  </>
);

};

export default ManageDivisions;
