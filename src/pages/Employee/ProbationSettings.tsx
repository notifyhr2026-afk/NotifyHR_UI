import React, { useEffect, useState } from "react";
import Select from "react-select";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import probationSettingsService from "../../services/probationSettingsService";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import { fireAudit } from "../../utils/auditUtils";

interface ProbationSetting {
  settingID: number;
  organizationID: number;
  employeeType: number;
  probationMonths: number;
  allowExtension: boolean;
  maxExtensionMonths?: number;
  autoConfirmation: boolean;
  confirmationType?: string;
  isActive: boolean;
}

const employeeOptions = [
  { value: 1, label: "Full-Time" },
  { value: 2, label: "Part-Time" },
  { value: 3, label: "Intern" },
  { value: 4, label: "Contract" },
  { value: 5, label: "Consultant" },
];

const confirmationOptions = [
  { value: "1", label: "Manager Approval" },
  { value: "2", label: "HR Approval" },
  { value: "3", label: "Manager + HR Approval" },
  { value: "4", label: "Performance Based Evaluation" },
  { value: "5", label: "Auto Confirmation" },
];

const ProbationSettings: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const organizationID: number = user?.organizationID;
  const createdBy: string = user?.userName || "Admin";

  const [data, setData] = useState<ProbationSetting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const defaultForm: ProbationSetting = {
    settingID: 0,
    organizationID,
    employeeType: 0,
    probationMonths: 3,
    allowExtension: false,
    maxExtensionMonths: 0,
    autoConfirmation: false,
    confirmationType: "1",
    isActive: true,
  };

  const [form, setForm] = useState<ProbationSetting>(defaultForm);

  /* ================= LOAD ================= */

  const mapData = (res: any): ProbationSetting[] => {
    let parsed = res;

    if (typeof res === "string") parsed = JSON.parse(res);
    if (parsed?.Table) parsed = parsed.Table;

    return parsed.map((x: any) => ({
      settingID: x.SettingID,
      organizationID: x.OrganizationID,
      employeeType: x.EmployeeType,
      probationMonths: x.ProbationMonths,
      allowExtension: x.AllowExtension,
      maxExtensionMonths: x.MaxExtensionMonths,
      autoConfirmation: x.AutoConfirmation,
      confirmationType: x.ConfirmationType,
      isActive: x.IsActive,
    }));
  };

  const loadData = async () => {
    try {
      const res =
        await probationSettingsService.getProbationSettingsAsync(
          organizationID
        );

      setData(mapData(res));
    } catch {
      ToastMessage.show("Failed to load data", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.employeeType) {
      newErrors.employeeType = "Employee Type is required";
    }

    if (!form.probationMonths || form.probationMonths < 1 || form.probationMonths > 24) {
      newErrors.probationMonths = "Probation Months must be 1–24";
    }

    if (form.allowExtension) {
      if (!form.maxExtensionMonths || form.maxExtensionMonths <= 0) {
        newErrors.maxExtensionMonths = "Max Extension Months required";
      }
     if (
  (form.maxExtensionMonths ?? 0) > form.probationMonths
) {
  newErrors.maxExtensionMonths =
    "Cannot exceed probation months";
}
    }

    if (!form.autoConfirmation && !form.confirmationType) {
      newErrors.confirmationType = "Confirmation Type is required";
    }

    const duplicate = data.find(
      (x) =>
        x.employeeType === form.employeeType &&
        x.settingID !== form.settingID
    );

    if (duplicate) {
      newErrors.employeeType = "Already exists for this Employee Type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SAVE ================= */

  const save = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        organizationID,
        createdBy,
        maxExtensionMonths: form.allowExtension ? form.maxExtensionMonths : null,
        confirmationType: form.autoConfirmation ? null : form.confirmationType,
      };

      const res =
        await probationSettingsService.createOrUpdateProbationSettingAsync(payload);

      const parsed = typeof res === "string" ? JSON.parse(res) : res;

      if (parsed[0]?.Value === 1) {
        ToastMessage.show(parsed[0].Message, "success");

        const oldData = form.settingID
          ? data.find((d) => d.settingID === form.settingID)
          : null;

        fireAudit(
          form.settingID ? "UPDATE" : "CREATE",
          "ProbationSetting",
          oldData,
          form,
          organizationID,
          createdBy,
          "ProbationSettings"
        );

        setShowModal(false);
        setErrors({});
        setForm(defaultForm);
        loadData();
      } else {
        ToastMessage.show(parsed[0]?.Message || "Failed", "warning");
      }
    } catch {
      ToastMessage.show("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteSetting = async (id: number) => {
    if (!window.confirm("Delete this setting?")) return;

    try {
      const res =
        await probationSettingsService.deleteProbationSettingAsync(
          id,
          createdBy
        );

      const parsed = typeof res === "string" ? JSON.parse(res) : res;

      if (parsed[0]?.Value === 1) {
        ToastMessage.show("Deleted successfully", "success");

        const oldData = data.find((d) => d.settingID === id);

        fireAudit(
          "DELETE",
          "ProbationSetting",
          oldData,
          null,
          organizationID,
          createdBy,
          "ProbationSettings"
        );

        loadData();
      } else {
        ToastMessage.show(parsed[0]?.Message, "warning");
      }
    } catch {
      ToastMessage.show("Delete failed", "error");
    }
  };

  const edit = (item: ProbationSetting) => {
    setErrors({});
    setForm(item);
    setShowModal(true);
  };

  const openCreate = () => {
    setErrors({});
    setForm(defaultForm);
    setShowModal(true);
  };

  const getEmployeeLabel = (id: number) =>
    employeeOptions.find((x) => x.value === id)?.label;

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      {/* CARD CONTAINER (same style as others) */}
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
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>Probation Settings</div>
              <div style={{ fontSize: ".8rem", opacity: 0.6 }}>
                Manage employee probation rules
              </div>
            </div>
          </div>

          <Button
            onClick={openCreate}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            + Add Setting
          </Button>
        </div>

        {/* TABLE WRAPPER */}
        <div
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <table className="table table-hover mb-0">
            <thead style={{ background: "rgba(0,0,0,.03)" }}>
              <tr>
                <th>Type</th>
                <th>Months</th>
                <th>Extension</th>
                <th>Auto Confirm</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-3">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((d) => (
                  <tr key={d.settingID}>
                    <td>{getEmployeeLabel(d.employeeType)}</td>
                    <td>{d.probationMonths}</td>
                    <td>
                      {d.allowExtension
                        ? `Yes (${d.maxExtensionMonths})`
                        : "No"}
                    </td>
                    <td>{d.autoConfirmation ? "Auto" : "Manual"}</td>
                    <td>
                      <span
                        className={`badge ${
                          d.isActive ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => edit(d)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteSetting(d.settingID)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (unchanged logic) */}
          <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {form.settingID === 0
              ? "Add Setting"
              : "Edit Setting"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Employee Type{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <Select
                className="org-select"
                classNamePrefix="org-select"
                options={employeeOptions}
                value={employeeOptions.find(
                  (x) =>
                    x.value === form.employeeType
                )}
                onChange={(e) =>
                  setForm({
                    ...form,
                    employeeType:
                      e?.value || 0,
                  })
                }
              />

              {errors.employeeType && (
                <small className="text-danger">
                  {errors.employeeType}
                </small>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Probation Months{" "}
                <span className="text-danger">*</span>
              </Form.Label>

              <Form.Control
                type="number"
                min={1}
                max={24}
                value={form.probationMonths}
                onChange={(e) =>
                  setForm({
                    ...form,
                    probationMonths:
                      parseInt(
                        e.target.value
                      ) || 0,
                  })
                }
              />

              {errors.probationMonths && (
                <small className="text-danger">
                  {errors.probationMonths}
                </small>
              )}
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Allow Extension"
              checked={form.allowExtension}
              onChange={(e) =>
                setForm({
                  ...form,
                  allowExtension:
                    e.target.checked,
                })
              }
            />

            {form.allowExtension && (
              <>
                <Form.Control
                  className="mt-2"
                  type="number"
                  min={1}
                  value={
                    form.maxExtensionMonths
                  }
                  placeholder="Max Extension Months"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxExtensionMonths:
                        parseInt(
                          e.target.value
                        ) || 0,
                    })
                  }
                />

                {errors.maxExtensionMonths && (
                  <small className="text-danger">
                    {
                      errors.maxExtensionMonths
                    }
                  </small>
                )}
              </>
            )}

            <Form.Check
              className="mt-3"
              type="checkbox"
              label="Auto Confirmation"
              checked={form.autoConfirmation}
              onChange={(e) =>
                setForm({
                  ...form,
                  autoConfirmation:
                    e.target.checked,
                })
              }
            />

            {!form.autoConfirmation && (
              <Form.Group className="mt-3">
                <Form.Label>
                  Confirmation Type{" "}
                  <span className="text-danger">
                    *
                  </span>
                </Form.Label>

                <Select
                  className="org-select"
                  classNamePrefix="org-select"
                  options={
                    confirmationOptions
                  }
                  value={confirmationOptions.find(
                    (x) =>
                      x.value ===
                      form.confirmationType
                  )}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      confirmationType:
                        e?.value || "",
                    })
                  }
                />

                {errors.confirmationType && (
                  <small className="text-danger">
                    {
                      errors.confirmationType
                    }
                  </small>
                )}
              </Form.Group>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setShowModal(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProbationSettings;