import { FaceClient } from '@azure/cognitiveservices-face';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceService } from '../attendance/attendance.service';
import { Class } from '../entities/center/class.entity';
import { Student } from '../entities/center/student.entity';
import { Schedule } from '../entities/schedule.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AzureFaceService {
  private faceClient: FaceClient;
  private personGroupId = 'students-group';

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private readonly attendanceService: AttendanceService,
  ) {
    this.initializeAzureFaceClient();
  }

  private initializeAzureFaceClient() {
    const subscriptionKey =
      '5QpqYCVDdb7FYCxwNEdGc3EMlJrMbej87sLhrfNAVY86J4mwxKfmJQQJ99BFACqBBLyXJ3w3AAAKACOGDHWO';
    const endpoint = 'https://fmfpt-azure-api.cognitiveservices.azure.com/';
    console.log(subscriptionKey, endpoint);
    if (!subscriptionKey || !endpoint) {
      console.log(subscriptionKey, endpoint);
      console.warn(
        'Azure Face API credentials not found. Please set AZURE_FACE_SUBSCRIPTION_KEY and AZURE_FACE_ENDPOINT environment variables.',
      );
      return;
    }

    const credentials = new CognitiveServicesCredentials(subscriptionKey);
    this.faceClient = new FaceClient(credentials, endpoint);
  }

  private async ensurePersonGroupExists() {
    if (!this.faceClient) {
      throw new BadRequestException('Azure Face API not configured');
    }

    try {
      await this.faceClient.personGroup.get(this.personGroupId);
    } catch (error) {
      // Person group doesn't exist, create it
      await this.faceClient.personGroup.create(
        this.personGroupId,
        'Students Group',
      );
      console.log('Created person group:', this.personGroupId);
    }
  }

  /**
   * Load image from different sources (file path or base64)
   */
  private async loadImage(imageSource: string): Promise<Buffer> {
    try {
      // If it's a base64 data URL
      if (imageSource.startsWith('data:image/')) {
        const base64Data = imageSource.replace(/^data:image\/\w+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
      }

      // If it's a file path (from uploads folder)
      let filePath = imageSource;

      // Remove leading slash if exists and make it relative to project root
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1); // Remove leading slash
      }

      // If it's not absolute, make it relative to project root
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read file and return buffer
      return fs.readFileSync(filePath);
    } catch (error) {
      console.error('Error loading image:', error);
      throw new BadRequestException(`Không thể đọc ảnh: ${error.message}`);
    }
  }

  /**
   * Check if student has valid avatar (either file path or base64)
   */
  private isValidAvatar(avatar: string): boolean {
    if (!avatar) return false;

    // Check if it's base64 data URL
    if (avatar.startsWith('data:image/')) return true;

    // Check if it's a file path
    let filePath = avatar;

    // Remove leading slash if exists
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }

    // If it's not absolute, make it relative to project root
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    return fs.existsSync(filePath);
  }

  private async createPersonForStudent(student: Student): Promise<string> {
    if (!this.faceClient) {
      throw new BadRequestException('Azure Face API not configured');
    }

    await this.ensurePersonGroupExists();

    // Create person
    const person = await this.faceClient.personGroupPerson.create(
      this.personGroupId,
      {
        name: student.name,
        userData: JSON.stringify({ studentId: student.id }),
      },
    );

    // Add face to person
    if (student.avatar && this.isValidAvatar(student.avatar)) {
      try {
        const imageBuffer = await this.loadImage(student.avatar);

        await this.faceClient.personGroupPerson.addFaceFromStream(
          this.personGroupId,
          person.personId,
          imageBuffer,
        );

        console.log(`Added face for student ${student.id} (${student.name})`);
      } catch (error) {
        console.error(`Error adding face for student ${student.id}:`, error);
        throw new BadRequestException(
          `Không thể thêm khuôn mặt cho sinh viên: ${error.message}`,
        );
      }
    }

    return person.personId;
  }

  private async findPersonByStudentId(
    studentId: number,
  ): Promise<string | null> {
    if (!this.faceClient) {
      throw new BadRequestException('Azure Face API not configured');
    }

    try {
      const persons = await this.faceClient.personGroupPerson.list(
        this.personGroupId,
      );

      for (const person of persons) {
        if (person.userData) {
          const userData = JSON.parse(person.userData);
          if (userData.studentId === studentId) {
            return person.personId;
          }
        }
      }
    } catch (error) {
      console.error('Error finding person by student ID:', error);
    }

    return null;
  }

  async registerStudentFace(studentId: number): Promise<any> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new BadRequestException('Không tìm thấy sinh viên');
      }

      if (!student.avatar || !this.isValidAvatar(student.avatar)) {
        throw new BadRequestException('Sinh viên không có ảnh đại diện hợp lệ');
      }

      // Check if person already exists
      let personId = await this.findPersonByStudentId(studentId);

      if (!personId) {
        personId = await this.createPersonForStudent(student);
      }

      // Train the person group
      await this.faceClient.personGroup.train(this.personGroupId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Đăng ký khuôn mặt thành công',
        data: {
          studentId,
          personId,
          studentName: student.name,
          avatarType: student.avatar.startsWith('data:image/')
            ? 'base64'
            : 'file',
        },
      };
    } catch (error) {
      console.error('Error registering student face:', error);
      throw new BadRequestException(`Lỗi đăng ký khuôn mặt: ${error.message}`);
    }
  }

  async verifyFace(
    image: string,
    studentId: number,
    scheduleId: number,
    note?: string,
  ): Promise<any> {
    try {
      if (!this.faceClient) {
        throw new BadRequestException('Azure Face API not configured');
      }

      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new BadRequestException('Không tìm thấy sinh viên');
      }

      if (!image || !this.isValidAvatar(image)) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      // Find person ID for the student
      const personId = await this.findPersonByStudentId(studentId);
      if (!personId) {
        throw new BadRequestException('Sinh viên chưa được đăng ký khuôn mặt');
      }

      // Load and detect faces in the input image
      const imageBuffer = await this.loadImage(image);

      const detectedFaces = await this.faceClient.face.detectWithStream(
        imageBuffer,
        {
          returnFaceId: true,
          recognitionModel: 'recognition_04',
        },
      );

      if (!detectedFaces || detectedFaces.length === 0) {
        throw new BadRequestException(
          'Không phát hiện được khuôn mặt trong ảnh',
        );
      }

      if (detectedFaces.length > 1) {
        throw new BadRequestException(
          'Phát hiện nhiều khuôn mặt trong ảnh. Vui lòng chỉ chụp một khuôn mặt',
        );
      }

      const faceId = detectedFaces[0].faceId;

      // Identify the face
      const identifyResults = await this.faceClient.face.identify([faceId], {
        personGroupId: this.personGroupId,
        confidenceThreshold: 0.5,
      });

      if (
        !identifyResults ||
        identifyResults.length === 0 ||
        !identifyResults[0].candidates ||
        identifyResults[0].candidates.length === 0
      ) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Xác thực khuôn mặt thất bại',
          data: { verified: false },
        };
      }

      const bestMatch = identifyResults[0].candidates[0];
      const isVerified =
        bestMatch.personId === personId && bestMatch.confidence >= 0.5;

      if (!isVerified) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Xác thực khuôn mặt thất bại',
          data: { verified: false },
        };
      }

      // Get schedule information
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId },
        relations: ['class', 'teacher'],
      });

      if (!schedule) {
        throw new BadRequestException(
          `Không tìm thấy lịch học với ID ${scheduleId}`,
        );
      }

      // Create attendance record using markAttendance method
      const attendanceData = {
        studentId,
        classId: schedule.class.id,
        teacherId: schedule.teacher.id,
        scheduleId,
        status: 1, // present
        note: note || 'Xác thực bằng khuôn mặt',
      };

      const attendance =
        await this.attendanceService.markAttendance(attendanceData);

      return {
        statusCode: HttpStatus.OK,
        message: 'Xác thực khuôn mặt thành công',
        data: {
          verified: true,
          confidence: bestMatch.confidence,
          student: {
            id: student.id,
            name: student.name,
            studentId: student.studentId,
          },
          schedule: {
            id: schedule.id,
            className: schedule.class?.name,
            teacherName: schedule.teacher?.name,
          },
          attendance: {
            id: attendance.id,
            status: attendance.status,
            updatedAt: attendance.updatedAt,
          },
        },
      };
    } catch (error) {
      console.error('Error verifying face:', error);
      throw new BadRequestException(`Lỗi xác thực khuôn mặt: ${error.message}`);
    }
  }

  async verifyClass(
    image: string,
    classId: number,
    teacherId: number,
    scheduleId: number,
  ): Promise<any> {
    try {
      if (!this.faceClient) {
        throw new BadRequestException('Azure Face API not configured');
      }

      // Get class and students
      const classInfo = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['students'],
      });

      if (!classInfo) {
        throw new BadRequestException('Không tìm thấy lớp học');
      }

      if (!image || !this.isValidAvatar(image)) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      // Load and detect faces in the input image
      const imageBuffer = await this.loadImage(image);

      const detectedFaces = await this.faceClient.face.detectWithStream(
        imageBuffer,
        {
          returnFaceId: true,
          recognitionModel: 'recognition_04',
        },
      );

      if (!detectedFaces || detectedFaces.length === 0) {
        throw new BadRequestException(
          'Không phát hiện được khuôn mặt trong ảnh',
        );
      }

      const faceIds = detectedFaces.map((face) => face.faceId);

      // Identify all faces
      const identifyResults = await this.faceClient.face.identify(faceIds, {
        personGroupId: this.personGroupId,
        confidenceThreshold: 0.5,
      });

      const verifiedStudents = [];
      const attendanceRecords = [];

      // Process each identified face
      for (const identifyResult of identifyResults) {
        if (identifyResult.candidates && identifyResult.candidates.length > 0) {
          const bestMatch = identifyResult.candidates[0];

          // Find student by person ID
          const persons = await this.faceClient.personGroupPerson.list(
            this.personGroupId,
          );
          let matchedStudent = null;

          for (const person of persons) {
            if (person.personId === bestMatch.personId && person.userData) {
              const userData = JSON.parse(person.userData);
              matchedStudent = classInfo.students.find(
                (s) => s.id === userData.studentId,
              );
              break;
            }
          }

          if (matchedStudent && bestMatch.confidence >= 0.5) {
            verifiedStudents.push({
              student: matchedStudent,
              confidence: bestMatch.confidence,
            });

            // Create attendance record
            const attendanceData = {
              studentId: matchedStudent.id,
              classId,
              teacherId,
              scheduleId,
              status: 1, // present
              note: 'Xác thực bằng khuôn mặt (chụp nhóm)',
            };

            const attendance =
              await this.attendanceService.markAttendance(attendanceData);
            attendanceRecords.push(attendance);
          }
        }
      }

      return {
        statusCode: HttpStatus.OK,
        message: `Xác thực thành công ${verifiedStudents.length} sinh viên`,
        data: {
          totalFacesDetected: detectedFaces.length,
          verifiedStudents: verifiedStudents.length,
          students: verifiedStudents.map((vs) => ({
            id: vs.student.id,
            name: vs.student.name,
            studentId: vs.student.studentId,
            confidence: vs.confidence,
          })),
          attendanceRecords: attendanceRecords.map((ar) => ({
            id: ar.id,
            studentId: ar.studentId,
            status: ar.status,
            updatedAt: ar.updatedAt,
          })),
        },
      };
    } catch (error) {
      console.error('Error verifying class:', error);
      throw new BadRequestException(`Lỗi xác thực lớp học: ${error.message}`);
    }
  }

  async deleteStudentFace(studentId: number): Promise<any> {
    try {
      if (!this.faceClient) {
        throw new BadRequestException('Azure Face API not configured');
      }

      const personId = await this.findPersonByStudentId(studentId);
      if (!personId) {
        throw new BadRequestException('Sinh viên chưa được đăng ký khuôn mặt');
      }

      await this.faceClient.personGroupPerson.deleteMethod(
        this.personGroupId,
        personId,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa khuôn mặt sinh viên thành công',
        data: { studentId },
      };
    } catch (error) {
      console.error('Error deleting student face:', error);
      throw new BadRequestException(`Lỗi xóa khuôn mặt: ${error.message}`);
    }
  }

  async getPersonGroupStatus(): Promise<any> {
    try {
      if (!this.faceClient) {
        throw new BadRequestException('Azure Face API not configured');
      }

      const trainingStatus =
        await this.faceClient.personGroup.getTrainingStatus(this.personGroupId);
      const persons = await this.faceClient.personGroupPerson.list(
        this.personGroupId,
      );

      return {
        statusCode: HttpStatus.OK,
        data: {
          personGroupId: this.personGroupId,
          trainingStatus: trainingStatus.status,
          totalPersons: persons.length,
          persons: persons.map((person) => ({
            personId: person.personId,
            name: person.name,
            userData: person.userData ? JSON.parse(person.userData) : null,
          })),
        },
      };
    } catch (error) {
      console.error('Error getting person group status:', error);
      throw new BadRequestException(`Lỗi lấy thông tin nhóm: ${error.message}`);
    }
  }

  /**
   * Test method to check avatar format and validity
   */
  async testAvatarFormat(studentId: number): Promise<any> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new BadRequestException('Không tìm thấy sinh viên');
      }

      if (!student.avatar) {
        return {
          hasAvatar: false,
          message: 'Sinh viên không có ảnh đại diện',
        };
      }

      const isValid = this.isValidAvatar(student.avatar);
      const avatarType = student.avatar.startsWith('data:image/')
        ? 'base64'
        : 'file';

      // Debug information
      let debugInfo = {
        originalPath: student.avatar,
        processedPath: student.avatar,
        absolutePath: '',
        fileExists: false,
      };

      if (avatarType === 'file') {
        let filePath = student.avatar;

        // Remove leading slash if exists
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }

        // Make it absolute
        const absolutePath = path.join(process.cwd(), filePath);

        debugInfo = {
          originalPath: student.avatar,
          processedPath: filePath,
          absolutePath: absolutePath,
          fileExists: fs.existsSync(absolutePath),
        };
      }

      return {
        hasAvatar: true,
        isValid,
        avatarType,
        avatarPath: student.avatar,
        debugInfo,
        message: isValid
          ? `Ảnh hợp lệ (${avatarType})`
          : 'Ảnh không hợp lệ hoặc file không tồn tại',
      };
    } catch (error) {
      console.error('Error in testAvatarFormat:', error);
      throw new BadRequestException(`Lỗi kiểm tra ảnh: ${error.message}`);
    }
  }
}
