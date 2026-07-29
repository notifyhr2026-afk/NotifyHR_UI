import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Badge,
} from "react-bootstrap";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import candidateService from "../../services/candidateService";


// ================= Interfaces =================

interface InterviewFeedback {
  InterviewID: number;
  ApplicationID: number;

  CandidateID: number;
  CandidateName: string;
  InterviewDate: string;

  InterviewerID: number;
  Interviewer: string;

  InterviewMode: string;

  InterviewStatus: string;


  FeedbackID?: number | null;

  FeedbackStatus?: string | null;

  FeedbackRating?: number | null;

  Feedback?: string | null;

  CreatedDate?: string | null;
}



// ================= Component =================

const CandidateInterviewFeedback: React.FC = () => {


  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );


  const EmployeeID =
    user?.employeeID || 0;


  const employeeName =
    user?.fullName ||
    user?.name ||
    "";



  const [loading,setLoading] =
    useState(false);


  const [saving,setSaving] =
    useState(false);



  const [interviews,setInterviews] =
    useState<InterviewFeedback[]>([]);



  const [showModal,setShowModal] =
    useState(false);



  const [selectedInterview,setSelectedInterview] =
    useState<InterviewFeedback | null>(null);



  const [formData,setFormData] =
    useState({

      status:"",

      rating:0,

      feedback:""

    });





  // ================= Load Interviews =================


  const loadInterviews = async()=>{


    try{


      setLoading(true);



      const response =
        await candidateService
          .GetCandidateInterviewFeedback(
            EmployeeID
          );



      setInterviews(
        response || []
      );


    }
    catch(error){


      console.error(error);


      toast.error(
        "Unable to load assigned interviews"
      );


    }
    finally{


      setLoading(false);


    }


  };




  useEffect(()=>{


    if(EmployeeID){

      loadInterviews();

    }


  },[]);





  // ================= Open Feedback =================


  const openFeedbackModal =
    (
      item:InterviewFeedback
    )=>{


      setSelectedInterview(item);



      setFormData({

        status:
          item.FeedbackStatus || "",


        rating:
          item.FeedbackRating || 0,


        feedback:
          item.Feedback || ""

      });



      setShowModal(true);


    };





  // ================= Save Feedback =================


  const saveFeedback =
    async(
      e:React.FormEvent<HTMLFormElement>
    )=>{


      e.preventDefault();



      if(!selectedInterview){

        return;

      }



      try{


        setSaving(true);



        const payload = {


          feedbackID:
            selectedInterview.FeedbackID || 0,


          interviewID:
            selectedInterview.InterviewID,


          interviewerID:
            EmployeeID,


          status:
            formData.status,


          rating:
            Number(formData.rating),


          feedback:
            formData.feedback


        };



        console.log(
          "Feedback Payload",
          payload
        );



        await candidateService
          .SaveCandidateInterviewFeedbackAsync(
            payload
          );



        toast.success(
          "Interview feedback saved successfully"
        );



        setShowModal(false);



        loadInterviews();


      }
      catch(error){


        console.error(error);


        toast.error(
          "Failed to save feedback"
        );


      }
      finally{


        setSaving(false);


      }


    };





  return (

    <div className="container mt-3">


      <h3 className="mb-3">

        Candidate Interview Feedback

      </h3>





      {
        loading ?


        <div className="text-center mt-5">


          <Spinner animation="border"/>


        </div>


        :


        <Table  bordered hover responsive className="mt-3">


          <thead>


            <tr>


              <th>
                Interview Date
              </th>


              <th>
                Candidate Name
              </th>


              <th>
                Interviewer
              </th>


              <th>
                Mode
              </th>


              <th>
                Interview Status
              </th>


              <th>
                Feedback Status
              </th>


              <th>
                Rating
              </th>


              <th>
                Action
              </th>


            </tr>


          </thead>




          <tbody>


          {

            interviews.length === 0 ?


            <tr>


              <td

                colSpan={8}

                className="text-center"

              >

                No assigned interviews found


              </td>


            </tr>


            :


            interviews.map(
              (item)=>(


              <tr

                key={
                  item.InterviewID
                }

              >


                <td>

                  {
                    new Date(
                      item.InterviewDate
                    )
                    .toLocaleDateString()
                  }

                </td>



                <td>

                  {
                    item.CandidateName
                  }

                </td>



                <td>

                  {
                    item.Interviewer
                  }

                </td>



                <td>

                  {
                    item.InterviewMode
                  }

                </td>




                <td>


                  <Badge bg="info">

                    {
                      item.InterviewStatus
                    }

                  </Badge>


                </td>




                <td>


                {

                  item.FeedbackStatus ?


                  <Badge bg="success">

                    {
                      item.FeedbackStatus
                    }

                  </Badge>


                  :


                  <Badge

                    bg="warning"

                    text="dark"

                  >

                    Pending

                  </Badge>


                }


                </td>




                <td>

                  {
                    item.FeedbackRating || "-"
                  }

                </td>




                <td>


                  <Button

                    size="sm"

                    variant="primary"

                    onClick={() =>
                      openFeedbackModal(item)
                    }

                  >

                    {
                      item.FeedbackID
                      ?
                      "Edit Feedback"
                      :
                      "Give Feedback"
                    }


                  </Button>


                </td>



              </tr>


            ))

          }


          </tbody>


        </Table>


      }






      {/* ================= Feedback Modal ================= */}


      <Modal

        show={showModal}

        onHide={() =>
          setShowModal(false)
        }

        centered

      >


        <Modal.Header closeButton>


          <Modal.Title>

            Interview Feedback

          </Modal.Title>


        </Modal.Header>




        <Form

          onSubmit={saveFeedback}

        >


          <Modal.Body>



            <Row className="mb-3">


              <Col md={6}>


                <Form.Label>

                  Status

                </Form.Label>



                <Form.Select

                  value={
                    formData.status
                  }


                  onChange={(e)=>

                    setFormData({

                      ...formData,

                      status:
                        e.target.value

                    })

                  }


                  required

                >


                  <option value="">

                    Select

                  </option>


                  <option value="Selected">

                    Selected

                  </option>


                  <option value="Rejected">

                    Rejected

                  </option>


                  <option value="Hold">

                    Hold

                  </option>



                </Form.Select>


              </Col>





              <Col md={6}>


                <Form.Label>

                  Rating

                </Form.Label>



                <Form.Select


                  value={
                    formData.rating
                  }


                  onChange={(e)=>

                    setFormData({

                      ...formData,

                      rating:
                        Number(
                          e.target.value
                        )

                    })

                  }


                  required

                >


                  <option value="0">

                    Select

                  </option>


                  <option value="1">
                    1
                  </option>

                  <option value="2">
                    2
                  </option>

                  <option value="3">
                    3
                  </option>

                  <option value="4">
                    4
                  </option>

                  <option value="5">
                    5
                  </option>



                </Form.Select>
              </Col>
            </Row>
            <Form.Group>
              <Form.Label>
                Feedback
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={
                  formData.feedback
                }
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    feedback:
                      e.target.value
                  })
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                setShowModal(false)
              }>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Feedback"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </div>
  );
};

export default CandidateInterviewFeedback;
