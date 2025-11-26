# Tasks Management Guide

## 1. Overview
**Purpose**: The Tasks screen breaks down projects into actionable work items, assigns them to team members, and tracks completion and time spent.
**User Roles**: Project Manager (Full Access), Team Members (View/Edit Assigned), Team Leads (View Team Tasks).

## 2. Business Process
### Input Data
- **Task Details**: Title, Description, Project, Estimated hours.
- **Assignment**: Assignee, Due date, Priority.
- **Dependencies**: Predecessor tasks (optional).

### Output Data
- **Task Status**: Real-time progress updates.
- **Time Tracking**: Actual hours vs. estimated for budget control.

### Process Flow
1.  **Create Task**: PM breaks down project into tasks with clear deliverables.
2.  **Assign**: Assign task to team member with due date and priority.
3.  **Execute**: Team member works on task, updates status (To Do → In Progress → Completed).
4.  **Track Time**: Team logs hours spent via timesheets.
5.  **Review**: PM monitors overdue tasks and time overruns.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Title** | Text | Yes | Task name/description. |
| **Project** | Dropdown | Yes | Parent project. |
| **Assignee** | Dropdown | Yes | Team member responsible. |
| **Status** | Dropdown | Yes | To Do, In Progress, Blocked, Completed. |
| **Priority** | Dropdown | Yes | High, Medium, Low. |
| **Due Date** | Date | Yes | Deadline for completion. |
| **Estimated Hours** | Number | Yes | Expected time to complete. |
| **Actual Hours** | Calculated | Read-only | Sum of timesheet entries. |

### Actions
- **New Task**: Opens a form to create a task.
- **Edit**: Modify task details, reassign, or change due date.
- **Update Status (Bulk)**: Change status for multiple tasks.

### Filters
- **Search**: Filter by Task Title, Project, or Assignee.
- **Status**: Filter by task status.
- **Priority**: Filter by priority level.

## 4. Related Screens
### Prerequisites
- **Projects**: Tasks must be linked to a project.
- **Users**: Assignees must be active users.

### Next Steps
- **Timesheets**: To log hours worked on tasks.
