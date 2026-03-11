# Thiết lập Google Sheets

## Bước 1: Tạo Google Sheet

1. Vào [Google Sheets](https://sheets.google.com) và tạo spreadsheet mới.
2. Copy **Sheet ID** từ URL: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
3. Điền `GOOGLE_SHEETS_ID=<SHEET_ID>` vào file `.env.local`.

## Bước 2: Tạo các sheet (tab) và header

Tạo đúng **tên sheet** (phân biệt chữ hoa/thường) và dòng đầu tiên là header như sau.

### Sheet: `users`
| id | email | passwordHash | role | createdAt |

- **role**: `admin` hoặc `user`. Đổi role trong sheet thành `admin` cho tài khoản quản trị.

### Sheet: `categories`
| id | name | order |

### Sheet: `skills`
| id | title | description | categoryId | link | starCount | createdAt | updatedAt |

### Sheet: `projects`
| id | userId | name | description | links | skillIds | createdAt | updatedAt |

- **links**: JSON array string, ví dụ: `["https://github.com/...", "https://..."]`
- **skillIds**: JSON array string, ví dụ: `["uuid-1", "uuid-2"]`

### Sheet: `docs`
| id | title | content | updatedAt |

- **content**: Nội dung Markdown cho trang Documentation.

### Sheet: `resources`
| id | title | description | link | order | createdAt |

- Dùng cho trang **Tư liệu quý**: tổng hợp link (title, mô tả, link) để cải thiện kỹ năng.
- **order**: Số thứ tự hiển thị (nhỏ lên trước).

## Bước 3: Google Service Account

1. Vào [Google Cloud Console](https://console.cloud.google.com) → chọn hoặc tạo project.
2. Bật **Google Sheets API**.
3. **APIs & Services** → **Credentials** → **Create Credentials** → **Service Account**.
4. Tạo xong, vào Service Account → **Keys** → **Add Key** → **Create new key** → JSON.
5. Mở file JSON:
   - `client_email` → điền vào `.env.local`: `GOOGLE_SERVICE_ACCOUNT_EMAIL=...`
   - `private_key` (cả khối, giữ `\n`) → điền vào `.env.local`: `GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
6. Chia sẻ Google Sheet cho email Service Account (client_email) với quyền **Chỉnh sửa**.

## Tạo Admin đầu tiên

1. Chạy app, đăng ký tài khoản qua trang **Đăng ký**.
2. Mở sheet `users`, tìm dòng email vừa đăng ký, đổi cột **role** từ `user` thành `admin`.
3. Đăng nhập lại → menu sẽ có **Admin**.
