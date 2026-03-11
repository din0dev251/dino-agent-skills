# Dino Agent Skills – Marketplace

Website tổng hợp agent skills: Client (xem, tìm kiếm, category, star), User (dự án riêng tư, nhiều link), Admin (CRUD skills, categories, docs). Backend lưu trên Google Sheets.

## Tech

- **FE:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **BE:** API Routes Next.js, Google Sheets API
- **Auth:** NextAuth (Credentials, role trong Sheet)

## Cấu trúc thư mục

```
src/
  app/          # Routes: page, layout, api
  components/  # UI: layout, skills, providers
  lib/         # sheets, auth, auth-options
  types/       # TypeScript + next-auth.d.ts
```

## Chạy dự án

1. **Cài đặt:**  
   `npm install`

2. **Biến môi trường:**  
   Copy `.env.example` thành `.env.local` và điền đủ (xem [SETUP-SHEETS.md](./SETUP-SHEETS.md)).

3. **Chạy:**  
   `npm run dev`  
   Mở http://localhost:3000

## Tính năng

- **Client:** Marketplace skills (tìm kiếm, filter category, sort Popular/Mới nhất), thẻ skill (title, description, star), trang Documentation (sidebar + nội dung Markdown do Admin chỉnh).
- **User:** Đăng ký/đăng nhập; trang "Dự án của tôi" – thêm/sửa/xóa project (riêng tư), nhiều link, chọn skills từ marketplace.
- **Admin:** CRUD skills, CRUD categories, chỉnh nội dung Documentation, Tư liệu quý. Role admin: đổi cột `role` trong sheet `users` thành `admin`.

## Deploy lên Vercel

1. **Đẩy code lên Git** (GitHub / GitLab):
   ```bash
   git add .
   git commit -m "feat: init dino-agent-skills"
   git push origin main
   ```

2. **Tạo project trên Vercel:**  
   Vào [vercel.com](https://vercel.com) → **Add New** → **Project** → Import repo của bạn → **Deploy** (có thể deploy trước).

3. **Cấu hình Environment Variables** (Settings → Environment Variables):
   - `NEXTAUTH_URL` = `https://<tên-project>.vercel.app` (sau lần deploy đầu, dùng đúng URL Vercel cho bạn)
   - `NEXTAUTH_SECRET` = chuỗi bí mật bất kỳ (ví dụ: `openssl rand -base64 32`)
   - `GOOGLE_SHEETS_ID` = ID Google Sheet
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = email từ file JSON Service Account
   - `GOOGLE_PRIVATE_KEY` = nội dung `private_key` từ JSON (giữ nguyên `\n`, paste cả khối trong dấu ngoặc kép)

4. **Redeploy** sau khi thêm xong env (Deployments → ... → Redeploy).

5. **Lưu ý:** Trong Google Sheet, cần share cho Service Account với quyền **Chỉnh sửa**. NextAuth sẽ dùng `NEXTAUTH_URL` đúng domain Vercel để callback đăng nhập.
