# Fix: API Routes Redirecting to Login

## Vấn đề

Khi truy cập `/api/test-supabase` (hoặc bất kỳ API route nào) trên production, hệ thống tự động redirect về trang login.

## Nguyên nhân

File `src/components/AuthProvider.js` có logic redirect (lines 135-147) kiểm tra authentication cho **tất cả routes**, bao gồm cả API routes.

### Code cũ (Có lỗi):

```javascript
// Handle redirects
useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/auth';
    const isPublicPage = pathname === '/api-docs' || pathname.startsWith('/api-docs');

    if (!user && !isAuthPage && !isPublicPage) {
        router.push('/auth');  // ❌ Redirect ALL routes including /api/*
    } else if (user && isAuthPage) {
        router.push('/');
    }
}, [user, loading, pathname, router]);
```

**Vấn đề:**
- Chỉ exclude `/auth` và `/api-docs`
- Không exclude `/api/*` routes
- API routes bị redirect về `/auth` khi không có user trong localStorage

## Giải pháp

Thêm check để exclude tất cả API routes khỏi authentication logic.

### Code mới (Đã fix):

```javascript
// Handle redirects
useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/auth';
    const isPublicPage = pathname === '/api-docs' || pathname.startsWith('/api-docs');
    // Exclude all API routes from authentication checks
    const isApiRoute = pathname.startsWith('/api/');

    if (!user && !isAuthPage && !isPublicPage && !isApiRoute) {
        router.push('/auth');  // ✅ Only redirect UI pages
    } else if (user && isAuthPage) {
        router.push('/');
    }
}, [user, loading, pathname, router]);
```

**Thay đổi:**
- ✅ Thêm `isApiRoute` check: `pathname.startsWith('/api/')`
- ✅ Thêm `&& !isApiRoute` vào điều kiện redirect
- ✅ API routes giờ không bị redirect

## Tại sao cần fix này?

### 1. API Routes là Server-Side

API routes trong Next.js chạy **server-side**, không phải client-side:
- Không có localStorage
- Không có browser context
- Không nên có client-side redirects

### 2. AuthProvider là Client Component

`AuthProvider` sử dụng:
- `'use client'` directive
- `useRouter`, `usePathname` (client hooks)
- `localStorage` (browser API)

Khi wrap API routes trong AuthProvider, nó cố gắng:
- Check `localStorage.getItem('user')` (không tồn tại server-side)
- Redirect bằng `router.push()` (không hoạt động cho API)

### 3. API Routes cần Public Access

Nhiều API endpoints cần public access:
- `/api/test-supabase` - Health check
- `/api/test-db` - Database test
- `/api/auth/login` - Login endpoint
- Swagger/OpenAPI endpoints

## Verification

### Test Local

```bash
# Start dev server
npm run dev

# Test API (không cần authentication)
curl http://localhost:3000/api/test-supabase

# Hoặc
node test-supabase-api.js
```

**Expected:** API trả về JSON response, không redirect

### Test Production

```bash
# Test trên Vercel
curl https://your-app.vercel.app/api/test-supabase
```

**Expected:** API trả về JSON response với database info

## Lưu ý quan trọng

### ⚠️ API Security

Việc exclude API routes khỏi client-side auth **KHÔNG có nghĩa** API không cần authentication!

**API routes vẫn cần implement authentication riêng:**

```javascript
// Example: Protected API route
export async function GET(request) {
    // Server-side authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    
    // ... rest of code
}
```

### Public vs Protected APIs

**Public APIs** (không cần auth):
- `/api/test-supabase` - Health check
- `/api/test-db` - Database test
- `/api/auth/login` - Login endpoint

**Protected APIs** (cần auth):
- `/api/users` - User management
- `/api/roles` - Role management
- `/api/menus` - Menu management

Implement authentication trong từng API route nếu cần.

## Related Files

- [AuthProvider.js](file:///c:/app/antigravity/src/components/AuthProvider.js#L135-L147) - Fixed redirect logic
- [layout.js](file:///c:/app/antigravity/src/app/layout.js) - Root layout wrapping with AuthProvider

## Alternative Solutions

### Option 1: Separate Layout for API Routes (Not Recommended)

Next.js App Router tự động handle API routes riêng, không cần layout.

### Option 2: Middleware (More Complex)

Có thể dùng Next.js middleware để handle authentication:

```javascript
// middleware.js
export function middleware(request) {
    // Check authentication
    // Redirect if needed
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Nhược điểm:** Phức tạp hơn, không cần thiết cho use case này.

### Option 3: Current Solution (Recommended) ✅

Đơn giản nhất: Exclude API routes trong AuthProvider.

## Testing Checklist

- [x] Fix implemented in AuthProvider.js
- [ ] Test `/api/test-supabase` locally
- [ ] Test `/api/test-supabase` on production
- [ ] Verify other API routes still work
- [ ] Verify UI pages still require authentication
- [ ] Verify `/auth` page still accessible without login

## Rollout Plan

1. ✅ Fix code locally
2. ⏳ Test locally
3. ⏳ Commit and push
4. ⏳ Deploy to Vercel
5. ⏳ Test on production
6. ⏳ Monitor for issues

## Impact

**Before:**
- ❌ API routes redirect to login
- ❌ Cannot access health check endpoints
- ❌ Cannot test database connection

**After:**
- ✅ API routes work without authentication
- ✅ Health check endpoints accessible
- ✅ Can test database connection
- ✅ UI pages still protected
