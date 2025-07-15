# Stream Face Recognition - Hướng dẫn sử dụng

## Tổng quan

Chức năng Stream Face Recognition cho phép nhận diện khuôn mặt real-time từ camera stream, thay vì phải chụp từng người một. Điều này rất hữu ích cho các lớp học đông học sinh.

## Các API Endpoints

### 1. Stream Face Recognition (Single Frame)

**POST** `/huggingface-face/stream-face-recognition`

Xử lý một frame ảnh từ camera stream để nhận diện học sinh trong lớp.

**Request Body:**

```json
{
  "classId": 1,
  "scheduleId": 1,
  "imageFrame": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "note": "Stream recognition session"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Stream face recognition hoàn thành",
  "data": {
    "success": true,
    "recognizedStudents": [
      {
        "studentId": 1,
        "studentName": "Nguyễn Văn A",
        "confidence": 0.95,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "totalFacesDetected": 1,
    "message": "Đã nhận diện 1 học sinh trong lớp",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Batch Stream Face Recognition

**POST** `/huggingface-face/batch-stream-face-recognition`

Xử lý nhiều frame ảnh cùng lúc để tăng độ chính xác.

**Request Body:**

```json
{
  "classId": 1,
  "scheduleId": 1,
  "imageFrames": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  ],
  "note": "Batch stream recognition"
}
```

### 3. Stream Status

**GET** `/huggingface-face/stream-status/:classId`

Lấy trạng thái stream recognition cho lớp học.

**Response:**

```json
{
  "statusCode": 200,
  "message": "Lấy trạng thái stream thành công",
  "data": {
    "classId": 1,
    "totalStudents": 30,
    "studentsWithAvatars": 28,
    "attendanceStats": {
      "today": {
        "present": 25,
        "absent": 5,
        "total": 30
      },
      "date": "2024-01-15"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Cách sử dụng trong Frontend

### 1. Setup Camera Stream

```javascript
// Mở camera và bắt đầu stream
const startCameraStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        facingMode: 'user', // Front camera
      },
    });

    const video = document.getElementById('camera-video');
    video.srcObject = stream;
    video.play();

    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
};
```

### 2. Capture Frames và gửi lên Server

```javascript
// Capture frame từ video stream
const captureFrame = (video) => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.8);
};

// Gửi frame lên server
const sendFrameToServer = async (classId, scheduleId, imageFrame) => {
  try {
    const response = await fetch('/huggingface-face/stream-face-recognition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        scheduleId,
        imageFrame,
        note: 'Real-time stream recognition',
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending frame:', error);
  }
};
```

### 3. Real-time Stream Processing

```javascript
// Xử lý stream real-time
const processStream = async (classId, scheduleId) => {
  const video = document.getElementById('camera-video');
  const stream = await startCameraStream();

  // Xử lý frame mỗi 2 giây
  const interval = setInterval(async () => {
    const frame = captureFrame(video);
    const result = await sendFrameToServer(classId, scheduleId, frame);

    if (result.data.success && result.data.recognizedStudents.length > 0) {
      // Hiển thị kết quả nhận diện
      displayRecognitionResults(result.data.recognizedStudents);
    }
  }, 2000); // 2 giây mỗi frame

  return interval;
};

// Hiển thị kết quả nhận diện
const displayRecognitionResults = (students) => {
  const resultsContainer = document.getElementById('recognition-results');
  resultsContainer.innerHTML = '';

  students.forEach((student) => {
    const studentElement = document.createElement('div');
    studentElement.className = 'recognized-student';
    studentElement.innerHTML = `
      <h4>${student.studentName}</h4>
      <p>Confidence: ${(student.confidence * 100).toFixed(1)}%</p>
      <p>Time: ${new Date(student.timestamp).toLocaleTimeString()}</p>
    `;
    resultsContainer.appendChild(studentElement);
  });
};
```

### 4. Batch Processing

```javascript
// Xử lý nhiều frame cùng lúc
const processBatchFrames = async (classId, scheduleId) => {
  const video = document.getElementById('camera-video');
  const frames = [];

  // Capture 5 frames
  for (let i = 0; i < 5; i++) {
    frames.push(captureFrame(video));
    await new Promise((resolve) => setTimeout(resolve, 500)); // Đợi 0.5s
  }

  // Gửi batch lên server
  const response = await fetch(
    '/huggingface-face/batch-stream-face-recognition',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        scheduleId,
        imageFrames: frames,
        note: 'Batch processing',
      }),
    },
  );

  const result = await response.json();
  return result;
};
```

## Tối ưu hóa Performance

### 1. Frame Rate Control

- Không gửi frame quá nhanh (recommend: 2-3 giây/frame)
- Sử dụng batch processing cho độ chính xác cao hơn

### 2. Image Quality

- Sử dụng JPEG với quality 0.8-0.9
- Giảm resolution nếu cần (640x480 là đủ)

### 3. Error Handling

```javascript
const handleStreamError = (error) => {
  console.error('Stream error:', error);
  // Retry logic hoặc fallback
  if (error.name === 'NotAllowedError') {
    alert('Vui lòng cho phép truy cập camera');
  }
};
```

## Lưu ý quan trọng

1. **Privacy**: Đảm bảo học sinh đồng ý với việc sử dụng camera
2. **Performance**: Không gửi frame quá nhanh để tránh overload server
3. **Accuracy**: Sử dụng batch processing cho kết quả chính xác hơn
4. **Fallback**: Luôn có phương án backup (manual attendance) nếu stream fail

## Troubleshooting

### Camera không hoạt động

- Kiểm tra quyền truy cập camera
- Thử refresh trang
- Kiểm tra HTTPS (camera chỉ hoạt động trên HTTPS)

### Nhận diện không chính xác

- Tăng số lượng frame trong batch
- Kiểm tra chất lượng ảnh avatar của học sinh
- Điều chỉnh lighting trong phòng

### Server overload

- Giảm frame rate
- Sử dụng batch processing thay vì single frame
- Tối ưu image size trước khi gửi
