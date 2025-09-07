/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module'; // <-- Import UsersModule

@Module({
  imports: [UsersModule], // <-- Add UsersModule here
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}