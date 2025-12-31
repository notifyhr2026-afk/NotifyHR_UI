// ...existing code...
import React from 'react';
import { Container } from 'react-bootstrap';
import EmployeeDetails from '../../components/Employee/EmployeeDetails';
import EmployeeExperience from '../../components/Employee/EmployeeExperience';
import EmployeePositionHistory from '../../components/Employee/EmployeePositionHistory';
import EmployeeEducation from '../../components/Employee/EmployeeEducation';
import EmployeeFamilyDetails from '../../components/Employee/EmployeeFamilyDetails';
import EmployeeAddress from '../../components/Employee/EmployeeAddress';
import EmployeeExitDetails from '../../components/Employee/EmployeeExitDetails';
import ProbationDetails from '../../components/Employee/ProbationDetails';
import EmployeeAsset from '../../components/Employee/EmployeeAsset';
import Accordion from 'react-bootstrap/Accordion';

const ManageEmployee: React.FC = () => {
  return (
    <Container className="mt-5">
      <h2 className="mb-4">Manage - Employee</h2>

      <Accordion defaultActiveKey="0" flush>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Employee Details</Accordion.Header>
          <Accordion.Body>
            <EmployeeDetails />
          </Accordion.Body>
        </Accordion.Item>
        
          <Accordion.Item eventKey="1">
          <Accordion.Header>Probation Details</Accordion.Header>
          <Accordion.Body>
            <ProbationDetails />
          </Accordion.Body>
        </Accordion.Item>
         <Accordion.Item eventKey="2">
            <Accordion.Header>Assigned Assets</Accordion.Header>
            <Accordion.Body>
              <EmployeeAsset />
            </Accordion.Body>
          </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Position History</Accordion.Header>
          <Accordion.Body>
            <EmployeePositionHistory />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>Experience</Accordion.Header>
          <Accordion.Body>
            <EmployeeExperience />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>Education</Accordion.Header>
          <Accordion.Body>
            <EmployeeEducation />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="6">
          <Accordion.Header>Family Details</Accordion.Header>
          <Accordion.Body>
            <EmployeeFamilyDetails />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="7">
          <Accordion.Header>Address</Accordion.Header>
          <Accordion.Body>
            <EmployeeAddress />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="8">
          <Accordion.Header>Exit Details</Accordion.Header>
          <Accordion.Body>
            <EmployeeExitDetails />
          </Accordion.Body>
        </Accordion.Item>

      </Accordion>
    </Container>
  );
};

export default ManageEmployee;