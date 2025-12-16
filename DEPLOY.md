# Hướng Dẫn Deploy Ứng Dụng Lucky Draw

Ứng dụng này được xây dựng bằng **Next.js 15** và là một ứng dụng Client-Side (mọi xử lý diễn ra trên trình duyệt), vì vậy bạn có nhiều cách để triển khai.

## 1. Deploy lên Vercel (Khuyên dùng cho Online)
Cách dễ nhất và ổn định nhất để chạy online.
1.  Đẩy code của bạn lên **GitHub**, **GitLab**, hoặc **Bitbucket**.
2.  Truy cập [Vercel](https://vercel.com) và đăng nhập.
3.  Chọn **"Add New"** -> **"Project"**.
4.  Chọn repository git của bạn.
5.  Vercel sẽ tự động phát hiện là Next.js. Bạn chỉ cần nhấn **"Deploy"**.
    -   *Không cần cấu hình gì thêm vì project đã chuẩn Next.js.*

## 2. Chạy Local (Khuyên dùng cho Sự Kiện Offline)
Nếu bạn tổ chức sự kiện tại hội trường lớn, việc chạy trực tiếp trên máy tính của người điều khiển (localhost) là an toàn nhất (tránh rủi ro mất mạng internet).

**Bước 1: Cài đặt & Build**
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
npm run build
```

**Bước 2: Chạy ứng dụng**
```bash
npm start
```
Ứng dụng sẽ chạy tại `http://localhost:3000`. Bạn có thể mở trình duyệt và đưa lên màn hình LED.
*Lưu ý: Chế độ `npm start` (Production) sẽ mượt mà hơn nhiều so với `npm run dev`.*

## 3. Deploy dạng Static HTML (Cho GitHub Pages, Netlify)
Nếu bạn muốn xuất ra file HTML tĩnh để upload lên host thường.

**Bước 1:** Mở file `next.config.ts` và thêm dòng `output: 'export'`:
```typescript
const nextConfig: NextConfig = {
  output: 'export', // <--- Thêm dòng này
  // ... các config khác giữ nguyên
};
```

**Bước 2:** Chạy build
```bash
npm run build
```

**Bước 3:** Lấy kết quả
Thư mục `out/` sẽ được tạo ra. Bạn có thể upload toàn bộ file trong `out/` lên bất kỳ hosting nào (như hostinger, github pages, netlify drop).

---

## Lưu ý quan trọng cho Sự Kiện
-   **Âm thanh:** Trình duyệt (Chrome/Edge) thường chặn tự động phát âm thanh. Hãy chắc chắn người điều khiển bấm tương tác vào trang ít nhất 1 lần trước khi sự kiện bắt đầu (ví dụ: bấm nút "Test Sound" hoặc click vào màn hình).
-   **Fullscreen:** Nhấn `F11` để full màn hình trình duyệt cho trải nghiệm tốt nhất.
