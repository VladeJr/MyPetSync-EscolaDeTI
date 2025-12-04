import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as passportJwt from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  userId: string;
  email?: string;
  role: 'tutor' | 'provider' | 'admin' | string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error(
        'JWT_SECRET não configurado. Impossível iniciar JwtStrategy.',
      );
    }

    super({
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
}
