import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// o nome 'jwt' tem que bater com o que foi definido na JwtStrategy
export class JwtAuthGuard extends AuthGuard('jwt') {}
