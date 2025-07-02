# Hugging Face Face Recognition Service (Demo)

Service xác thực khuôn mặt demo sử dụng simplified face recognition approach.

## Tính năng

- ✅ Đăng ký khuôn mặt cho sinh viên
- ✅ Xác thực khuôn mặt đơn lẻ
- ✅ Xác thực khuôn mặt cho cả lớp
- ✅ Xóa khuôn mặt sinh viên
- ✅ Thống kê sinh viên đã đăng ký
- ✅ Kiểm tra format ảnh đại diện

## Cài đặt

### 1. Dependencies

Service này sử dụng simplified approach và không cần download models phức tạp.

```bash
npm install
```

### 2. Cấu trúc thư mục

```
src/huggingface-face/
├── dto/
│   ├── register-student.dto.ts
│   ├── verify-face.dto.ts
│   └── verify-class.dto.ts
├── huggingface-face.controller.ts
├── huggingface-face.service.ts
├── huggingface-face.module.ts
└── README.md
```

## API Endpoints

### 1. Đăng ký khuôn mặt sinh viên

```http
POST /huggingface-face/register-student
Content-Type: application/json

{
  "studentId": 1
}
```

### 2. Xác thực khuôn mặt sinh viên

```http
POST /huggingface-face/verify-face
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "studentId": 1,
  "scheduleId": 1,
  "note": "Xác thực bằng khuôn mặt"
}
```

### 3. Xác thực khuôn mặt cả lớp

```http
POST /huggingface-face/verify-class
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "classId": 1,
  "teacherId": 1,
  "scheduleId": 1
}
```

### 4. Xóa khuôn mặt sinh viên

```http
DELETE /huggingface-face/delete-student/1
```

### 5. Thống kê sinh viên đã đăng ký

```http
GET /huggingface-face/status
```

### 6. Kiểm tra format ảnh đại diện

```http
GET /huggingface-face/test-avatar/1
```

## Cấu hình

### Ngưỡng tương đồng (Similarity Threshold)

Mặc định: `0.8` (80%)

Có thể điều chỉnh trong service:

```typescript
private readonly similarityThreshold = 0.8; // Thay đổi giá trị này
```

### Simplified Approach

Service này sử dụng simplified approach với:

- Hash-based face descriptor generation
- Hamming distance similarity calculation
- In-memory storage

## So sánh với Azure Face API

| Tính năng    | Hugging Face | Azure Face API |
| ------------ | ------------ | -------------- |
| Chi phí      | Miễn phí     | Có phí         |
| Độ chính xác | Tốt          | Rất tốt        |
| Tốc độ       | Chậm hơn     | Nhanh          |
| Setup        | Phức tạp     | Đơn giản       |
| Tùy chỉnh    | Cao          | Thấp           |
| Offline      | Có thể       | Không          |

## Lưu ý

1. **Demo Service**: Đây là demo service sử dụng simplified approach, không phải production-ready.

2. **Memory Usage**: Service lưu trữ face descriptors trong memory, nên restart server sẽ mất dữ liệu đã đăng ký.

3. **Accuracy**: Simplified approach có độ chính xác thấp hơn so với real face recognition models.

4. **Performance**: Với số lượng sinh viên lớn, nên cân nhắc sử dụng database để lưu trữ face descriptors.

5. **Production Use**: Để sử dụng trong production, cần implement proper face recognition models.

## Troubleshooting

### Lỗi "Image not found"

- Kiểm tra đường dẫn ảnh
- Đảm bảo file tồn tại
- Kiểm tra quyền truy cập file

### Lỗi "Invalid image format"

- Sử dụng ảnh định dạng JPEG, PNG
- Kiểm tra base64 encoding
- Đảm bảo ảnh không bị corrupt

### Lỗi "Student not registered"

- Đăng ký khuôn mặt cho sinh viên trước
- Kiểm tra studentId có đúng không

## Development

### Thêm tính năng mới

1. Thêm method vào service
2. Thêm endpoint vào controller
3. Tạo DTO nếu cần
4. Cập nhật documentation

### Testing

```bash
# Test đăng ký
curl -X POST http://localhost:3000/huggingface-face/register-student \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1}'

# Test xác thực
curl -X POST http://localhost:3000/huggingface-face/verify-face \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_image", "studentId": 1, "scheduleId": 1}'
```
