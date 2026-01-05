import React from "react";
import { Container } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";

import CandidateDetails from "./CandidateDetails";
import CandidateSkills from "./CandidateSkills";
import CandidateDocuments from "./CandidateDocuments";
import CandidateInterview from "./CandidateInterview";
import CandidateApplications from "./CandidateApplications";

const ManageCandidate: React.FC = () => {
  return (
    <Container className="mt-5">
      <h2 className="mb-4">Manage - Candidate</h2>

      <Accordion defaultActiveKey="0" flush>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Details</Accordion.Header>
          <Accordion.Body>
            <CandidateDetails />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>Applications</Accordion.Header>
          <Accordion.Body>
            <CandidateApplications />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>Documents</Accordion.Header>
          <Accordion.Body>
            <CandidateDocuments />
          </Accordion.Body>
        </Accordion.Item>

        {/* <Accordion.Item eventKey="3">
          <Accordion.Header>Interview Details</Accordion.Header>
          <Accordion.Body>
            <CandidateInterview />
          </Accordion.Body>
        </Accordion.Item> */}

       
      </Accordion>
    </Container>
  );
};

export default ManageCandidate;
