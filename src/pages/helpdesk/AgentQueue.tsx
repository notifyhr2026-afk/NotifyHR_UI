// src/pages/helpdesk/AgentQueue.tsx
import TicketTable from '../../components/helpdesk/TicketTable';
import { mockTickets } from '../../data/mockTickets';

export default function AgentQueue() {
  return (
    <div className="container mt-4">
      <h3>Agent Queue</h3>
      <TicketTable tickets={mockTickets} />
    </div>
  );
}
