import React, { useState } from 'react';
import { Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';

interface CandidateDocument {
  id: number;
  documentTypeID: number;
  documentTypeName: string;
  fileName: string;
  filePath: string;
}

const documentTypes = [
  { id: 1, name: 'Resume' },
  { id: 2, name: 'Aadhar Card' },
  { id: 3, name: 'PAN Card' },
  { id: 4, name: 'Passport' }
];

const CandidateDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editDocument, setEditDocument] = useState<CandidateDocument | null>(null);

  const [formData, setFormData] = useState({
    documentTypeID: 0,
    fileName: '',
    file: null as File | null
  });

  // ---- Handlers ----
  const handleChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSave = () => {
    const selectedType = documentTypes.find(
      (d) => d.id === Number(formData.documentTypeID)
    );

    if (!selectedType) return;

    const newDoc: CandidateDocument = {
      id: editDocument ? editDocument.id : Date.now(),
      documentTypeID: selectedType.id,
      documentTypeName: selectedType.name,
      fileName: formData.fileName,
      filePath: formData.file ? formData.file.name : ''
    };

    if (editDocument) {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === editDocument.id ? newDoc : doc))
      );
    } else {
      setDocuments((prev) => [...prev, newDoc]);
    }

    setShowModal(false);
    setEditDocument(null);
    setFormData({ documentTypeID: 0, fileName: '', file: null });
  };

  const handleEdit = (doc: CandidateDocument) => {
    setEditDocument(doc);
    setFormData({
      documentTypeID: doc.documentTypeID,
      fileName: doc.fileName,
      file: null
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleAdd = () => {
    setEditDocument(null);
    setFormData({ documentTypeID: 0, fileName: '', file: null });
    setShowModal(true);
  };

  return (
    <>
      {/* Header */}
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAdd}>
          + Add Document
        </Button>
      </div>

      {/* Table */}
      {documents.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Document Type</th>
              <th>File Name</th>
              <th>File Path</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.documentTypeName}</td>
                <td>{doc.fileName}</td>
                <td>{doc.filePath}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEdit(doc)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No documents added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editDocument ? 'Edit Document' : 'Add Document'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="documentTypeID">
                  <Form.Label>Document Type</Form.Label>
                  <Form.Select
                    value={formData.documentTypeID}
                    onChange={handleChange}
                  >
                    <option value={0}>Select</option>
                    {documentTypes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="fileName">
                  <Form.Label>File Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fileName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="file" className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CandidateDocuments;
