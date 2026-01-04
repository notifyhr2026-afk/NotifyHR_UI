import React, { useState } from "react";
import { Form } from "react-bootstrap";

const CandidateDocuments: React.FC = () => {
  const [resume, setResume] = useState("");

  return (
    <>
      <Form.Label>Upload Resume</Form.Label>
      <Form.Control
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e: any) =>
          setResume(e.target.files?.[0]?.name || "")
        }
      />

      {resume && (
        <p className="mt-2">
          <strong>Uploaded:</strong> {resume}
        </p>
      )}
    </>
  );
};

export default CandidateDocuments;
