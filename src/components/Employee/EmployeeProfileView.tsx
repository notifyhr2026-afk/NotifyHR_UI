import React, { useEffect, useState } from 'react';
import { Card, Table, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';

interface EducationData {
  qualification: string;
  course: string;
  university: string;
  passingYear: string;
  grade: string;
  modeOfEducation: string;
  isHighestQualification: boolean;
}

interface ExperienceData {
  companyName: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  reasonForLeaving: string;
  location: string;
  description: string;
  isCurrent: boolean;
}

interface FamilyData {
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  isEmergencyContact: boolean;
  isDependentForTax: boolean;
  isNominee: boolean;
}

interface AddressData {
  addressType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Helper function to map education API response to interface
const mapEducationData = (data: any): EducationData => ({
  qualification: data.qualification || data.Qualification || data.qualificationName || '',
  course: data.course || data.Course || data.courseName || '',
  university: data.university || data.University || data.universityName || '',
  passingYear: data.passingYear || data.PassingYear || data.yearOfPassing || data.YearOfPassing || '',
  grade: data.grade || data.Grade || data.gradeObtained || data.GradeObtained || '',
  modeOfEducation: data.modeOfEducation || data.ModeOfEducation || data.mode || data.Mode || '',
  isHighestQualification: data.isHighestQualification === true || data.IsHighestQualification === true || data.highestQualification === true,
});

// Helper function to map experience API response to interface
const mapExperienceData = (data: any): ExperienceData => ({
  companyName: data.companyName || data.CompanyName || data.company || data.Company || '',
  jobTitle: data.jobTitle || data.JobTitle || data.designation || data.Designation || '',
  employmentType: data.employmentType || data.EmploymentType || data.empType || data.EmpType || '',
  startDate: data.startDate || data.StartDate || data.joinDate || data.JoinDate || '',
  endDate: data.endDate || data.EndDate || data.relievingDate || data.RelievingDate || '',
  reasonForLeaving: data.reasonForLeaving || data.ReasonForLeaving || data.reason || data.Reason || '',
  location: data.location || data.Location || data.workLocation || data.WorkLocation || '',
  description: data.description || data.Description || data.jobDescription || data.JobDescription || '',
  isCurrent: data.isCurrent === true || data.IsCurrent === true || data.currentlyWorking === true,
});

// Helper function to map family API response to interface
const mapFamilyData = (data: any): FamilyData => ({
  fullName: data.fullName || data.FullName || data.name || data.Name || '',
  relationship: data.relationship || data.Relationship || '',
  dateOfBirth: data.dateOfBirth || data.DateOfBirth || data.dob || data.DOB || '',
  gender: data.gender || data.Gender || '',
  contactNumber: data.contactNumber || data.ContactNumber || data.mobileNumber || data.MobileNumber || '',
  email: data.email || data.Email || data.emailAddress || data.EmailAddress || '',
  isEmergencyContact: data.isEmergencyContact === true || data.IsEmergencyContact === true || data.emergencyContact === true,
  isDependentForTax: data.isDependentForTax === true || data.IsDependentForTax === true || data.dependent === true,
  isNominee: data.isNominee === true || data.IsNominee === true || data.nominee === true,
});

// Helper function to map address API response to interface
const mapAddressData = (data: any): AddressData => ({
  addressType: data.addressType || data.AddressType || data.type || data.Type || '',
  addressLine1: data.addressLine1 || data.AddressLine1 || data.address1 || data.Address1 || '',
  addressLine2: data.addressLine2 || data.AddressLine2 || data.address2 || data.Address2 || '',
  city: data.city || data.City || '',
  state: data.state || data.State || data.province || data.Province || '',
  country: data.country || data.Country || '',
  postalCode: data.postalCode || data.PostalCode || data.zipCode || data.ZipCode || '',
});

const EmployeeProfileView: React.FC = () => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const [educationData, setEducationData] = useState<EducationData[]>([]);
  const [experienceData, setExperienceData] = useState<ExperienceData[]>([]);
  const [familyData, setFamilyData] = useState<FamilyData[]>([]);
  const [addressData, setAddressData] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const empID = parseInt(employeeID || '0');
        if (!empID) {
          setError('Employee ID is required');
          setLoading(false);
          return;
        }

        const [educations, experiences, families, addresses] = await Promise.all([
          employeeService.GetEmployeeEducations(empID),
          employeeService.GetEmployeeExperiences(empID),
          employeeService.GetEmployeeFamilyDetails(empID),
          employeeService.GetEmployeeAddresses(empID),
        ]);

        console.log('Raw Educations:', educations);
        console.log('Raw Experiences:', experiences);
        console.log('Raw Families:', families);
        console.log('Raw Addresses:', addresses);

        // Handle different response formats
        const eduArray = Array.isArray(educations) ? educations : educations?.Table || [];
        const expArray = Array.isArray(experiences) ? experiences : experiences?.Table || [];
        const famArray = Array.isArray(families) ? families : families?.Table || [];
        const addrArray = Array.isArray(addresses) ? addresses : addresses?.Table || [];

        console.log('Parsed Education Array:', eduArray);
        console.log('First education record:', eduArray[0]);

        // Map API response to interface
        const mappedEducations = eduArray.map(mapEducationData);
        const mappedExperiences = expArray.map(mapExperienceData);
        const mappedFamilies = famArray.map(mapFamilyData);
        const mappedAddresses = addrArray.map(mapAddressData);

        console.log('Mapped Educations:', mappedEducations);

        setEducationData(mappedEducations);
        setExperienceData(mappedExperiences);
        setFamilyData(mappedFamilies);
        setAddressData(mappedAddresses);
      } catch (err: any) {
        console.error('Error fetching employee data:', err);
        setError(err.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeID]);

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">

      {/* Education */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Education Details</h5>
        </Card.Header>
        <Card.Body>
          {educationData.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Qualification</th>
                  <th>Course</th>
                  <th>University</th>
                  <th>Passing Year</th>
                  <th>Grade</th>
                  <th>Mode</th>
                  <th>Highest Qualification</th>
                </tr>
              </thead>
              <tbody>
                {educationData.map((edu, index) => (
                  <tr key={index}>
                    <td>{edu.qualification}</td>
                    <td>{edu.course}</td>
                    <td>{edu.university}</td>
                    <td>{edu.passingYear}</td>
                    <td>{edu.grade}</td>
                    <td>{edu.modeOfEducation}</td>
                    <td>{edu.isHighestQualification ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No education data available.</p>
          )}
        </Card.Body>
      </Card>

      {/* Experience */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Experience Details</h5>
        </Card.Header>
        <Card.Body>
          {experienceData.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Employment Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Location</th>
                  <th>Current</th>
                </tr>
              </thead>
              <tbody>
                {experienceData.map((exp, index) => (
                  <tr key={index}>
                    <td>{exp.companyName}</td>
                    <td>{exp.jobTitle}</td>
                    <td>{exp.employmentType}</td>
                    <td>{exp.startDate}</td>
                    <td>{exp.isCurrent ? 'Present' : exp.endDate}</td>
                    <td>{exp.location}</td>
                    <td>{exp.isCurrent ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No experience data available.</p>
          )}
        </Card.Body>
      </Card>

      {/* Family */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Family Details</h5>
        </Card.Header>
        <Card.Body>
          {familyData.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Relationship</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Emergency Contact</th>
                  <th>Nominee</th>
                </tr>
              </thead>
              <tbody>
                {familyData.map((member, index) => (
                  <tr key={index}>
                    <td>{member.fullName}</td>
                    <td>{member.relationship}</td>
                    <td>{member.dateOfBirth}</td>
                    <td>{member.gender}</td>
                    <td>{member.contactNumber}</td>
                    <td>{member.email}</td>
                    <td>{member.isEmergencyContact ? 'Yes' : 'No'}</td>
                    <td>{member.isNominee ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No family data available.</p>
          )}
        </Card.Body>
      </Card>

      {/* Address */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Address Details</h5>
        </Card.Header>
        <Card.Body>
          {addressData.length > 0 ? (
            <Row>
              {addressData.map((address, index) => (
                <Col md={6} key={index}>
                  <Card className="border mb-3">
                    <Card.Body>
                      <h6>{address.addressType} Address</h6>
                      <p className="mb-1">{address.addressLine1}</p>
                      <p className="mb-1">{address.addressLine2}</p>
                      <p className="mb-1">
                        {address.city}, {address.state}
                      </p>
                      <p className="mb-1">{address.country}</p>
                      <p className="mb-0">
                        <strong>Postal Code:</strong> {address.postalCode}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">No address data available.</p>
          )}
        </Card.Body>
      </Card>

    </div>
  );
};

export default EmployeeProfileView;