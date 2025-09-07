/* eslint-disable prettier/prettier */
// src/profile/profile.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  async getProfile(userId: string) {
    // Note: the `update` method in UsersService does not return password, so this is safe
    const user = await this.usersService.update(userId, {});
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }
    // As a best practice, explicitly remove the password hash if it ever slips through
    delete user.password;
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Convert UpdateProfileDto to UpdateUserDto
    const updateUserDto: UpdateUserDto = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      phone: updateProfileDto.phone,
      address: updateProfileDto.address,
      city: updateProfileDto.city,
      state: updateProfileDto.state,
      zipCode: updateProfileDto.zipCode
    };
    
    const user = await this.usersService.update(userId, updateUserDto);
    delete user.password; // Ensure password hash is not returned
    return user;
  }
  
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findOneByIdWithPassword(userId);
    if (!user) {
      // This case should realistically never happen if user is authenticated
      throw new NotFoundException('User not found.');
    }

    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password as string,
    );

    if (!isPasswordMatching) {
      throw new ForbiddenException('Incorrect current password.');
    }
    
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    
    // Create UpdateUserDto with password field
    const updateUserDto: UpdateUserDto = {
      password: hashedPassword
    };
    
    await this.usersService.update(userId, updateUserDto);
    
    return { message: 'Password changed successfully.' };
  }
}