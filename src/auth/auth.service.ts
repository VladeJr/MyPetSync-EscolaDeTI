import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const emailUnico = await this.UserModel.findOne({
      email: createUserDto.email,
    });
    if (emailUnico) {
      throw new BadRequestException('Este email já está em uso.'); // validação de email
    }

    const senhaHashed = await bcrypt.hash(createUserDto.senha, 10); // hash de senha com saltRounds 10

    await this.UserModel.create({
      nome: createUserDto.nome,
      email: createUserDto.email,
      senha_hash: senhaHashed,
      tipo_usuario: createUserDto.tipo_usuario,
    }); // validação dos dados no dto
  }

  async login(loginDto: LoginDto) {
    // procurar se o usuário existe por email
    const user = await this.UserModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // comparação da senha existente com a senha hash
    const passwordMatch = await bcrypt.compare(loginDto.senha, user.senha_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.generateUserToken(user._id as Types.ObjectId);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const token = await this.RefreshTokenModel.findOneAndDelete({
      token: refreshTokenDto.refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh token é inválido');
    }

    return this.generateUserToken(token.userId);
  }

  async generateUserToken(userId: Types.ObjectId) {
    const accessToken = this.jwtService.sign(
      { userId: userId.toString() }, // garante string no payload do JWT
      { expiresIn: '3d' },
    );
    const refreshToken = uuidv4(); // id unico para o refresh token

    await this.salvarRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async salvarRefreshToken(token: string, userId: Types.ObjectId) {
    // calcula a data de validade do refresh token,
    // setado para 3 dias a partir de agora
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.create({ token, userId, expiryDate });
  }
}
