# Users Management Guide

## 1. Overview
**Purpose**: The Users Management screen allows administrators to manage user accounts, assign roles, and monitor user activity within the ERP system.
**User Roles**: Admin (Full Access), HR Manager (View Only).

## 2. Business Process
### Input Data
- **User Details**: Name, Email, Password (initial), Role, Department.
- **Status**: Active/Inactive.

### Output Data
- **User Accounts**: Created or updated user records in the database.
- **Access Control**: Users gain or lose access to modules based on assigned roles.

### Process Flow
1.  **Create User**: Admin clicks "Add User", fills in details, and assigns a role.
2.  **Update User**: Admin edits user details (e.g., change role, reset password).
3.  **Deactivate User**: Admin changes status to "Inactive" to prevent login.
4.  **Monitor**: Admin views "Last Login" to track user activity.

## 3. Screen Details
### Key Fields
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| **Name** | Text | Yes | Full name of the user. |
| **Email** | Email | Yes | Unique email address used for login. |
| **Role** | Dropdown | Yes | Determines access permissions (e.g., Admin, User). |
| **Status** | Dropdown | Yes | Active (can login) or Inactive (cannot login). |

### Actions
- **Add User**: Opens a modal to create a new user account.
- **Edit**: Modifies existing user information.
- **Delete**: Permanently removes a user (use with caution; prefer deactivation).
- **Bulk Delete**: Delete multiple selected users at once.

### Filters
- **Search**: Filter by Name or Email.
- **Role**: Filter by specific user roles.
- **Status**: Filter by Active or Inactive status.

## 4. Related Screens
### Prerequisites
- **Roles**: Roles must be defined before assigning them to users.

### Next Steps
- **Audit Logs**: To view detailed activity logs for specific users.
