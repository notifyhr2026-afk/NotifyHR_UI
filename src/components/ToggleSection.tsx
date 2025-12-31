import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const ToggleSection: React.FC<SectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        <Button
          variant={isOpen ? 'outline-danger' : 'outline-primary'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </Card.Header>
      {isOpen && <Card.Body>{children}</Card.Body>}
    </Card>
  );
};

export default ToggleSection;
