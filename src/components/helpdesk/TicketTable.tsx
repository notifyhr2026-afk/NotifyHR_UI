// src/components/helpdesk/TicketTable.tsx
import { useState } from 'react';
import { Ticket } from '../../types/helpdesk';

interface Props {
  tickets: Ticket[];
  onUpdate?: (ticket: Ticket) => void;
}

const STATUS_OPTIONS: Ticket['status'][] = [
  'Open',
  'In Progress',
  'Resolved',
  'Closed',
];

export default function TicketTable({ tickets, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTicket, setEditedTicket] = useState<Partial<Ticket>>({});

  const startEdit = (ticket: Ticket) => {
    setEditingId(ticket.ticketId);
    setEditedTicket(ticket);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedTicket({});
  };

  const saveEdit = () => {
    if (onUpdate && editedTicket.ticketId) {
      onUpdate(editedTicket as Ticket);
    }
    setEditingId(null);
    setEditedTicket({});
  };

  return (
    <table className="table table-striped">
      <thead className="table-dark">
        <tr>
          <th>Ticket #</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assigned</th>
          <th>Remarks</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {tickets.map(t => {
          const isEditing = editingId === t.ticketId;

          return (
            <tr key={t.ticketId}>
              <td>{t.ticketNumber}</td>
              <td>{t.subject}</td>

              <td>
                {isEditing ? (
                  <select
                    className="form-select form-select-sm"
                    value={editedTicket.status}
                    onChange={e =>
                      setEditedTicket({
                        ...editedTicket,
                        status: e.target.value as Ticket['status'],
                      })
                    }
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="badge bg-info">{t.status}</span>
                )}
              </td>

              <td>
                <span className="badge bg-warning text-dark">
                  {t.priority}
                </span>
              </td>

              <td>{t.assignedTo || 'Unassigned'}</td>

              <td style={{ minWidth: 220 }}>
                {isEditing ? (
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={editedTicket.remarks ?? ''}
                    onChange={e =>
                      setEditedTicket({
                        ...editedTicket,
                        remarks: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="text-muted">
                    {t.remarks || '—'}
                  </span>
                )}
              </td>

              <td>
                {isEditing ? (
                  <>
                    <button
                      className="btn btn-success btn-sm me-1"
                      onClick={saveEdit}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startEdit(t)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
