# ✅ Checklist Deploy Vercel - Sửa lỗi Database Connection

## Đã hoàn thành ✅

- [x] Cập nhật `src/db/index.ts` để ưu tiên `DATABASE_URL`
- [x] Thêm SSL support cho production
- [x] Tạo file `.env.example` hướng dẫn cấu hình
- [x] Tạo file `VERCEL_DEPLOYMENT.md` với hướng dẫn chi tiết

## Cần làm ngay ⏰

### 1. Cấu hình Vercel Environment Variables

**Truy cập:** https://vercel.com/dashboard

1. Chọn project của bạn
2. Vào **Settings** → **Environment Variables**
3. Thêm biến:
   ```
   Key: DATABASE_URL
   Value: postgresql://postgres:YOUR_PASSWORD@db.xwutosntmfxfpgxtiswr.supabase.co:5432/postgres
   ```
4. Chọn: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### 2. Redeploy

**Cách 1: Từ Vercel Dashboard**
- Deployments → Latest deployment → **Redeploy**

**Cách 2: Push code mới**
```bash
git add .
git commit -m "Fix database connection for Vercel deployment"
git push
```

### 3. Test

Sau khi deploy xong:
```bash
# Test database connection
curl https://your-app.vercel.app/api/test-db

# Test login
# Vào trang login và thử đăng nhập
```

## ⚠️ BẮT BUỘC - Bảo mật Database

**NGUY HIỂM:** Password database hiện tại là `123456` - quá yếu!

### Đổi password ngay:

1. **Vào Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Chọn project: `xwutosntmfxfpgxtiswr`

2. **Settings → Database → Database Password**
   - Click **Reset Database Password**
   - Tạo password mạnh (ít nhất 16 ký tự)
   - Copy password mới

3. **Cập nhật connection string:**
   ```
   postgresql://postgres:NEW_STRONG_PASSWORD@db.xwutosntmfxfpgxtiswr.supabase.co:5432/postgres
   ```

4. **Update ở 2 nơi:**
   - ✅ Vercel Environment Variables
   - ✅ File `.env.local` (local development)

## 📝 Notes

- File `.env` đã được gitignore, không bao giờ commit lên Git
- Sử dụng `.env.local` cho local development
- Sử dụng Vercel Environment Variables cho production
- SSL tự động bật khi `NODE_ENV=production`

## 🆘 Nếu vẫn lỗi

1. Kiểm tra Vercel logs: Deployments → View Function Logs
2. Kiểm tra DATABASE_URL đã được set chưa
3. Thử kết nối từ máy local với connection string đó
4. Đảm bảo Supabase database đang chạy

## 📚 Tài liệu tham khảo

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Hướng dẫn chi tiết
- [.env.example](./.env.example) - Template cấu hình
