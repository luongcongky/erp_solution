# Opportunities Management Guide

## 1. Overview
**Purpose**: The Opportunities screen helps sales teams manage active deals through the sales pipeline, from initial qualification to close.
**User Roles**: Sales Manager (Full Access), Sales Rep (View/Edit Owned Opportunities).

## 2. Business Process
### Input Data
- **Opportunity Details**: Name, Account, Stage, Value, Probability, Expected Close Date.
- **Owner**: Sales rep responsible for the deal.

### Output Data
- **Pipeline Reports**: Revenue forecasts, win/loss analysis.
- **Closed Deals**: Won or lost opportunities for reporting.

### Process Flow
1.  **Create Opportunity**: Convert a qualified lead or create directly from an account.
2.  **Progress Through Stages**: Move through Qualification → Proposal → Negotiation.
3.  **Update Probability**: Adjust win probability as the deal progresses.
4.  **Close**: Mark as "Closed Won" (customer signed) or "Closed Lost" (deal fell through).

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Name** | Text | Yes | Descriptive name of the opportunity. |
| **Account** | Dropdown | Yes | Associated customer/company. |
| **Stage** | Dropdown | Yes | Current pipeline stage. |
| **Value** | Number | Yes | Estimated deal value in dollars. |
| **Probability** | Number | Yes | Win probability (0-100%). |
| **Expected Close** | Date | Yes | Anticipated closing date. |
| **Owner** | Dropdown | Yes | Sales rep managing this opportunity. |

### Stages
- **Qualification**: Initial assessment of fit and budget.
- **Proposal**: Formal proposal or quote sent to customer.
- **Negotiation**: Discussing terms, pricing, and contract details.
- **Closed Won**: Deal successfully closed.
- **Closed Lost**: Deal lost to competitor or no decision.

### Actions
- **Add Opportunity**: Opens a modal to create a new opportunity.
- **View**: Opens detailed opportunity view with activity timeline.
- **Update Stage (Bulk)**: Move multiple opportunities to a new stage.

### Filters
- **Search**: Filter by Opportunity Name or Account.
- **Stage**: Filter by pipeline stage.

## 4. Related Screens
### Prerequisites
- **Leads**: Opportunities are often created from qualified leads.
- **Customers**: Opportunities must be linked to an existing customer/account.

### Next Steps
- **Quotations**: To generate formal quotes for opportunities.
- **Orders**: To create sales orders from won opportunities.
