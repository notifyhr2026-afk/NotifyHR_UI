import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import { BsPlusLg, BsPencilSquare, BsTrash } from "react-icons/bs";
import positionService from "../../services/positionService";
import { Link } from "react-router-dom";

/* ================= ICON WRAPPER ================= */
const Icon = (C: any, props: any = {}) => React.createElement(C, props);

/* ================= TYPES ================= */

interface Position {
  positionID: number;
  positionTitle: string;
}

interface HierarchyMapping {
  id: number;
  parentPositionID: number | null;
  childPositionIDs: number[];
}

interface OptionType {
  value: number;
  label: string;
}

/* ================= COMPONENT ================= */

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

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res =
        await positionService.GetOrganizationPositionHierarchyAsync(
          organizationID
        );

      const pos: Position[] =
        res?.Table?.map((p: any) => ({
          positionID: p.PositionID,
          positionTitle: p.PositionTitle?.trim(),
        })) || [];

      const map: HierarchyMapping[] =
        res?.Table1?.map((m: any, index: number) => ({
          id: index + 1,
          parentPositionID: m.ParentPositionID,
          childPositionIDs: m.ChildPositionIDs
            ? m.ChildPositionIDs.split(",").map((x: string) => Number(x.trim()))
            : [],
        })) || [];

      setPositions(pos);
      setMappings(map);
    } catch (error) {
      console.error("Failed to load hierarchy:", error);
    }
  };

  /* ================= OPTIONS ================= */

  const positionOptions: OptionType[] = positions.map((p) => ({
    value: p.positionID,
    label: p.positionTitle,
  }));

  const getName = (id: number) =>
    positions.find((p) => p.positionID === id)?.positionTitle || "-";

  /* ================= ADD ================= */

  const openAdd = () => {
    setFormData({
      id: 0,
      parentPositionID: null,
      childPositionIDs: [],
    });
    setShowModal(true);
  };

  /* ================= EDIT ================= */

  const edit = (m: HierarchyMapping) => {
    setFormData({
      id: m.id,
      parentPositionID: m.parentPositionID,
      childPositionIDs: [...m.childPositionIDs],
    });
    setShowModal(true);
  };

  /* ================= SAVE ================= */

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

      await fetchData();
      setShowModal(false);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save hierarchy mapping");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const remove = (id: number) => {
    if (window.confirm("Delete mapping?")) {
      setMappings((prev) => prev.filter((m) => m.id !== id));
    }
  };

  /* ================= OPTIONS ================= */

  const positionOptionsFiltered = positionOptions;

  /* ================= UI ================= */

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        borderRadius: 12,
        padding: 24,
        border: "1px solid var(--border-color)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(13,110,253,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0d6efd",
            }}
          >
            <i className="bi bi-diagram-3"></i>
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>Organization Hierarchy</div>
            <div style={{ fontSize: ".8rem", opacity: 0.6 }}>
              Manage position reporting structure
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
  <Button
    variant="outline-primary"
    onClick={() => window.location.href = "/ViewOrgTree"}
    style={{ borderRadius: 8, fontWeight: 600 }}
  >
    View Hierarchy
  </Button>

  <Button
    onClick={openAdd}
    style={{ borderRadius: 8, fontWeight: 600 }}
  >
    {Icon(BsPlusLg, { className: "me-2" })}
    Add Mapping
  </Button>
</div>      </div>

      {/* CONTENT BOX */}
      <div
        style={{
          border: "1px solid var(--border-color)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <Row>
          {mappings.map((m) => (
            <Col md={4} key={m.id} className="mb-3">
              <Card
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                }}
              >
                <Card.Body>
                  <div style={{ fontWeight: 500 }}>
                    {getName(m.parentPositionID!)} →{" "}
                    {m.childPositionIDs.map(getName).join(", ")}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => edit(m)}
                      style={{ borderRadius: 6 }}
                    >
                      {Icon(BsPencilSquare)}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => remove(m.id)}
                      style={{ borderRadius: 6 }}
                    >
                      {Icon(BsTrash)}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

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
            <Select<OptionType, false>
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
            <Select<OptionType, true>
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
                  childPositionIDs: vals ? vals.map((v) => v.value) : [],
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