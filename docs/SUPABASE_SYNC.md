# Supabase Sync - Quick Reference

## Thao Tác Đơn Giản Nhất

### Khi thêm table/model mới:
```bash
npm run supabase:sync
```

### Khi thêm schema mới:
```bash
npm run supabase:create-schemas
npm run supabase:sync
```

### Kiểm tra kết quả:
```bash
npm run supabase:verify
```

---

## Lưu Ý Quan Trọng

⚠️ **Script hiện tại chỉ TẠO tables mới, KHÔNG sửa tables đã tồn tại**

Nếu cần sửa table existing → Dùng SQL manual hoặc Supabase Dashboard

---

## Chi Tiết

Xem file `supabase_quick_sync.md` để biết thêm chi tiết về:
- Sync data
- Update existing tables
- Troubleshooting
- Best practices
