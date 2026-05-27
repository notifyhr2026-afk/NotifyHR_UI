import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Button, Card, Form, Table } from "react-bootstrap";

// ===== Types =====
interface Candidate {
  CandidateID: number;
  Name: string;
  Email: string;
  OfferReleasedDate: string;
  JoiningDate: string;
  Status: string;
}

// ===== Static Candidate Data =====
const candidateData: Candidate[] = [
  {
    CandidateID: 1,
    Name: "John Doe",
    Email: "john.doe@email.com",
    OfferReleasedDate: "2026-05-01",
    JoiningDate: "2026-06-10",
    Status: "Offer Accepted",
  },
  {
    CandidateID: 2,
    Name: "Jane Smith",
    Email: "jane.smith@email.com",
    OfferReleasedDate: "2026-05-03",
    JoiningDate: "2026-06-15",
    Status: "Rejected",
  },
  {
    CandidateID: 3,
    Name: "Michael Johnson",
    Email: "michael@email.com",
    OfferReleasedDate: "2026-05-05",
    JoiningDate: "2026-06-18",
    Status: "Offer Accepted",
  },
  {
    CandidateID: 4,
    Name: "Emily Davis",
    Email: "emily@email.com",
    OfferReleasedDate: "2026-05-06",
    JoiningDate: "2026-06-20",
    Status: "Offer Accepted",
  },
  {
    CandidateID: 5,
    Name: "Robert Wilson",
    Email: "robert@email.com",
    OfferReleasedDate: "2026-05-07",
    JoiningDate: "2026-06-25",
    Status: "Rejected",
  },
  {
    CandidateID: 6,
    Name: "Sophia Brown",
    Email: "sophia@email.com",
    OfferReleasedDate: "2026-05-08",
    JoiningDate: "2026-06-28",
    Status: "Offer Accepted",
  },
  {
    CandidateID: 7,
    Name: "Daniel Taylor",
    Email: "daniel@email.com",
    OfferReleasedDate: "2026-05-09",
    JoiningDate: "2026-07-01",
    Status: "Offer Accepted",
  },
  {
    CandidateID: 8,
    Name: "Olivia Anderson",
    Email: "olivia@email.com",
    OfferReleasedDate: "2026-05-10",
    JoiningDate: "2026-07-03",
    Status: "Rejected",
  },
  {
    CandidateID: 9,
    Name: "William Thomas",
    Email: "william@email.com",
    OfferReleasedDate: "2026-05-12",
    JoiningDate: "2026-07-06",
    Status: "Offer Accepted",
  },
  {
    CandidateID: 10,
    Name: "Emma Martinez",
    Email: "emma@email.com",
    OfferReleasedDate: "2026-05-15",
    JoiningDate: "2026-07-10",
    Status: "Offer Accepted",
  },
];

// ===== Dropdown Options =====
const candidateOptions = candidateData.map((candidate) => ({
  value: candidate.CandidateID,
  label: `${candidate.Name} - ${candidate.Email}`,
}));

// ===== Component =====
const CandidateOfferList: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchText, setSearchText] = useState("");

  // ===== Filter Logic =====
  const filteredCandidates = useMemo(() => {
    return candidateData.filter((candidate) => {
      const matchesSearch =
        candidate.Name.toLowerCase().includes(searchText.toLowerCase()) ||
        candidate.Email.toLowerCase().includes(searchText.toLowerCase());

      const matchesDropdown = selectedCandidate
        ? candidate.CandidateID === selectedCandidate.value
        : true;

      return matchesSearch && matchesDropdown;
    });
  }, [searchText, selectedCandidate]);

  // ===== Redirect =====
  const handleOnboard = (candidate: Candidate) => {
    navigate(`/onboard-process/${candidate.CandidateID}`);
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h3 className="mb-0">Candidate Offer List</h3>
          </div>

          {/* ===== Filters ===== */}
          <div className="row mb-4">
            <div className="col-md-6">
              <Form.Label>Select Candidate</Form.Label>
              <Select
                options={candidateOptions}
                value={selectedCandidate}
                onChange={(selected) => setSelectedCandidate(selected)}
                isClearable
                placeholder="Search and select candidate..."
              />
            </div>

            <div className="col-md-6">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          {/* ===== Grid ===== */}
          <div className="table-responsive">
            <Table bordered hover striped>
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Offer Released Date</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.CandidateID}>
                      <td>{candidate.Name}</td>
                      <td>{candidate.Email}</td>
                      <td>{candidate.OfferReleasedDate}</td>
                      <td>{candidate.JoiningDate}</td>
                      <td>
                        <span
                          className={`badge ${
                            candidate.Status === "Offer Accepted"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {candidate.Status}
                        </span>
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOnboard(candidate)}
                        >
                          Onboard
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No candidates found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CandidateOfferList;