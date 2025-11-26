# Audit Logs Guide

## 1. Overview
**Purpose**: The Audit Logs screen provides a comprehensive history of all significant actions taken within the ERP system. It is essential for security auditing, troubleshooting, and compliance.
**User Roles**: Admin (Full Access), Auditor (View Only).

## 2. Business Process
### Input Data
- **System Events**: Automatically captured by the system when users perform actions (e.g., Login, Create, Update, Delete).

### Output Data
- **Log Records**: Immutable records of who did what, when, and from where.

### Process Flow
1.  **Action Occurs**: A user performs an action (e.g., updates an order).
2.  **Log Capture**: The system records the event details (User, Timestamp, Action, Old Value, New Value, IP).
3.  **Review**: Admin or Auditor reviews the logs to investigate issues or monitor activity.

## 3. Screen Details
### Key Fields
| Field Name | Type | Description |
|------------|------|-------------|
| **Timestamp** | DateTime | Exact time the event occurred. |
| **User** | Text | Name of the user who performed the action. |
| **Action** | Text | Type of action (e.g., LOGIN, CREATE, UPDATE, DELETE). |
| **Resource** | Text | The specific item affected (e.g., Order #123). |
| **IP Address** | Text | Source IP address of the request. |
| **Details** | Text | Additional context or changes made. |

### Actions
- **View Details**: (Future) Click to see full JSON payload of the change.
- **Export**: Download logs as CSV for external analysis.
- **Filter**: Search by User, Action, or Date Range.

## 4. Related Screens
### Prerequisites
- **None**: Logs are generated automatically.

### Next Steps
- **Users**: To investigate a specific user found in the logs.
