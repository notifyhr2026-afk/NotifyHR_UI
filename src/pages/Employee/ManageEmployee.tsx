// ...existing code...
import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import EmployeeDetails from '../../components/Employee/EmployeeDetails';
import EmployeePositionHistory from '../../components/Employee/EmployeePositionHistory';
// import EmployeeEducation from '../../components/Employee/EmployeeEducation';
// import EmployeeFamilyDetails from '../../components/Employee/EmployeeFamilyDetails';
// import EmployeeAddress from '../../components/Employee/EmployeeAddress';
//import EmployeeExperience from '../../components/Employee/EmployeeExperience';
import EmployeeExitDetails from '../../components/Employee/EmployeeExitDetails';
import ProbationDetails from '../../components/Employee/ProbationDetails';
import EmployeeAsset from '../../components/Employee/EmployeeAsset';
import Accordion from 'react-bootstrap/Accordion';
import EmployeeRoles from '../../components/Employee/EmployeeRoles';
import EmployeeProjects from '../../components/Employee/EmployeeProjects';
import EmployeeShifts from '../../components/Employee/EmployeeShifts';
import EmployeeProfileView from '../../components/Employee/EmployeeProfileView';
import '../../css/ManageEmployee.css';

const ManageEmployee: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const sectionKeys = ['0', '1', '2', '3', '4', '5', '6', '11', '12'];
  const [activeSections, setActiveSections] = useState<string[]>(['0']);

  const handleAccordionSelect = (eventKey: string | string[] | null | undefined) => {
    setActiveSections(
      eventKey ? (Array.isArray(eventKey) ? eventKey : [eventKey]) : []
    );
  };

  return (
    <Container fluid className="manage-employee-page">
      {/* <header className="manage-employee-header">
        <div>         
          <h1>Manage employee</h1>
          <p className="manage-employee-subtitle">
            Keep the employee record, assignments, and lifecycle details in one place.
          </p>
        </div>      
      </header> */}

      <div className="manage-employee-toolbar">
        <div>
          <span className="manage-employee-toolbar-title">Manage Employee</span>
          <span className="manage-employee-toolbar-hint">Keep the employee record, assignments, and lifecycle details in one place.</span>
        </div>
        <div className="manage-employee-actions" role="group" aria-label="Accordion controls">
          <Button
            variant="light"
            className="manage-employee-icon-action"
            aria-label="Expand all sections"
            title="Expand all sections"
            onClick={() => setActiveSections(sectionKeys)}
          >
            <i className="bi bi-arrows-expand" aria-hidden="true" />
          </Button>
          <Button
            variant="light"
            className="manage-employee-icon-action"
            aria-label="Collapse all sections"
            title="Collapse all sections"
            onClick={() => setActiveSections([])}
          >
            <i className="bi bi-arrows-collapse" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Accordion
        activeKey={activeSections}
        onSelect={handleAccordionSelect}
        alwaysOpen
        flush
        className="manage-employee-accordion"
      >
        
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-person-vcard" aria-hidden="true" /></span>
            <span><strong>Details</strong><small>Identity and contact information</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <EmployeeDetails />
          </Accordion.Body>
        </Accordion.Item>
        
          <Accordion.Item eventKey="1">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-hourglass-split" aria-hidden="true" /></span>
            <span><strong>Probation details</strong><small>Review probation progress</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <ProbationDetails />
          </Accordion.Body>
        </Accordion.Item>

         <Accordion.Item eventKey="2">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-calendar3" aria-hidden="true" /></span>
            <span><strong>Shifts</strong><small>Working patterns and schedules</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <EmployeeShifts />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-diagram-3" aria-hidden="true" /></span>
            <span><strong>Position history</strong><small>Roles and progression over time</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <EmployeePositionHistory />
          </Accordion.Body>
        </Accordion.Item>



        <Accordion.Item eventKey="4">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-kanban" aria-hidden="true" /></span>
            <span><strong>Assigned projects</strong><small>Current project responsibilities</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <EmployeeProjects />
          </Accordion.Body>
        </Accordion.Item>

         <Accordion.Item eventKey="5">
            <Accordion.Header>
              <span className="manage-employee-section-icon"><i className="bi bi-laptop" aria-hidden="true" /></span>
              <span><strong>Assigned assets</strong><small>Equipment and return details</small></span>
            </Accordion.Header>
            <Accordion.Body>
              <EmployeeAsset />
            </Accordion.Body>
          </Accordion.Item>
        
        <Accordion.Item eventKey="6">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-shield-check" aria-hidden="true" /></span>
            <span><strong>Assigned roles</strong><small>Access and responsibility scope</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <EmployeeRoles />
          </Accordion.Body>
        </Accordion.Item>

        {/* <Accordion.Item eventKey="7">
          <Accordion.Header>Experience</Accordion.Header>
          <Accordion.Body>
            <EmployeeExperience />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="8">
          <Accordion.Header>Education</Accordion.Header>
          <Accordion.Body>
            <EmployeeEducation />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="9">
          <Accordion.Header>Family Details</Accordion.Header>
          <Accordion.Body>
            <EmployeeFamilyDetails />
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="10">
          <Accordion.Header>Address</Accordion.Header>
          <Accordion.Body>
            <EmployeeAddress />
          </Accordion.Body>
        </Accordion.Item>    */}

          <Accordion.Item eventKey="11">
              <Accordion.Header>
                <span className="manage-employee-section-icon"><i className="bi bi-person-lines-fill" aria-hidden="true" /></span>
                <span><strong>Personal and professional details</strong><small>Additional employee profile data</small></span>
              </Accordion.Header>
              <Accordion.Body>
                <EmployeeProfileView />
              </Accordion.Body>
            </Accordion.Item>
       
       <Accordion.Item eventKey="12">
          <Accordion.Header>
            <span className="manage-employee-section-icon"><i className="bi bi-box-arrow-right" aria-hidden="true" /></span>
            <span><strong>Exit details</strong><small>Separation and handover information</small></span>
          </Accordion.Header>
          <Accordion.Body>
            <EmployeeExitDetails />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default ManageEmployee;