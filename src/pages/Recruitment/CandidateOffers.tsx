import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

import candidateService from "../../services/candidateService";
import positionService from "../../services/positionService";
import employeeService from "../../services/employeeService";

interface OfferFormData {
  OfferID?: number;

  ApplicationID: string;

  OfferedPositionID: number;
  OfferedPosition: string;

  OfferedCTC: string;

  Currency: string;

  OfferDate: string;

  OfferValidUntil: string;

  JoiningDate: string;

  OfferStatusID: string;

  OfferApprovedByID: number;
  OfferApprovedBy: string;

  OfferLetterPath: string;

  Notes: string;
}

interface CandidateApplication {
  ApplicationID: number;
  CandidateName: string;
  JobTitle: string;
  ApplicationStatus: string;
  jobRequisition: string;
}

interface CandidateOffer {
  OfferID?: number;

  ApplicationID?: number;

  OfferedPositionID?: number;
  OfferedPosition?: string;

  OfferedCTC?: string;

  Currency?: string;

  OfferDate?: string;

  OfferValidUntil?: string;

  JoiningDate?: string;

  OfferStatusID?: string;

  OfferApprovedByID?: number;
  OfferApprovedBy?: string;

  OfferLetterPath?: string;

  Notes?: string;
}

const CandidateOffers: React.FC = () => {
  const { CandidateID } = useParams<{ CandidateID: string }>();

  const user =
    JSON.parse(localStorage.getItem("user") || "null") || {};

  const organizationID = user?.organizationID || 0;

  const [applications, setApplications] = useState<CandidateApplication[]>([]);

  const [offers, setOffers] = useState<CandidateOffer[]>([]);

  const [loadingApplications, setLoadingApplications] =
    useState(false);

  const [loadingOffers, setLoadingOffers] =
    useState(false);

  const [savingOffer, setSavingOffer] =
    useState(false);

  const [positionOptions, setPositionOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const [employeeOptions, setEmployeeOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const [formData, setFormData] =
    useState<OfferFormData>({
      OfferID: 0,

      ApplicationID: "",

      OfferedPositionID: 0,
      OfferedPosition: "",

      OfferedCTC: "",

      Currency: "INR",

      OfferDate: new Date()
        .toISOString()
        .split("T")[0],

      OfferValidUntil: "",

      JoiningDate: "",

      OfferStatusID: "Pending",

      OfferApprovedByID: 0,
      OfferApprovedBy: "",

      OfferLetterPath: "",

      Notes: "",
    });

  const mapApplication = (
    item: any
  ): CandidateApplication => ({
    ApplicationID:
      item.ApplicationID ??
      item.applicationID ??
      0,

    CandidateName:
      item.CandidateName ??
      item.candidateName ??
      item.FullName ??
      "Unknown",

    JobTitle:
      item.JobTitle ??
      item.jobTitle ??
      item.Position ??
      "Unknown",

    ApplicationStatus:
      item.ApplicationStatus ??
      item.applicationStatus ??
      "",

    jobRequisition:
      item.jobRequisition ??
      item.JobRequisition ??
      "",
  });

  const mapOffer = (
    item: any
  ): CandidateOffer => ({
    OfferID:
      item.OfferID ??
      item.offerID ??
      0,

    ApplicationID:
      item.ApplicationID ??
      item.applicationID ??
      0,

    OfferedPositionID:
      item.OfferedPositionID ??
      item.offeredPositionID ??
      0,

    OfferedPosition:
      item.OfferedPosition ??
      item.offeredPosition ??
      "",

    OfferedCTC:
      item.OfferedCTC ??
      item.offeredCTC ??
      "",

    Currency:
      item.Currency ??
      item.currency ??
      "INR",

    OfferDate:
      item.OfferDate ??
      item.offerDate ??
      "",

    OfferValidUntil:
      item.OfferValidUntil ??
      item.offerValidUntil ??
      "",

    JoiningDate:
      item.JoiningDate ??
      item.joiningDate ??
      "",

    OfferStatusID:
      item.OfferStatusID ??
      item.offerStatusID ??
      "",

    OfferApprovedByID:
      item.OfferApprovedByID ??
      item.offerApprovedByID ??
      0,

    OfferApprovedBy:
      item.OfferApprovedBy ??
      item.offerApprovedBy ??
      "",

    OfferLetterPath:
      item.OfferLetterPath ??
      item.offerLetterPath ??
      "",

    Notes:
      item.Notes ??
      item.notes ??
      "",
  });

  const loadPositions = async () => {
    try {
      const response =
        await positionService.getPositionsAsync(
          organizationID
        );

      const positions = Array.isArray(response)
        ? response
        : response?.Table || [];

      setPositionOptions(
        positions.map((p: any) => ({
          value: p.PositionID,
          label: p.PositionTitle,
        }))
      );
    } catch {
      toast.error("Unable to load positions.");
    }
  };

  const loadEmployees = async () => {
    try {
      const response =
        await employeeService.getEmployeesByOrganizationIdAsync(
          organizationID
        );

      const employees = Array.isArray(response)
        ? response
        : response?.Table || [];

      setEmployeeOptions(
        employees.map((emp: any) => ({
          value: emp.EmployeeID,
          label: emp.EmployeeName,
        }))
      );
    } catch {
      toast.error("Unable to load employees.");
    }
  };
  const loadApplications = async () => {
  if (!CandidateID || !organizationID) return;

  try {
    setLoadingApplications(true);

    const response =
      await candidateService.GetCandidateApplicationsAsync(
        organizationID,
        Number(CandidateID)
      );

    const result = Array.isArray(response)
      ? response
      : [response];

    const selectedApps = result
      .map(mapApplication)
      .filter(
        (x) =>
          x.ApplicationStatus?.toLowerCase() === "selected"
      );

    setApplications(selectedApps);
  } catch (error) {
    console.error(error);
    toast.error("Unable to load applications.");
  } finally {
    setLoadingApplications(false);
  }
};

const loadOffers = async (applicationID: number) => {
  if (!CandidateID || !organizationID || !applicationID) {
    setOffers([]);
    return;
  }

  try {
    setLoadingOffers(true);

    const response =
      await candidateService.GetCandidateOffersAsync(
        organizationID,
        Number(CandidateID),
        applicationID
      );

    const result = Array.isArray(response)
      ? response
      : response
      ? [response]
      : [];

    const mapped = result.map(mapOffer);

    setOffers(mapped);

    if (mapped.length > 0) {
      const offer = mapped[0];

      setFormData((prev) => ({
        ...prev,

        OfferID: offer.OfferID,

        OfferedPositionID:
          offer.OfferedPositionID || 0,

        OfferedPosition:
          offer.OfferedPosition || "",

        OfferedCTC:
          offer.OfferedCTC || "",

        Currency:
          offer.Currency || "INR",

        OfferDate:
          offer.OfferDate || "",

        OfferValidUntil:
          offer.OfferValidUntil || "",

        JoiningDate:
          offer.JoiningDate || "",

        OfferStatusID:
          offer.OfferStatusID || "Pending",

        OfferApprovedByID:
          offer.OfferApprovedByID || 0,

        OfferApprovedBy:
          offer.OfferApprovedBy || "",

        OfferLetterPath:
          offer.OfferLetterPath || "",

        Notes:
          offer.Notes || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,

        OfferID: 0,

        OfferedPositionID: 0,

        OfferedPosition: "",

        OfferedCTC: "",

        Currency: "INR",

        OfferDate:
          new Date().toISOString().split("T")[0],

        OfferValidUntil: "",

        JoiningDate: "",

        OfferStatusID: "Pending",

        OfferApprovedByID: 0,

        OfferApprovedBy: "",

        OfferLetterPath: "",

        Notes: "",
      }));
    }
  } catch (error) {
    console.error(error);
    toast.error("Unable to load offer.");
  } finally {
    setLoadingOffers(false);
  }
};

useEffect(() => {
  loadApplications();

  if (organizationID) {
    loadPositions();
    loadEmployees();
  }
}, [CandidateID, organizationID]);

useEffect(() => {
  if (formData.ApplicationID) {
    loadOffers(Number(formData.ApplicationID));
  }
}, [formData.ApplicationID]);

const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement |
    HTMLSelectElement |
    HTMLTextAreaElement
  >
) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleClearApplication = () => {
  setFormData({
    OfferID: 0,

    ApplicationID: "",

    OfferedPositionID: 0,

    OfferedPosition: "",

    OfferedCTC: "",

    Currency: "INR",

    OfferDate:
      new Date().toISOString().split("T")[0],

    OfferValidUntil: "",

    JoiningDate: "",

    OfferStatusID: "Pending",

    OfferApprovedByID: 0,

    OfferApprovedBy: "",

    OfferLetterPath: "",

    Notes: "",
  });

  setOffers([]);
};

const handleClearForm = () => {
  setFormData((prev) => ({
    ...prev,

    OfferID: 0,

    OfferedPositionID: 0,

    OfferedPosition: "",

    OfferedCTC: "",

    Currency: "INR",

    OfferDate:
      new Date().toISOString().split("T")[0],

    OfferValidUntil: "",

    JoiningDate: "",

    OfferStatusID: "Pending",

    OfferApprovedByID: 0,

    OfferApprovedBy: "",

    OfferLetterPath: "",

    Notes: "",
  }));
};
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!CandidateID || !organizationID || !formData.ApplicationID) {
    toast.error("Please select an application.");
    return;
  }

  try {
    setSavingOffer(true);

    const payload = {
      OfferID: formData.OfferID ?? 0,

      ApplicationID: Number(formData.ApplicationID),

      CandidateID: Number(CandidateID),

      OrganizationID: organizationID,

      OfferedPositionID: formData.OfferedPositionID,
      OfferedPosition: formData.OfferedPosition,

      OfferedCTC: formData.OfferedCTC,

      Currency: formData.Currency,

      OfferDate: formData.OfferDate,

      OfferValidUntil: formData.OfferValidUntil,

      JoiningDate: formData.JoiningDate,

      OfferStatusID: formData.OfferStatusID,

      OfferApprovedByID: formData.OfferApprovedByID,
      OfferApprovedBy: formData.OfferApprovedBy,

      OfferLetterPath: formData.OfferLetterPath,

      Notes: formData.Notes,

      CreatedBy: user?.username || "system",
    };

    await candidateService.SaveCandidateOfferAsync(payload);

    toast.success("Offer saved successfully.");

    await loadOffers(Number(formData.ApplicationID));
  } catch (error) {
    console.error(error);
    toast.error("Unable to save offer.");
  } finally {
    setSavingOffer(false);
  }
};

return (
  <>
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Candidate Application</Form.Label>

        <Form.Select
          name="ApplicationID"
          value={formData.ApplicationID}
          onChange={handleChange}
        >
          <option value="">Select Application</option>

          {applications.map((app) => (
            <option
              key={app.ApplicationID}
              value={app.ApplicationID}
            >
              {app.jobRequisition} - {app.JobTitle}
            </option>
          ))}
        </Form.Select>

        {loadingApplications && (
          <Spinner animation="border" size="sm" />
        )}
      </Form.Group>

      <Row className="mb-3">

        <Col md={4}>
          <Form.Label>Offered Position</Form.Label>

          <Select
            options={positionOptions}
            value={positionOptions.find(
              x => x.value === formData.OfferedPositionID
            )}
            onChange={(selected) =>
              setFormData(prev => ({
                ...prev,
                OfferedPositionID: selected?.value ?? 0,
                OfferedPosition: selected?.label ?? ""
              }))
            }
          />
        </Col>

        <Col md={4}>
          <Form.Label>Offered CTC</Form.Label>

          <Form.Control
            type="number"
            name="OfferedCTC"
            value={formData.OfferedCTC}
            onChange={handleChange}
          />
        </Col>

        <Col md={4}>
          <Form.Label>Currency</Form.Label>

          <Form.Select
            name="Currency"
            value={formData.Currency}
            onChange={handleChange}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Form.Select>
        </Col>

      </Row>

      <Row className="mb-3">

        <Col md={4}>
          <Form.Label>Status</Form.Label>

          <Form.Select
            name="OfferStatusID"
            value={formData.OfferStatusID}
            onChange={handleChange}
          >
            <option value="1">Pending</option>
            <option value="2">Approved</option>
            <option value="3">Sent</option>
            <option value="4">Accepted</option>
            <option value="5">Rejected</option>
            <option value="6">Joined</option>
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Label>Offer Date</Form.Label>

          <Form.Control
            type="date"
            name="OfferDate"
            value={formData.OfferDate}
            onChange={handleChange}
          />
        </Col>

        <Col md={4}>
          <Form.Label>Offer Valid Until</Form.Label>

          <Form.Control
            type="date"
            name="OfferValidUntil"
            value={formData.OfferValidUntil}
            onChange={handleChange}
          />
        </Col>

      </Row>

      <Row className="mb-3">

        <Col md={4}>
          <Form.Label>Joining Date</Form.Label>

          <Form.Control
            type="date"
            name="JoiningDate"
            value={formData.JoiningDate}
            onChange={handleChange}
          />
        </Col>

        <Col md={4}>
          <Form.Label>Offer Approved By</Form.Label>

          <Select
            options={employeeOptions}
            value={employeeOptions.find(
              x => x.value === formData.OfferApprovedByID
            )}
            onChange={(selected) =>
              setFormData(prev => ({
                ...prev,
                OfferApprovedByID: selected?.value ?? 0,
                OfferApprovedBy: selected?.label ?? ""
              }))
            }
          />
        </Col>

        <Col md={4}>
          <Form.Label>Offer Letter Path</Form.Label>

          <Form.Control
            type="text"
            name="OfferLetterPath"
            value={formData.OfferLetterPath}
            onChange={handleChange}
          />
        </Col>

      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Notes</Form.Label>

        <Form.Control
          as="textarea"
          rows={3}
          name="Notes"
          value={formData.Notes}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="text-end">

        <Button
          type="submit"
          disabled={savingOffer}
        >
          {savingOffer ? "Saving..." : "Save Offer"}
        </Button>

      </div>
    </Form>
  </>
);

};

export default CandidateOffers;