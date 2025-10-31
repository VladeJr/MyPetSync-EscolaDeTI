import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserType } from 'src/users/schemas/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/mail/mail.service';
import { ProvidersService } from 'src/providers/providers.service';
import { TutorsService } from 'src/tutors/tutors.service';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private resetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly providersService: ProvidersService,
    private readonly tutorsService: TutorsService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const { email, senha, nome, tipo_usuario, type, cpf, cnpj } = createUserDto;

    const emailUnico = await this.UserModel.findOne({
      email: createUserDto.email,
    });
    if (emailUnico) {
      throw new BadRequestException('Este email já está em uso.');
    }

    const senhaHashed = await bcrypt.hash(senha, 10);

    const newUser = await this.UserModel.create({
      nome: nome,
      email: email.toLowerCase(),
      senha_hash: senhaHashed,
      tipo_usuario: tipo_usuario,
    });

    const newUserId = (newUser._id as Types.ObjectId).toString();

    if (newUser.tipo_usuario === UserType.TUTOR) {
      await this.tutorsService.createForUser(newUserId, newUser.nome, {
        name: newUser.nome,
      });
    } else if (newUser.tipo_usuario === UserType.PROVIDER) {
      await this.providersService.createForUser(
        newUserId,
        newUser.email,
        newUser.nome,
        type!,
        cpf,
        cnpj,
      );
    }

    return this.generateUserToken(newUser._id as Types.ObjectId);
  }

  async login(loginDto: LoginDto) {
    const user = await this.UserModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

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
      { userId: userId.toString() },
      { expiresIn: '1d' },
    );
    const refreshToken = uuidv4();

    await this.salvarRefreshToken(refreshToken, userId);

    return {
      token: accessToken,
      user: {
        id: userId,
      },
    };
  }

  async salvarRefreshToken(token: string, userId: Types.ObjectId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.create({ token, userId, expiryDate });
  }

  async changePassword(
    userId: Types.ObjectId,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.senha_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.senha_hash = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    const user = await this.UserModel.findOne({ email: email.toLowerCase() });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Solicitação de recuperação de senha para: ${email}`);
    }
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`E-mail não encontrado: ${email}`);
      }
      return {
        message: 'Se o usuário existir, um e-mail de redefinição foi enviado.',
      };
    }

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    const resetCode = generateCode();
    await this.resetTokenModel.create({
      token: resetCode,
      userId: user._id,
      expiryDate,
    });

    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetCode);
    } catch (mailError) {
      this.logger.error('Falha ao enviar e-mail de redefinição.', mailError);
    }

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`E-mail de redefinição enviado para: ${user.email}`);
      this.logger.log(`CÓDIGO de redefinição (para log): ${resetCode}`);
    }

    return {
      message: 'Se o usuário existir, um e-mail de redefinição foi enviado.',
    };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new BadRequestException(
        'Código de verificação inválido ou expirado.',
      );
    }

    const resetTokenDocument = await this.resetTokenModel.findOne({
      token: code,
      userId: user._id,
      expiryDate: { $gt: new Date() },
    });

    if (!resetTokenDocument) {
      throw new BadRequestException(
        `Código de verificação inválido ou expirado. Tente novamente.`,
      );
    }

    this.logger.log(
      `Código de redefinição verificado com sucesso para ${email}`,
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const resetTokenDocument = await this.resetTokenModel.findOne({
      token: token,
      expiryDate: { $gt: new Date() },
    });
    if (!resetTokenDocument) {
      throw new BadRequestException(
        `Código de redefinição inválido ou expirado`,
      );
    }

    const user = await this.UserModel.findById(resetTokenDocument.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    try {
      const senhaHashed = await bcrypt.hash(newPassword, 10);
      user.senha_hash = senhaHashed;

      await user.save();
      await this.resetTokenModel.deleteOne({ _id: resetTokenDocument._id });
      await this.RefreshTokenModel.deleteMany({ userId: user._id });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Erro ao resetar senha para user: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Erro desconhecido ao resetar senha para user`,
          String(error),
        );
      }
      throw new InternalServerErrorException(
        'Falha ao redefinir senha. Tente novamente.',
      );
    }
  }
}
