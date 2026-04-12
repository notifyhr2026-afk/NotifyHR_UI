// src/types/helpdesk.ts
export interface Ticket {
  ticketId: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  assignedTo?: string;
  createdAt: string;  
  remarks?: string;
}
