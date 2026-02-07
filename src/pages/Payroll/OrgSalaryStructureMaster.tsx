import React, { useState } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Modal
} from 'react-bootstrap';
import { EyeFill } from 'react-bootstrap-icons';

/* ===================== TYPES ===================== */
interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  Description: string;
  IsOpted: boolean;
}

interface SalaryComponent {
  ComponentID: number;
  StructureID: number;
  ComponentName: string;
  ComponentCode: string;
  ComponentType: string;
}

/* ===================== SAMPLE DATA ===================== */
const initialStructures: SalaryStructure[] = [
  {
    StructureID: 1,
    StructureName: 'Monthly Salary',
    Description: 'Standard monthly payroll',
    IsOpted: true,
  },
  {
    StructureID: 2,
    StructureName: 'Contract Salary',
    Description: 'Contract-based payroll',
    IsOpted: false,
  },
];

const components: SalaryComponent[] = [
  { ComponentID: 1, StructureID: 1, ComponentName: 'Basic Pay', ComponentCode: 'BASIC', ComponentType: 'Fixed' },
  { ComponentID: 2, StructureID: 1, ComponentName: 'HRA', ComponentCode: 'HRA', ComponentType: 'Percentage' },
  { ComponentID: 3, StructureID: 2, ComponentName: 'Basic Pay', ComponentCode: 'BASIC', ComponentType: 'Fixed' },
];

/* ===================== COMPONENT ===================== */
const OrgSalaryStructureMaster: React.FC = () => {
  const [structures, setStructures] = useState(initialStructures);
  const [showModal, setShowModal] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<SalaryComponent[]>([]);

  /* ===================== HANDLERS ===================== */
  const handleNameChange = (id: number, value: string) => {
    setStructures(prev =>
      prev.map(s =>
        s.StructureID === id ? { ...s, StructureName: value } : s
      )
    );
  };

  const handleToggleOpt = (id: number) => {
    setStructures(prev =>
      prev.map(s =>
        s.StructureID === id ? { ...s, IsOpted: !s.IsOpted } : s
      )
    );
  };

  const handleShowComponents = (structureID: number) => {
    const data = components.filter(c => c.StructureID === structureID);
    setSelectedComponents(data);
    setShowModal(true);
  };

  /* ===================== UI ===================== */
  return (
    <Container className="mt-5">
      <h3 className="mb-3">Salary Structure Master</h3>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Structure Name</th>
            <th>Structure Name</th>
            <th>Description</th>
            <th className="text-center">Components</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {structures.map(structure => (
            <tr key={structure.StructureID}>
             <td>{structure.StructureName}</td>

              {/* RENAME STRUCTURE */}
              <td>
                <Form.Control
                  size="sm"
                  value={structure.StructureName}
                  onChange={e =>
                    handleNameChange(structure.StructureID, e.target.value)
                  }
                />
              </td>

              <td>{structure.Description}</td>

              {/* VIEW COMPONENTS */}
              <td className="text-center">
                <Button
                  variant="link"
                  onClick={() => handleShowComponents(structure.StructureID)}
                >
                  <EyeFill size={18} />
                </Button>
              </td>

              {/* OPT / NOT OPT */}
              <td className="text-center">
                <Button
                  size="sm"
                  variant={structure.IsOpted ? 'success' : 'secondary'}
                  onClick={() => handleToggleOpt(structure.StructureID)}
                >
                  {structure.IsOpted ? 'Opted' : 'Not Opted'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ===================== COMPONENT MODAL ===================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Salary Components</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table bordered size="sm">
            <thead className="table-light">
              <tr>
                <th>Component Name</th>
                <th>Component Code</th>
                <th>Component Type</th>
              </tr>
            </thead>
            <tbody>
              {selectedComponents.map(c => (
                <tr key={c.ComponentID}>
                  <td>{c.ComponentName}</td>
                  <td>{c.ComponentCode}</td>
                  <td>{c.ComponentType}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrgSalaryStructureMaster;
