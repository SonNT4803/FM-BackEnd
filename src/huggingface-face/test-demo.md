# Test Demo - Hugging Face Face Recognition Service

## Test Cases

### 1. Đăng ký khuôn mặt sinh viên

```bash
curl -X POST http://localhost:3000/huggingface-face/register-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studentId": 1
  }'
```

**Expected Response:**

```json
{
  "statusCode": 200,
  "message": "Đăng ký khuôn mặt thành công (Hugging Face)",
  "data": {
    "studentId": 1,
    "studentName": "Nguyễn Văn A",
    "avatarType": "file",
    "descriptorLength": 64,
    "note": "Đây là demo service sử dụng simplified face recognition"
  }
}
```

### 2. Xác thực khuôn mặt sinh viên

```bash
curl -X POST http://localhost:3000/huggingface-face/verify-face \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "studentId": 1,
    "scheduleId": 1,
    "note": "Test xác thực"
  }'
```

**Expected Response (Success):**

```json
{
  "statusCode": 200,
  "message": "Xác thực khuôn mặt thành công",
  "data": {
    "verified": true,
    "similarity": 0.95,
    "threshold": 0.8,
    "student": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "studentId": "SV001"
    },
    "schedule": {
      "id": 1,
      "className": "Lớp A",
      "teacherName": "Giáo viên A"
    },
    "attendance": {
      "id": 1,
      "status": 1,
      "updatedAt": "2024-01-01T10:00:00.000Z"
    },
    "note": "Đây là demo service sử dụng simplified face recognition"
  }
}
```

### 3. Xác thực khuôn mặt cả lớp

```bash
curl -X POST http://localhost:3000/huggingface-face/verify-class \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "classId": 1,
    "teacherId": 1,
    "scheduleId": 1
  }'
```

**Expected Response:**

```json
{
  "statusCode": 200,
  "message": "Xác thực khuôn mặt lớp học thành công",
  "data": {
    "totalStudentsInClass": 30,
    "verifiedStudents": 2,
    "students": [
      {
        "student": {
          "id": 1,
          "name": "Nguyễn Văn A",
          "studentId": "SV001"
        },
        "similarity": 0.95
      },
      {
        "student": {
          "id": 2,
          "name": "Trần Thị B",
          "studentId": "SV002"
        },
        "similarity": 0.88
      }
    ],
    "attendanceRecords": [
      {
        "id": 1,
        "studentId": 1,
        "status": 1,
        "updatedAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "studentId": 2,
        "status": 1,
        "updatedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "note": "Đây là demo service sử dụng simplified face recognition"
  }
}
```

### 4. Thống kê sinh viên đã đăng ký

```bash
curl -X GET http://localhost:3000/huggingface-face/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "statusCode": 200,
  "message": "Lấy thông tin thành công",
  "data": {
    "registeredCount": 5,
    "totalStudents": 100,
    "note": "Đây là demo service sử dụng simplified face recognition"
  }
}
```

### 5. Kiểm tra format ảnh đại diện

```bash
curl -X GET http://localhost:3000/huggingface-face/test-avatar/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "statusCode": 200,
  "message": "Kiểm tra format ảnh thành công",
  "data": {
    "studentId": 1,
    "studentName": "Nguyễn Văn A",
    "hasAvatar": true,
    "isValidAvatar": true,
    "isRegistered": true,
    "avatarType": "file",
    "note": "Đây là demo service sử dụng simplified face recognition"
  }
}
```

### 6. Xóa khuôn mặt sinh viên

```bash
curl -X DELETE http://localhost:3000/huggingface-face/delete-student/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "statusCode": 200,
  "message": "Xóa khuôn mặt thành công",
  "data": {
    "studentId": 1,
    "studentName": "Nguyễn Văn A",
    "deleted": true,
    "note": "Đây là demo service sử dụng simplified face recognition"
  }
}
```

## Test Scenarios

### Scenario 1: Đăng ký và xác thực thành công

1. Đăng ký khuôn mặt cho sinh viên ID 1
2. Xác thực với cùng ảnh → Kết quả: Thành công (similarity = 1.0)

### Scenario 2: Xác thực thất bại

1. Đăng ký khuôn mặt cho sinh viên ID 1
2. Xác thực với ảnh khác → Kết quả: Thất bại (similarity < 0.8)

### Scenario 3: Sinh viên chưa đăng ký

1. Xác thực sinh viên chưa đăng ký → Kết quả: Lỗi "Sinh viên chưa được đăng ký khuôn mặt"

### Scenario 4: Ảnh không hợp lệ

1. Xác thực với ảnh không tồn tại → Kết quả: Lỗi "Ảnh đầu vào không hợp lệ"

## Notes

- Service này sử dụng simplified approach nên độ chính xác không cao
- Chỉ có thể xác thực với chính xác ảnh đã đăng ký (hash-based)
- Không có face detection thực sự
- Phù hợp cho demo và testing purposes
