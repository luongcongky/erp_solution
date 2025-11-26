# Stock Movements Guide

## 1. Overview
**Purpose**: The Stock Movements screen provides a complete audit trail of all inventory transactions, showing when, why, and by whom stock levels were changed.
**User Roles**: Inventory Manager (Full Access), Warehouse Staff (View), Auditors (View Only).

## 2. Business Process
### Input Data
- **Movement Details**: Product, Quantity (+ or -), Type (In/Out/Adjustment/Transfer).
- **Reference**: Source document (PO, SO, Work Order, Adjustment).
- **Metadata**: Date/Time, User, Warehouse, Notes.

### Output Data
- **Transaction History**: Complete inventory audit trail.
- **Stock Reports**: Movement analysis, turnover rates.

### Process Flow
1.  **Automatic Recording**: System creates movement records when:
    - Goods are received (Purchase Order → Stock In)
    - Products are shipped (Sales Order → Stock Out)
    - Items are consumed (Work Order → Stock Out)
    - Transfers occur between warehouses
2.  **Manual Adjustments**: Inventory manager creates adjustment records for:
    - Physical count discrepancies
    - Damaged/expired items write-off
    - Found stock
3.  **Audit & Review**: Managers review movements to identify trends or issues.

## 3. Screen Details
### Key Fields
| Field Name | Type | Description |
|------------|------|-------------|
| **Date & Time** | DateTime | When the movement occurred. |
| **Product** | Text | Product name and SKU. |
| **Type** | Text | In (📥), Out (📤), Adjustment (⚙️), Transfer (🔄). |
| **Quantity** | Number | Amount changed (positive for in, negative for out). |
| **Reference** | Text | Source document number (PO-xxx, SO-xxx, ADJ-xxx). |
| **Warehouse** | Text | Location where movement occurred. |
| **User** | Text | Employee who performed or triggered the movement. |
| **Notes** | Text | Additional context or reason. |

### Actions
- **View**: Opens detailed movement record with full context.
- **Stock Adjustment**: Create a manual adjustment record (Manager only).

### Filters
- **Search**: Filter by Product, SKU, or Reference.
- **Type**: Filter by movement type.

## 4. Related Screens
### Prerequisites
- **Products**: Movements are linked to product records.

### Next Steps
- **Products**: To view current stock levels after movements.
- **Purchase Orders/Sales Orders**: To view source documents.
