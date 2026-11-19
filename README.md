# Mira World – Next.js / React

Dự án Next.js responsive, lấy cảm hứng về bố cục và chức năng từ `https://mira.hcompany.workers.dev/`. Các thành phần viết bằng React, CSS thuần. Bản giao diện sáng tạo lại, không phải bản sao 1:1.

## Chạy local

Yêu cầu Node.js bản còn được hỗ trợ. Trong thư mục dự án:

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Sử dụng

- `app/page.jsx`: dữ liệu thương hiệu, nội dung, các thành phần, form và tương tác.
- `app/globals.css`: màu sắc, bố cục và responsive.
- `app/layout.jsx`: metadata và layout gốc.

Website hỗ trợ chọn số tiền, nhập tên, ẩn danh, email tùy chọn, lời nhắn và luồng 3 bước hoàn chỉnh *để minh họa*. Không giao dịch, lưu trữ dữ liệu, hoặc gửi lời nhắn thật.

## Triển khai Cloudflare

Có thể triển khai trên nền tảng có hỗ trợ Next.js phù hợp. Đối với Cloudflare Workers, kiểm tra hướng dẫn OpenNext Cloudflare hiện hành, cấu hình adapter thích hợp và version tương thích. Không upload trực tiếp source Next.js như trang HTML tĩnh.

## Khi cần thanh toán thật

Thêm backend tạo đơn hàng và tích hợp payOS/ví điện tử. Dữ liệu thanh toán, webhook và xác thực chữ ký luôn xử lý phía server; xác minh kết quả trước khi ghi nhận giao dịch vào DB hoặc cập nhật bảng xếp hạng. Không tin tưởng callback frontend làm bằng chứng đã thanh toán.

`package.json` dùng nhãn `latest`; sau khi cài đặt và kiểm thử, nên commit `package-lock.json` để pin phiên bản đã dùng.
