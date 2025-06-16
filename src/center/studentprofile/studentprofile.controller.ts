import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateStudentProfileDto } from './dto/student.profile.dto';
import { StudentprofileService } from './studentprofile.service';

@Controller('student-profile')
export class StudentprofileController {
    constructor(private readonly studentProfileService: StudentprofileService) {}

    @Post()
    async create(@Body() createStudentProfileDto: CreateStudentProfileDto) {
        return this.studentProfileService.create(createStudentProfileDto);
    }

    @Get()
    async findAll() {
        return this.studentProfileService.findAll();
    }
}
