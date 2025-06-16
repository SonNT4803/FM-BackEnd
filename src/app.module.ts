import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionprogramModule } from './admissions/admissionprogram/admissionprogram.module';
import { ApplicationModule } from './admissions/application/application.module';
import { ApplicationdocumentsModule } from './admissions/applicationdocuments/applicationdocuments.module';
import { AttacheddocumentsModule } from './admissions/attacheddocuments/attacheddocuments.module';
import { IntensivecareModule } from './admissions/intensivecare/intensivecare.module';
import { PriorityModule } from './admissions/priority/priority.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { BuildingModule } from './center/building/building.module';
import { ClassModule } from './center/class/class.module';
import { ClassroomModule } from './center/classroom/classroom.module';
import { CohortModule } from './center/cohort/cohort.module';
import { StudentModule } from './center/student/student.module';
import { StudentprofileModule } from './center/studentprofile/studentprofile.module';
import { CoursesModule } from './courses/courses.module';
import { CoursesfamilyModule } from './coursesfamily/coursesfamily.module';
import { GradecomponentModule } from './grades/gradecomponent/gradecomponent.module';
import { GradefinalModule } from './grades/gradefinal/gradefinal.module';
import { ModuleModule } from './module/module.module';
import { ParentModule } from './parent/parent.module';
import { PermissionModule } from './permission/permission.module';
import { PromotionModule } from './promotion/promotion.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { RoleModule } from './role/role.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SemesterModule } from './semester/semester.module';
import { ShiftModule } from './shift/shift.module';
import { TeacherModule } from './teacher/teacher.module';
import { UploadModule } from './upload/upload.module';
import { UserRoleModule } from './user-role/user-role.module';
import { UserModule } from './user/user.module';
import { GradecategoryModule } from './grades/gradecategory/gradecategory.module';
import { ExamtypeModule } from './center/exam/examtype/examtype.module';
import { ExamScheduleMasterModule } from './center/exam/exam_schedule_master/exam_schedule_master.module';
import { ExamRoomModule } from './center/exam/exam_room/exam_room.module';
import { FaceRecognitionModule } from './face-recognition/face-recognition.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { StudentResitModule } from './center/student-resit/student-resit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      // password: 'lht@39412990',
      password: '123456',
      entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
      database: 'attendence_system_v2',
      synchronize: true,
      // logging: true,
    }),
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    UserRoleModule,
    RolePermissionModule,
    ClassModule,
    BuildingModule,
    ClassroomModule,
    CoursesModule,
    CoursesfamilyModule,
    ModuleModule,
    ShiftModule,
    StudentModule,
    AttendanceModule,
    ScheduleModule,
    UploadModule,
    TeacherModule,
    PromotionModule,
    ApplicationModule,
    AttacheddocumentsModule,
    AdmissionprogramModule,
    ApplicationdocumentsModule,
    CohortModule,
    ParentModule,
    StudentprofileModule,
    SemesterModule,
    GradefinalModule,
    GradecomponentModule,
    GradecategoryModule,
    PriorityModule,
    IntensivecareModule,
    ExamtypeModule,
    ExamScheduleMasterModule,
    ExamRoomModule,
    FaceRecognitionModule,
    EvaluationModule,
    StudentResitModule,
  ],
})
export class AppModule {}
