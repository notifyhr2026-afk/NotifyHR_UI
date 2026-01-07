// src/components/helpdesk/TicketTable.tsx
import { Ticket } from '../../types/helpdesk';

interface Props {
  tickets: Ticket[];
}

export default function TicketTable({ tickets }: Props) {
  return (
    <table className="table table-striped">
      <thead className="table-dark">
        <tr>
          <th>Ticket #</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Assigned</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map(t => (
          <tr key={t.ticketId}>
            <td>{t.ticketNumber}</td>
            <td>{t.subject}</td>
            <td>
              <span className="badge bg-info">{t.status}</span>
            </td>
            <td>
              <span className="badge bg-warning text-dark">
                {t.priority}
              </span>
            </td>
            <td>{t.assignedTo || 'Unassigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
