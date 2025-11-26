# Invoices Management Guide

## 1. Overview
**Purpose**: The Invoices screen manages both accounts receivable (sales invoices) and accounts payable (purchase bills), tracking payment status and due dates.
**User Roles**: Accountant (Full Access), Finance Manager (Full Access), Sales/Purchasing (View Related).

## 2. Business Process
### Input Data
- **Invoice Details**: Number, Customer/Vendor, Line items, Amount, Tax.
- **Payment Terms**: Issue date, Due date, Payment method.

### Output Data
- **Financial Records**: Revenue and expense tracking.
- **Aging Reports**: Overdue invoices for collection follow-up.

### Process Flow
1.  **Create Invoice**: System auto-generates from sales/purchase orders or manual entry.
2.  **Send to Customer/Receive from Vendor**: Email invoice or record received bill.
3.  **Track Payment**: Monitor due dates, send reminders for overdue invoices.
4.  **Record Payment**: Mark as paid when payment received/made.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Invoice #** | Auto-generated | Yes | Unique invoice identifier. |
| **Customer/Vendor** | Dropdown | Yes | Party being invoiced or invoicing us. |
| **Type** | Auto-set | Yes | Sales (outgoing) or Purchase (incoming). |
| **Amount** | Calculated | Yes | Total invoice amount including tax. |
| **Status** | Auto-updated | Yes | Pending, Paid, Overdue, Cancelled. |
| **Issue Date** | Date | Yes | Invoice creation date. |
| **Due Date** | Date | Yes | Payment deadline. |
| **Paid Date** | Date | No | When payment was received/made. |

### Actions
- **New Invoice**: Create a sales invoice or record a purchase bill.
- **View**: Opens detailed invoice with line items and payment history.
- **Mark as Paid (Bulk)**: Record payment for multiple invoices.

### Filters
- **Search**: Filter by Invoice Number or Customer/Vendor.
- **Type**: Filter by Sales or Purchase.
- **Status**: Filter by payment status.

## 4. Related Screens
### Prerequisites
- **Customers/Suppliers**: Invoice parties must exist.
- **Sales Orders/Purchase Orders**: Invoices often generated from orders.

### Next Steps
- **Payments**: To record payment transactions.
