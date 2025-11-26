# Suppliers Management Guide

## 1. Overview
**Purpose**: The Suppliers screen maintains a database of all vendors and service providers, tracking performance, contact information, and purchase history.
**User Roles**: Purchasing Manager (Full Access), Purchasing Team (View/Edit), Accounts Payable (View Only).

## 2. Business Process
### Input Data
- **Supplier Information**: Company name, Category, Primary contact, Payment terms.
- **Performance Data**: Rating (1-5 stars), On-time delivery %, Quality score.

### Output Data
- **Vendor Database**: Centralized supplier records for procurement decisions.
- **Supplier Reports**: Spending analysis, performance comparisons.

### Process Flow
1.  **Add Supplier**: Purchasing team creates a new supplier record after vetting.
2.  **Maintain Information**: Update contact details, payment terms, and certifications.
3.  **Track Performance**: Rate suppliers based on delivery, quality, and service.
4.  **Deactivate**: Mark as inactive if relationship ends or supplier goes out of business.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Name** | Text | Yes | Supplier company name. |
| **Category** | Dropdown | Yes | Type of goods/services (Electronics, Office Supplies, Raw Materials, Services). |
| **Contact** | Text | Yes | Primary contact person. |
| **Email** | Email | Yes | Primary email address. |
| **Phone** | Phone | No | Primary phone number. |
| **Rating** | Number | No | Performance rating (1-5 stars). |
| **Status** | Dropdown | Yes | Active or Inactive. |
| **Total Orders** | Number | Read-only | Count of purchase orders placed. |
| **Total Spent** | Number | Read-only | Lifetime spending with this supplier. |

### Actions
- **Add Supplier**: Opens a modal to create a new supplier.
- **View**: Opens detailed supplier profile with order history and performance metrics.
- **Export (Bulk)**: Export selected supplier data to CSV.

### Filters
- **Search**: Filter by Name, Contact, or Email.
- **Category**: Filter by supplier category.
- **Status**: Filter by Active or Inactive.

## 4. Related Screens
### Prerequisites
- **None**: Suppliers can be created independently.

### Next Steps
- **RFQ**: To send requests for quotation to suppliers.
- **Purchase Orders**: To create purchase orders for selected suppliers.
