import { mockTickets } from '../../data/mockTickets';

export default function TicketDetails() {
  const ticket = mockTickets[0];

  return (
    <div className="container mt-4">
      <h3>{ticket.ticketNumber}</h3>

      <div className="row">
        <div className="col-md-8">
          <div className="card p-3 mb-3">
            <h5>{ticket.subject}</h5>
            <p>{ticket.description}</p>
          </div>

          <div className="card p-3">
            <h6>Comments</h6>
            <div className="border p-2 mb-2">
              <strong>Agent:</strong> We are checking this.
            </div>

            <textarea className="form-control mb-2" />
            <button className="btn btn-secondary">
              Add Comment
            </button>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Assigned:</strong> {ticket.assignedTo}</p>

            <button className="btn btn-outline-primary w-100">
              Change Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
