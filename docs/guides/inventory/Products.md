# Products Management Guide

## 1. Overview
**Purpose**: The Products screen maintains the master catalog of all items that can be purchased, sold, or used in manufacturing, including pricing, stock levels, and supplier information.
**User Roles**: Inventory Manager (Full Access), Purchasing Team (View/Edit), Sales Team (View Only).

## 2. Business Process
### Input Data
- **Product Details**: SKU, Name, Category, Description, Unit of Measure.
- **Pricing**: Unit price, Cost price, Markup percentage.
- **Inventory**: Current stock quantity, Reorder level, Preferred supplier.

### Output Data
- **Product Catalog**: Centralized database for all business operations.
- **Stock Alerts**: Notifications when stock falls below reorder level.

### Process Flow
1.  **Create Product**: Inventory manager adds a new product to the catalog.
2.  **Set Pricing**: Define unit price and cost for margin calculation.
3.  **Configure Stock**: Set reorder level to trigger automatic purchase requests.
4.  **Monitor Status**: System automatically updates status (Active, Low Stock, Out of Stock).

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **SKU** | Text | Yes | Unique product identifier (Stock Keeping Unit). |
| **Name** | Text | Yes | Product name/description. |
| **Category** | Dropdown | Yes | Product classification (Electronics, Furniture, Office Supplies, Raw Materials). |
| **Unit Price** | Number | Yes | Selling price per unit. |
| **Stock Qty** | Number | Read-only | Current available quantity. |
| **Reorder Level** | Number | Yes | Minimum stock before reorder alert. |
| **Status** | Auto-calculated | Yes | Active, Low Stock, Out of Stock, Discontinued. |
| **Supplier** | Dropdown | No | Preferred supplier for this product. |

### Actions
- **Add Product**: Opens a form to create a new product.
- **Edit**: Modify product details, pricing, or reorder level.
- **Update Price (Bulk)**: Change prices for multiple selected products.

### Filters
- **Search**: Filter by Product Name or SKU.
- **Category**: Filter by product category.
- **Status**: Filter by stock status.

## 4. Related Screens
### Prerequisites
- **Suppliers**: Suppliers should exist to link products to preferred vendors.

### Next Steps
- **Stock Movements**: To view detailed inventory transactions for a product.
- **Purchase Orders**: To order products from suppliers.
