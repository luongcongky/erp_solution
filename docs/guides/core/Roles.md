# Roles Management Guide

## 1. Overview
**Purpose**: The Roles Management screen allows administrators to define user roles and assign specific permissions to control access to various modules and features within the ERP system.
**User Roles**: Admin (Full Access).

## 2. Business Process
### Input Data
- **Role Name**: Unique identifier for the role (e.g., Sales Manager).
- **Description**: Brief explanation of the role's purpose.
- **Permissions**: List of allowed actions (View, Create, Edit, Delete) per module.

### Output Data
- **Role Definitions**: Stored role configurations used for access control checks.

### Process Flow
1.  **Create Role**: Admin defines a new role and selects applicable permissions.
2.  **Assign Role**: Admin assigns the role to users via the User Management screen.
3.  **Update Role**: Admin modifies permissions as business needs change.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Role Name** | Text | Yes | Name of the role. |
| **Description** | Text | No | Details about the role's scope. |
| **Users** | Number | Read-only | Count of users currently assigned to this role. |

### Actions
- **Add Role**: Opens a modal to create a new role.
- **Edit**: Modifies role name, description, or permissions.
- **Delete**: Removes a role (only if no users are assigned; System roles cannot be deleted).

## 4. Related Screens
### Prerequisites
- **None**: Roles are a foundational element.

### Next Steps
- **Users**: To assign the newly created roles to user accounts.
