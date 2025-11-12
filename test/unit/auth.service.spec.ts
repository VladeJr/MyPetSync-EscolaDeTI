import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue({
        _id: '123',
        email: 'test@mail.com',
        password: await bcrypt.hash('123456', 10),
      }),
    } as Partial<UsersService>;

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve validar credenciais e retornar token JWT', async () => {
    const result = await service.login({ email: 'test@mail.com', senha: '123456' });
    expect(result.token).toBe('mocked_token');
  });

  it('deve lançar erro se senha for inválida', async () => {
    await expect(
      service.login({ email: 'test@mail.com', senha: 'senha_errada' }),
    ).rejects.toThrow();
  });
});
