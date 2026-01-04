import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ===== Types =====
interface Candidate {
  CandidateID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  LinkedInProfile: string;
  ResumeFileName: string;
  Status: string;
  Skills: string;
}

// ===== Static Data =====
const statusList = [
  "New",
  "Screening",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

const skillOptions = [
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Java",
  "Python",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
];

// ===== Component =====
const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState<Candidate>({
    CandidateID: 0,
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    LinkedInProfile: "",
    ResumeFileName: "",
    Status: "New",
    Skills: "",
  });

  // ===== Fetch / Initialize Candidates =====
  useEffect(() => {
    // Simulate API fetch
    const initialData: Candidate[] = [
      {
        CandidateID: 1,
        FirstName: "John",
        LastName: "Doe",
        Email: "john.doe@email.com",
        Phone: "9876543210",
        LinkedInProfile: "https://linkedin.com/in/johndoe",
        ResumeFileName: "john_doe_resume.pdf",
        Status: "New",
        Skills: "React, Node.js",
      },
    ];
    setCandidates(initialData);
    setFilteredCandidates(initialData);
    setLoading(false);
  }, []);

  // ===== Search Filter =====
  useEffect(() => {
    const filtered = candidates.filter(
      (c) =>
        c.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.LastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.Skills.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  // ===== Handlers =====
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          ResumeFileName: file.name,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        ResumeFileName: "",
      }));
    }
  };

  const addSkill = (skill: string) => {
    const existing = formData.Skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!skill || existing.includes(skill)) {
      toast.warn("Skill already added or empty");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      Skills: [...existing, skill].join(", "),
    }));
    setSkillSearch("");
    setShowSkillDropdown(false);
  };

  const handleSaveCandidate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      toast.warn("Please fill all required fields");
      return;
    }
    setSaving(true);

    if (formData.CandidateID) {
      setCandidates((prev) =>
        prev.map((c) => (c.CandidateID === formData.CandidateID ? formData : c))
      );
      toast.success("Candidate updated successfully");
    } else {
      const newId = candidates.length
        ? Math.max(...candidates.map((c) => c.CandidateID)) + 1
        : 1;
      setCandidates((prev) => [...prev, { ...formData, CandidateID: newId }]);
      toast.success("Candidate added successfully");
    }

    setShowModal(false);
    setValidated(false);
    setFormData({
      CandidateID: 0,
      FirstName: "",
      LastName: "",
      Email: "",
      Phone: "",
      LinkedInProfile: "",
      ResumeFileName: "",
      Status: "New",
      Skills: "",
    });
    setSaving(false);
  };

  const openAddCandidate = () => {
    setFormData({
      CandidateID: 0,
      FirstName: "",
      LastName: "",
      Email: "",
      Phone: "",
      LinkedInProfile: "",
      ResumeFileName: "",
      Status: "New",
      Skills: "",
    });
    setShowModal(true);
  };

  const openManageCandidate = (candidate: Candidate) => {
    navigate(`/candidates/manage/${candidate.CandidateID}`);
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="mt-5">
      <h2 className="mb-4">Candidate List</h2>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <Form.Control
          type="text"
          placeholder="Search by name, email, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
        <Button variant="success" onClick={openAddCandidate}>
          + Add Candidate
        </Button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Status</th>
              <th>Skills</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((c) => (
                <tr key={c.CandidateID}>
                  <td>{c.FirstName} {c.LastName}</td>
                  <td>{c.Email}</td>
                  <td>{c.Status}</td>
                  <td>{c.Skills}</td>
                  <td>{c.ResumeFileName || "—"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openManageCandidate(c)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Candidate Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{formData.CandidateID ? "Edit Candidate" : "Add Candidate"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSaveCandidate}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="FirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.FirstName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter first name
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="LastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    required
                    value={formData.LastName}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter last name
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="Email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={formData.Email}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter valid email
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="Phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    required
                    value={formData.Phone}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Enter phone number
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="LinkedInProfile">
                  <Form.Label>LinkedIn Profile</Form.Label>
                  <Form.Control
                    value={formData.LinkedInProfile}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Resume Upload</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                  {formData.ResumeFileName && (
                    <small className="text-muted">
                      Uploaded: {formData.ResumeFileName}
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Status & Skills */}
            <Row className="mb-3">             
              <Col md={6} style={{ position: "relative" }}>
                <Form.Label>Search Skill</Form.Label>
                <Form.Control
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                />
                {showSkillDropdown && (
              <div className="border bg-white mt-1 position-absolute w-100" style={{ zIndex: 1000 }}>
                {skillOptions
                  .filter(
                    (s) =>
                      s.toLowerCase().includes(skillSearch.toLowerCase()) &&
                      !formData.Skills.includes(s)
                  )
                  .map((skill) => (
                    <div
                      key={skill}
                      className="p-2 dropdown-item"
                      style={{ cursor: "pointer" }}
                      onMouseDown={() => addSkill(skill)} // important!
                    >
                      {skill}
                    </div>
                  ))}
              </div>
            )}
              </Col>
              <Col>
                <Form.Group controlId="Skills">
                  <Form.Label>Selected Skills</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.Skills}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : "Save"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CandidateList;
