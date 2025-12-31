import { Modal, Button } from 'react-bootstrap';

interface Props {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<Props> = ({ show, onHide, onConfirm }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
    <Modal.Body>Are you sure?</Modal.Body>
    <Modal.Footer>
      <Button onClick={onHide}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>Delete</Button>
    </Modal.Footer>
  </Modal>
);

export default DeleteConfirmModal;
