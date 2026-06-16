import React from 'react';
import { Container, Accordion } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EmployeeProvider } from '../../context/EmployeeContext';
import EmployeeEducation from '../../components/Employee/EmployeeEducation';
import EmployeeExperience from '../../components/Employee/EmployeeExperience';
import EmployeeFamilyDetails from '../../components/Employee/EmployeeFamilyDetails';
import EmployeeAddress from '../../components/Employee/EmployeeAddress';
import EmployeeSeparation from '../../components/Employee/EmployeeSeparation';
import ManageEmployeeBankDetails from '../Payroll/ManageEmployeeBankDetails';

const CareerPersonal: React.FC = () => {
  const userData: any = localStorage.getItem('user');
  const parsed = userData ? JSON.parse(userData) : {};
  const employeeID: number = parsed?.employeeID || 0;

  return (
    <Container>
      <h2 className="mb-4">Career &amp; Personal</h2>
      <EmployeeProvider>
        <Accordion defaultActiveKey="0" flush>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Education Details</Accordion.Header>
            <Accordion.Body>
              <EmployeeEducation employeeID={employeeID} />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>Experience Details</Accordion.Header>
            <Accordion.Body>
              <EmployeeExperience employeeID={employeeID} hidePersonalDetails />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2">
            <Accordion.Header>Family Details</Accordion.Header>
            <Accordion.Body>
              <EmployeeFamilyDetails employeeID={employeeID} />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="3">
            <Accordion.Header>Address Details</Accordion.Header>
            <Accordion.Body>
              <EmployeeAddress employeeID={employeeID} />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="4">
            <Accordion.Header>Bank Details</Accordion.Header>
            <Accordion.Body>
              <ManageEmployeeBankDetails />
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="5">
            <Accordion.Header>Separation</Accordion.Header>
            <Accordion.Body>
              <EmployeeSeparation employeeID={employeeID} />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </EmployeeProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default CareerPersonal;
