// File: Feedback360Page.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Table } from 'react-bootstrap';

// ----------------------
// TypeScript Interfaces
// ----------------------
interface ReviewCycle {
  reviewCycleID: number;
  cycleName: string;
}

interface Employee {
  employeeID: number;
  fullName: string;
}

interface Criteria {
  criteriaID: number;
  criteriaName: string;
}

interface FeedbackCriteria {
  criteriaID: number;
  rating: number;
  feedback: string;
}

// ----------------------
// Component
// ----------------------
const Feedback360Page: React.FC = () => {
  // Master data
  const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);

  // Form state
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [reviewerID, setReviewerID] = useState<number | null>(null);
  const [relationship, setRelationship] = useState<string>('');
  const [feedbackCriteria, setFeedbackCriteria] = useState<FeedbackCriteria[]>([]);
  const [overallRating, setOverallRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');

  // ----------------------
  // Load Master Data
  // ----------------------
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [cycleRes, empRes] = await Promise.all([
          axios.get<ReviewCycle[]>('/api/reviewCycles'), // API endpoints
          axios.get<Employee[]>('/api/employees')
        ]);
        setReviewCycles(cycleRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadMasterData();
  }, []);

  // Load Criteria when Employee or Cycle changes
  useEffect(() => {
    if (selectedEmployee && selectedCycle) {
      axios
        .get<Criteria[]>(`/api/feedbackCriteria?employeeID=${selectedEmployee}&cycleID=${selectedCycle}`)
        .then(res => {
          setCriteriaList(res.data);
          // Initialize feedbackCriteria array
          setFeedbackCriteria(res.data.map(c => ({ criteriaID: c.criteriaID, rating: 0, feedback: '' })));
        })
        .catch(err => console.error(err));
    }
  }, [selectedEmployee, selectedCycle]);

  // ----------------------
  // Handlers
  // ----------------------
  const handleCriteriaChange = (criteriaID: number, field: 'rating' | 'feedback', value: any) => {
    setFeedbackCriteria(prev =>
      prev.map(f => (f.criteriaID === criteriaID ? { ...f, [field]: value } : f))
    );
  };

  const handleSubmit = async (status: 'Draft' | 'Submitted') => {
    if (!selectedCycle || !selectedEmployee || !reviewerID || !relationship) {
      alert('Please fill all required fields!');
      return;
    }

    const payload = {
      reviewCycleID: selectedCycle,
      employeeID: selectedEmployee,
      reviewerID,
      relationship,
      overallRating,
      comments,
      feedbackCriteria,
      status,
      submittedAt: status === 'Submitted' ? new Date() : null
    };

    try {
      await axios.post('/api/multiReviewerFeedback', payload);
      alert(`Feedback ${status} successfully!`);
      // Clear form
      setSelectedCycle(null);
      setSelectedEmployee(null);
      setReviewerID(null);
      setRelationship('');
      setOverallRating(0);
      setComments('');
      setFeedbackCriteria([]);
    } catch (err) {
      console.error(err);
      alert('Error submitting feedback.');
    }
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <div className="container mt-4">
      <h3>360° Feedback</h3>
      <Form>
        <div className="row mb-3">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Review Cycle</Form.Label>
              <Form.Select
                value={selectedCycle ?? ''}
                onChange={e => setSelectedCycle(Number(e.target.value))}
              >
                <option value="">Select Cycle</option>
                {reviewCycles.map(c => (
                  <option key={c.reviewCycleID} value={c.reviewCycleID}>{c.cycleName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Employee</Form.Label>
              <Form.Select
                value={selectedEmployee ?? ''}
                onChange={e => setSelectedEmployee(Number(e.target.value))}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.employeeID} value={emp.employeeID}>{emp.fullName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Reviewer</Form.Label>
              <Form.Select
                value={reviewerID ?? ''}
                onChange={e => setReviewerID(Number(e.target.value))}
              >
                <option value="">Select Reviewer</option>
                {employees.map(emp => (
                  <option key={emp.employeeID} value={emp.employeeID}>{emp.fullName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Relationship</Form.Label>
              <Form.Select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Manager">Manager</option>
                <option value="Peer">Peer</option>
                <option value="Subordinate">Subordinate</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <h5>Criteria Feedback</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Criteria</th>
              <th>Rating (1–5)</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {criteriaList.map(c => {
              const fc = feedbackCriteria.find(f => f.criteriaID === c.criteriaID);
              return (
                <tr key={c.criteriaID}>
                  <td>{c.criteriaName}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min={1}
                      max={5}
                      value={fc?.rating ?? 0}
                      onChange={e => handleCriteriaChange(c.criteriaID, 'rating', Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={fc?.feedback ?? ''}
                      onChange={e => handleCriteriaChange(c.criteriaID, 'feedback', e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <Form.Group className="mb-3">
          <Form.Label>Overall Rating</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={5}
            value={overallRating}
            onChange={e => setOverallRating(Number(e.target.value))}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Comments</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comments}
            onChange={e => setComments(e.target.value)}
          />
        </Form.Group>

        <div className="mb-3">
          <Button variant="secondary" className="me-2" onClick={() => handleSubmit('Draft')}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSubmit('Submitted')}>
            Submit Feedback
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Feedback360Page;
