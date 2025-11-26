# Support Tickets Guide

## 1. Overview
**Purpose**: The Support Tickets screen manages customer support requests, tracking issues from submission to resolution.
**User Roles**: Support Team (Full Access), Customers (View/Create Own), Managers (View All).

## 2. Business Process
### Input Data
- **Ticket Details**: Customer, Subject, Description, Priority.
- **Assignment**: Support agent, Category.

### Output Data
- **Resolution History**: Closed tickets with solutions.
- **Support Metrics**: Response time, resolution time, customer satisfaction.

### Process Flow
1.  **Create Ticket**: Customer or support agent creates a ticket.
2.  **Assign**: Ticket routed to appropriate support agent based on category.
3.  **Investigate**: Agent communicates with customer, troubleshoots issue.
4.  **Resolve**: Agent provides solution, marks as resolved.
5.  **Close**: Customer confirms resolution, ticket closed.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Ticket #** | Auto-generated | Yes | Unique ticket identifier. |
| **Customer** | Dropdown | Yes | Customer who reported the issue. |
| **Subject** | Text | Yes | Brief description of the issue. |
| **Status** | Dropdown | Yes | Open, In Progress, Resolved, Closed. |
| **Priority** | Dropdown | Yes | High, Medium, Low. |
| **Assignee** | Dropdown | Yes | Support agent handling the ticket. |
| **Created Date** | DateTime | Auto | When ticket was created. |
| **Last Update** | DateTime | Auto | Last activity timestamp. |

### Actions
- **New Ticket**: Opens a form to create a support ticket.
- **View**: Opens detailed ticket with conversation history and attachments.
- **Assign (Bulk)**: Assign multiple tickets to a support agent.

### Filters
- **Search**: Filter by Ticket Number, Customer, or Subject.
- **Status**: Filter by ticket status.
- **Priority**: Filter by priority level.

## 4. Related Screens
### Prerequisites
- **Customers**: Ticket must be linked to a customer.

### Next Steps
- **Knowledge Base**: To document solutions for common issues.
