# Tóm tắt Azure Face API Service

## 🎯 Mục tiêu

Thay thế face-api.js bằng Azure Face API để có độ chính xác cao hơn và khả năng mở rộng tốt hơn.

## 📁 Cấu trúc files đã tạo

### 1. Service Layer

- `src/azure-face/azure-face.service.ts` - Service chính xử lý logic Azure Face API
- `src/azure-face/azure-face.service.spec.ts` - Unit tests

### 2. Controller Layer

- `src/azure-face/azure-face.controller.ts` - API endpoints với validation

### 3. DTOs (Data Transfer Objects)

- `src/azure-face/dto/register-student.dto.ts` - DTO cho đăng ký khuôn mặt
- `src/azure-face/dto/verify-face.dto.ts` - DTO cho xác thực khuôn mặt
- `src/azure-face/dto/verify-class.dto.ts` - DTO cho xác thực cả lớp

### 4. Module

- `src/azure-face/azure-face.module.ts` - Module configuration

### 5. Configuration & Documentation

- `azure-face-config.example` - File cấu hình mẫu
- `AZURE_FACE_SETUP.md` - Hướng dẫn setup chi tiết
- `test-azure-face.js` - Script test API
- `AZURE_FACE_SUMMARY.md` - File tóm tắt này

## 🔧 Dependencies đã cài đặt

```bash
npm install @azure/cognitiveservices-face @azure/ms-rest-azure-js
```

## 🚀 API Endpoints

### 1. Đăng ký khuôn mặt sinh viên

```http
POST /azure-face/register-student
{
  "studentId": 1
}
```

### 2. Xác thực khuôn mặt

```http
POST /azure-face/verify-face
{
  "image": "data:image/jpeg;base64,...",
  "studentId": 1,
  "scheduleId": 1,
  "note": "Xác thực bằng khuôn mặt"
}
```

### 3. Xác thực khuôn mặt cả lớp

```http
POST /azure-face/verify-class
{
  "image": "data:image/jpeg;base64,...",
  "classId": 1,
  "teacherId": 1,
  "scheduleId": 1
}
```

### 4. Xóa khuôn mặt sinh viên

```http
DELETE /azure-face/delete-student/1
```

### 5. Lấy trạng thái nhóm người

```http
GET /azure-face/status
```

## 🔄 Quy trình hoạt động

### Bước 1: Đăng ký khuôn mặt

1. Sinh viên cần có ảnh đại diện trong database (dạng base64)
2. Gọi API `register-student` để đăng ký khuôn mặt
3. Azure tạo Person Group và thêm khuôn mặt vào
4. Train Person Group để có thể nhận diện

### Bước 2: Xác thực khuôn mặt

1. Chụp ảnh khuôn mặt (dạng base64)
2. Gọi API `verify-face` với ảnh và thông tin sinh viên
3. Azure so sánh và trả về kết quả xác thực
4. Nếu thành công, tự động tạo bản ghi điểm danh

### Bước 3: Xác thực cả lớp

1. Chụp ảnh nhóm (có thể có nhiều khuôn mặt)
2. Gọi API `verify-class` với ảnh và thông tin lớp
3. Azure phát hiện và nhận diện tất cả khuôn mặt
4. Tự động tạo bản ghi điểm danh cho các sinh viên được nhận diện

## ⚡ Ưu điểm so với face-api.js

| Tính năng     | face-api.js          | Azure Face API        |
| ------------- | -------------------- | --------------------- |
| Độ chính xác  | Trung bình           | Cao                   |
| Tải models    | Cần download locally | Không cần             |
| Scalability   | Hạn chế              | Tốt                   |
| Bảo mật       | Local                | Cloud-based           |
| Monitoring    | Không có             | Có dashboard          |
| Rate limiting | Không                | Có                    |
| Cost          | Free                 | Có phí (có free tier) |

## 🔐 Bảo mật

- Dữ liệu được mã hóa trong transit và at rest
- Tuân thủ GDPR và các quy định bảo mật
- API key được lưu trong environment variables

## 💰 Pricing

- **F0 (Free)**: 30,000 transactions/tháng
- **S0 (Standard)**: $1.50 per 1,000 transactions

## 🚨 Lưu ý quan trọng

### Environment Variables

Cần cấu hình trong file `.env`:

```env
AZURE_FACE_SUBSCRIPTION_KEY=your-subscription-key
AZURE_FACE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
```

### Image Requirements

- Format: JPEG, PNG, GIF, BMP
- Size: Tối đa 6MB
- Resolution: Tối thiểu 36x36 pixels

### Rate Limits

- F0: 20 calls per minute
- S0: 10 calls per second

## 🧪 Testing

1. Cấu hình Azure Face API credentials
2. Chạy server: `npm run start:dev`
3. Test với script: `node test-azure-face.js`
4. Hoặc sử dụng Swagger UI tại: `http://localhost:3000/api`

## 📈 Monitoring

- Sử dụng Azure Portal để theo dõi API usage
- Kiểm tra logs trong console
- Monitor performance và errors

## 🔄 Migration từ face-api.js

1. Cài đặt Azure Face API service
2. Cấu hình credentials
3. Đăng ký lại khuôn mặt cho tất cả sinh viên
4. Cập nhật frontend để sử dụng API mới
5. Test và deploy

## 📞 Support

- Azure Face API Documentation: https://docs.microsoft.com/en-us/azure/cognitive-services/face/
- Azure Portal: https://portal.azure.com
- Azure Support: https://azure.microsoft.com/en-us/support/
