import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import manageClientsService from "../../services/manageClientsService";

/* ===================== INTERFACE ===================== */

interface Client {
  ClientId: number;
  OrganizationId: number;
  ClientCode: string;
  ClientName: string;
  IndustryTypeId: number;
  ClientTypeId: number;
  CurrencyId: number;
  PaymentTermId: number;
  TaxTypeId: number;
  ContactPerson: string;
  Email: string;
  Phone: string;
  AlternatePhone: string;
  AddressLine1: string;
  AddressLine2: string;
  StateId: number;
  CountryId: number;
  City: string;
  PostalCode: string;
  TaxIdentificationNumber: string;
  AssociationStartDate: string;
  AssociationEndDate: string;
  IsActive: boolean;
}

/* ===================== COMPONENT ===================== */

const ManageClients: React.FC = () => {

  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Client | null>(null);

  /* ===== LOOKUPS ===== */
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [taxTypes, setTaxTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);

  /* ===== FORM ===== */
  const [formData, setFormData] = useState<Client>({
    ClientId: 0,
    OrganizationId: 1,
    ClientCode: "",
    ClientName: "",
    IndustryTypeId: 1,
    ClientTypeId: 1,
    CurrencyId: 1,
    PaymentTermId: 1,
    TaxTypeId: 1,
    ContactPerson: "",
    Email: "",
    Phone: "",
    AlternatePhone: "",
    AddressLine1: "",
    AddressLine2: "",
    StateId: 1,
    CountryId: 1,
    City: "",
    PostalCode: "",
    TaxIdentificationNumber: "",
    AssociationStartDate: "",
    AssociationEndDate: "",
    IsActive: true
  });

  /* ===================== LOAD LOOKUPS ===================== */

  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    try {
      const res = await manageClientsService.GetAllLookups();

      setClientTypes(res.Table || []);
      setIndustries(res.Table1 || []);
      setPaymentTerms(res.Table2 || []);
      setTaxTypes(res.Table3 || []);
      setCountries(res.Table4 || []);
      setStates(res.Table5 || []);
      setCurrencies(res.Table6 || []);
    } catch (error) {
      console.error("Error loading lookups", error);
    }
  };

  /* ===================== HANDLERS ===================== */

  const handleChange = (e: any) => {
    const { id, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : Number(value) || value
    }));
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData(prev => ({ ...prev, ClientId: 0 }));
    setShowModal(true);
  };

  const handleEdit = (c: Client) => {
    setEditItem(c);
    setFormData(c);
    setShowModal(true);
  };

  const handleSave = (e: any) => {
    e.preventDefault();

    if (editItem) {
      setClients(prev => prev.map(c => c.ClientId === editItem.ClientId ? formData : c));
    } else {
      setClients(prev => [...prev, { ...formData, ClientId: Date.now() }]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete client?")) return;
    setClients(prev => prev.filter(c => c.ClientId !== id));
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="Container">

      <Row className="mb-3">
        <Col><h4>Manage Clients</h4></Col>
        <Col className="text-end">
          <Button onClick={handleAdd}>+ Add Client</Button>
        </Col>
      </Row>

      <Table className="table table-hover table-dark-custom">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Phone</th>
            <th>City</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients.map(c => (
            <tr key={c.ClientId}>
              <td>{c.ClientCode}</td>
              <td>{c.ClientName}</td>
              <td>{c.ContactPerson}</td>
              <td>{c.Phone}</td>
              <td>{c.City}</td>
              <td>{c.IsActive ? "Active" : "Inactive"}</td>
              <td>
                <Button size="sm" onClick={() => handleEdit(c)}>Edit</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(c.ClientId)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===================== MODAL ===================== */}

 <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>{editItem ? "Edit Client" : "Add Client"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form onSubmit={handleSave}>

            {/* BASIC */}
            <h6>Basic Info</h6>
            <Row className="mb-3">
              <Col md={4}><Form.Control id="ClientCode" placeholder="Code" value={formData.ClientCode} onChange={handleChange} required /></Col>
              <Col md={4}><Form.Control id="ClientName" placeholder="Name" value={formData.ClientName} onChange={handleChange} required /></Col>
              <Col md={4}><Form.Select id="ClientTypeId" value={formData.ClientTypeId} onChange={handleChange}>
  {clientTypes.map(x => (
    <option key={x.ClientTypeId} value={x.ClientTypeId}>
      {x.ClientTypeName}
    </option>
  ))}
</Form.Select></Col>
            </Row>

            {/* BUSINESS */}
            <h6>Business Info</h6>
            <Row className="mb-3">
              <Col md={4}><Form.Select id="IndustryTypeId" value={formData.IndustryTypeId} onChange={handleChange}>
  {industries.map(x => (
    <option key={x.IndustryTypeId} value={x.IndustryTypeId}>
      {x.IndustryName}
    </option>
  ))}
</Form.Select></Col>
              <Col md={4}>
              <Form.Select id="CurrencyId" value={formData.CurrencyId} onChange={handleChange}>
  {currencies.map(x => (
    <option key={x.CurrencyId} value={x.CurrencyId}>
      {x.CurrencyName}
    </option>
  ))}
</Form.Select></Col>
              <Col md={4}><Form.Select id="PaymentTermId" value={formData.PaymentTermId} onChange={handleChange}>
  {paymentTerms.map(x => (
    <option key={x.PaymentTermId} value={x.PaymentTermId}>
      {x.TermName}
    </option>
  ))}
</Form.Select></Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}><Form.Select id="TaxTypeId" value={formData.TaxTypeId} onChange={handleChange}>
  {taxTypes.map(x => (
    <option key={x.TaxTypeId} value={x.TaxTypeId}>
      {x.TaxName}
    </option>
  ))}
</Form.Select></Col>
              <Col md={4}><Form.Control id="TaxIdentificationNumber" placeholder="Tax Number" value={formData.TaxIdentificationNumber} onChange={handleChange} /></Col>
            </Row>

            {/* CONTACT */}
            <h6>Contact Info</h6>
            <Row className="mb-3">
              <Col md={4}><Form.Control id="ContactPerson" placeholder="Contact Person" value={formData.ContactPerson} onChange={handleChange} /></Col>
              <Col md={4}><Form.Control id="Email" placeholder="Email" value={formData.Email} onChange={handleChange} /></Col>
              <Col md={4}><Form.Control id="Phone" placeholder="Phone" value={formData.Phone} onChange={handleChange} /></Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}><Form.Control id="AlternatePhone" placeholder="Alternate Phone" value={formData.AlternatePhone} onChange={handleChange} /></Col>
            </Row>

            {/* ADDRESS */}
            <h6>Address</h6>
            <Row className="mb-3">
              <Col md={6}><Form.Control id="AddressLine1" placeholder="Address Line 1" value={formData.AddressLine1} onChange={handleChange} /></Col>
              <Col md={6}><Form.Control id="AddressLine2" placeholder="Address Line 2" value={formData.AddressLine2} onChange={handleChange} /></Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}><Form.Select id="CountryId" value={formData.CountryId} onChange={handleChange}>
  {countries.map(x => (
    <option key={x.CountryId} value={x.CountryId}>
      {x.CountryName}
    </option>
  ))}
</Form.Select></Col>
              <Col md={3}><Form.Select id="StateId" value={formData.StateId} onChange={handleChange}>
  {states
    .filter(s => s.CountryId === formData.CountryId)
    .map(s => (
      <option key={s.StateId} value={s.StateId}>
        {s.StateName}
      </option>
    ))}
</Form.Select></Col>
              <Col md={3}><Form.Control id="City" placeholder="City" value={formData.City} onChange={handleChange} /></Col>
              <Col md={3}><Form.Control id="PostalCode" placeholder="Postal Code" value={formData.PostalCode} onChange={handleChange} /></Col>
            </Row>

            {/* DATES */}
            <h6>Association</h6>
            <Row className="mb-3">
              <Col md={6}><Form.Control type="date" id="AssociationStartDate" value={formData.AssociationStartDate} onChange={handleChange} /></Col>
              <Col md={6}><Form.Control type="date" id="AssociationEndDate" value={formData.AssociationEndDate} onChange={handleChange} /></Col>
            </Row>

            <Form.Check id="IsActive" label="Active" checked={formData.IsActive} onChange={handleChange} />

            <Modal.Footer>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </Modal.Footer>

          </Form>

        </Modal.Body>

      </Modal>

    </div>
  );
};

export default ManageClients;