export class UserDTO {
  id: number;
  username: string;
  email: string;
  roles: string[]; // Hoặc Role[] tùy thuộc vào cách bạn định nghĩa roles
  permissions: string[]; // Hoặc Permission[] tùy thuộc vào hệ thống của bạn
}
