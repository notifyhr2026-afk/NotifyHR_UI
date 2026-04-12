import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

interface OfferFormData {
  ApplicationID: string;
  OfferedPositionID: string;
  OfferedCTC: string;
  Currency: string;
  OfferDate: string;
  OfferValidUntil: string;
  JoiningDate: string;
  OfferStatusID: string;
  OfferCreatedBy: string;
  OfferLetterPath: string;
  Notes: string;
}

const mockApplications = [
  { ApplicationID: 'APP001', CandidateName: 'John Doe', JobTitle: 'Software Engineer' },
  { ApplicationID: 'APP002', CandidateName: 'Jane Smith', JobTitle: 'QA Engineer' },
];

const CandidateOffers: React.FC = () => {
  const [formData, setFormData] = useState<OfferFormData>({
    ApplicationID: '',
    OfferedPositionID: '',
    OfferedCTC: '',
    Currency: 'INR',
    OfferDate: new Date().toISOString().split('T')[0],
    OfferValidUntil: '',
    JoiningDate: '',
    OfferStatusID: 'Pending',
    OfferCreatedBy: '',
    OfferLetterPath: '',
    Notes: '',
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Clear Candidate Application selection
  const handleClearApplication = () => {
    setFormData({ ...formData, ApplicationID: '' });
  };

  // Clear all fields
  const handleClearForm = () => {
    setFormData({
      ApplicationID: '',
      OfferedPositionID: '',
      OfferedCTC: '',
      Currency: 'INR',
      OfferDate: new Date().toISOString().split('T')[0],
      OfferValidUntil: '',
      JoiningDate: '',
      OfferStatusID: 'Pending',
      OfferCreatedBy: '',
      OfferLetterPath: '',
      Notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Offer Data:', formData);
    alert('Offer submitted! Check console for data.');
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Candidate Application with underline + clear button */}
      <Form.Group className="mb-3" controlId="ApplicationID">
        <Form.Label>Candidate Application</Form.Label>
        <div className="d-flex align-items-center mb-3">
          <Form.Select
            name="ApplicationID"
            value={formData.ApplicationID}
            onChange={handleChange}
            required
            className="underline-select me-2"
          >
            <option value="">Select Application</option>
            {mockApplications.map((app) => (
              <option key={app.ApplicationID} value={app.ApplicationID}>
                {app.CandidateName} - {app.JobTitle}
              </option>
            ))}
          </Form.Select>
          <Button variant="outline-secondary" size="sm" onClick={handleClearApplication}>
            Clear
          </Button>
        </div>
      </Form.Group>

      {/* Position & CTC */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="OfferedPositionID">
            <Form.Label>Offered Position ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Position ID"
              name="OfferedPositionID"
              value={formData.OfferedPositionID}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="OfferedCTC">
            <Form.Label>Offered CTC</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter CTC"
              name="OfferedCTC"
              value={formData.OfferedCTC}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="Currency">
            <Form.Label>Currency</Form.Label>
            <Form.Select name="Currency" value={formData.Currency} onChange={handleChange}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Dates & Status */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="OfferStatusID">
            <Form.Label>Offer Status</Form.Label>
            <Form.Select name="OfferStatusID" value={formData.OfferStatusID} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Pending">Release</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="OfferDate">
            <Form.Label>Offer Date</Form.Label>
            <Form.Control type="date" name="OfferDate" value={formData.OfferDate} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="OfferValidUntil">
            <Form.Label>Offer Valid Until</Form.Label>
            <Form.Control
              type="date"
              name="OfferValidUntil"
              value={formData.OfferValidUntil}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Joining Date & Created By & Offer Letter */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="JoiningDate">
            <Form.Label>Joining Date</Form.Label>
            <Form.Control type="date" name="JoiningDate" value={formData.JoiningDate} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="OfferCreatedBy">
            <Form.Label>Created By</Form.Label>
            <Form.Control
              type="text"
              placeholder="HR / Recruiter Name"
              name="OfferCreatedBy"
              value={formData.OfferCreatedBy}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="OfferLetterPath">
            <Form.Label>Offer Letter Path</Form.Label>
            <Form.Control
              type="text"
              placeholder="Path to Offer Letter"
              name="OfferLetterPath"
              value={formData.OfferLetterPath}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Notes */}
      <Form.Group className="mb-3" controlId="Notes">
        <Form.Label>Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Additional notes..."
          name="Notes"
          value={formData.Notes}
          onChange={handleChange}
        />
      </Form.Group>

      {/* Buttons: Submit + Clear */}
      <div className="d-flex justify-content-end">
         <Button type="submit" size="sm" variant="outline-primary" className="me-2">
          Pending / Hold
        </Button>
        <Button type="submit" size="sm" variant="outline-primary" className="me-2">
          Release
        </Button>
        <Button type="button" size="sm" variant="outline-secondary" onClick={handleClearForm}>
          Clear
        </Button>
      </div>

      {/* Custom CSS for underline select */}
      <style>
        {`
          .underline-select {
            border: none;
            border-bottom: 1px solid #0d6efd;
            border-radius: 0;
            padding-left: 0;
          }
          .underline-select:focus {
            box-shadow: none;
            border-color: #0d6efd;
          }
        `}
      </style>
    </Form>
  );
};

export default CandidateOffers;
