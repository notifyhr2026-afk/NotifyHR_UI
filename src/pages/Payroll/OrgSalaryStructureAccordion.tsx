import React, { useEffect, useState } from 'react';
import { Accordion, Table, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import salaryService from '../../services/salaryService';
import LoggedInUser from '../../types/LoggedInUser';

/* ===================== TYPES ===================== */
interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  IsActive: boolean;
}

interface SalaryStructureComponent {
  StructureComponentID: number;
  StructureID: number;
  ComponentName: string;
  CalculationType: string;
  Value: number;
}

/* ===================== COMPONENT ===================== */
const OrgSalaryStructureViewAccordion: React.FC = () => {
  const navigate = useNavigate();

  /* ================= USER ================= */
  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString ? JSON.parse(userString) : null;
  const organizationID = user?.organizationID ?? 0;

  /* ================= STATE ================= */
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [components, setComponents] = useState<SalaryStructureComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ===================== LOAD STRUCTURES & COMPONENTS ===================== */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load structures
      const structuresData: SalaryStructure[] = await salaryService.getSalaryStructuresAsync(organizationID);

      setStructures(structuresData);

      // Load all components for all structures
      const allComponentsRaw: any[] = await salaryService.GetStructureComponentsAsync(0);

      // Map API response to expected component shape
      const mappedComponents: SalaryStructureComponent[] = allComponentsRaw.map(c => ({
        StructureComponentID: c.StructureComponentID || c.ComponentID || 0,
        StructureID: c.StructureID || 0,
        ComponentName: c.ComponentName,
        CalculationType: c.CalculationTypeName || c.ComponentType || '',
        Value: c.Value || 0,
      }));

      setComponents(mappedComponents);

    } catch (err) {
      console.error(err);
      setError('Failed to load salary structures or components.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationID > 0) {
      fetchData();
    }
  }, [organizationID]);

  /* ===================== NAVIGATION ===================== */
  const handleManage = () => {
    navigate('/org-salary-structure');
  };

  /* ===================== UI ===================== */
  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-5">
      {/* HEADER + MANAGE BUTTON */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h3 className="mb-0">Organization Salary Structures</h3>
        </Col>
        <Col className="text-end">
          <Button variant="primary" size="sm" onClick={handleManage}>
            Manage Components
          </Button>
        </Col>
      </Row>

      <Accordion alwaysOpen>
        {structures.map(structure => {
          const rows = components.filter(c => c.StructureID === structure.StructureID);

          return (
            <Accordion.Item eventKey={structure.StructureID.toString()} key={structure.StructureID}>
              <Accordion.Header>{structure.StructureName}</Accordion.Header>

              <Accordion.Body>
                {rows.length ? (
                  <Table bordered hover responsive size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Component</th>
                        <th>Calculation Type</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(c => (
                        <tr key={c.StructureComponentID}>
                          <td>{c.ComponentName}</td>
                          <td>{c.CalculationType}</td>
                          <td>{c.Value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No components available for this structure.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Container>
  );
};

export default OrgSalaryStructureViewAccordion;
