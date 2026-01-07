// src/data/mockTickets.ts
import { Ticket } from '../types/helpdesk';

export const mockTickets: Ticket[] = [
  {
    ticketId: 1,
    ticketNumber: 'HD-1001',
    subject: 'Login issue',
    description: 'Unable to login to HR portal',
    status: 'Open',
    priority: 'High',
    category: 'IT',
    assignedTo: 'John Agent',
    createdAt: '2026-01-01'
  },
  {
    ticketId: 2,
    ticketNumber: 'HD-1002',
    subject: 'Payslip missing',
    description: 'December payslip not available',
    status: 'In Progress',
    priority: 'Medium',
    category: 'Payroll',
    assignedTo: 'Mary Agent',
    createdAt: '2026-01-02'
  }
];
