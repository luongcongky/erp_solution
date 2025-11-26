# Projects Management Guide

## 1. Overview
**Purpose**: The Projects screen enables teams to plan, execute, and monitor projects from initiation to completion, tracking progress, budgets, and deliverables.
**User Roles**: Project Manager (Full Access), Team Members (View Assigned), Executives (View All).

## 2. Business Process
### Input Data
- **Project Details**: Name, Client, Start/End dates, Budget, Priority.
- **Team**: Project manager, Team members.
- **Deliverables**: Tasks, Milestones, Dependencies.

### Output Data
- **Project Status**: Real-time progress, budget utilization.
- **Reports**: Timeline adherence, resource allocation, profitability.

### Process Flow
1.  **Initiate Project**: PM creates project record with scope and budget.
2.  **Plan Tasks**: Break down project into tasks with assignments and deadlines.
3.  **Execute**: Team completes tasks, PM monitors progress.
4.  **Track Budget**: System calculates spent vs. budget based on time entries and expenses.
5.  **Close**: Mark project as completed when all tasks are done.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Name** | Text | Yes | Project name/title. |
| **Client** | Dropdown | Yes | Customer or "Internal" for internal projects. |
| **Manager** | Dropdown | Yes | Project manager responsible. |
| **Status** | Dropdown | Yes | Planning, In Progress, On Hold, Completed. |
| **Priority** | Dropdown | Yes | High, Medium, Low. |
| **Progress** | Calculated | Read-only | Percentage of completed tasks. |
| **Budget** | Number | Yes | Total allocated budget. |
| **Spent** | Calculated | Read-only | Total expenses and time costs. |
| **Start Date** | Date | Yes | Project start date. |
| **End Date** | Date | Yes | Expected completion date. |
| **Tasks** | Number | Read-only | Total task count. |
| **Completed Tasks** | Number | Read-only | Number of finished tasks. |

### Actions
- **New Project**: Opens a form to create a project.
- **View**: Opens detailed project dashboard with Gantt chart, task list, and budget breakdown.
- **Update Status (Bulk)**: Change status for multiple projects.

### Filters
- **Search**: Filter by Project Name, Client, or Manager.
- **Status**: Filter by project status.
- **Priority**: Filter by priority level.

## 4. Related Screens
### Prerequisites
- **Customers**: Client must exist if project is for external customer.

### Next Steps
- **Tasks**: To view and manage project tasks.
- **Timesheets**: To track time spent on project activities.
