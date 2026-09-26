import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

interface Props {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<Props> = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Cancellation',
  message = 'Are you sure you want to cancel and withdraw this request? This action cannot be undone.',
  confirmLabel = 'Yes, Withdraw',
  loading = false,
}) => (
  <Modal show={show} onHide={onHide} centered backdrop="static">
    <Modal.Header closeButton className="border-bottom-0 pb-0">
      <Modal.Title className="d-flex align-items-center gap-2 fs-5 fw-bold text-dark">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger"
          style={{ width: '36px', height: '36px', flexShrink: 0 }}
        >
          <ExclamationTriangleFill size={18} />
        </div>
        <span>{title}</span>
      </Modal.Title>
    </Modal.Header>

    <Modal.Body className="pt-2 text-muted">
      <p className="mb-0">{message}</p>
    </Modal.Body>

    <Modal.Footer className="border-top-0 pt-0">
      <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm} disabled={loading}>
        {loading ? (
          <>
            <Spinner size="sm" animation="border" className="me-1" /> Processing...
          </>
        ) : (
          confirmLabel
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default DeleteConfirmModal;
