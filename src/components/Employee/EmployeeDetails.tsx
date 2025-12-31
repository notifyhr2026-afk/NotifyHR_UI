import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import { toast } from 'react-toastify';

const EmployeeDetails: React.FC = () => {
    const { employeeID } = useParams<{ employeeID: string }>();
    const [validated, setValidated] = useState(false);
    const data: any = localStorage.getItem('user');

    const [formData, setFormData] = useState({
        employeeID: 0,
        organizationID: JSON.parse(data)?.organizationID,
        firstName: '',
        middleName: '',
        lastName: '',
        employeeCode: '',
        dob: '',
        gender: '',
        officialEmail: '',
        dateOfJoining: '',
        maritalStatus: '',
        createdBy: 'admin',
        pan: '',
        aadhar: '',
        passportNumber: '',
        profilePic: '' // NEW FIELD FOR IMAGE
    });

    // Load employee data on mount
    useEffect(() => {
        if (employeeID) {
            const id = parseInt(employeeID);
            setFormData((prev) => ({ ...prev, employeeID: id }));

            employeeService.GetEmployeeDetialsByEmployeeID(id)
                .then((res) => {
                    if (res?.Table && res.Table.length > 0) {
                        const emp = res.Table[0];
                        setFormData({
                            employeeID: id,
                            organizationID: emp.OrganizationID || 0,
                            firstName: emp.FirstName || '',
                            middleName: emp.MiddleName || '',
                            lastName: emp.LastName || '',
                            employeeCode: emp.EmployeeCode || '',
                            dob: emp.DOB ? emp.DOB.split('T')[0] : '',
                            gender: emp.Gender || '',
                            officialEmail: emp.OfficialEmail || '',
                            dateOfJoining: emp.DateOfJoining ? emp.DateOfJoining.split('T')[0] : '',
                            maritalStatus: emp.MaritalStatus || '',
                            createdBy: 'admin',
                            pan: emp.PAN || '',
                            aadhar: emp.Aadhar || '',
                            passportNumber: emp.PassportNumber || '',
                            profilePic: emp.ProfilePic || '' // If photo exists from DB
                        });
                    } else {
                        toast.info('No employee data found.');
                    }
                })
                .catch((err) => {
                    console.error('Error fetching employee details:', err);
                });
        }
    }, [employeeID]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<any>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Handle form submit
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
            try {
                const payload = {
                    ...formData,
                    dob: new Date(formData.dob).toISOString(),
                    dateOfJoining: new Date(formData.dateOfJoining).toISOString(),
                };

                const updatedEmployeeID = await employeeService.createEmployee(payload);

                if (updatedEmployeeID) {
                    toast.success(`Employee saved successfully! ID: ${updatedEmployeeID}`);
                } else {
                    toast.error('Failed to save employee.');
                }
            } catch (error) {
                console.error('Error creating/updating employee:', error);
                toast.error('Error creating or updating employee.');
            }
        } else {
            toast.warn('Please fill all required fields correctly.');
        }

        setValidated(true);
    };

    const handleClear = () => {
        window.location.reload();
    };

    return (
        <>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>

                {/* ------------------ PROFILE PICTURE SECTION ------------------ */}
                <Row className="mb-4">
                    <Col md={3}>
                        <div
                            style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "2px solid #ccc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f5f5f5",
                                marginBottom: "10px"
                            }}
                        >
                            <img
                                src={
                                    formData.profilePic
                                        ? formData.profilePic    // preview or saved image
                                        : "/default-user.png"     // fallback image
                                }
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>

                        <Form.Group controlId="profilePicUpload">
                            <Form.Label>Upload Picture</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (x) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                profilePic: x.target?.result as string,
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={9}>
                        {/* ------------------ ORIGINAL FORM ------------------ */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="firstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        First Name is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="middleName">
                                    <Form.Label>Middle Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="lastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Last Name is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="employeeCode">
                                    <Form.Label>Employee Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.employeeCode}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Employee Code is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="officialEmail">
                                    <Form.Label>Official Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        required
                                        value={formData.officialEmail}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid email.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="dob">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Date of Birth is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="dateOfJoining">
                                    <Form.Label>Date of Joining</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={formData.dateOfJoining}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Date of Joining is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="gender">
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select required value={formData.gender} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Please select a gender.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="maritalStatus">
                                    <Form.Label>Marital Status</Form.Label>
                                    <Form.Select
                                        required
                                        value={formData.maritalStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Please select a marital status.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="pan">
                                    <Form.Label>PAN</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.pan}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        PAN is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="aadhar">
                                    <Form.Label>Aadhar</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.aadhar}
                                        onChange={handleChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Aadhar is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="passportNumber">
                                    <Form.Label>Passport Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.passportNumber}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end mt-4">
                            <Button variant="primary" type="submit" className="me-2">
                                Update
                            </Button>
                            <Button variant="secondary" type="button" onClick={handleClear}>
                                Clear
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default EmployeeDetails;
