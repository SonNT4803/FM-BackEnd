# Google AI Integration Guide

## Tổng quan

Module `huggingface-face` đã được tích hợp với Google Generative AI để cung cấp các tính năng AI nâng cao cho việc nhận diện khuôn mặt và phân tích ảnh.

## Cài đặt

### 1. Cài đặt package

Package `@google/generative-ai` đã được cài đặt trong `package.json`.

### 2. Cấu hình API Key

Thêm API key của Google AI vào file environment:

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 3. Lấy API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy API key và thêm vào environment variables

## Các tính năng mới

### 1. Phân tích ảnh bằng AI

**Endpoint:** `POST /huggingface-face/analyze-image-ai`

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "prompt": "Hãy mô tả chi tiết về khuôn mặt trong ảnh này"
}
```

### 2. So sánh hai ảnh bằng AI

**Endpoint:** `POST /huggingface-face/compare-images-ai`

```json
{
  "image1": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "image2": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "prompt": "Hãy so sánh hai ảnh này và cho biết chúng có phải là cùng một người không"
}
```

### 3. Xác thực khuôn mặt với AI hỗ trợ

**Endpoint:** `POST /huggingface-face/verify-face-ai`

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "studentId": 1,
  "scheduleId": 1,
  "note": "Xác thực bằng AI"
}
```

### 4. Tạo text response từ AI

**Endpoint:** `POST /huggingface-face/generate-text-ai`

```json
{
  "prompt": "Giải thích về nhận diện khuôn mặt",
  "context": "Trong hệ thống điểm danh sinh viên"
}
```

### 5. Kiểm tra trạng thái AI service

**Endpoint:** `GET /huggingface-face/ai-service-info`

## Cấu trúc Service

### GoogleAIService

- `generateText(prompt: string)`: Tạo text response
- `generateTextWithContext(systemPrompt, userPrompt, context)`: Tạo text với context
- `analyzeImage(imageBase64, prompt)`: Phân tích ảnh
- `compareImages(image1Base64, image2Base64, prompt)`: So sánh hai ảnh
- `isAvailable()`: Kiểm tra service có sẵn sàng không
- `getModelInfo()`: Lấy thông tin model

### HuggingfaceFaceService (Mở rộng)

- `analyzeImageWithAI(image, prompt)`: Phân tích ảnh bằng AI
- `compareImagesWithAI(image1, image2, prompt)`: So sánh ảnh bằng AI
- `verifyFaceWithAI(image, studentId, scheduleId, note)`: Xác thực với AI
- `getAIServiceInfo()`: Thông tin AI service
- `generateTextWithAI(prompt, context)`: Tạo text với AI

## Models được sử dụng

- **gemini-pro**: Cho text generation
- **gemini-pro-vision**: Cho image analysis

## Xử lý lỗi

Service sẽ tự động xử lý các trường hợp:

- API key không hợp lệ
- Network errors
- Rate limiting
- Invalid image format

## Ví dụ sử dụng

### Phân tích ảnh khuôn mặt

```javascript
const response = await fetch('/huggingface-face/analyze-image-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: base64Image,
    prompt:
      'Hãy mô tả chi tiết về khuôn mặt, bao gồm màu tóc, màu mắt, và các đặc điểm nổi bật',
  }),
});
```

### So sánh ảnh sinh viên

```javascript
const response = await fetch('/huggingface-face/compare-images-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image1: registeredImage,
    image2: currentImage,
    prompt:
      'Đây là ảnh đăng ký và ảnh hiện tại của sinh viên. Hãy so sánh và đưa ra tỷ lệ tương đồng từ 0-100%',
  }),
});
```

## Lưu ý

1. **API Key Security**: Không bao giờ commit API key vào source code
2. **Rate Limiting**: Google AI có giới hạn request, cần xử lý gracefully
3. **Image Format**: Hỗ trợ JPEG, PNG, WebP
4. **Image Size**: Khuyến nghị dưới 4MB cho mỗi ảnh
5. **Fallback**: Nếu AI service không khả dụng, hệ thống sẽ fallback về phương pháp truyền thống

## Troubleshooting

### Lỗi "Google AI model not initialized"

- Kiểm tra `GOOGLE_AI_API_KEY` trong environment
- Đảm bảo API key hợp lệ

### Lỗi "Rate limit exceeded"

- Implement retry logic với exponential backoff
- Giảm tần suất request

### Lỗi "Invalid image format"

- Kiểm tra format ảnh (JPEG, PNG, WebP)
- Đảm bảo base64 encoding đúng
