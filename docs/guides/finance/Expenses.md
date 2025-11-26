# Expenses Management Guide

## 1. Overview
**Purpose**: The Expenses screen allows employees to submit expense claims for reimbursement and enables managers to review and approve them.
**User Roles**: All Employees (Submit Own), Managers (Approve Team), Finance (View All, Process Payments).

## 2. Business Process
### Input Data
- **Expense Details**: Category, Description, Amount, Date, Receipt attachment.
- **Submitter**: Employee who incurred the expense.

### Output Data
- **Approved Claims**: Ready for reimbursement payment.
- **Expense Reports**: Spending analysis by category, department, employee.

### Process Flow
1.  **Submit Claim**: Employee creates expense record with receipt.
2.  **Manager Review**: Manager approves or rejects based on policy.
3.  **Finance Processing**: Finance team processes approved expenses for payment.
4.  **Reimbursement**: Payment made to employee.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Expense ID** | Auto-generated | Yes | Unique expense identifier. |
| **Employee** | Auto-filled | Yes | Employee who submitted the claim. |
| **Category** | Dropdown | Yes | Travel, Meals, Supplies, Training, etc. |
| **Description** | Text | Yes | Details of the expense. |
| **Amount** | Number | Yes | Expense amount. |
| **Date** | Date | Yes | When the expense was incurred. |
| **Status** | Auto-updated | Yes | Pending, Approved, Rejected. |
| **Approver** | Auto-filled | No | Manager who approved/rejected. |

### Actions
- **New Expense**: Opens a form to submit an expense claim.
- **View**: Opens detailed expense with receipt image and approval history.
- **Approve (Bulk)**: Approve multiple pending expenses (Manager only).

### Filters
- **Search**: Filter by Expense ID, Employee, or Description.
- **Category**: Filter by expense category.
- **Status**: Filter by approval status.

## 4. Related Screens
### Prerequisites
- **Employees**: Submitter must be an active employee.

### Next Steps
- **Payments**: To process reimbursement payments.
