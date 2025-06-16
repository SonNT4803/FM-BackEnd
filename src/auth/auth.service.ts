import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Thư viện mã hóa mật khẩu
import { UserRoleService } from 'src/user-role/user-role.service';
import { UserService } from '../user/user.service';
import { RolePermissionService } from './../role-permission/role-permission.service';
import { UserDTO } from './dto/user.dto';
import { User } from 'src/entities/auth/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userRoleService: UserRoleService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async validateUser(username: string, pass: string): Promise<UserDTO | null> {
    const user = await this.userService.findUserByUsername(username);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const userRoles = await this.userRoleService.findUserRoleById(user.id);
      const roles = userRoles.map((userRole) => userRole.role.name);
      const permissions =
        await this.rolePermissionService.findPermissionsByRoles(
          userRoles.map((userRole) => userRole.role.id),
        );
      const userDTO: UserDTO = {
        id: user.id,
        username: user.username,
        roles,
        email: user.email,
        permissions,
      };
      console.log(userDTO);
      return userDTO;
    }

    return null;
  }

  async login(userDTO: UserDTO) {
    const payload = {
      username: userDTO.username,
      sub: userDTO.id,
      roles: userDTO.roles,
      permissions: userDTO.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    username: string,
    password: string,
    roleId: number,
  ): Promise<User> {
    const existingUser = await this.userService.findUserByUsername(username);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser(
      username,
      hashedPassword,
      roleId,
    );
    return user;
  }
}
