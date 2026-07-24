import React from "react";
import { Card, Row, Col } from "react-bootstrap";

interface ReportHeaderProps {
  title: string;
  subTitle?: string;
  organizationName?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  subTitle,
  organizationName,
}) => {
  return (
    <Card className="shadow-sm border-0 mb-4">

      <Card.Body>

        <Row className="align-items-center">

          <Col>

            <h3 className="fw-bold mb-1">
              {title}
            </h3>

            {subTitle && (
              <div className="text-muted">
                {subTitle}
              </div>
            )}

          </Col>

          <Col xs="auto" className="text-end">

            <h5 className="text-primary mb-0">
              {organizationName || "HRMS"}
            </h5>

            <small className="text-muted">
              {new Date().toLocaleDateString()}
            </small>

          </Col>

        </Row>

      </Card.Body>

    </Card>
  );
};

export default ReportHeader;
