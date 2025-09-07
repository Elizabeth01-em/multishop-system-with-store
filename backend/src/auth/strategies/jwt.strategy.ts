/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // This method runs after the token is verified.
  // The returned value is attached to the request object as request.user
  validate(payload: {
    sub: string;
    email: string;
    role: string;
    shopId?: string; // <-- Add this line
  }) {
    // Use sub as id, and include email, role, and shopId from payload
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      shopId: payload.shopId, // <-- Add this line
    };
  }
}