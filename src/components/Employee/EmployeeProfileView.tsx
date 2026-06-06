import React from 'react';
import { Card, Table, Row, Col } from 'react-bootstrap';

const EmployeeProfileView: React.FC = () => {
  const educationData = [
    {
      qualification: 'B.Tech',
      course: 'Computer Science',
      university: 'JNTU Hyderabad',
      passingYear: '2020',
      grade: '8.5 CGPA',
      modeOfEducation: 'Regular',
      isHighestQualification: true,
    },
  ];

  const experienceData = [
    {
      companyName: 'ABC Technologies',
      jobTitle: 'Software Engineer',
      employmentType: 'Full Time',
      startDate: '2020-07-01',
      endDate: '2023-12-31',
      reasonForLeaving: 'Career Growth',
      location: 'Hyderabad',
      description: 'Worked on React and .NET applications.',
      isCurrent: false,
    },
    {
      companyName: 'XYZ Solutions',
      jobTitle: 'Senior Software Engineer',
      employmentType: 'Full Time',
      startDate: '2024-01-01',
      endDate: '',
      reasonForLeaving: '',
      location: 'Bangalore',
      description: 'Leading frontend development team.',
      isCurrent: true,
    },
  ];

  const familyData = [
    {
      fullName: 'Ramesh Kumar',
      relationship: 'Father',
      dateOfBirth: '1965-05-15',
      gender: 'Male',
      contactNumber: '9876543210',
      email: 'ramesh@gmail.com',
      isEmergencyContact: true,
      isDependentForTax: true,
      isNominee: false,
    },
    {
      fullName: 'Suresh Kumar',
      relationship: 'Brother',
      dateOfBirth: '1998-02-10',
      gender: 'Male',
      contactNumber: '9876500000',
      email: 'suresh@gmail.com',
      isEmergencyContact: false,
      isDependentForTax: false,
      isNominee: true,
    },
  ];

  const addressData = [
    {
      addressType: 'Permanent',
      addressLine1: '123 Main Street',
      addressLine2: 'Near Bus Stand',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500001',
    },
    {
      addressType: 'Current',
      addressLine1: '456 IT Park Road',
      addressLine2: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      postalCode: '500081',
    },
  ];

  return (
    <div className="container-fluid">

      {/* Education */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Education Details</h5>
        </Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card>

      {/* Experience */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Experience Details</h5>
        </Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card>

      {/* Family */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Family Details</h5>
        </Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card>

      {/* Address */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Address Details</h5>
        </Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card>

    </div>
  );
};

export default EmployeeProfileView;