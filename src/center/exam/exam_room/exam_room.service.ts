import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamRoom } from 'src/entities/center/exam.room.entity';
import { ExamRoomStudent } from 'src/entities/center/exam.room.student.entity';
import { Repository } from 'typeorm';
import { CreateExamRoomDto, UpdateExamRoomDto } from './dto/exam-room.dto';

@Injectable()
export class ExamRoomService {
  constructor(
    @InjectRepository(ExamRoom)
    private examRoomRepo: Repository<ExamRoom>,
    @InjectRepository(ExamRoomStudent)
    private examRoomStudentRepo: Repository<ExamRoomStudent>,
  ) {}

  async create(createDto: CreateExamRoomDto) {
    // Tạo exam room
    const examRoom = new ExamRoom();
    examRoom.exam_schedule_master = {
      id: createDto.exam_schedule_master_id,
    } as any;
    examRoom.classroom = { id: createDto.classroom_id } as any;
    examRoom.teacher = { id: createDto.teacher_id } as any;
    examRoom.capacity = createDto.capacity;

    // Lưu exam room
    return await this.examRoomRepo.save(examRoom);
  }

  async addStudentsToRoom(examRoomId: number, studentIds: number[]) {
    const examRoom = await this.examRoomRepo.findOne({
      where: { id: examRoomId },
      relations: ['exam_room_students'],
    });

    if (!examRoom) {
      throw new BadRequestException('Phòng thi không tồn tại');
    }

    // Kiểm tra số lượng học sinh không vượt quá capacity
    const currentStudentCount = examRoom.exam_room_students?.length || 0;
    if (currentStudentCount + studentIds.length > examRoom.capacity) {
      throw new BadRequestException(
        'Số lượng thí sinh vượt quá sức chứa của phòng thi',
      );
    }

    // Tạo các bản ghi exam_room_students
    const examRoomStudents = studentIds.map((studentId) => {
      const examRoomStudent = new ExamRoomStudent();
      examRoomStudent.exam_room = examRoom;
      examRoomStudent.student = { id: studentId } as any;
      examRoomStudent.is_present = null;
      return examRoomStudent;
    });

    // Lưu các bản ghi exam_room_students
    await this.examRoomStudentRepo.save(examRoomStudents);
  }

  async findAll() {
    return await this.examRoomRepo.find({
      relations: [
        'exam_schedule_master',
        'classroom',
        'teacher',
        'exam_room_students',
      ],
    });
  }

  async findOne(id: number) {
    return await this.examRoomRepo.findOne({
      where: { id },
      relations: [
        'exam_schedule_master',
        'classroom',
        'teacher',
        'exam_room_students',
      ],
    });
  }

  async update(id: number, updateDto: UpdateExamRoomDto) {
    const examRoom = await this.examRoomRepo.findOne({ where: { id } });
    if (!examRoom) {
      throw new BadRequestException('Exam room not found');
    }

    if (updateDto.classroom_id) {
      examRoom.classroom = { id: updateDto.classroom_id } as any;
    }
    if (updateDto.teacher_id) {
      examRoom.teacher = { id: updateDto.teacher_id } as any;
    }
    if (updateDto.capacity) {
      examRoom.capacity = updateDto.capacity;
    }

    return await this.examRoomRepo.save(examRoom);
  }

  async remove(id: number) {
    const examRoom = await this.examRoomRepo.findOne({
      where: { id },
      relations: ['exam_room_students'],
    });

    if (!examRoom) {
      throw new BadRequestException('Không tìm thấy phòng thi để xóa');
    }

    if (examRoom.exam_room_students?.length > 0) {
      await this.examRoomStudentRepo.remove(examRoom.exam_room_students);
    }

    return await this.examRoomRepo.remove(examRoom);
  }

  async findByExamScheduleMasterId(examScheduleMasterId: number) {
    return await this.examRoomRepo.find({
      where: {
        exam_schedule_master: { id: examScheduleMasterId },
      },
      relations: [
        'exam_schedule_master',
        'classroom',
        'classroom.building',
        'teacher',
        'exam_room_students',
        'exam_room_students.student',
      ],
    });
  }

  async updateStudentPresence(
    examRoomId: number,
    studentId: number,
    data: ExamRoomStudent,
  ) {
    const examRoomStudent = await this.examRoomStudentRepo.findOne({
      where: {
        exam_room: { id: examRoomId },
        student: { id: studentId },
      },
    });

    if (!examRoomStudent) {
      throw new BadRequestException('Không tìm thấy sinh viên trong phòng thi');
    }

    // Cập nhật thông tin điểm danh
    examRoomStudent.is_present = data.is_present;
    if (data.note !== undefined) {
      examRoomStudent.note = data.note;
    }

    return await this.examRoomStudentRepo.save(examRoomStudent);
  }
}
