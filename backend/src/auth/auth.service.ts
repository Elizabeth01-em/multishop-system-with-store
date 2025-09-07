/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user's password.
   * @param email The user's email
   * @param pass The plain text password
   * @returns The user object without the password, or null if validation fails.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    // Check if user exists, if they are active, AND if passwords match.
    // The checks now happen in a safe, sequential order.
    if (user && user.isActive && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    
    // If any of the above conditions fail, return null.
    return null;
  }

  /**
   * Generates a JWT for a user.
   * @param user The user object (from validateUser)
   * @returns An object containing the access token.
   */
  async login(user: { id: string; email: string; role: string; shopId?: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId ?? null,
    };
    const token = await this.jwtService.signAsync(payload);
    // Return both the token and the user object
    return {
      access_token: token,
      user,
    };
  }
}