# PostgreSQL Configuration Guide

## Required Configuration

Add the following to your `.env.local` file:

```env
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=erp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123456
```

## Instructions

1. **Update `.env.local`**: Add the PostgreSQL configuration above
2. **Set Password**: Replace `your_password_here` with your actual PostgreSQL password
3. **Verify PostgreSQL is Running**: Ensure PostgreSQL server is active on your machine
4. **Database Creation**: The `erp` database will be created automatically if it doesn't exist

##Next Steps

After updating `.env.local`, run:
```bash
node scripts/migrate-mongo-to-postgres.js
```

This will:
- Connect to both MongoDB and PostgreSQL
- Export all data from MongoDB
- Transform and import into PostgreSQL
- Provide migration statistics

## Rollback

If migration fails, your MongoDB data remains intact and unchanged.
