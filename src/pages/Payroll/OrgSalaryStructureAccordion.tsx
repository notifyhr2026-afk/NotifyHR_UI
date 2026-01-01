import React from 'react';
import { Accordion, Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

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

/* ===================== SAMPLE DATA ===================== */
const structures: SalaryStructure[] = [
  { StructureID: 1, StructureName: 'Monthly Salary', IsActive: true },
  { StructureID: 2, StructureName: 'Contract Salary', IsActive: true },
];

const structureComponents: SalaryStructureComponent[] = [
  { StructureComponentID: 1, StructureID: 1, ComponentName: 'Basic Pay', CalculationType: 'Fixed', Value: 50000 },
  { StructureComponentID: 2, StructureID: 1, ComponentName: 'HRA', CalculationType: 'Percentage', Value: 20 },
  { StructureComponentID: 3, StructureID: 1, ComponentName: 'PF', CalculationType: 'Percentage', Value: 12 },
  { StructureComponentID: 4, StructureID: 2, ComponentName: 'Basic Pay', CalculationType: 'Fixed', Value: 40000 },
  { StructureComponentID: 5, StructureID: 2, ComponentName: 'HRA', CalculationType: 'Percentage', Value: 15 },
];

/* ===================== COMPONENT ===================== */
const OrgSalaryStructureViewAccordion: React.FC = () => {
  const navigate = useNavigate();

  const handleManage = (structureID: number) => {
    navigate(`/org-salary-structure/manage/${structureID}`);
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-3">Organization Salary Structures</h3>

      <Accordion alwaysOpen>
        {structures.map(structure => {
          const rows = structureComponents.filter(
            c => c.StructureID === structure.StructureID
          );

          return (
            <Accordion.Item
              eventKey={structure.StructureID.toString()}
              key={structure.StructureID}
            >
              <Accordion.Header>
                {structure.StructureName}
              </Accordion.Header>

              <Accordion.Body>
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

                    {/* MANAGE BUTTON ROW */}
                    <tr>
                      <td colSpan={3} className="text-end">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleManage(structure.StructureID)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Container>
  );
};

export default OrgSalaryStructureViewAccordion;
