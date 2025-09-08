import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
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
    }); // validação dos dados no dto
  }

  async login(loginDto: LoginDto) {
    // procurar se o email do user existe
    const user = await this.UserModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Credenciais erradas.');
    }

    // comparação da senha existente com a senha hash
    const passwordMatch = await bcrypt.compare(loginDto.senha, user.senha_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais erradas.');
    }

    return {
      message: 'sucesso',
    };
  }

  async generateUserToken(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '3d' });

    return {
      accessToken,
    };
  }
}
