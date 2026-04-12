import React, { useState } from "react";
import { Button, Form, Card, Row, Col } from "react-bootstrap";

const OrganizationSetup: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [color1, setColor1] = useState("#ff0000");
  const [color2, setColor2] = useState("#0000ff");
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const isValidHex = (value: string) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value);
  };

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

  const handleColor1Text = (value: string) => {
    setColor1(value);
  };

  const handleColor2Text = (value: string) => {
    setColor2(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidHex(color1) || !isValidHex(color2)) {
      alert("Please enter valid HEX color codes!");
      return;
    }

    alert(
      `File: ${file?.name || "None"}\nColor 1: ${color1}\nColor 2: ${color2}`
    );
  };

  return (
    <Card className="p-4 mt-3">
      <h4>Organization Setup</h4>

      <Form onSubmit={handleSubmit}>
        {/* Logo Upload */}
        <Form.Group className="mb-3">
          <Form.Label>Upload Organization Logo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {previewLogo && (
            <div className="mt-2">
              <img
                src={previewLogo}
                alt="logo preview"
                style={{ height: 80 }}
              />
            </div>
          )}
        </Form.Group>

        {/* Color 1 */}
        <Form.Group className="mb-3">
          <Form.Label>Primary Color</Form.Label>
          <Row>
            <Col xs={4}>
              <Form.Control
                type="color"
                value={isValidHex(color1) ? color1 : "#000000"}
                onChange={(e) => setColor1(e.target.value)}
              />
            </Col>
            <Col xs={8}>
              <Form.Control
                type="text"
                placeholder="#ffffff"
                value={color1}
                onChange={(e) => handleColor1Text(e.target.value)}
              />
            </Col>
          </Row>
        </Form.Group>

        {/* Color 2 */}
        <Form.Group className="mb-3">
          <Form.Label>Secondary Color</Form.Label>
          <Row>
            <Col xs={4}>
              <Form.Control
                type="color"
                value={isValidHex(color2) ? color2 : "#000000"}
                onChange={(e) => setColor2(e.target.value)}
              />
            </Col>
            <Col xs={8}>
              <Form.Control
                type="text"
                placeholder="#ffffff"
                value={color2}
                onChange={(e) => handleColor2Text(e.target.value)}
              />
            </Col>
          </Row>
        </Form.Group>

        <Button type="submit" variant="primary">
          Save
        </Button>
      </Form>

      {/* Preview */}
      <div className="mt-3">
        <h6>Preview:</h6>
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: isValidHex(color1) ? color1 : "#ccc",
            }}
          ></div>
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: isValidHex(color2) ? color2 : "#ccc",
            }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationSetup;