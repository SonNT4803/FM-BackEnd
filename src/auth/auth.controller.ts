import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './guard/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (user) {
      return this.authService.login(user);
    }
    throw new UnauthorizedException();
  }

  @Post('register')
  @Public()
  async register(
    @Body() body: { username: string; password: string; roleId: number },
  ) {
    return this.authService.register(body.username, body.password, body.roleId);
  }
}
