# Customers Management Guide

## 1. Overview
**Purpose**: The Customers screen serves as the central repository for all customer account information, enabling sales and support teams to maintain relationships and track business history.
**User Roles**: Sales Manager (Full Access), Sales Rep (View All, Edit Assigned), Support (View Only).

## 2. Business Process
### Input Data
- **Account Information**: Company name, Type (Enterprise/SMB/Startup), Primary contact details.
- **Status**: Active (currently doing business) or Inactive (dormant account).

### Output Data
- **Customer Database**: Centralized customer records for sales, support, and reporting.
- **Revenue Reports**: Total revenue per customer, segmentation by type.

### Process Flow
1.  **Create Customer**: Sales rep creates a new customer record after first sale or during lead qualification.
2.  **Update Information**: Contact details, billing address, and preferences are maintained over time.
3.  **Track Activity**: All opportunities, orders, and support tickets are linked to the customer record.
4.  **Deactivate**: Mark as inactive if customer churns or goes out of business.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Name** | Text | Yes | Company/organization name. |
| **Type** | Dropdown | Yes | Customer segment (Enterprise, SMB, Startup). |
| **Contact** | Text | Yes | Primary contact person. |
| **Email** | Email | Yes | Primary email address. |
| **Phone** | Phone | No | Primary phone number. |
| **Status** | Dropdown | Yes | Active or Inactive. |
| **Total Revenue** | Number | Read-only | Lifetime revenue from this customer. |
| **Open Opportunities** | Number | Read-only | Count of active sales opportunities. |

### Actions
- **Add Customer**: Opens a modal to create a new customer account.
- **View**: Opens detailed customer profile with history, contacts, and related records.
- **Export (Bulk)**: Export selected customer data to CSV.

### Filters
- **Search**: Filter by Name, Contact, or Email.
- **Type**: Filter by customer segment.
- **Status**: Filter by Active or Inactive.

## 4. Related Screens
### Prerequisites
- **None**: Customers can be created independently.

### Next Steps
- **Opportunities**: To create sales opportunities for this customer.
- **Orders**: To view purchase history and create new orders.
- **Support Tickets**: To manage customer support requests.
