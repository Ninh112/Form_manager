# Dynamic Form Builder System

Đây là một hệ thống quản lý và xây dựng biểu mẫu động (Dynamic Form Builder), bao gồm đầy đủ Frontend và Backend. 

- **Backend:** Node.js, Express, Sequelize (ORM), MySQL
- **Frontend:** React.js (Vite), Axios

---

## 🚀 Hướng phát triển trong tương lai

Nếu có thêm thời gian, đây là những điểm em sẽ ưu tiên nâng cấp và phát triển cho hệ thống:

1. **Cải thiện Kiến trúc & Code Quality:**
   - Bổ sung Unit Tests và Integration Tests (đặc biệt cho các logic validation phức tạp của form).
   - Xây dựng hệ thống bắt lỗi (Global Error Handling) chuẩn mực hơn và ghi log chuyên nghiệp.

2. **Nâng cấp Tính năng:**
   - Hoàn thiện tính năng Xác thực và Phân quyền với JWT (hiện cấu trúc database và thư viện đã sẵn sàng nhưng cần trau chuốt lại luồng phân quyền Role-based Admin/User).
   - Thêm tính năng phân trang (Pagination), tìm kiếm (Search), và lọc (Filter) nâng cao cho phần thống kê Submissions.
   - Hỗ trợ đa dạng loại trường dữ liệu (Fields) hơn: File upload, Checkbox đa lựa chọn, Radio buttons, Matrix.

3. **DevOps & Tài liệu:**
   - Tích hợp tài liệu API tự động (Swagger/OpenAPI) để dễ dàng theo dõi.
   - Container hóa ứng dụng (Docker và Docker Compose) để có thể setup dự án chỉ với 1 click.
   - Thiết lập CI/CD pipeline cơ bản.

---

## 1. Cấu trúc dự án

- `server/`: Chứa mã nguồn REST API phục vụ cho việc tạo form, quản lý field, lưu trữ submission và xử lý xác thực.
- `client/`: Mã nguồn giao diện người dùng cho phép Admin thiết kế form và Người dùng phổ thông truy cập để điền thông tin.

## 2. Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- Máy chủ MySQL đang hoạt động

### Bước 1: Khởi tạo Database
Truy cập vào MySQL (thông qua MySQL Workbench, phpMyAdmin hoặc CLI) và chạy lệnh tạo cơ sở dữ liệu:
```sql
CREATE DATABASE form_manager;
```

### Bước 2: Cài đặt Backend
Mở terminal và trỏ vào thư mục server:
```bash
cd server
npm install express cors dotenv sequelize mysql2
npm install -D nodemon
```
Copy nội dung file `.env.example` thành file mới có tên `.env` và cập nhật thông số kết nối MySQL của bạn (nếu có khác biệt):
```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=form_manager
DB_USER=root
DB_PASSWORD=your_mysql_password
```
Khởi động server:
```bash
npm run dev
```
*(Lưu ý: Backend sử dụng `sequelize.sync()` nên sẽ tự động khởi tạo các bảng và cấu trúc trong database khi chạy lần đầu).*

### Bước 3: Cài đặt Frontend
Mở một terminal mới và trỏ vào thư mục client:
```bash
cd client
npm install
npm install axios react-router-dom
npm run dev
```
Mặc định ứng dụng Frontend sẽ được chạy tại `http://localhost:5173`. Frontend đã được cấu hình Axios để tự động gọi các request tới Backend.

---

## 3. Hướng dẫn đăng nhập
tài khoản và mật khẩu ở trong file env.example
<img width="1875" height="1004" alt="image" src="https://github.com/user-attachments/assets/734cfde1-c8d1-44b0-9f5e-85a43d6a6218" />
