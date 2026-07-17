import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jobRequisitionService from "../../services/jobRequisitionService";

// ================= TYPES =================

interface JobRequisition {
  JobReqRecruiterID: number;
  JobRequisitionID: number;
  RecruiterUserID: number;
  AssignedDate: string;
  Status: string;
  Comment?: string;
}


// ================= STATIC DATA =================
// Replace later with API

const jobRequisitions = [
  { id: 1, name: "JR-001" },
  { id: 2, name: "JR-002" },
];


const recruiters = [
  { id: 101, name: "Alice" },
  { id: 102, name: "Bob" },
  { id: 103, name: "Charlie" },
];


// ================= COMPONENT =================

const RecruiterApprovalPage: React.FC = () => {


  const user =
    JSON.parse(localStorage.getItem("user") || "{}");


  const employeeID = user?.employeeID;

  const employeeName = user?.fullName;



  const [recruitersList, setRecruitersList] =
    useState<JobRequisition[]>([]);


  const [loading, setLoading] =
    useState(false);



  const [showModal, setShowModal] =
    useState(false);



  const [selectedRecruiter, setSelectedRecruiter] =
    useState<JobRequisition | null>(null);



  const [validated, setValidated] =
    useState(false);



  const [formData, setFormData] =
    useState({
      JobReqRecruiterID: 0,
      Status: "Approved",
      Comment: "",
    });



  // ================= LOAD DATA =================


  useEffect(() => {

    if(employeeID){
      loadAssignedJobs();
    }

  }, []);



  const loadAssignedJobs = async () => {

    try {

      setLoading(true);


      const response =
        await jobRequisitionService
        .GetRecruiterAssignedJobsAsync(
          employeeID
        );


      setRecruitersList(response || []);


    } catch(error){

      console.error(error);

      toast.error(
        "Unable to load assigned jobs."
      );


    } finally {

      setLoading(false);

    }

  };



  // ================= OPEN MODAL =================


  const openApprovalModal = (
    item: JobRequisition
  ) => {


    setSelectedRecruiter(item);


    setFormData({

      JobReqRecruiterID:
        item.JobReqRecruiterID,

      Status:
        "Approved",

      Comment:
        "",

    });


    setShowModal(true);

  };



  // ================= HANDLE CHANGE =================


  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {


    const {
      id,
      value
    } = e.target;


    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

  };



  // ================= SAVE APPROVAL =================


  const handleSaveApproval = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {


    event.preventDefault();


    const form =
      event.currentTarget;



    if(form.checkValidity() === false){

      event.stopPropagation();

      setValidated(true);

      toast.warning(
        "Please select status."
      );

      return;

    }



    try {


      const payload = {

        jobReqRecruiterID:
          formData.JobReqRecruiterID,


        recruiterActionStatus:
          formData.Status,


        createdBy:
          employeeName,

      };



      await jobRequisitionService
      .PostManageRecruiterActionAsync(
        payload
      );



      toast.success(
        `Recruiter action ${formData.Status} completed`
      );



      setShowModal(false);


      setValidated(false);


      loadAssignedJobs();



    } catch(error){


      console.error(error);


      toast.error(
        "Failed to update recruiter action."
      );


    }

  };



  // ================= NAME HELPERS =================


  const getJobName = (
    id:number
  ) => {

    return (
      jobRequisitions.find(
        x => x.id === id
      )?.name || id
    );

  };



  const getRecruiterName = (
    id:number
  ) => {

    return (
      recruiters.find(
        x => x.id === id
      )?.name || id
    );

  };



  return (

    <div className="container mt-3">


      <h3>
        Recruiter Approval Page
      </h3>



      {
        loading ? (

          <div className="text-center mt-5">

            <Spinner animation="border"/>

          </div>

        ) : (


        <Table
          bordered
          hover
          className="mt-3"
        >

          <thead>

            <tr>

              <th>ID</th>

              <th>
                Job Requisition
              </th>

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
            recruitersList.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="text-center"
                >
                  No records found
                </td>

              </tr>


            ) : (


            recruitersList.map(item => (

              <tr
                key={
                  item.JobReqRecruiterID
                }
              >


                <td>
                  {
                    item.JobReqRecruiterID
                  }
                </td>


                <td>
                  {
                    getJobName(
                      item.JobRequisitionID
                    )
                  }
                </td>


                <td>
                  {
                    getRecruiterName(
                      item.RecruiterUserID
                    )
                  }
                </td>


                <td>
                  {
                    item.AssignedDate
                  }
                </td>


                <td>

                  <span
                    className={
                      `badge ${
                        item.Status==="Approved"
                        ?"bg-success"
                        :
                        item.Status==="Rejected"
                        ?"bg-danger"
                        :
                        "bg-warning"
                      }`
                    }
                  >

                    {
                      item.Status
                    }

                  </span>

                </td>



                <td>


                  {
                    item.Status === "Pending" ||
                    !item.Status ? (


                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        openApprovalModal(item)
                      }
                    >

                      Approve / Reject

                    </Button>


                    ) : (

                      <span>
                        Completed
                      </span>

                    )
                  }


                </td>



              </tr>

            ))

            )

          }


          </tbody>


        </Table>


        )

      }




      {/* ================= MODAL ================= */}


      <Modal
        show={showModal}
        onHide={() =>
          setShowModal(false)
        }
      >


        <Modal.Header closeButton>

          <Modal.Title>
            Approve / Reject Recruiter
          </Modal.Title>

        </Modal.Header>



        <Modal.Body>


        <Form
          noValidate
          validated={validated}
          onSubmit={handleSaveApproval}
        >


          <Row className="mb-3">


            <Col>

              <Form.Label>
                Job Requisition
              </Form.Label>


              <Form.Control
                disabled
                value={
                  selectedRecruiter
                  ?
                  getJobName(
                    selectedRecruiter.JobRequisitionID
                  )
                  :
                  ""
                }
              />


            </Col>



          </Row>



          <Form.Group className="mb-3">

            <Form.Label>
              Status
            </Form.Label>


            <Form.Select

              id="Status"

              value={
                formData.Status
              }

              onChange={
                handleInputChange
              }

              required

            >

              <option value="Approved">
                Approve
              </option>


              <option value="Rejected">
                Reject
              </option>


            </Form.Select>


          </Form.Group>



          <Form.Group>

            <Form.Label>
              Comment
            </Form.Label>


            <Form.Control

              id="Comment"

              as="textarea"

              rows={3}

              value={
                formData.Comment
              }

              onChange={
                handleInputChange
              }

            />


          </Form.Group>



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
              variant="success"
              type="submit"
            >

              Submit

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


export default RecruiterApprovalPage;