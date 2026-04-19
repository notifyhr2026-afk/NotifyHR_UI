import React, { useEffect, useState } from "react";
import Select from "react-select";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import probationSettingsService from "../../services/probationSettingsService";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";

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

  const [form, setForm] = useState<ProbationSetting>({
    settingID: 0,
    organizationID,
    employeeType: 0,
    probationMonths: 3,
    allowExtension: false,
    maxExtensionMonths: 0,
    autoConfirmation: false,
    confirmationType: "1",
    isActive: true,
  });

  // =========================
  // MAP API RESPONSE 🔥
  // =========================
  const mapData = (res: any): ProbationSetting[] => {
    let parsed = res;

    // if API returns string → parse
    if (typeof res === "string") {
      parsed = JSON.parse(res);
    }

    // handle .Table format
    if (parsed?.Table) {
      parsed = parsed.Table;
    }

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

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      const res = await probationSettingsService.getProbationSettingsAsync(organizationID);
      const mapped = mapData(res);
      setData(mapped);
    } catch {
      ToastMessage.show("Failed to load data", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // SAVE
  // =========================
  const save = async () => {
    try {
      const payload = {
        ...form,
        organizationID,
        createdBy,
        maxExtensionMonths: form.allowExtension ? form.maxExtensionMonths : null,
        confirmationType: form.autoConfirmation ? null : form.confirmationType,
      };

      const res = await probationSettingsService.createOrUpdateProbationSettingAsync(payload);
      const parsed = typeof res === "string" ? JSON.parse(res) : res;

      if (parsed[0]?.Value === 1) {
        ToastMessage.show(parsed[0].Message, "success");
        setShowModal(false);
        loadData(); // 🔥 reload properly
      } else {
        ToastMessage.show(parsed[0]?.Message || "Failed", "warning");
      }
    } catch {
      ToastMessage.show("Save failed", "error");
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteSetting = async (id: number) => {
    if (!id) {
      ToastMessage.show("Invalid ID", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this setting?")) return;

    try {
      const res = await probationSettingsService.deleteProbationSettingAsync(id, createdBy);
      const parsed = typeof res === "string" ? JSON.parse(res) : res;

      if (parsed[0]?.Value === 1) {
        ToastMessage.show("Deleted successfully", "success");
        loadData();
      } else {
        ToastMessage.show(parsed[0]?.Message, "warning");
      }
    } catch {
      ToastMessage.show("Delete failed", "error");
    }
  };

  // =========================
  // EDIT
  // =========================
  const edit = (item: ProbationSetting) => {
    setForm(item);
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({
      settingID: 0,
      organizationID,
      employeeType: 0,
      probationMonths: 3,
      allowExtension: false,
      maxExtensionMonths: 0,
      autoConfirmation: false,
      confirmationType: "1",
      isActive: true,
    });
    setShowModal(true);
  };

  const getEmployeeLabel = (id: number) =>
    employeeOptions.find((x) => x.value === id)?.label;

  return (
    <>
      <ToastProvider />

      <div className="container mt-3">
        <div className="d-flex justify-content-between mb-3">
          <h4>Probation Settings</h4>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add
          </button>
        </div>

        <table className="table table-hover table-dark-custom">
          <thead>
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
                <td colSpan={6} className="text-center">No data found</td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.settingID}>
                  <td>{getEmployeeLabel(d.employeeType)}</td>
                  <td>{d.probationMonths}</td>
                  <td>{d.allowExtension ? `Yes (${d.maxExtensionMonths})` : "No"}</td>
                  <td>{d.autoConfirmation ? "Auto" : "Manual"}</td>
                  <td>
                    <span className={`badge ${d.isActive ? "bg-success" : "bg-secondary"}`}>
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => edit(d)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteSetting(d.settingID)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
     <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title>
      {form.settingID === 0 ? "Add Setting" : "Edit Setting"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>

    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Employee Type</Form.Label>
        <Select
           className="org-select"
          classNamePrefix="org-select"
          options={employeeOptions}
          value={employeeOptions.find((x) => x.value === form.employeeType)}
          onChange={(e) =>
            setForm({ ...form, employeeType: e?.value || 0 })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Probation Months</Form.Label>
        <Form.Control
          type="number"
          value={form.probationMonths}
          onChange={(e) =>
            setForm({
              ...form,
              probationMonths: parseInt(e.target.value) || 0,
            })
          }
        />
      </Form.Group>

      <Form.Check
        type="checkbox"
        label="Allow Extension"
        checked={form.allowExtension}
        onChange={(e) =>
          setForm({ ...form, allowExtension: e.target.checked })
        }
      />

      {form.allowExtension && (
        <Form.Control
          className="mt-2"
          type="number"
          placeholder="Max Extension Months"
          value={form.maxExtensionMonths}
          onChange={(e) =>
            setForm({
              ...form,
              maxExtensionMonths: parseInt(e.target.value) || 0,
            })
          }
        />
      )}

      <Form.Check
        className="mt-3"
        type="checkbox"
        label="Auto Confirmation"
        checked={form.autoConfirmation}
        onChange={(e) =>
          setForm({ ...form, autoConfirmation: e.target.checked })
        }
      />

      {!form.autoConfirmation && (
        <Form.Group className="mt-3">
          <Form.Label>Confirmation Type</Form.Label>
          <Select
             className="org-select"
          classNamePrefix="org-select"
            options={confirmationOptions}
            value={confirmationOptions.find(
              (x) => x.value === form.confirmationType
            )}
            onChange={(e) =>
              setForm({ ...form, confirmationType: e?.value || "" })
            }
          />
        </Form.Group>
      )}
    </Form>

  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={save}>
      Save
    </Button>
  </Modal.Footer>
</Modal>
    </>
  );
};

export default ProbationSettings;