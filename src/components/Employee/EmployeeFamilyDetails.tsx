import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeService from '../../services/employeeService';

interface FamilyMember {
  id: number;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  isEmergencyContact: boolean;
  isDependentForTax: boolean;
  isNominee: boolean;
}

interface Props {
  employeeID: number;
}

const EmployeeFamilyDetails: React.FC<Props> = ({ employeeID }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FamilyMember>({
    id: 0,
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    isEmergencyContact: false,
    isDependentForTax: false,
    isNominee: false,
  });
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadFamilyDetails();
  }, [employeeID]);

  const loadFamilyDetails = async () => {
    if (!employeeID) return;
    setLoading(true);
    try {
      const res = await employeeService.GetEmployeeFamilyDetails(employeeID);
      const list = res?.Table || [];
      setFamilyMembers(
        list.map((item: any) => ({
          id: item.FamilyDetailID || item.familyDetailID || item.id || 0,
          fullName: item.FullName || item.fullName || '',
          relationship: item.Relationship || item.relationship || '',
          dateOfBirth: (item.DateOfBirth || item.dateOfBirth || '').split('T')[0],
          gender: item.Gender || item.gender || '',
          contactNumber: item.ContactNumber || item.contactNumber || '',
          email: item.Email || item.email || '',
          isEmergencyContact: item.IsEmergencyContact || item.isEmergencyContact || false,
          isDependentForTax: item.IsDependentForTax || item.isDependentForTax || false,
          isNominee: item.IsNominee || item.isNominee || false,
        }))
      );
    } catch (err) {
      console.error('Error loading family details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const payload: any = {
      familyDetailID: editMember ? editMember.id : 0,
      employeeID,
      fullName: formData.fullName,
      relationship: formData.relationship,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      contactNumber: formData.contactNumber,
      email: formData.email,
      isEmergencyContact: formData.isEmergencyContact,
      isDependentForTax: formData.isDependentForTax,
      isNominee: formData.isNominee,
      isActive: true,
      isDeleted: false,
      createdBy: 'Employee',
    };

    try {
      const res = await employeeService.SaveEmployeeFamilyDetail(payload);
      const msg = Array.isArray(res) && res[0]?.msg ? res[0].msg : (editMember ? 'Family member updated' : 'Family member added');
      toast.success(msg);
      setValidated(false);
      setShowModal(false);
      await loadFamilyDetails();
    } catch (err) {
      toast.error('Failed to save family member');
    }
  };

  const handleAdd = () => {
    setFormData({
      id: 0,
      fullName: '',
      relationship: '',
      dateOfBirth: '',
      gender: '',
      contactNumber: '',
      email: '',
      isEmergencyContact: false,
      isDependentForTax: false,
      isNominee: false,
    });
    setEditMember(null);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      let deleteRes: any;
      const record = familyMembers.find((m) => m.id === deleteId);
      if (record) {
        deleteRes = await employeeService.SaveEmployeeFamilyDetail({
          familyDetailID: deleteId,
          employeeID,
          fullName: record.fullName,
          relationship: record.relationship,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          contactNumber: record.contactNumber,
          email: record.email,
          isEmergencyContact: record.isEmergencyContact,
          isDependentForTax: record.isDependentForTax,
          isNominee: record.isNominee,
          isActive: false,
          isDeleted: true,
        });
      }
      const msg = Array.isArray(deleteRes) && deleteRes[0]?.msg ? deleteRes[0].msg : 'Family member deleted';
      toast.success(msg);
      setConfirmDelete(false);
      await loadFamilyDetails();
    } catch (err) {
      toast.error('Failed to delete family member');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setConfirmDelete(true);
  };

  return (
   <div className="employee-family-container">
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Family Member
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : familyMembers.length ? (
        <Table className="table table-hover table-dark-custom">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Relationship</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Emergency?</th>
              <th>Dependent?</th>
              <th>Nominee?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {familyMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.fullName}</td>
                <td>{member.relationship}</td>
                <td>{member.dateOfBirth}</td>
                <td>{member.gender}</td>
                <td>{member.contactNumber}</td>
                <td>{member.email}</td>
                <td>{member.isEmergencyContact ? 'Yes' : 'No'}</td>
                <td>{member.isDependentForTax ? 'Yes' : 'No'}</td>
                <td>{member.isNominee ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setEditMember(member);
                      setFormData(member);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeleteClick(member.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No family members added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editMember ? 'Edit Family Member' : 'Add Family Member'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="fullName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter full name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="relationship">
                  <Form.Label>Relationship</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={formData.relationship}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter relationship.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="dateOfBirth">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please select a valid date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select gender.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="contactNumber">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    required
                    type="tel"
                    pattern="^[0-9]{10}$"
                    placeholder="Enter 10-digit number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid 10-digit contact number.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Check
                  id="isEmergencyContact"
                  label="Is Emergency Contact"
                  checked={formData.isEmergencyContact}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  id="isDependentForTax"
                  label="Is Dependent for Tax"
                  checked={formData.isDependentForTax}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  id="isNominee"
                  label="Is Nominee"
                  checked={formData.isNominee}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editMember ? 'Update' : 'Save'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this family member record?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeFamilyDetails;
