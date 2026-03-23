import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeDetails: React.FC = () => {
    const { employeeID } = useParams<{ employeeID: string }>();
    const [validated, setValidated] = useState(false);
    const data: any = localStorage.getItem('user');

    const [formData, setFormData] = useState({
        employeeID: 0,
        organizationID: JSON.parse(data)?.organizationID || 0,
        firstName: '',
        middleName: '',
        lastName: '',
        employeeCode: '',
        dob: '',
        gender: '',
        officialEmail: '',
        personalEmail: '',     // ✅ NEW
        personalPhone: '',     // ✅ NEW
        workPhone: '',         // ✅ NEW
        dateOfJoining: '',
        maritalStatus: '',
        createdBy: 'admin',
        pan: '',
        aadhar: '',
        passportNumber: '',
        profilePic: ''
    });

    useEffect(() => {
        toast.info('Toast system ready ✅');
    }, []);

    // ✅ LOAD DATA
    useEffect(() => {
        if (!employeeID) return;

        const id = parseInt(employeeID);

        employeeService.GetEmployeeDetialsByEmployeeID(id)
            .then((res) => {
                if (res?.Table?.length) {
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
                        personalEmail: emp.PersonalEmail || '',   // ✅ NEW
                        personalPhone: emp.PersonalPhone || '',   // ✅ NEW
                        workPhone: emp.WorkPhone || '',           // ✅ NEW
                        dateOfJoining: emp.DateOfJoining ? emp.DateOfJoining.split('T')[0] : '',
                        maritalStatus: emp.MaritalStatus || '',
                        createdBy: 'admin',
                        pan: emp.PAN || '',
                        aadhar: emp.Aadhar || '',
                        passportNumber: emp.PassportNumber || '',
                        profilePic: emp.ProfilePic || ''
                    });
                } else {
                    toast.info('No employee data found.');
                }
            })
            .catch(() => toast.error('Failed to load employee data'));
    }, [employeeID]);

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // ✅ SUBMIT
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (!form.checkValidity()) {
            toast.warn('Please fill all required fields');
            setValidated(true);
            return;
        }

        try {
            toast.info('Saving employee...');

            const payload = {
                ...formData,
                dob: new Date(formData.dob).toISOString(),
                dateOfJoining: new Date(formData.dateOfJoining).toISOString(),
            };

            console.log('Payload:', payload);

            const response = await employeeService.createEmployee(payload);

            const result = Array.isArray(response) ? response[0] : response;
            const finalResult = result?.data ? result.data : result;

            if (!finalResult) {
                toast.error('No response from server');
                return;
            }

            if (Number(finalResult.value) === 1) {
                toast.success(finalResult.msg);
            } else {
                toast.error(finalResult.msg || 'Operation failed');
            }

        } catch (error) {
            console.error(error);
            toast.error('Server error while saving employee');
        } finally {
            setValidated(true);
        }
    };

    const handleClear = () => window.location.reload();

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-4">

                    {/* PROFILE PIC */}
                    <Col md={3}>
                        <div style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid #ccc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f5f5f5"
                        }}>
                            <img
                                src={formData.profilePic || "/default-user.png"}
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>

                        <Form.Group className="mt-2">
                            <Form.Label>Upload Picture</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (x) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                profilePic: x.target?.result as string
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </Form.Group>
                    </Col>

                    {/* FORM */}
                    <Col md={9}>

                        {/* NAME */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="firstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control required value={formData.firstName} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="middleName">
                                    <Form.Label>Middle Name</Form.Label>
                                    <Form.Control value={formData.middleName} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="lastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control required value={formData.lastName} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* CONTACT NEW */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="personalPhone">
                                    <Form.Label>Personal Phone</Form.Label>
                                    <Form.Control required value={formData.personalPhone} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="workPhone">
                                    <Form.Label>Work Phone</Form.Label>
                                    <Form.Control required value={formData.workPhone} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="personalEmail">
                                    <Form.Label>Personal Email</Form.Label>
                                    <Form.Control type="email" required value={formData.personalEmail} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* EXISTING */}
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="employeeCode">
                                    <Form.Label>Employee Code</Form.Label>
                                    <Form.Control required value={formData.employeeCode} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="officialEmail">
                                    <Form.Label>Official Email</Form.Label>
                                    <Form.Control type="email" required value={formData.officialEmail} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="dob">
                                    <Form.Label>DOB</Form.Label>
                                    <Form.Control type="date" required value={formData.dob} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="dateOfJoining">
                                    <Form.Label>Date Of Joining</Form.Label>
                                    <Form.Control type="date" required value={formData.dateOfJoining} onChange={handleChange}/>
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
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="maritalStatus">
                                    <Form.Label>Marital Status</Form.Label>
                                    <Form.Select required value={formData.maritalStatus} onChange={handleChange}>
                                        <option value="">Select</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group controlId="pan">
                                    <Form.Label>PAN</Form.Label>
                                    <Form.Control required value={formData.pan} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="aadhar">
                                    <Form.Label>Aadhar</Form.Label>
                                    <Form.Control required value={formData.aadhar} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="passportNumber">
                                    <Form.Label>Passport</Form.Label>
                                    <Form.Control value={formData.passportNumber} onChange={handleChange}/>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end mt-4">
                            <Button type="submit" className="me-2">Update</Button>
                            <Button variant="secondary" onClick={handleClear}>Clear</Button>
                        </div>

                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default EmployeeDetails;