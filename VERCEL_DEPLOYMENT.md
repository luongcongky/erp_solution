# Hướng dẫn Deploy lên Vercel

## Vấn đề gặp phải

Lỗi `ECONNREFUSED 127.0.0.1:5432` xảy ra vì ứng dụng trên Vercel đang cố kết nối đến `localhost:5432` thay vì database production.

## Giải pháp

### Bước 1: Cấu hình Environment Variables trên Vercel

1. **Truy cập Vercel Dashboard**
   - Đăng nhập vào [Vercel](https://vercel.com)
   - Chọn project của bạn

2. **Thêm Environment Variables**
   - Vào **Settings** → **Environment Variables**
   - Thêm biến môi trường sau:

   ```
   DATABASE_URL=postgresql://postgres:123456@db.xwutosntmfxfpgxtiswr.supabase.co:5432/postgres
   ```

   **Hoặc** nếu bạn muốn sử dụng tên khác:

   ```
   SUPABASE_DATABASE_URL=postgresql://postgres:123456@db.xwutosntmfxfpgxtiswr.supabase.co:5432/postgres
   ```

3. **Chọn Environment**
   - ✅ Production
   - ✅ Preview
   - ✅ Development (tùy chọn)

4. **Lưu lại**

### Bước 2: Redeploy ứng dụng

Sau khi thêm environment variables, bạn cần redeploy:

**Cách 1: Từ Vercel Dashboard**
- Vào tab **Deployments**
- Click vào deployment mới nhất
- Click nút **Redeploy**

**Cách 2: Push code mới**
```bash
git add .
git commit -m "Update database connection for Vercel"
git push
```

### Bước 3: Kiểm tra kết nối

Sau khi deploy xong, test bằng cách:

1. Truy cập trang login của bạn trên Vercel
2. Thử đăng nhập với tài khoản test
3. Kiểm tra logs trên Vercel Dashboard nếu vẫn có lỗi

## Lưu ý quan trọng

### ⚠️ Bảo mật Database

**QUAN TRỌNG**: Connection string trong file `.env` của bạn chứa password `123456`. Đây là một vấn đề bảo mật nghiêm trọng!

**Khuyến nghị:**

1. **Đổi password database ngay lập tức** trên Supabase:
   - Vào Supabase Dashboard
   - Settings → Database
   - Reset database password
   - Sử dụng password mạnh (ít nhất 16 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt)

2. **Cập nhật connection string** với password mới:
   - Cập nhật trong Vercel Environment Variables
   - Cập nhật trong file `.env.local` (local development)
   - **KHÔNG commit** file `.env` vào Git

3. **Kiểm tra `.gitignore`** đảm bảo có:
   ```
   .env
   .env.local
   .env*.local
   ```

### 🔒 Best Practices

1. **Sử dụng Supabase Connection Pooler** cho production:
   ```
   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

2. **Giới hạn kết nối** trong code (đã có trong `src/db/index.ts`):
   ```typescript
   max: 10,  // Tối đa 10 connections
   ```

3. **Sử dụng SSL** cho production:
   ```typescript
   const pool = new Pool({
       connectionString,
       ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
       max: 10,
   });
   ```

## Kiểm tra kết nối

Sau khi deploy, bạn có thể test database connection bằng API endpoint:

```bash
curl https://your-app.vercel.app/api/test-db
```

Nếu thành công, bạn sẽ thấy:
```json
{
  "success": true,
  "message": "PostgreSQL connected successfully (Drizzle ORM)",
  "menuCount": <số lượng menus>
}
```

## Troubleshooting

### Lỗi vẫn còn sau khi thêm DATABASE_URL

1. **Kiểm tra Environment Variables** đã được set đúng chưa
2. **Redeploy lại** (không phải rebuild, mà redeploy)
3. **Xem logs** trên Vercel Dashboard → Deployments → View Function Logs

### Lỗi timeout khi kết nối

- Kiểm tra Supabase database có đang chạy không
- Kiểm tra connection string có đúng không
- Thử kết nối từ máy local bằng connection string đó

### Lỗi SSL

Nếu gặp lỗi SSL, thêm `?sslmode=require` vào cuối connection string:
```
DATABASE_URL=postgresql://...postgres?sslmode=require
```

## Các bước tiếp theo

1. ✅ Cập nhật code (đã xong)
2. ⏳ Thêm DATABASE_URL vào Vercel Environment Variables
3. ⏳ Redeploy ứng dụng
4. ⏳ Test login trên production
5. ⏳ Đổi password database (BẮT BUỘC!)
