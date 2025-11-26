# Leads Management Guide

## 1. Overview
**Purpose**: The Leads Management screen allows sales teams to capture, track, and nurture potential customers (leads) through the sales pipeline.
**User Roles**: Sales Manager (Full Access), Sales Rep (View/Edit Assigned Leads).

## 2. Business Process
### Input Data
- **Lead Information**: Name, Company, Email, Phone, Source.
- **Qualification Data**: Estimated value, Status, Assigned sales rep.

### Output Data
- **Qualified Leads**: Leads ready to be converted to Opportunities.
- **Activity Reports**: Lead source performance, conversion rates.

### Process Flow
1.  **Capture Lead**: Sales rep or automated system creates a new lead record.
2.  **Contact Lead**: Sales rep reaches out via email/phone and updates status to "Contacted".
3.  **Qualify Lead**: After initial conversation, rep assesses fit and updates status to "Qualified" or "Lost".
4.  **Convert to Opportunity**: Qualified leads are converted to formal sales opportunities.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Name** | Text | Yes | Full name of the lead contact. |
| **Company** | Text | Yes | Company name. |
| **Email** | Email | Yes | Primary email address. |
| **Phone** | Phone | No | Contact phone number. |
| **Status** | Dropdown | Yes | Current stage (New, Contacted, Qualified, Lost). |
| **Source** | Dropdown | Yes | How the lead was acquired (Website, Referral, LinkedIn, Cold Call). |
| **Est. Value** | Number | No | Estimated deal value in dollars. |
| **Assigned To** | Dropdown | Yes | Sales rep responsible for this lead. |

### Actions
- **Add Lead**: Opens a modal to create a new lead.
- **View**: Opens detailed lead profile with activity history.
- **Assign (Bulk)**: Reassign multiple selected leads to a different sales rep.
- **Delete (Bulk)**: Remove multiple leads at once.

### Filters
- **Search**: Filter by Name, Company, or Email.
- **Status**: Filter by lead status.
- **Source**: Filter by acquisition source.

## 4. Related Screens
### Prerequisites
- **Users**: Sales reps must exist to assign leads.

### Next Steps
- **Opportunities**: To convert qualified leads into formal sales opportunities.
