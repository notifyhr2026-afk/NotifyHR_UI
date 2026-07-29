import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Badge,
  Collapse,
} from "react-bootstrap";

import {
  toast,
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import jobRequisitionService from "../../services/jobRequisitionService";
import employeeService from "../../services/employeeService";


// ================= Interfaces =================


interface JobRequisition {
  JobRequisitionID: number;
  JobRequisitionNo: string;
  Position: string;
  Department: string;
  RequestedUser: string;
  NoOfOpenings: number;
  TargetStartDate: string;
  MinSalary: number;
  MaxSalary: number;
  Recruiters: RecruiterAssignment[];
}

interface ApiResponse {
  Table: JobRequisition[];
  Table1: RecruiterAssignment[];
}



interface Recruiter {

  EmployeeID: number;

  EmployeeName: string;

}



interface RecruiterAssignment {
  JobReqRecruiterID: number;
  JobRequisitionID: number;
  RecruiterUserID: number;
  RecruiterUser: string;
  AssignedDate?: string;
  RevokedDate?: string;
  RecruiterStatus: string;
}




// ================= Component =================


const ManageJobRequisitionRecruiters: React.FC = () => {


  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );


  const organizationID =
    user?.organizationID;


  const employeeName =
    user?.fullName;



  const [loading, setLoading] =    useState(false);
  const [jobs, setJobs] =    useState<JobRequisition[]>([]);
  const [employees, setEmployees] =    useState<Recruiter[]>([]);
  const [showModal, setShowModal] =    useState(false);
  const [selectedJob, setSelectedJob] =   useState<JobRequisition | null>(null);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);  
  const [validated, setValidated] =  useState(false);

  const [formData, setFormData] =  useState({
      JobReqRecruiterID: 0,
      JobRequisitionID: 0,
      RecruiterUserID: 0,
      RecruiterUser: "",
      Status: "Assign"
    });



  // ================= Initial Load =================


  useEffect(() => {


    if (organizationID) {

      loadJobs();

      loadEmployees();

    }


  }, [organizationID]);




  // ================= Load Jobs =================


const loadJobs = async () => {
  try {
    setLoading(true);

 const response: ApiResponse =
  await jobRequisitionService.GetJobForAssignmentByOrganizationAsync(
    organizationID
  );


    const jobs = response.Table || [];
    const recruiters = response.Table1 || [];

  const mappedJobs: JobRequisition[] = jobs.map((job) => ({
  ...job,
  Recruiters: recruiters.filter(
    (r) => r.JobRequisitionID === job.JobRequisitionID
  ),
}));

    mappedJobs.sort((a: JobRequisition, b: JobRequisition) => {

      const aAssigned = a.Recruiters.length > 0;
      const bAssigned = b.Recruiters.length > 0;

      if (!aAssigned && bAssigned) return -1;
      if (aAssigned && !bAssigned) return 1;

      return 0;
    });

    setJobs(mappedJobs);
  } catch (error) {
    console.error(error);
    toast.error("Unable to load job requisitions.");
  } finally {
    setLoading(false);
  }
};




  // ================= Load Employees =================


  const loadEmployees = async () => {


    try {


      const response =
        await employeeService
          .getEmployeesByOrganizationIdAsync(
            organizationID
          );



      setEmployees(
        response || []
      );


    }
    catch (error) {


      console.error(error);


      toast.error(
        "Unable to load employees."
      );


    }


  };




  // ================= Add Recruiter =================


  const openAssignModal =
    (job: JobRequisition) => {
      setSelectedJob(job);
      setFormData({
        JobReqRecruiterID: 0,
        JobRequisitionID: job.JobRequisitionID,
        RecruiterUserID: 0,
        RecruiterUser: "",
        Status: "Assign"
      });
      setValidated(false);      
      setShowModal(true);
    };




  // ================= Revoke =================


  const revokeRecruiter =
    async (
      assignment: RecruiterAssignment
    ) => {


      try {


        const payload = {
  jobReqRecruiterID: assignment.JobReqRecruiterID,
  jobRequisitionID: assignment.JobRequisitionID,
  recruiterUserID: assignment.RecruiterUserID,
  recruiterUser: assignment.RecruiterUser,
  status: "Revoked",
  createdBy: employeeName,
};




        await jobRequisitionService
          .PostManageJobRequisitionRecruiterAsync(
            payload
          );



        toast.success(
          "Recruiter revoked successfully."
        );



        loadJobs();


      }
      catch (error) {


        console.error(error);


        toast.error(
          "Unable to revoke recruiter."
        );


      }


    };



  // ================= Input =================


 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { id, value } = e.target;

  if (id === "RecruiterUserID") {
    const recruiter = employees.find(
      (x) => x.EmployeeID === Number(value)
    );

    setFormData((prev) => ({
      ...prev,
      RecruiterUserID: Number(value),
      RecruiterUser: recruiter?.EmployeeName ?? "",
    }));

    return;
  }

  setFormData((prev) => ({
    ...prev,
    [id]: value,
  }));
};




  // ================= Save =================


  const handleSave =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {


      event.preventDefault();



      const form =
        event.currentTarget;



      if (form.checkValidity() === false) {


        event.stopPropagation();

        setValidated(true);

        return;


      }



      try {


        const payload = {

          jobReqRecruiterID: 0,
          jobRequisitionID:formData.JobRequisitionID,          
          recruiterUserID: formData.RecruiterUserID,
          recruiterUser: formData.RecruiterUser,
          status: formData.Status,
          createdBy: employeeName
        };



        await jobRequisitionService
          .PostManageJobRequisitionRecruiterAsync(
            payload
          );



        toast.success(
          "Recruiter assigned successfully."
        );



        setShowModal(false);



        loadJobs();


      }
      catch (error) {


        console.error(error);


        toast.error(
          "Unable to assign recruiter."
        );


      }



    };
  // ================= Render =================


  return (

    <div className="container mt-3">


      <div className="d-flex justify-content-between align-items-center mb-3">


        <h3>
          Manage Job Requisition Recruiters
        </h3>


      </div>



      {
        loading ? (


          <div className="text-center mt-5">

            <Spinner animation="border" />

          </div>


        ) : (


          <Table bordered hover responsive className="mt-3">
            <thead>


              <tr>

                <th>
                  Req No
                </th>

                <th>
                  Position
                </th>

                <th>
                  Department
                </th>

                <th>
                  Requested By
                </th>

                <th>
                  Openings
                </th>

                <th>
                  Target Date
                </th>

                <th>
                  Salary
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>


            </thead>




            <tbody>


              {

                jobs.length === 0 ? (


                  <tr>

                    <td

                      colSpan={9}

                      className="text-center"

                    >

                      No Job Requisitions Found

                    </td>

                  </tr>


                ) : (


                  jobs.map(job => (


                    <React.Fragment

                      key={
                        job.JobRequisitionID
                      }

                    >


                      <tr

                        className={
                          job.Recruiters.length === 0


                            ?

                            "table-warning"

                            :

                            ""

                        }


                      >


                        <td>

                          {job.JobRequisitionNo}

                        </td>



                        <td>

                          {job.Position}

                        </td>



                        <td>

                          {job.Department}

                        </td>



                        <td>

                          {job.RequestedUser}

                        </td>



                        <td>

                          {job.NoOfOpenings}

                        </td>



                        <td>


                          {
                            new Date(
                              job.TargetStartDate
                            )
                              .toLocaleDateString()
                          }


                        </td>



                        <td>


                          ₹
                          {job.MinSalary.toLocaleString()}

                          -

                          ₹
                          {job.MaxSalary.toLocaleString()}


                        </td>



                        <td>


                          {

                            job.Recruiters.length === 0
 ? (


                              <Badge bg="warning" text="dark">

                                Unassigned

                              </Badge>


                            ) : (


                              <Badge bg="success">

                                Assigned

                              </Badge>


                            )


                          }



                        </td>



                        <td>


                          <Button

                            size="sm"

                            variant="primary"

                            className="me-2"

                            onClick={() =>
                              openAssignModal(job)
                            }

                          >


                            +
                            Assign


                          </Button>



                          <Button

                            size="sm"

                            variant="outline-secondary"

                            onClick={() =>


                              setExpandedJob(

                                expandedJob ===
                                  job.JobRequisitionID

                                  ?

                                  null

                                  :

                                  job.JobRequisitionID

                              )

                            }


                          >

                            View


                          </Button>



                        </td>



                      </tr>





                      <tr>


                        <td

                          colSpan={9}

                          className="p-0"

                        >



                          <Collapse

                            in={
                              expandedJob ===
                              job.JobRequisitionID
                            }


                          >


                            <div

                              className="p-3 bg-light"

                            >


                              <h6>

                                Assigned Recruiters

                              </h6>



                              {

                                job.Recruiters.length === 0 ? (


                                  <div className="text-muted">

                                    No recruiters assigned.

                                  </div>


                                ) : (


                                  <Table

                                    size="sm"

                                    bordered

                                  >


                                    <thead>


                                      <tr>

                                        <th>
                                          Recruiter
                                        </th>

                                        <th>
                                          Assigned Date
                                        </th>

                                        <th>
                                          Status
                                        </th>

                                        <th>
                                          Action
                                        </th>

                                      </tr>


                                    </thead>



                                    <tbody>



                                      {

                                        job.Recruiters.map(
                                          (rec) => (


                                            <tr

                                              key={
                                                rec.JobReqRecruiterID
                                              }

                                            >


                                              <td>

                                                {
                                                  rec.RecruiterUser ||
                                                  "-"
                                                }

                                              </td>



                                              <td>

                                                {
                                                  rec.AssignedDate
                                                    ?

                                                    new Date(
                                                      rec.AssignedDate
                                                    )
                                                      .toLocaleDateString()

                                                    :

                                                    "-"

                                                }

                                              </td>




                                              <td>


                                                {

                                                  rec.RecruiterStatus ===
                                                    "Revoked"

                                                    ?

                                                    <Badge bg="danger">

                                                      Revoked

                                                    </Badge>


                                                    :


                                                    <Badge bg="success">

                                                      Assigned

                                                    </Badge>


                                                }



                                              </td>




                                              <td>


                                                {

                                                  rec.RecruiterStatus !==
                                                  "Revoked"

                                                  &&


                                                  <Button

                                                    size="sm"

                                                    variant="danger"

                                                    onClick={() =>
                                                      revokeRecruiter(rec)
                                                    }

                                                  >


                                                    Revoke

                                                  </Button>


                                                }



                                              </td>



                                            </tr>


                                          ))


                                      }



                                    </tbody>


                                  </Table>


                                )



                              }



                            </div>


                          </Collapse>


                        </td>


                      </tr>




                    </React.Fragment>


                  ))


                )


              }



            </tbody>


          </Table>


        )

      }
{/* 
// ================= Assign Recruiter Modal ================= */}


      <Modal

        show={showModal}

        onHide={() => setShowModal(false)}

        centered

      >


        <Modal.Header closeButton>


          <Modal.Title>

            Assign Recruiter

          </Modal.Title>


        </Modal.Header>



        <Modal.Body>


          <Form

            noValidate

            validated={validated}

            onSubmit={handleSave}

          >


            <Row className="mb-3">


              <Col md={12}>


                <Form.Group

                  controlId="JobRequisitionID"

                >


                  <Form.Label>

                    Job Requisition

                  </Form.Label>



                  <Form.Control

                    type="text"

                    value={

                      selectedJob

                        ?

                        `${selectedJob.JobRequisitionNo} - ${selectedJob.Position}`

                        :

                        ""

                    }

                    disabled

                  />


                </Form.Group>


              </Col>


            </Row>





            <Row className="mb-3">


              <Col md={12}>


                <Form.Group

                  controlId="RecruiterUserID"

                >


                  <Form.Label>

                    Recruiter

                  </Form.Label>



                  <Form.Select

                    required

                    value={
                      formData.RecruiterUserID
                    }

                    onChange={
                      handleChange
                    }

                  >


                    <option value="">

                      Select Recruiter

                    </option>



                    {

                      employees.map(
                        (emp) => (


                          <option

                            key={
                              emp.EmployeeID
                            }

                            value={
                              emp.EmployeeID
                            }

                          >

                            {
                              emp.EmployeeName
                            }

                          </option>


                        )

                      )

                    }


                  </Form.Select>



                  <Form.Control.Feedback

                    type="invalid"

                  >

                    Please select recruiter.

                  </Form.Control.Feedback>



                </Form.Group>


              </Col>


            </Row>






            <Row className="mb-3">


              <Col md={12}>


                <Form.Group

                  controlId="Status"

                >


                  <Form.Label>

                    Status

                  </Form.Label>



                  <Form.Select

                    value={
                      formData.Status
                    }

                    onChange={
                      handleChange
                    }

                  >


                    <option value="Assign">

                      Assign

                    </option>



                    <option value="Revoked">

                      Revoked

                    </option>



                  </Form.Select>


                </Form.Group>


              </Col>


            </Row>





            <Modal.Footer>


              <Button

                variant="secondary"

                onClick={() =>
                  setShowModal(false)
                }

              >

                Cancel

              </Button>




              <Button

                variant="primary"

                type="submit"

              >

                Save

              </Button>



            </Modal.Footer>



          </Form>


        </Modal.Body>


      </Modal>






      <ToastContainer

        position="top-right"

        autoClose={3000}

      />



    </div>

  );

};


export default ManageJobRequisitionRecruiters;
