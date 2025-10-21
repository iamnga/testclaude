# OMNI CORP - Hệ thống Ngân hàng số OCB

Website demo cho hệ thống ngân hàng số OMNI KHDN của OCB

## Tính năng đã hoàn thành

### 1. Đăng nhập & Màn hình tổng quan

- **Đăng nhập**:
  - Nhập tên đăng nhập và mật khẩu
  - Validation form
  - Thông báo lỗi khi đăng nhập sai

- **Đổi mật khẩu lần đầu**:
  - Tự động hiển thị modal yêu cầu đổi mật khẩu khi đăng nhập lần đầu
  - Validation mật khẩu mới (tối thiểu 6 ký tự)
  - Xác nhận mật khẩu

- **Giao diện tổng quan (Dashboard)**:
  - Header hiển thị tên đăng nhập, tên khách hàng, avatar
  - Banner hiển thị Hotline và Email hỗ trợ
  - 4 biểu tượng truy cập nhanh:
    - Chuyển tiền
    - Mở hợp đồng tiền gửi
    - Quản lý giao dịch chờ duyệt
    - Thanh toán hóa đơn
  - Thống kê:
    - Tổng giao dịch Thu gần nhất
    - Tổng giao dịch Chi gần nhất
    - Số lượng hợp đồng tiền gửi đang hoạt động
  - Timeline hiển thị 5 giao dịch gần nhất (Thu/Chi)
  - Danh sách hợp đồng tiền gửi đang hoạt động
  - Menu dropdown với tùy chọn đăng xuất

## Cài đặt và Chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5173/

### 3. Build production

```bash
npm run build
```

## Tài khoản demo

### Tài khoản 1 (Lần đăng nhập đầu - cần đổi mật khẩu)
- **Username**: `user_demo`
- **Password**: `OCB@2024`
- **Tên**: Nguyễn Văn A
- **Đặc điểm**: Khi đăng nhập lần đầu, hệ thống sẽ yêu cầu đổi mật khẩu

### Tài khoản 2 (Đã đổi mật khẩu)
- **Username**: `company_demo`
- **Password**: `OCB@2024`
- **Tên**: Công ty TNHH ABC
- **Đặc điểm**: Đã đổi mật khẩu, đăng nhập trực tiếp vào Dashboard

## Cấu trúc thư mục

```
omni-banking/
├── src/
│   ├── pages/              # Các trang chính
│   │   ├── Login.tsx       # Trang đăng nhập
│   │   └── Dashboard.tsx   # Trang tổng quan
│   ├── components/         # Components dùng chung (sẽ thêm sau)
│   ├── context/            # React Context
│   │   └── AuthContext.tsx # Context quản lý authentication
│   ├── data/               # Mock data
│   │   └── mockData.ts     # Dữ liệu demo (users, transactions, contracts)
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Các interface và type definitions
│   ├── styles/             # CSS files
│   │   ├── Login.css       # Style cho trang Login
│   │   └── Dashboard.css   # Style cho trang Dashboard
│   ├── App.tsx             # Main App với routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global CSS
├── package.json
└── README.md
```

## Công nghệ sử dụng

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design** - UI Component Library
- **React Router** - Navigation
- **Context API** - State management

## Tính năng đã implement

### Authentication
- [x] Login form với validation
- [x] First-time password change
- [x] Protected routes
- [x] Session persistence với localStorage
- [x] Logout functionality

### Dashboard
- [x] User information display
- [x] Contact information (Hotline, Email)
- [x] Quick access shortcuts
- [x] Recent transactions timeline (5 latest)
- [x] Transaction statistics (Credit/Debit)
- [x] Active deposit contracts display
- [x] Responsive design

## Các tính năng sẽ phát triển tiếp

Đây là tính năng **Đăng nhập & màn hình tổng quan** - phần đầu tiên của hệ thống.

Các tính năng tiếp theo sẽ được phát triển theo yêu cầu:
- Thông tin tài khoản (Danh sách, Sao kê, Giao dịch phong toả, Hóa đơn điện tử)
- Chuyển tiền (Theo món, Theo lô, Định kỳ, Quốc tế)
- Thanh toán hóa đơn
- Quản lý hợp đồng tiền gửi
- Giao dịch chờ duyệt
- Và nhiều tính năng khác...

## Ghi chú

- Đây là bản demo với mock data, không có backend thực
- Dữ liệu được lưu trong localStorage của trình duyệt
- UI được thiết kế responsive, tương thích với mobile
- Mọi giao dịch và dữ liệu chỉ là demo, không có giá trị thực tế

## Hỗ trợ

Nếu gặp vấn đề khi chạy ứng dụng, vui lòng kiểm tra:
1. Node.js version >= 16
2. Đã chạy `npm install` đầy đủ
3. Port 5173 chưa được sử dụng bởi ứng dụng khác
