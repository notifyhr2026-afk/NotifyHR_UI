// src/pages/helpdesk/CreateTicket.tsx
export default function CreateTicket() {
  return (
    <div className="container mt-4">
      <h3>Create Ticket</h3>
      <form className="card p-3">
        <div className="mb-2">
          <label>Category</label>
          <select className="form-select">
            <option>IT</option>
            <option>Payroll</option>
          </select>
        </div>

        <div className="mb-2">
          <label>Priority</label>
          <select className="form-select">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="mb-2">
          <label>Subject</label>
          <input className="form-control" />
        </div>

        <div className="mb-2">
          <label>Description</label>
          <textarea className="form-control" rows={4} />
        </div>

        <button className="btn btn-primary mt-2">
          Submit Ticket
        </button>
      </form>
    </div>
  );
}
