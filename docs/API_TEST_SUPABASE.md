# API Test Supabase Connection

## Endpoint

```
GET /api/test-supabase
```

## Mô tả

API endpoint để kiểm tra kết nối tới Supabase PostgreSQL database một cách toàn diện. API này thực hiện 8 health checks khác nhau và trả về thông tin chi tiết về trạng thái kết nối.

## Các kiểm tra được thực hiện

### 1. Basic Connection Test
- Kiểm tra kết nối cơ bản tới database
- Thực hiện query đơn giản `SELECT 1`

### 2. Database Information
- PostgreSQL version
- Database name
- Current user
- Server IP và port

### 3. Connection Pool Stats
- Total connections
- Idle connections
- Waiting connections

### 4. Core Schema Check
- Kiểm tra schema `core` có tồn tại không
- Đếm số lượng tables trong schema

### 5. Users Table Test
- Kiểm tra truy cập vào bảng `core.users`
- Đếm số lượng users

### 6. Time Synchronization
- So sánh thời gian database vs local time
- Tính time difference (ms)

### 7. Connection Source
- Xác định nguồn connection string (DATABASE_URL, SUPABASE_DATABASE_URL, hoặc POSTGRES_* variables)

### 8. Performance Check
- Đo response time của tất cả checks

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "timestamp": "2025-12-04T09:53:20.000Z",
  "environment": "development",
  "message": "All Supabase connection tests passed",
  "checks": {
    "basicConnection": {
      "status": "success",
      "message": "Basic connection successful"
    },
    "databaseInfo": {
      "status": "success",
      "message": "Database info retrieved"
    },
    "connectionPool": {
      "status": "success",
      "message": "Pool: 2 total, 1 idle, 0 waiting"
    },
    "coreSchema": {
      "status": "success",
      "message": "Core schema exists"
    },
    "coreTables": {
      "status": "success",
      "message": "Found 17 tables in core schema"
    },
    "usersTable": {
      "status": "success",
      "message": "Users table accessible, 3 users found"
    },
    "timeSync": {
      "status": "success",
      "message": "Time difference: 125ms"
    },
    "connectionSource": {
      "status": "info",
      "message": "Using SUPABASE_DATABASE_URL"
    },
    "performance": {
      "status": "success",
      "message": "Response time: 456ms"
    }
  },
  "connectionInfo": {
    "postgresVersion": "PostgreSQL 17.6 on aarch64-unknown-linux-gnu",
    "databaseName": "postgres",
    "currentUser": "postgres",
    "serverIp": "10.0.1.5",
    "serverPort": 5432,
    "poolStats": {
      "totalCount": 2,
      "idleCount": 1,
      "waitingCount": 0
    },
    "coreTableCount": 17,
    "userCount": 3,
    "databaseTime": "2025-12-04T09:53:20.123Z",
    "localTime": "2025-12-04T09:53:20.248Z",
    "timeDifferenceMs": 125,
    "connectionSource": "SUPABASE_DATABASE_URL",
    "responseTimeMs": 456
  },
  "error": null
}
```

### Error Response (500)

```json
{
  "success": false,
  "timestamp": "2025-12-04T09:53:20.000Z",
  "environment": "production",
  "checks": {},
  "connectionInfo": {},
  "error": {
    "message": "connect ECONNREFUSED 127.0.0.1:5432",
    "code": "ECONNREFUSED",
    "detail": null,
    "hint": null,
    "suggestion": "Database server is not reachable. Check host and port."
  }
}
```

## Error Codes và Suggestions

| Error Code | Ý nghĩa | Suggestion |
|------------|---------|------------|
| `ECONNREFUSED` | Không kết nối được tới server | Check host và port, đảm bảo database đang chạy |
| `28P01` | Authentication failed | Check username và password |
| `3D000` | Database không tồn tại | Check database name |
| `ETIMEDOUT` | Connection timeout | Check network và firewall settings |

## Cách sử dụng

### 1. Local Development

```bash
# Start dev server
npm run dev

# Test API
curl http://localhost:3000/api/test-supabase
```

### 2. Production (Vercel)

```bash
curl https://your-app.vercel.app/api/test-supabase
```

### 3. Từ Browser

Truy cập trực tiếp:
```
http://localhost:3000/api/test-supabase
```

### 4. Từ Code

```javascript
const response = await fetch('/api/test-supabase');
const data = await response.json();

if (data.success) {
  console.log('✅ Database connected');
  console.log('Response time:', data.connectionInfo.responseTimeMs, 'ms');
  console.log('User count:', data.connectionInfo.userCount);
} else {
  console.error('❌ Database connection failed');
  console.error('Error:', data.error.message);
  console.error('Suggestion:', data.error.suggestion);
}
```

## Use Cases

### 1. Health Check
Sử dụng để kiểm tra trạng thái database trong monitoring systems:
```bash
# Cron job để check health mỗi 5 phút
*/5 * * * * curl -f https://your-app.vercel.app/api/test-supabase || alert
```

### 2. Deployment Verification
Sau khi deploy, verify database connection:
```bash
# CI/CD pipeline
npm run build
npm run start &
sleep 5
curl http://localhost:3000/api/test-supabase | jq '.success'
```

### 3. Troubleshooting
Khi gặp lỗi database, check API này để có thông tin chi tiết:
- Connection pool có đầy không?
- Time sync có vấn đề không?
- Schema và tables có đúng không?

### 4. Performance Monitoring
Track response time để phát hiện performance issues:
```javascript
// Log response time
const { connectionInfo } = await fetch('/api/test-supabase').then(r => r.json());
console.log('DB response time:', connectionInfo.responseTimeMs, 'ms');
```

## So sánh với `/api/test-db`

| Feature | `/api/test-db` | `/api/test-supabase` |
|---------|----------------|---------------------|
| Basic connection test | ✅ | ✅ |
| Database info | ❌ | ✅ |
| Connection pool stats | ❌ | ✅ |
| Schema validation | ❌ | ✅ |
| Table count | ✅ (menus only) | ✅ (all core tables) |
| Users table test | ❌ | ✅ |
| Time sync check | ❌ | ✅ |
| Connection source | ❌ | ✅ |
| Performance metrics | ❌ | ✅ |
| Error diagnostics | Basic | Detailed with suggestions |

## Notes

- API này **không yêu cầu authentication** để dễ dàng troubleshooting
- Nên **hạn chế expose** trên production hoặc thêm authentication
- Response time bình thường: **< 1000ms**
- Nếu response time > 1000ms, có thể có vấn đề về network hoặc database performance

## Security Considerations

> [!WARNING]
> **Production Deployment**
> 
> API này expose thông tin về database. Khuyến nghị:
> 1. Thêm authentication/authorization
> 2. Hoặc chỉ enable trong development environment
> 3. Hoặc restrict bằng IP whitelist

### Option 1: Disable in Production

```javascript
export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Not available in production' },
            { status: 403 }
        );
    }
    // ... rest of code
}
```

### Option 2: Add Authentication

```javascript
export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    // ... rest of code
}
```

## Troubleshooting

### Warning vẫn còn sau khi update module

Nếu warning `baseline-browser-mapping` vẫn xuất hiện:
1. Version 2.9.0 có thể là version mới nhất hiện có
2. Data trong module này thực sự đã cũ hơn 2 tháng
3. Đây là limitation của module, không phải lỗi của bạn
4. Warning này **không ảnh hưởng** functionality
5. Có thể bỏ qua hoặc suppress warning

### Dev server không chạy

Nếu không test được API:
```bash
# Start dev server
npm run dev

# Trong terminal khác
curl http://localhost:3000/api/test-supabase
```
