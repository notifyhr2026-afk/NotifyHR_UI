import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Form, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import organizationService from '../../services/organizationService';
import { Organization } from '../../types/organization';
import { organizationTypes } from '../../types/organizationTypes';

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationTypes, setOrganizationTypes] = useState<organizationTypes[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false); 
  const [newOrg, setNewOrg] = useState<Organization>({
    OrganizationID: 0,
    OrganizationName: '',
    Email: '',
    Phone: '',
    Website: '',
    Industry: '',
    OrganizationTypeID: 0,
    CreatedBy: '',
    CreatedAt: new Date().toISOString(),
    IsActive: true,
    IsDeleted: false,
  });
  const navigate = useNavigate();

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
      setFilteredOrganizations(data);
    } catch (err) {
      setError('Error loading organizations');
      toast.error('Error loading organizations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizations
  useEffect(() => {
  fetchOrganizations();
}, []);

  // Fetch organization types
  useEffect(() => {
    const fetchOrganizationTypes = async () => {
      try {
        const types = await organizationService.getOrganizationTypes();
        setOrganizationTypes(types);
      } catch (err) {
        setError('Error loading organization types');
        toast.error('Error loading organization types');
      }
    };
    fetchOrganizationTypes();
  }, []);

  // Filter organizations on search
  useEffect(() => {
    const filtered = organizations.filter((org) =>
      org.OrganizationName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrganizations(filtered);
  }, [searchTerm, organizations]);

  const handleClear = () => {
    setNewOrg({
      OrganizationID: 0,
      OrganizationName: '',
      Email: '',
      Phone: '',
      Website: '',
      Industry: '',
      OrganizationTypeID: 0,
      CreatedBy: '',
      CreatedAt: new Date().toISOString(),
      IsActive: true,
      IsDeleted: false,
    });
    setValidated(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewOrg((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    handleClear();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    setValidated(true);

    if (!form.checkValidity()) {
      toast.error('Please fix validation errors before saving.');
      return;
    }

    const newOrgData = {
      OrganizationName: newOrg.OrganizationName,
      Email: newOrg.Email,
      Phone: newOrg.Phone,
      Website: newOrg.Website,
      Industry: newOrg.Industry,
      OrganizationTypeID: newOrg.OrganizationTypeID,
      CreatedBy: newOrg.CreatedBy || 'defaultUser',
      ModifiedBy: newOrg.CreatedBy || 'defaultUser',
      CreatedAt: null,
      IsActive: newOrg.IsActive,
      IsDeleted: newOrg.IsDeleted,
    };

    try {
      toast.info('Saving organization...');
      const newOrgID = await organizationService.createOrganization(newOrgData);

      const createdOrg = { ...newOrgData, OrganizationID: newOrgID };
      await fetchOrganizations();

      toast.success('Organization added successfully!');
      await fetchOrganizations();
      handleCloseModal();
    } catch (err) {
      toast.error('Failed to add organization.');
      console.error('Error creating organization:', err);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="mt-5">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="mb-4">Organization List</h2>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        {/* Search Box */}
        <div className="d-flex align-items-center flex-grow-1" style={{ maxWidth: '450px' }}>
          <Form.Control
            type="text"
            placeholder="Search by organization name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Toggle with Tooltip */}
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="toggle-tooltip">Open Manage Page in New Tab</Tooltip>}
        >
          <Form.Check
            type="switch"
            id="openInNewTabSwitch"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            className="ms-3 mt-2 mt-md-0"
          />
        </OverlayTrigger>

        {/* Add New Button */}
        <Button variant="success" className="mt-2 mt-md-0" onClick={handleOpenModal}>
          + Add New Organization
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Website</th>
              <th>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((org) => (
                <tr key={org.OrganizationID}>
                  <td>{org.OrganizationName}</td>
                  <td>{org.Email || '-'}</td>
                  <td>{org.Phone || '-'}</td>
                  <td>{org.Website || '-'}</td>
                  <td>{org.Industry || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const path = `/Organizations/manageOrganization/${org.OrganizationID}`;
                        if (openInNewTab) {
                          window.open(path, '_blank');
                        } else {
                          navigate(path);
                        }
                      }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No matching organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Organization Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="orgName">
                  <Form.Label>Organization Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter organization name"
                    name="OrganizationName"
                    value={newOrg.OrganizationName}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Organization Name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="Email"
                    value={newOrg.Email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter phone number"
                    name="Phone"
                    value={newOrg.Phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="website">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter website URL"
                    name="Website"
                    value={newOrg.Website}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="industry">
                  <Form.Label>Industry</Form.Label>
                  <Form.Control
                    as="select"
                    name="Industry"
                    value={newOrg.Industry}
                    onChange={handleChange}
                  >
                    <option value="">Select Industry</option>
                    <option value="IT">IT</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="orgType">
                  <Form.Label>Organization Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="OrganizationTypeID"
                    value={newOrg.OrganizationTypeID || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    {organizationTypes.map((type) => (
                      <option key={type.OrganizationTypeID} value={type.OrganizationTypeID}>
                        {type.OrganizationTypeName}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    Organization Type is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="isActiveCheckbox">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    name="IsActive"
                    checked={newOrg.IsActive}
                    onChange={(e) => setNewOrg((prev) => ({ ...prev, IsActive: e.target.checked }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrganizationList;
