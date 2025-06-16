import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Shift } from 'src/entities/shift.entity';
import { Classroom } from 'src/entities/center/classroom.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Student)
    private readonly studentListRepository: Repository<Student>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}

  private parseDate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  async importData(data: any) {
    // Lấy thông tin lớp học
    const className = data['Column6'][1];
    const shiftName = data['Column8'][1];

    // Tạo hoặc tìm lớp học
    let classEntity = await this.classRepository.findOne({
      where: { name: className },
    });
    if (!classEntity) {
      classEntity = this.classRepository.create({ name: className });
      await this.classRepository.save(classEntity);
    }
    // Tìm shift
    let shiftEntity = await this.shiftRepository.findOne({
      where: { name: shiftName },
    });
    if (!shiftEntity) {
      throw new Error(`Shift with name ${shiftName} does not exist`);
    }

    // Lặp qua dữ liệu sinh viên để tạo hoặc cập nhật sinh viên
    for (let i = 1; i < data['Column1'].length; i++) {
      const studentId = data['Column2'][i];
      const studentName = data['Column3'][i];
      const birthDateString = data['Column4'][i];
      const birthDate = this.parseDate(birthDateString);

      let studentEntity = await this.studentListRepository.findOne({
        where: { studentId },
      });
      if (!studentEntity) {
        studentEntity = this.studentListRepository.create({
          studentId,
          name: studentName,
          birthdate: birthDate,
          email: studentName + '@example.com',
          class: classEntity,
        });
        await this.studentListRepository.save(studentEntity);
      }
    }

    // Tạo lịch trình
    for (let i = 1; i < data['Column9'].length; i++) {
      const scheduleDateString = data['Column9'][i];
      const date = moment('1899-12-30')
        .add(scheduleDateString, 'days')
        .format('YYYY-MM-DD'); // Định dạng ngày thành DD/MM/YYYY
      const scheduleEntity = this.scheduleRepository.create({
        date: date, // Chuyển đổi thành Date
        shift: shiftEntity,
        class: classEntity,
      });
      await this.scheduleRepository.save(scheduleEntity);
    }
  }
}
