import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Modal, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Static Candidate Data
const staticCandidateData = [
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
    ProfilePic: "/default-user.png",
    TotalExperienceYears: 3,
    CurrentEmployer: "ABC Corp",
    CurrentRole: "Frontend Developer",
    ExpectedMinSalary: 5,
    ExpectedMaxSalary: 8,
    CurrentSalary: 4,
  },
  {
    CandidateID: 2,
    FirstName: "Jane",
    LastName: "Smith",
    Email: "jane.smith@email.com",
    Phone: "9876543211",
    LinkedInProfile: "https://linkedin.com/in/janesmith",
    ResumeFileName: "jane_smith_resume.pdf",
    Status: "Interview Scheduled",
    Skills: "Angular, SQL",
    ProfilePic: "/default-user.png",
    TotalExperienceYears: 4,
    CurrentEmployer: "XYZ Ltd",
    CurrentRole: "Fullstack Developer",
    ExpectedMinSalary: 6,
    ExpectedMaxSalary: 10,
    CurrentSalary: 5,
  },
];

const statusList = ["New", "Interview Scheduled", "Hired", "Rejected"];
const skillOptions = ["React", "Node.js", "Angular", "Vue.js", "SQL", "JavaScript"];

const CandidateDetails: React.FC = () => {
  const { CandidateID } = useParams<{ CandidateID: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [validated, setValidated] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [formData, setFormData] = useState<any>({
    CandidateID: 0,
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    LinkedInProfile: "",
    ResumeFileName: "",
    Status: "",
    Skills: "",
    ProfilePic: "",
    TotalExperienceYears: 0,
    CurrentEmployer: "",
    CurrentRole: "",
    ExpectedMinSalary: 0,
    ExpectedMaxSalary: 0,
    CurrentSalary: 0,
  });

  // Fetch candidate details from static data
  useEffect(() => {
    if (CandidateID) {
      const candidateIdNumber = parseInt(CandidateID, 10);
      const fetchedCandidate = staticCandidateData.find(
        (c) => c.CandidateID === candidateIdNumber
      );
      if (fetchedCandidate) {
        setCandidate(fetchedCandidate);
        setFormData(fetchedCandidate); // Pre-populate the form data
      } else {
        toast.error("Candidate not found.");
        navigate("/candidates");
      }
    }
  }, [CandidateID, navigate]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [id]:
        id === "TotalExperienceYears" ||
        id === "ExpectedMinSalary" ||
        id === "ExpectedMaxSalary" ||
        id === "CurrentSalary"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleResumeUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev: any) => ({
        ...prev,
        ResumeFileName: file.name,
      }));
    }
  };

  const addSkill = (skill: string) => {
    setFormData((prev: any) => ({
      ...prev,
      Skills: prev.Skills ? `${prev.Skills}, ${skill}` : skill,
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
      toast.warn("Please fill in all required fields");
      return;
    }

    setSaving(true);

    // Simulate saving candidate data (e.g., API call)
    setTimeout(() => {
      console.log("Saved Candidate:", formData);
      toast.success(
        `${formData.CandidateID ? "Updated" : "Added"} Candidate successfully`
      );
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="mt-3">
      <Form noValidate validated={validated} onSubmit={handleSaveCandidate}>
        {/* Name */}
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

        {/* Email and Phone */}
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

        {/* LinkedIn and Resume */}
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

        {/* Experience and Salary */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="TotalExperienceYears">
              <Form.Label>Total Experience (Years)</Form.Label>
              <Form.Control
                required
                type="number"
                value={formData.TotalExperienceYears}
                onChange={handleChange}
                min={0}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="CurrentEmployer">
              <Form.Label>Current Employer</Form.Label>
              <Form.Control
                required
                value={formData.CurrentEmployer}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="CurrentRole">
              <Form.Label>Current Role</Form.Label>
              <Form.Control
                required
                value={formData.CurrentRole}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="CurrentSalary">
              <Form.Label>Current Salary (Lacs)</Form.Label>
              <Form.Control
                required
                type="number"
                value={formData.CurrentSalary}
                onChange={handleChange}
                min={0}
                step={0.1}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="ExpectedMinSalary">
              <Form.Label>Expected Min Salary (Lacs)</Form.Label>
              <Form.Control
                required
                type="number"
                value={formData.ExpectedMinSalary}
                onChange={handleChange}
                min={0}
                step={0.1}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="ExpectedMaxSalary">
              <Form.Label>Expected Max Salary (Lacs)</Form.Label>
              <Form.Control
                required
                type="number"
                value={formData.ExpectedMaxSalary}
                onChange={handleChange}
                min={0}
                step={0.1}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Skills */}
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
            {showSkillDropdown && skillSearch && (
              <div className="border bg-white mt-1 position-absolute w-100">
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
                      onClick={() => addSkill(skill)}
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

        {/* Actions */}
        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CandidateDetails;
