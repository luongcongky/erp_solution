# Employees Management Guide

## 1. Overview
**Purpose**: The Employees screen maintains the master database of all company personnel, including contact information, job details, and employment status.
**User Roles**: HR Manager (Full Access), Department Managers (View Team), Employees (View Self).

## 2. Business Process
### Input Data
- **Personal Info**: Name, Email, Phone, Address, Emergency contact.
- **Employment Details**: Employee ID, Department, Position, Hire date, Salary.
- **Status**: Active, On Leave, Terminated.

### Output Data
- **Employee Directory**: Centralized contact and org chart information.
- **HR Reports**: Headcount, turnover, department distribution.

### Process Flow
1.  **Onboarding**: HR creates employee record during hiring process.
2.  **Maintain Records**: Update contact info, promotions, transfers.
3.  **Leave Management**: Mark as "On Leave" for extended absences.
4.  **Offboarding**: Change status to "Terminated" when employee leaves.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Employee ID** | Auto-generated | Yes | Unique employee identifier. |
| **Name** | Text | Yes | Full name. |
| **Email** | Email | Yes | Company email address. |
| **Phone** | Phone | Yes | Contact phone number. |
| **Department** | Dropdown | Yes | Organizational department. |
| **Position** | Text | Yes | Job title. |
| **Status** | Dropdown | Yes | Active, On Leave, Terminated. |
| **Hire Date** | Date | Yes | Employment start date. |

### Actions
- **Add Employee**: Opens a form to create a new employee record.
- **View**: Opens detailed employee profile with full information and history.
- **Export (Bulk)**: Export selected employee data to CSV.

### Filters
- **Search**: Filter by Name, Employee ID, or Email.
- **Department**: Filter by department.
- **Status**: Filter by employment status.

## 4. Related Screens
### Prerequisites
- **None**: Employees can be created independently.

### Next Steps
- **Attendance**: To track employee attendance and time off.
- **Payroll**: To process employee salaries.
