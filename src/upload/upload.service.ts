import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/auth/user.entity';
import { UserRole } from 'src/entities/auth/user.role.entity';
import { Class } from 'src/entities/center/class.entity';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Student } from 'src/entities/center/student.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Shift } from 'src/entities/shift.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Repository } from 'typeorm';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  private parseDate(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  async importData(data: any[]) {
    for (const row of data) {
      // Map đúng tên trường từ file Excel
      const name = row['Họ Tên'] || row['Họ và tên'];
      const email = row['Email'];
      const phone = row['Số Điện Thoại'] || row['Số điện thoại'];
      const username = row['Username'];
      const password = row['Password'];
      const roleName = row['Vai trò'] || row['Vai Trò'] || row['Role'];

      if (!username || !email) continue;

      // Tạo user
      let user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        user = this.userRepository.create({
          username,
          password: hashedPassword,
          email,
          isActive: true,
        });
        await this.userRepository.save(user);
      }

      // Nếu là Trợ giảng hoặc Giảng viên thì tạo user_role và teacher
      if (
        roleName &&
        (roleName.toLowerCase().includes('giảng viên') ||
          roleName.toLowerCase().includes('trợ giảng'))
      ) {
        // Tạo user_role với roleId = 2
        await this.userRoleRepository.save({
          user: { id: user.id },
          role: { id: 2 },
        });
        // Tạo teacher
        let teacher = await this.teacherRepository.findOne({
          where: { userId: user.id },
        });
        if (!teacher) {
          teacher = this.teacherRepository.create({
            userId: user.id,
            name,
            email,
            phone,
            // Có thể bổ sung các trường khác nếu cần
          });
          await this.teacherRepository.save(teacher);
        }
      }

      // Tạo student như cũ nếu cần
      let student = await this.studentListRepository.findOne({
        where: { email },
      });
      if (!student) {
        student = this.studentListRepository.create({
          name,
          email,
          phone,
          userId: user.id,
        });
        await this.studentListRepository.save(student);
      }
    }
  }

  async importMultiSheet(allData: { [sheet: string]: any[] }) {
    // Sheet học viên
    const studentSheet = Object.keys(allData).find((s) =>
      s.toLowerCase().includes('học viên'),
    );
    if (studentSheet) {
      for (const row of allData[studentSheet]) {
        const name = row['Họ Tên'] || row['Họ và tên'];
        const email = row['Email'];
        const phone = row['Số Điện Thoại'] || row['Số điện thoại'];
        const username = row['Username'];
        const password = row['Password'];
        if (!username || !email) continue;
        let user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
          const passwordStr = (password || '123456').toString();
          const hashedPassword = await bcrypt.hash(passwordStr, 10);
          user = this.userRepository.create({
            username,
            password: hashedPassword,
            email,
            isActive: true,
          });
          await this.userRepository.save(user);
        }
        // Gán role sinh viên (roleId = 3)
        await this.userRoleRepository.save({
          user: { id: user.id },
          role: { id: 3 },
        });
        let student = await this.studentListRepository.findOne({
          where: { email },
        });
        if (!student) {
          student = this.studentListRepository.create({
            name,
            email,
            phone,
            userId: user.id,
          });
          await this.studentListRepository.save(student);
        }
      }
    }
    // Sheet giảng viên/trợ giảng
    const teacherSheet = Object.keys(allData).find((s) =>
      s.toLowerCase().includes('giảng viên'),
    );
    if (teacherSheet) {
      for (const row of allData[teacherSheet]) {
        const name = row['Họ Tên'] || row['Họ và tên'];
        const email = row['Email'];
        const phone = row['Số Điện Thoại'] || row['Số điện thoại'];
        const username = row['Username'];
        const password = row['Password'];
        const roleName = row['Vai trò'] || row['Vai Trò'] || row['Role'];
        console.log('Teacher row:', row);
        console.log('roleName:', roleName);
        if (!username || !email) continue;
        let user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
          const passwordStr = (password || '123456').toString();
          const hashedPassword = await bcrypt.hash(passwordStr, 10);
          user = this.userRepository.create({
            username,
            password: hashedPassword,
            email,
            isActive: true,
          });
          await this.userRepository.save(user);
        }
        if (
          roleName &&
          (roleName.toLowerCase().includes('giảng viên') ||
            roleName.toLowerCase().includes('trợ giảng'))
        ) {
          console.log('Creating teacher for:', username, name);
          await this.userRoleRepository.save({
            user: { id: user.id },
            role: { id: 2 },
          });
          let teacher = await this.teacherRepository.findOne({
            where: { userId: user.id },
          });
          if (!teacher) {
            teacher = this.teacherRepository.create({
              userId: user.id,
              name,
              email,
              phone,
            });
            await this.teacherRepository.save(teacher);
            console.log('Teacher created:', teacher);
          }
        }
      }
    }
  }
}
