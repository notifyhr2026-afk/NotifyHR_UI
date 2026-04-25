import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import { BsPlusLg, BsPencilSquare, BsTrash } from "react-icons/bs";
import positionService from "../../services/positionService";

const Icon = (C: any, props: any = {}) => React.createElement(C, props);

// ---------------- Types ----------------

interface Position {
  positionID: number;
  positionTitle: string;
}

interface HierarchyMapping {
  id: number;
  parentPositionID: number | null;
  childPositionIDs: number[];
}

// ---------------- Component ----------------

const ManageOrgHierarchy: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [mappings, setMappings] = useState<HierarchyMapping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID || 0;

  const [formData, setFormData] = useState<HierarchyMapping>({
    id: 0,
    parentPositionID: null,
    childPositionIDs: [],
  });

  // ---------------- LOAD DATA (POSITIONS + HIERARCHY) ----------------

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res =
        await positionService.GetOrganizationPositionHierarchyAsync(
          organizationID
        );

      // ---------------- Positions ----------------
      const pos: Position[] =
        res?.Table?.map((p: any) => ({
          positionID: p.PositionID,
          positionTitle: p.PositionTitle?.trim(),
        })) || [];

      // ---------------- Mappings (IMPORTANT FIX) ----------------
      const map: HierarchyMapping[] =
        res?.Table1?.map((m: any, index: number) => ({
          id: index + 1, // UI ID (since backend doesn't send one)
          parentPositionID: m.ParentPositionID,
          childPositionIDs: m.ChildPositionIDs
            ? m.ChildPositionIDs.split(",").map((x: string) =>
                Number(x.trim())
              )
            : [],
        })) || [];

      setPositions(pos);
      setMappings(map);
    } catch (error) {
      console.error("Failed to load hierarchy:", error);
    }
  };

  // ---------------- OPTIONS ----------------

  const positionOptions = positions.map((p) => ({
    value: p.positionID,
    label: p.positionTitle,
  }));

  const getName = (id: number) =>
    positions.find((p) => p.positionID === id)?.positionTitle || "-";

  // ---------------- ADD ----------------

  const openAdd = () => {
    setFormData({
      id: 0,
      parentPositionID: null,
      childPositionIDs: [],
    });
    setShowModal(true);
  };

  // ---------------- EDIT (FIXED BINDING) ----------------

  const edit = (m: HierarchyMapping) => {
    setFormData({
      id: m.id,
      parentPositionID: m.parentPositionID,
      childPositionIDs: [...m.childPositionIDs],
    });
    setShowModal(true);
  };

  // ---------------- SAVE ----------------

  const save = async () => {
    if (!formData.parentPositionID) {
      alert("Select parent position");
      return;
    }

    if (formData.childPositionIDs.length === 0) {
      alert("Select at least one child position");
      return;
    }

    if (formData.childPositionIDs.includes(formData.parentPositionID)) {
      alert("Parent cannot be a child of itself");
      return;
    }

    const payload = {
      organizationID,
      positionID: formData.parentPositionID,
      childPositionIDs: formData.childPositionIDs.join(","),
      createdBy: "Admin",
    };

    try {
      setLoading(true);

      await positionService.SaveOrganizationPositionHierarchyAsync(payload);

      // Refresh after save (BEST PRACTICE)
      await fetchData();

      setShowModal(false);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save hierarchy mapping");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE ----------------

  const remove = (id: number) => {
    if (window.confirm("Delete mapping?")) {
      setMappings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="p-3 mt-3">
      <h3 className="fw-bold">Organization Hierarchy</h3>

      <div className="text-end mb-3">
        <Button onClick={openAdd}>
          {Icon(BsPlusLg, { className: "me-2" })}
          Add Mapping
        </Button>
      </div>

      {/* CARDS */}
      <Row>
        {mappings.map((m) => (
          <Col md={4} key={m.id} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">
                  {getName(m.parentPositionID!)} →{" "}
                  {m.childPositionIDs.map(getName).join(", ")}
                </h6>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => edit(m)}
                  >
                    {Icon(BsPencilSquare)}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => remove(m.id)}
                  >
                    {Icon(BsTrash)}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.id === 0 ? "Add Mapping" : "Edit Mapping"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Parent */}
          <div className="mb-3">
            <label>Parent Position</label>
            <Select
              options={positionOptions}
              value={
                positionOptions.find(
                  (o) => o.value === formData.parentPositionID
                ) || null
              }
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  parentPositionID: val ? val.value : null,
                }))
              }
              isClearable
            />
          </div>

          {/* Children */}
          <div className="mb-3">
            <label>Child Positions</label>
            <Select
              isMulti
              options={positionOptions.filter(
                (p) => p.value !== formData.parentPositionID
              )}
              value={positionOptions.filter((o) =>
                formData.childPositionIDs.includes(o.value)
              )}
              onChange={(vals) =>
                setFormData((prev) => ({
                  ...prev,
                  childPositionIDs: vals
                    ? vals.map((v) => v.value)
                    : [],
                }))
              }
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button onClick={save} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageOrgHierarchy;