// src/pages/helpdesk/MyTickets.tsx
import TicketTable from '../../components/helpdesk/TicketTable';
import { mockTickets } from '../../data/mockTickets';

export default function MyTickets() {
  return (
    <div className="container mt-4">
      <h3>My Tickets</h3>
      <TicketTable tickets={mockTickets} />
    </div>
  );
}
