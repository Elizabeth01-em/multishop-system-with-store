/* eslint-disable prettier/prettier */
// src/profile/profile.controller.ts
import { Controller, Get, Body, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Endpoint for a logged-in user to fetch their own profile details.
   */
  @Get()
  getProfile(@Request() req: any) {
    // req.user is populated by JwtAuthGuard with the token payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.profileService.getProfile(userId);
  }

  /**
   * Endpoint for a logged-in user to update their own first and last name.
   */
  @Patch()
  updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.profileService.updateProfile(userId, updateProfileDto);
  }
  
  /**
   * Endpoint for a logged-in user to change their password.
   */
  @Post('change-password')
  changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const userId = req.user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.profileService.changePassword(userId, changePasswordDto);
  }
}