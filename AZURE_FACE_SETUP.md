# Hướng dẫn Setup Azure Face API

## 1. Tạo Azure Face API Resource

### Bước 1: Đăng ký Azure Account

- Truy cập [Azure Portal](https://portal.azure.com)
- Đăng ký tài khoản Azure (có thể dùng free tier)

### Bước 2: Tạo Face API Resource

1. Trong Azure Portal, click "Create a resource"
2. Tìm kiếm "Face"
3. Chọn "Face" service
4. Click "Create"
5. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource group**: Tạo mới hoặc chọn có sẵn
   - **Region**: Chọn region gần nhất (ví dụ: Southeast Asia)
   - **Name**: Đặt tên cho resource (ví dụ: my-face-api)
   - **Pricing tier**: Chọn F0 (Free) hoặc S0 (Standard)
6. Click "Review + create" và "Create"

### Bước 3: Lấy Credentials

1. Sau khi tạo xong, vào resource vừa tạo
2. Vào "Keys and Endpoint" trong menu bên trái
3. Copy **Key 1** và **Endpoint**
4. Lưu lại để sử dụng trong ứng dụng

## 2. Cấu hình Environment Variables

### Tạo file .env

```bash
# Copy file example
cp azure-face-config.example .env
```

### Cập nhật .env với credentials thực tế

```env
AZURE_FACE_SUBSCRIPTION_KEY=your-actual-subscription-key
AZURE_FACE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
```

## 3. Cài đặt Dependencies

```bash
npm install @azure/cognitiveservices-face @azure/ms-rest-azure-js
```

## 4. Sử dụng Azure Face API

### API Endpoints

#### 1. Đăng ký khuôn mặt sinh viên

```http
POST /azure-face/register-student
Content-Type: application/json

{
  "studentId": 1
}
```

#### 2. Xác thực khuôn mặt

```http
POST /azure-face/verify-face
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "studentId": 1,
  "scheduleId": 1,
  "note": "Xác thực bằng khuôn mặt"
}
```

#### 3. Xác thực khuôn mặt cả lớp

```http
POST /azure-face/verify-class
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "classId": 1,
  "teacherId": 1,
  "scheduleId": 1
}
```

#### 4. Xóa khuôn mặt sinh viên

```http
DELETE /azure-face/delete-student/1
```

#### 5. Lấy trạng thái nhóm người

```http
GET /azure-face/status
```

## 5. Quy trình sử dụng

### Bước 1: Đăng ký khuôn mặt

1. Sinh viên cần có ảnh đại diện trong database (dạng base64)
2. Gọi API `register-student` để đăng ký khuôn mặt
3. Azure sẽ tạo Person Group và thêm khuôn mặt vào

### Bước 2: Xác thực khuôn mặt

1. Chụp ảnh khuôn mặt (dạng base64)
2. Gọi API `verify-face` với ảnh và thông tin sinh viên
3. Azure sẽ so sánh và trả về kết quả xác thực

### Bước 3: Tự động điểm danh

- Nếu xác thực thành công, hệ thống sẽ tự động tạo bản ghi điểm danh
- Kết quả bao gồm độ tin cậy (confidence) của việc xác thực

## 6. Ưu điểm của Azure Face API

### So với face-api.js:

- **Độ chính xác cao hơn**: Sử dụng AI mạnh mẽ của Microsoft
- **Không cần tải models**: Không cần download và quản lý models locally
- **Scalable**: Có thể xử lý nhiều request đồng thời
- **Bảo mật**: Dữ liệu được mã hóa và bảo vệ bởi Azure
- **Monitoring**: Có dashboard theo dõi usage và performance

### Tính năng:

- **Face Detection**: Phát hiện khuôn mặt trong ảnh
- **Face Recognition**: Nhận diện khuôn mặt đã đăng ký
- **Face Verification**: Xác thực khuôn mặt với độ tin cậy
- **Person Group Management**: Quản lý nhóm người

## 7. Lưu ý quan trọng

### Pricing:

- **F0 (Free)**: 30,000 transactions/tháng
- **S0 (Standard)**: $1.50 per 1,000 transactions

### Rate Limits:

- F0: 20 calls per minute
- S0: 10 calls per second

### Image Requirements:

- Format: JPEG, PNG, GIF, BMP
- Size: Tối đa 6MB
- Resolution: Tối thiểu 36x36 pixels

### Privacy:

- Tuân thủ GDPR và các quy định bảo mật
- Dữ liệu được mã hóa trong transit và at rest

## 8. Troubleshooting

### Lỗi thường gặp:

1. **"Azure Face API not configured"**: Kiểm tra environment variables
2. **"No face detected"**: Ảnh không có khuôn mặt hoặc chất lượng thấp
3. **"Person not found"**: Sinh viên chưa được đăng ký khuôn mặt
4. **"Rate limit exceeded"**: Vượt quá giới hạn API calls

### Debug:

- Kiểm tra logs trong console
- Sử dụng Azure Portal để monitor API usage
- Test với Postman hoặc Swagger UI
