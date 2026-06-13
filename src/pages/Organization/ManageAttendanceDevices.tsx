import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Toast,
  ToastContainer,
  Row,
  Col,
} from "react-bootstrap";
import {
  BsPencilSquare,
  BsPlus,
  BsTrash,
} from "react-icons/bs";

import branchService from "../../services/branchService";
import attendanceDeviceService from "../../services/attendanceDeviceService";
import LoggedInUser from "../../types/LoggedInUser";

const Icon = (Component: any, props: any = {}) => (
  <Component {...props} />
);

interface AttendanceDevice {
  deviceID: number;
  branchID: number;
  deviceName: string;
  serialNumber: string;
  location: string;
  ipAddress: string;
  isActive: boolean;
}

interface Branch {
  BranchID: number;
  BranchName: string;
}

const ManageAttendanceDevices: React.FC = () => {
  const userString = localStorage.getItem("user");

  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;

  const organizationID = user?.organizationID ?? 0;

  const [devices, setDevices] = useState<
    AttendanceDevice[]
  >([]);

  const [branches, setBranches] = useState<
    Branch[]
  >([]);

  const [selectedBranch, setSelectedBranch] =
    useState<number>(0);

  const [showModal, setShowModal] =
    useState(false);

  const [validated, setValidated] =
    useState(false);

  const [editDevice, setEditDevice] =
    useState<AttendanceDevice | null>(null);

  const [deviceFormData, setDeviceFormData] =
    useState<AttendanceDevice>({
      deviceID: 0,
      branchID: 0,
      deviceName: "",
      serialNumber: "",
      location: "",
      ipAddress: "",
      isActive: true,
    });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    loadBranches();
    loadDevices();
  }, []);

  const loadBranches = async () => {
    try {
      const res =
        await branchService.getBranchesAsync(
          organizationID
        );

      setBranches(res?.Table ?? []);
    } catch (error) {
      console.error(
        "Failed to load branches",
        error
      );
    }
  };

  const loadDevices = async () => {
    try {
      const res =
        await attendanceDeviceService.getAttendanceDevicesByOrganization(
          organizationID
        );

      const mapped: AttendanceDevice[] = (
        res || []
      ).map((d: any) => ({
        deviceID: d.DeviceID,
        branchID: d.BranchID,
        deviceName: d.DeviceName,
        serialNumber: d.SerialNumber,
        location: d.Location ?? "",
        ipAddress: d.IPAddress ?? "",
        isActive: d.IsActive,
      }));

      setDevices(mapped);
    } catch (error) {
      console.error(
        "Failed to load devices",
        error
      );
    }
  };

  const filteredDevices =
    selectedBranch === 0
      ? devices
      : devices.filter(
          (d) =>
            d.branchID === selectedBranch
        );

  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { name, value, type } = e.target;

    setDeviceFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (
              e.target as HTMLInputElement
            ).checked
          : value,
    }));
  };

  const openAddModal = () => {
    setEditDevice(null);
    setValidated(false);

    setDeviceFormData({
      deviceID: 0,
      branchID: selectedBranch || 0,
      deviceName: "",
      serialNumber: "",
      location: "",
      ipAddress: "",
      isActive: true,
    });

    setShowModal(true);
  };

  const openEditModal = (
    device: AttendanceDevice
  ) => {
    setEditDevice(device);
    setValidated(false);
    setDeviceFormData(device);
    setShowModal(true);
  };

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const payload = {
        deviceID:
          deviceFormData.deviceID,
        organizationID,
        branchID: Number(
          deviceFormData.branchID
        ),
        deviceName:
          deviceFormData.deviceName,
        serialNumber:
          deviceFormData.serialNumber,
        location:
          deviceFormData.location,
        ipAddress:
          deviceFormData.ipAddress,
        isActive:
          deviceFormData.isActive,
        createdBy:
          user?.userID ?? 0,
      };

      const res =
        await attendanceDeviceService.postAttendanceDevice(
          payload
        );

      console.log(
        "Save Device Response:",
        res
      );

      if (
        res?.Value === 1 ||
        res?.value === 1
      ) {
        setToast({
          show: true,
          message:
            res?.Message ||
            res?.message ||
            "Device saved successfully.",
          variant: "success",
        });

        setShowModal(false);
        loadDevices();
      } else {
        setToast({
          show: true,
          message:
            res?.Message ||
            res?.message ||
            "Unable to save device.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error(error);

      setToast({
        show: true,
        message:
          "Something went wrong while saving.",
        variant: "danger",
      });
    }
  };

  const handleDelete = async (
    deviceID: number,
    deviceName: string
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${deviceName}?`
      );

    if (!confirmed) return;

    try {
  const res =
        await attendanceDeviceService.deleteAttendanceDevice(deviceID);

      // normalize response (array OR object)
      const result = Array.isArray(res) ? res[0] : res;

      if (result?.Value === 1 || result?.value === 1) {
        setToast({
          show: true,
          message:
            result?.Message ||
            result?.message ||
            "Device deleted successfully.",
          variant: "success",
        });

        loadDevices();
      } else {
        setToast({
          show: true,
          message:
            result?.Message ||
            result?.message ||
            "Unable to delete device.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error(error);

      setToast({
        show: true,
        message:
          "Something went wrong while deleting.",
        variant: "danger",
      });
    }
  };

  return (
    <div className="Container">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <h3>
            Manage Attendance Devices
          </h3>
        </Col>

        <Col md={4}>
          <Form.Select
            value={selectedBranch}
            onChange={(e) =>
              setSelectedBranch(
                Number(e.target.value)
              )
            }
          >
            <option value={0}>
              All Branches
            </option>

            {branches.map((b) => (
              <option
                key={b.BranchID}
                value={b.BranchID}
              >
                {b.BranchName}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4} className="text-end">
          <Button
            variant="primary"
            onClick={openAddModal}
          >
            {Icon(BsPlus, {
              className: "me-1",
            })}
            Add Device
          </Button>
        </Col>
      </Row>

      <Table className="table table-hover table-dark-custom">
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Serial Number</th>
            <th>Location</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredDevices.length >
          0 ? (
            filteredDevices.map(
              (device) => (
                <tr
                  key={
                    device.deviceID
                  }
                >
                  <td>
                    {
                      device.deviceName
                    }
                  </td>
                  <td>
                    {
                      device.serialNumber
                    }
                  </td>
                  <td>
                    {device.location}
                  </td>
                  <td>
                    {
                      device.ipAddress
                    }
                  </td>

                  <td>
                    <Badge
                      bg={
                        device.isActive
                          ? "success"
                          : "danger"
                      }
                    >
                      {device.isActive
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          openEditModal(
                            device
                          )
                        }
                      >
                        {Icon(
                          BsPencilSquare
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          handleDelete(
                            device.deviceID,
                            device.deviceName
                          )
                        }
                      >
                        {Icon(BsTrash)}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={6}
                className="text-center"
              >
                No devices found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={() =>
          setShowModal(false)
        }
        centered
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSave}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editDevice
                ? "Edit Device"
                : "Add Device"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Branch *
                  </Form.Label>

                  <Form.Select
                    required
                    name="branchID"
                    value={
                      deviceFormData.branchID
                    }
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value={0}>
                      Select Branch
                    </option>

                    {branches.map(
                      (b) => (
                        <option
                          key={
                            b.BranchID
                          }
                          value={
                            b.BranchID
                          }
                        >
                          {
                            b.BranchName
                          }
                        </option>
                      )
                    )}
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    Please select
                    branch.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Device Name *
                  </Form.Label>

                  <Form.Control
                    required
                    name="deviceName"
                    value={
                      deviceFormData.deviceName
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Serial Number *
                  </Form.Label>

                  <Form.Control
                    required
                    name="serialNumber"
                    value={
                      deviceFormData.serialNumber
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Location
                  </Form.Label>

                  <Form.Control
                    name="location"
                    value={
                      deviceFormData.location
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    IP Address
                  </Form.Label>

                  <Form.Control
                    name="ipAddress"
                    value={
                      deviceFormData.ipAddress
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </Form.Group>
              </Col>

              <Col
                md={6}
                className="d-flex align-items-center"
              >
                <Form.Check
                  type="switch"
                  name="isActive"
                  label="Active Device"
                  checked={
                    deviceFormData.isActive
                  }
                  onChange={
                    handleInputChange
                  }
                />
              </Col>
            </Row>
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
              type="submit"
            >
              {editDevice
                ? "Update"
                : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer
        position="top-end"
        className="p-3"
      >
        <Toast
          bg={toast.variant}
          show={toast.show}
          delay={3000}
          autohide
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              show: false,
            }))
          }
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ManageAttendanceDevices;
