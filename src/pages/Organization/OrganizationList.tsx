import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Pagination,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import organizationService from '../../services/organizationService';
import { Organization } from '../../types/organization';
import { organizationTypes } from '../../types/organizationTypes';

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationTypesList, setOrganizationTypesList] = useState<organizationTypes[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

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

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchOrganizationTypes = async () => {
      try {
        const types = await organizationService.getOrganizationTypes();
        setOrganizationTypesList(types);
      } catch (err) {
        setError('Error loading organization types');
        toast.error('Error loading organization types');
      }
    };
    fetchOrganizationTypes();
  }, []);

  useEffect(() => {
    const filtered = organizations.filter((org) =>
      org.OrganizationName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrganizations(filtered);
    setCurrentPage(1);
  }, [searchTerm, organizations]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrganizations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrganizations, currentPage]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewOrg((prev) => ({
      ...prev,
      [name]:
        name === 'OrganizationTypeID'
          ? Number(value)
          : value,
    }));
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
      await organizationService.createOrganization(newOrgData);
      await fetchOrganizations();
      toast.success('Organization added successfully!');
      handleCloseModal();
    } catch (err) {
      toast.error('Failed to add organization.');
      console.error('Error creating organization:', err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    handleClear();
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="mt-5">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="mb-4">Organization List</h2>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <Form.Control
          type="text"
          placeholder="Search by organization name..."
          style={{ maxWidth: '450px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="toggle-tooltip">Open Manage Page in New Tab</Tooltip>}
        >
          <Form.Check
            type="switch"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
          />
        </OverlayTrigger>

        <Button variant="success" onClick={() => setShowModal(true)}>
          + Add New Organization
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead>
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
            {paginatedOrganizations.length > 0 ? (
              paginatedOrganizations.map((org) => (
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
                        openInNewTab
                          ? window.open(path, '_blank')
                          : navigate(path);
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

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      )}

      {/* ✅ FULL ORIGINAL MODAL WITH ALL FIELDS */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Organization Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    name="OrganizationName"
                    value={newOrg.OrganizationName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Organization Name is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="Email"
                    value={newOrg.Email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="Phone"
                    value={newOrg.Phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="text"
                    name="Website"
                    value={newOrg.Website}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Industry</Form.Label>
                  <Form.Select
                    name="Industry"
                    value={newOrg.Industry}
                    onChange={handleChange}
                  >
                    <option value="">Select Industry</option>
                    <option value="IT">IT</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Organization Type</Form.Label>
                  <Form.Select
                    required
                    name="OrganizationTypeID"
                    value={newOrg.OrganizationTypeID || ''}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    {organizationTypesList.map((type) => (
                      <option
                        key={type.OrganizationTypeID}
                        value={type.OrganizationTypeID}
                      >
                        {type.OrganizationTypeName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Organization Type is required.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              label="Active"
              name="IsActive"
              checked={newOrg.IsActive}
              onChange={(e) =>
                setNewOrg((prev) => ({
                  ...prev,
                  IsActive: e.target.checked,
                }))
              }
            />

            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrganizationList;
