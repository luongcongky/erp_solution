# Purchase Requests Guide

## 1. Overview
**Purpose**: The Purchase Requests screen allows employees to submit internal requisitions for goods or services, which then go through an approval workflow before being converted to purchase orders.
**User Roles**: All Employees (Create), Department Managers (Approve), Purchasing Team (Convert to PO).

## 2. Business Process
### Input Data
- **Request Details**: Items needed, quantities, estimated costs, required delivery date.
- **Requester Info**: Employee name, department, justification.
- **Priority**: High/Medium/Low urgency.

### Output Data
- **Approved Requests**: Ready to be converted to RFQs or Purchase Orders.
- **Spending Reports**: Budget tracking by department.

### Process Flow
1.  **Submit Request**: Employee creates a new purchase request listing needed items.
2.  **Manager Approval**: Department manager reviews and approves/rejects based on budget.
3.  **Purchasing Review**: Purchasing team converts approved requests to RFQs or direct POs.
4.  **Track Status**: Requester can monitor progress from pending → approved → in RFQ → ordered.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **PR Number** | Auto-generated | Yes | Unique purchase request identifier. |
| **Requested By** | Auto-filled | Yes | Employee submitting the request. |
| **Department** | Auto-filled | Yes | Requester's department. |
| **Items** | List | Yes | Line items with product, quantity, estimated price. |
| **Total Amount** | Calculated | Yes | Sum of all line items. |
| **Priority** | Dropdown | Yes | High, Medium, or Low. |
| **Required By** | Date | Yes | Date when items are needed. |
| **Status** | Auto-updated | Yes | Pending, Approved, In RFQ, Rejected. |

### Actions
- **New Request**: Opens a form to create a purchase request.
- **View**: Opens detailed request with line items and approval history.
- **Approve (Bulk)**: Approve multiple pending requests at once (Manager only).

### Filters
- **Search**: Filter by PR Number, Requester, or Department.
- **Status**: Filter by approval status.
- **Priority**: Filter by urgency level.

## 4. Related Screens
### Prerequisites
- **Products**: Items must exist in the product catalog to be requested.

### Next Steps
- **RFQ**: Approved requests can be converted to Request for Quotation.
- **Purchase Orders**: Direct conversion to PO for known suppliers.
