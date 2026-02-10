import React, { useState } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Modal,
  Badge,
} from 'react-bootstrap';
import { EyeFill, PencilSquare } from 'react-bootstrap-icons';

/* ===================== TYPES ===================== */
interface SalaryStructure {
  StructureID: number;
  StructureName: string;
  AlterStructureName: string | null;
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
    AlterStructureName: null,
    Description: 'Standard monthly payroll',
    IsOpted: true,
  },
  {
    StructureID: 2,
    StructureName: 'Contract Salary',
    AlterStructureName: null,
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

  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<SalaryComponent[]>([]);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [selectedStructureId, setSelectedStructureId] = useState<number | null>(null);

  /* ===================== HANDLERS ===================== */
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
    setShowComponentModal(true);
  };

  const handleOpenRename = (structure: SalaryStructure) => {
    setSelectedStructureId(structure.StructureID);
    setRenameValue(structure.StructureName);
    setShowRenameModal(true);
  };

  const handleRenameStructure = () => {
    if (!selectedStructureId || !renameValue.trim()) return;

    setStructures(prev =>
      prev.map(s => {
        if (s.StructureID !== selectedStructureId) return s;

        return {
          ...s,
          StructureName: renameValue,
          AlterStructureName: s.AlterStructureName ?? s.StructureName,
        };
      })
    );

    setShowRenameModal(false);
    setRenameValue('');
    setSelectedStructureId(null);
  };

  /* ===================== UI ===================== */
  return (
    <Container className="mt-5">
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Salary Structure Master</h3>
        <p className="text-muted">
          Manage salary structures, components and availability
        </p>
      </div>

      <Table bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>Structure</th>
            <th>Description</th>
            <th className="text-center">Components</th>
            <th className="text-center">Rename</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {structures.map(structure => (
            <tr key={structure.StructureID}>
              {/* STRUCTURE NAME */}
              <td>
                <div className="fw-semibold text-primary">
                  {structure.StructureName}
                </div>

                {structure.AlterStructureName && (
                  <div className="text-muted small fst-italic">
                    Original: {structure.AlterStructureName}
                  </div>
                )}
              </td>

              {/* DESCRIPTION */}
              <td>{structure.Description}</td>

              {/* VIEW COMPONENTS */}
              <td className="text-center">
                <Button
                  variant="light"
                  size="sm"
                  className="border"
                  onClick={() => handleShowComponents(structure.StructureID)}
                >
                  <EyeFill />
                </Button>
              </td>

              {/* RENAME */}
              <td className="text-center">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => handleOpenRename(structure)}
                >
                  <PencilSquare className="me-1" />
                  Rename
                </Button>
              </td>

              {/* STATUS */}
              <td className="text-center">
                <Badge
                  pill
                  bg={structure.IsOpted ? 'success' : 'secondary'}
                  className="px-3 py-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleToggleOpt(structure.StructureID)}
                >
                  {structure.IsOpted ? 'Opted' : 'Not Opted'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* COMPONENT MODAL */}
      <Modal show={showComponentModal} onHide={() => setShowComponentModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-semibold">
            Salary Components
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table bordered size="sm">
            <thead className="table-light">
              <tr>
                <th>Component Name</th>
                <th>Code</th>
                <th>Type</th>
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

      {/* RENAME MODAL */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-semibold">
            Rename Salary Structure
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted mb-2">
            Renaming preserves the original structure name for audit reference.
          </p>

          <Form.Control
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            placeholder="Enter new structure name"
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRenameStructure}>
            Rename
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrgSalaryStructureMaster;
