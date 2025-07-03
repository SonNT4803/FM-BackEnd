import { Injectable, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class GoogleAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Khởi tạo Google Generative AI với API key từ environment
    const apiKey = 'AIzaSyAVRCJ9DgbXiog69hludGpI5pZKB1rvGAo';
    if (!apiKey) {
      console.warn('GOOGLE_AI_API_KEY not found in environment variables');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  private async urlToBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Tạo text response từ prompt
   */
  async generateText(prompt: string): Promise<string> {
    try {
      if (!this.model) {
        throw new BadRequestException(
          'Google AI model not initialized. Please check API key.',
        );
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text with Google AI:', error);
      throw new BadRequestException(
        `Lỗi tạo text với Google AI: ${error.message}`,
      );
    }
  }

  /**
   * Tạo text response với context và system prompt
   */
  async generateTextWithContext(
    systemPrompt: string,
    userPrompt: string,
    context?: string,
  ): Promise<string> {
    try {
      if (!this.model) {
        throw new BadRequestException(
          'Google AI model not initialized. Please check API key.',
        );
      }

      let fullPrompt = systemPrompt;
      if (context) {
        fullPrompt += `\n\nContext: ${context}`;
      }
      fullPrompt += `\n\nUser: ${userPrompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text with context:', error);
      throw new BadRequestException(
        `Lỗi tạo text với context: ${error.message}`,
      );
    }
  }

  /**
   * Phân tích ảnh và tạo mô tả
   */
  async analyzeImage(imageBase64: string, prompt?: string): Promise<string> {
    try {
      if (!this.genAI) {
        throw new BadRequestException(
          'Google AI not initialized. Please check API key.',
        );
      }

      // Nếu là đường dẫn uploads, chuyển thành URL public
      const PUBLIC_DOMAIN = 'https://fm-backend-izjp.onrender.com';
      if (imageBase64.startsWith('/uploads/')) {
        imageBase64 = PUBLIC_DOMAIN + imageBase64;
      }

      // Nếu là URL, tải về và chuyển sang base64
      let base64 = imageBase64;
      if (
        imageBase64.startsWith('http://') ||
        imageBase64.startsWith('https://')
      ) {
        base64 = await this.urlToBase64(imageBase64);
      } else if (!imageBase64.startsWith('data:image/')) {
        let filePath = imageBase64;
        if (filePath.startsWith('/')) filePath = filePath.substring(1);
        if (!path.isAbsolute(filePath))
          filePath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(filePath))
          throw new BadRequestException('File not found: ' + filePath);
        const buffer = fs.readFileSync(filePath);
        base64 = 'data:image/jpeg;base64,' + buffer.toString('base64');
      }

      // Sử dụng model hỗ trợ vision
      const visionModel = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      // Chuẩn bị image data
      const imageData = {
        inlineData: {
          data: base64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/jpeg',
        },
      };

      // Tạo prompt mặc định nếu không có
      const defaultPrompt =
        'Hãy mô tả chi tiết về ảnh này. Nếu có khuôn mặt, hãy mô tả các đặc điểm chính.';
      const finalPrompt = prompt || defaultPrompt;

      const result = await visionModel.generateContent([
        finalPrompt,
        imageData,
      ]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing image with Google AI:', error);
      throw new BadRequestException(
        `Lỗi phân tích ảnh với Google AI: ${error.message}`,
      );
    }
  }

  /**
   * So sánh hai ảnh và đưa ra nhận xét
   */
  async compareImages(
    image1Base64: string,
    image2Base64: string,
    prompt?: string,
  ): Promise<string> {
    try {
      if (!this.genAI) {
        throw new BadRequestException(
          'Google AI not initialized. Please check API key.',
        );
      }

      // Nếu là đường dẫn uploads, chuyển thành URL public
      const PUBLIC_DOMAIN = 'https://fm-backend-izjp.onrender.com';
      if (image1Base64.startsWith('/uploads/')) {
        image1Base64 = PUBLIC_DOMAIN + image1Base64;
      }
      if (image2Base64.startsWith('/uploads/')) {
        image2Base64 = PUBLIC_DOMAIN + image2Base64;
      }

      // Nếu là URL, tải về và chuyển sang base64
      let base64_1 = image1Base64;
      if (
        image1Base64.startsWith('http://') ||
        image1Base64.startsWith('https://')
      ) {
        base64_1 = await this.urlToBase64(image1Base64);
      } else if (!image1Base64.startsWith('data:image/')) {
        let filePath = image1Base64;
        if (filePath.startsWith('/')) filePath = filePath.substring(1);
        if (!path.isAbsolute(filePath))
          filePath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(filePath))
          throw new BadRequestException('File not found: ' + filePath);
        const buffer = fs.readFileSync(filePath);
        base64_1 = 'data:image/jpeg;base64,' + buffer.toString('base64');
      }
      let base64_2 = image2Base64;
      if (
        image2Base64.startsWith('http://') ||
        image2Base64.startsWith('https://')
      ) {
        base64_2 = await this.urlToBase64(image2Base64);
      } else if (!image2Base64.startsWith('data:image/')) {
        let filePath = image2Base64;
        if (filePath.startsWith('/')) filePath = filePath.substring(1);
        if (!path.isAbsolute(filePath))
          filePath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(filePath))
          throw new BadRequestException('File not found: ' + filePath);
        const buffer = fs.readFileSync(filePath);
        base64_2 = 'data:image/jpeg;base64,' + buffer.toString('base64');
      }

      const visionModel = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      // Chuẩn bị image data
      const image1Data = {
        inlineData: {
          data: base64_1.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/jpeg',
        },
      };

      const image2Data = {
        inlineData: {
          data: base64_2.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/jpeg',
        },
      };

      // Tạo prompt mặc định nếu không có
      const defaultPrompt =
        'Hãy so sánh hai ảnh này và cho biết chúng có phải là cùng một người không. Đưa ra tỷ lệ tương đồng từ 0-100%.';
      const finalPrompt = prompt || defaultPrompt;

      const result = await visionModel.generateContent([
        finalPrompt,
        image1Data,
        image2Data,
      ]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error comparing images with Google AI:', error);
      throw new BadRequestException(
        `Lỗi so sánh ảnh với Google AI: ${error.message}`,
      );
    }
  }

  /**
   * Kiểm tra xem service có sẵn sàng không
   */
  isAvailable(): boolean {
    return !!this.model;
  }

  /**
   * Lấy thông tin về model
   */
  getModelInfo(): any {
    if (!this.model) {
      return { available: false, message: 'Model not initialized' };
    }
    return { available: true, model: 'gemini-pro' };
  }
}
