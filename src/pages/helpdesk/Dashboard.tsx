// src/pages/helpdesk/Dashboard.tsx
import TicketStats from '../../components/helpdesk/TicketStats';
import TicketTable from '../../components/helpdesk/TicketTable';
import { mockTickets } from '../../data/mockTickets';

export default function Dashboard() {
  return (
    <div className="container mt-4">
      <h3>Helpdesk Dashboard</h3>
      <TicketStats tickets={mockTickets} />
      <TicketTable tickets={mockTickets} />
    </div>
  );
}
