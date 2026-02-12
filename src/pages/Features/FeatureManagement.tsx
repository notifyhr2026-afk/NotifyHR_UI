import React, { useState, useEffect } from "react";
import ToastMessage, { ToastProvider } from "../../components/ToastMessage";
import { ValidationMessage } from "../../components/ValidationMessage";
import "bootstrap/dist/css/bootstrap.min.css";
import {GetAllFeaturesAsync,PostFeaturesByAsync,DeleteFeatureAsync,GetFeatureTypesAsync} from "../../services/featureService";
import {FeatureType} from '../../types/FeatureType';
import { Modal, Button, Form, Badge } from "react-bootstrap";
/* ================= TYPES ================= */

interface Feature {
  FeatureID: number;
  FeatureName: string;
  Description: string;
  FeatureType: string;
  IsActive: boolean;
  Icon: string;
  OrderBy: number;
}
/* ================= STATIC DATA ================= */



/* ================= COMPONENT ================= */

const FeatureManagement: React.FC = () => {
  const [featureTypes, setFeatureTypes] = useState<FeatureType[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [featureData, setFeatureData] = useState<Feature>({
    FeatureID: 0,
    FeatureName: "",
    Description: "",
    FeatureType: "",
    IsActive: true,
    Icon: "",
    OrderBy: 0,
  });

  const [valid, setValid] = useState<{
    FeatureName: boolean | null;
    FeatureType: boolean | null;
  }>({
    FeatureName: null,
    FeatureType: null,
  });

  /* ================= LOAD FEATURES ================= */

useEffect(() => {
  const loadInitialData = async () => {
    try {
      // Load Features
      const apiResponse: Feature[] = await GetAllFeaturesAsync();

      const normalized: Feature[] = apiResponse.map(f => ({
        FeatureID: Number(f.FeatureID),
        FeatureName: String(f.FeatureName),
        Description: String(f.Description ?? ""),
        FeatureType: String(f.FeatureType),
        IsActive: Boolean(f.IsActive),
        Icon: String(f.Icon),
        OrderBy: f.OrderBy === null ? 0 : Number(f.OrderBy),
      }));

      setFeatures(normalized);

      // ✅ Load Feature Types
      const typesResponse = await GetFeatureTypesAsync();

      const normalizedTypes: FeatureType[] = typesResponse.map((t: any) => ({
        FeatureTypeID: Number(t.FeatureTypeID),
        FeatureType: String(t.FeatureType),
      }));

      setFeatureTypes(normalizedTypes);

    } catch (error) {
      console.error("Failed to load data", error);
      ToastMessage.show("Failed to load data", "error");
    }
  };

  loadInitialData();
}, []);

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const nameValid = featureData.FeatureName.trim() !== "";
    const typeValid = featureData.FeatureType.trim() !== "";

    setValid({
      FeatureName: nameValid,
      FeatureType: typeValid,
    });

    return nameValid && typeValid;
  };

  const isFormValid =
    featureData.FeatureName.trim() !== "" &&
    featureData.FeatureType.trim() !== "";

  /* ================= MODAL HANDLERS ================= */

  const openCreateModal = () => {
    setEditingId(null);
    setFeatureData({
      FeatureID: 0,
      FeatureName: "",
      Description: "",
      FeatureType: "",
      IsActive: true,
      Icon: "",
      OrderBy: 0,
    });
    setValid({ FeatureName: null, FeatureType: null });
    setShowModal(true);
  };

  const openEditModal = (feature: Feature) => {
    console.log(feature, 'feature-open Edit modal')

    setEditingId(feature.FeatureID);
    setFeatureData(feature);
    setValid({ FeatureName: true, FeatureType: true });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };



  /* ================= SAVE / DELETE ================= */

  const saveFeature = async () => {
    if (!validateForm()) {
      ToastMessage.show("Please fill required fields.", "error");
      return;
    }

    try {
      if (editingId) {

        setFeatures(prev =>
          prev.map(f =>
            f.FeatureID === editingId ? { ...featureData } : f
          )
        );
        ToastMessage.show("Feature updated successfully!", "success");
      } else {

        const response = await PostFeaturesByAsync(featureData);
        //         console.log(response, 'response issss...')
        //         {
        //     "FeatureID": 37,
        //     "value": 1,
        //     "message": "Feature Created Successfully."
        // }
        if (response.value === 1) {
        }
        setFeatures(prev => [
          ...prev,
          {
            ...featureData,
            FeatureID: response?.FeatureID ?? Date.now(),
          },
        ]);
        if (response.value === 1) {

          ToastMessage.show("Feature created successfully!", "success");
        }
        else {
          ToastMessage.show("Somewent wrong!", "error");

        }
      }

      setShowModal(false);
    } catch (error) {
      console.error(error);
      ToastMessage.show("Failed to save feature.", "error");
    }
  };
  const deleteFeature = async () => {
    if (!deleteId) return;

    try {
      const result = await DeleteFeatureAsync(deleteId);

      if (result === 1) {
        // Remove from UI immediately
        setFeatures(prev =>
          prev.filter(f => f.FeatureID !== deleteId)
        );

        ToastMessage.show("Feature deleted successfully!", "success");
      } else {
        ToastMessage.show("Failed to delete feature", "error");
      }

    } catch (error) {
      ToastMessage.show("Failed to delete feature", "error");
    }

    setShowDeleteModal(false);
  };

  /* ================= UI ================= */

  return (
    <>
      <ToastProvider />

      <div className="container mt-5">
        <h3 className="mb-3">Feature Management</h3>

        <button className="btn btn-primary mb-3" onClick={openCreateModal}>
          + Create Feature
        </button>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Feature Name</th>
              <th>Description</th>
              <th>Feature Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {features.map(feature => (
              <tr key={feature.FeatureID}>
                <td>{feature.FeatureName}</td>
                <td>{feature.Description}</td>
                <td>{feature.FeatureType}</td>
                <td>
                  <span
                    className={`badge ${feature.IsActive ? "bg-success" : "bg-secondary"
                      }`}
                  >
                    {feature.IsActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => openEditModal(feature)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openDeleteModal(feature.FeatureID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CREATE / EDIT MODAL ================= */}

     <Modal
  show={showModal}
  onHide={() => setShowModal(false)}
  centered
  backdrop="static"
  size="lg"
>
  <Modal.Header closeButton>
    <Modal.Title>
      {editingId !== null ? "Edit Feature" : "Create Feature"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>
      {/* Feature Name */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Feature Name</Form.Label>
        <Form.Control
          type="text"
          value={featureData.FeatureName}
          isInvalid={valid.FeatureName === false}
          isValid={valid.FeatureName === true}
          onChange={e =>
            setFeatureData({
              ...featureData,
              FeatureName: e.target.value,
            })
          }
        />
        <Form.Control.Feedback type="invalid">
          Feature name is required
        </Form.Control.Feedback>
      </Form.Group>

      {/* Description */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={featureData.Description}
          onChange={e =>
            setFeatureData({
              ...featureData,
              Description: e.target.value,
            })
          }
        />
      </Form.Group>

      {/* Feature Type */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Feature Type</Form.Label>
        <Form.Select
          value={featureData.FeatureType}
          isInvalid={valid.FeatureType === false}
          isValid={valid.FeatureType === true}
          onChange={e =>
            setFeatureData({
              ...featureData,
              FeatureType: e.target.value,
            })
          }
        >
          <option value="">Select Feature Type</option>
          {featureTypes.map(type => (
            <option key={type.FeatureTypeID} value={type.FeatureType}>
              {type.FeatureType}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          Feature type is required
        </Form.Control.Feedback>
      </Form.Group>

      {/* Order By */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Order By</Form.Label>
        <Form.Control
          type="number"
          value={featureData.OrderBy}
          onChange={e =>
            setFeatureData({
              ...featureData,
              OrderBy: Number(e.target.value),
            })
          }
        />
      </Form.Group>

      {/* Icon */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Icon</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. bi-shield-lock"
          value={featureData.Icon}
          onChange={e =>
            setFeatureData({
              ...featureData,
              Icon: e.target.value,
            })
          }
        />
      </Form.Group>

      {/* Status */}
      <Form.Check
        type="switch"
        id="isActiveSwitch"
        label="Is Active"
        checked={featureData.IsActive}
        onChange={e =>
          setFeatureData({
            ...featureData,
            IsActive: e.target.checked,
          })
        }
      />
    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button
      variant="success"
      disabled={!isFormValid}
      onClick={saveFeature}
    >
      Save Feature
    </Button>
  </Modal.Footer>
</Modal>


      {/* ================= DELETE MODAL ================= */}

   <Modal
  show={showDeleteModal}
  onHide={() => setShowDeleteModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Delete Feature</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    Are you sure you want to delete this feature?
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={deleteFeature}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>

    </>
  );
};

export default FeatureManagement;
