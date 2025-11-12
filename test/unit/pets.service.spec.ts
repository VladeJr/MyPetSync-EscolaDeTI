import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from 'src/pets/pets.service';
import { getModelToken } from '@nestjs/mongoose';

describe('PetsService', () => {
  let service: PetsService;
  const mockPetModel = {
    create: jest.fn().mockResolvedValue({ name: 'Bolt', species: 'Dog' }),
    find: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([{ name: 'Bolt' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: getModelToken('Pet'), useValue: mockPetModel },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  it('deve criar um novo pet', async () => {
    const pet = await service.create('tutor-id-123', { name: 'Bolt', species: 'Dog' } as any);
    expect(pet).toHaveProperty('name', 'Bolt');
  });

  it('deve listar pets', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });
});
