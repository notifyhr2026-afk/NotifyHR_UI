// src/components/helpdesk/TicketStats.tsx
import { Ticket } from '../../types/helpdesk';

export default function TicketStats({ tickets }: { tickets: Ticket[] }) {
  const open = tickets.filter(t => t.status === 'Open').length;
  const progress = tickets.filter(t => t.status === 'In Progress').length;

  return (
    <div className="row mb-3">
      <div className="col">
        <div className="card text-center">
          <div className="card-body">
            <h5>Open</h5>
            <h2>{open}</h2>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card text-center">
          <div className="card-body">
            <h5>In Progress</h5>
            <h2>{progress}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
