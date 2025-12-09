# Library Structure (src/lib)

This directory contains the core business logic and utilities for the ERP system, organized following **3-Tier Architecture** principles.

## Directory Structure

```
lib/
├── services/           # Business Logic Layer
├── repositories/       # Data Access Layer
├── utils/             # Utility Functions
├── legacy/            # Deprecated Code
├── adapters/          # Database Adapters (if needed)
├── errors.js          # Custom Error Classes
├── validators.js      # Validation Utilities
├── apiResponse.js     # API Response Helpers
├── tenantContext.js   # Tenant Context Utilities
└── swagger.js         # Swagger Configuration
```

## Layer Descriptions

### 📊 Services (Business Logic Layer)
**Location**: `lib/services/`

Contains business logic, validation, and orchestration. Services use repositories to access data.

**Files**:
- `BaseService.js` - Base class for all services
- `UserService.js` - User management logic
- `RoleService.js` - Role management logic
- `MenuService.js` - Menu management logic
- `LanguageService.js` - Language management logic
- `TranslationService.js` - Translation management logic
- `ProductService.js` - Product management logic

**Example**:
```javascript
import { getUserService } from '@/lib/services/UserService';

const userService = getUserService();
const user = await userService.createUser(userData, tenantContext);
```

### 💾 Repositories (Data Access Layer)
**Location**: `lib/repositories/`

Handles all database operations using Drizzle ORM. No business logic here.

**Files**:
- `BaseRepository.js` - Base class with CRUD operations
- `UserRepository.js` - User data access
- `RoleRepository.js` - Role data access
- `MenuRepository.js` - Menu data access
- `LanguageRepository.js` - Language data access
- `TranslationRepository.js` - Translation data access
- `ProductRepository.js` - Product data access

**Example**:
```javascript
import { getUserRepository } from '@/lib/repositories/UserRepository';

const userRepo = getUserRepository();
const users = await userRepo.findAll({}, tenantContext);
```

### 🛠️ Utils (Utility Functions)
**Location**: `lib/utils/`

Pure utility functions that don't fit into services or repositories.

**Files**:
- `menuHelpers.js` - Menu tree building, filtering
- `multiCompany.js` - Multi-tenant utilities

**Example**:
```javascript
import { buildMenuTree } from '@/lib/utils/menuHelpers';

const menuTree = buildMenuTree(flatMenuList);
```

### 🗑️ Legacy (Deprecated Code)
**Location**: `lib/legacy/`

Old code kept for reference. **Do not use in new code**.

**Files**:
- `apiHelpers.js` - Old Sequelize-based helpers (use BaseRepository/BaseService instead)
- `db.js` - Old adapter pattern (use `@/db` instead)

### 🔧 Core Utilities

#### errors.js
Custom error classes for better error handling:
```javascript
import { ValidationError, NotFoundError } from '@/lib/errors';

throw new ValidationError('Email is required');
throw new NotFoundError('User', userId);
```

#### validators.js
Validation utilities:
```javascript
import { validateEmail, validateRequired } from '@/lib/validators';

validateEmail(email);
validateRequired(['name', 'email'], data);
```

#### apiResponse.js
Standardized API responses:
```javascript
import * as apiResponse from '@/lib/apiResponse';

return apiResponse.success(data);
return apiResponse.error(error);
return apiResponse.paginated(data, pagination);
```

#### tenantContext.js
Tenant context helpers:
```javascript
import { extractTenantContext } from '@/lib/tenantContext';

const tenantContext = extractTenantContext(request);
// { ten_id: '1000', stg_id: 'DEV' }
```

## Usage Guidelines

### ✅ DO:
- Use services in API routes
- Use repositories in services
- Keep business logic in services
- Keep data access in repositories
- Use utils for pure functions

### ❌ DON'T:
- Call repositories directly from API routes
- Put business logic in repositories
- Put data access in services (use repositories)
- Use legacy code in new features

## Adding New Modules

1. Create Repository in `lib/repositories/`
2. Create Service in `lib/services/`
3. Use Service in API route

Example for a new "Customer" module:

```javascript
// 1. lib/repositories/CustomerRepository.js
import { BaseRepository } from './BaseRepository.js';
import { customers } from '@/db/schema/sales';

export class CustomerRepository extends BaseRepository {
    constructor() {
        super(customers, 'Customer');
    }
}

// 2. lib/services/CustomerService.js
import { BaseService } from './BaseService.js';
import { getCustomerRepository } from '../repositories/CustomerRepository.js';

export class CustomerService extends BaseService {
    constructor() {
        super(getCustomerRepository());
    }
}

// 3. app/api/customers/route.js
import { getCustomerService } from '@/lib/services/CustomerService';

export async function GET(request) {
    const service = getCustomerService();
    const result = await service.getAll(tenantContext);
    return apiResponse.success(result.data);
}
```

## Migration from Legacy Code

If you find code using legacy patterns:

**Old (Legacy)**:
```javascript
import { handleList } from '@/lib/apiHelpers';
const result = await handleList(Model, request);
```

**New (3-Tier)**:
```javascript
import { getCustomerService } from '@/lib/services/CustomerService';
const service = getCustomerService();
const result = await service.getAll(tenantContext);
```
