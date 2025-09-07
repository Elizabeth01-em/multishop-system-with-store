/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Controller,
  Request,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Set default role to CUSTOMER for registration if not provided
    const userWithRole = {
      ...createUserDto,
      role: createUserDto.role || UserRole.CUSTOMER,
    };
    
    // Create the user
    const user = await this.usersService.create(userWithRole);
    
    // Automatically log in the user after registration
    // Create a compatible user object for the login method
    const loginUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
    };
    
    return this.authService.login(loginUser);
  }
}