import React, { useState } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";

const OrganizationSetup: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [color1, setColor1] = useState("#ff0000"); // default color
  const [color2, setColor2] = useState("#0000ff"); // default color
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => setPreviewLogo(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewLogo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`File: ${file?.name || "None"}\nColor 1: ${color1}\nColor 2: ${color2}`);
  };

  return (
    <Card className="p-4 mt-3">
      <h4>Organization Setup</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Upload Organization Logo</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          {previewLogo && (
            <div className="mt-2">
              <img src={previewLogo} alt="logo preview" style={{ height: 80 }} />
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Choose Color 1 (Primary)</Form.Label>
          <Form.Control
            type="color"
            value={color1}
            onChange={(e) => setColor1(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Choose Color 2 (Secondary)</Form.Label>
          <Form.Control
            type="color"
            value={color2}
            onChange={(e) => setColor2(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Save
        </Button>
      </Form>

      <div className="mt-3">
        <h6>Preview:</h6>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{ width: 50, height: 50, backgroundColor: color1 }}></div>
          <div style={{ width: 50, height: 50, backgroundColor: color2 }}></div>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationSetup;