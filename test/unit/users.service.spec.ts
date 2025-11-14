import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/users/users.service';
import { getModelToken } from '@nestjs/mongoose';

describe('UsersService', () => {
  let service: UsersService;
  const mockUserModel = {
    create: jest.fn().mockResolvedValue({ email: 'user@test.com' }),
    findById: jest.fn().mockResolvedValue({ _id: '1', email: 'user@test.com' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve criar usuário', async () => {
    const user = await (service as any).create({ email: 'user@test.com', password: '123' });
    expect(user.email).toBe('user@test.com');
  });

  it('deve buscar usuário pelo id', async () => {
    const found = await (service as any).findById('1');
    expect(found.email).toBe('user@test.com');
  });
});
