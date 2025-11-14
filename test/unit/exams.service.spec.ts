import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from 'src/exams/exams.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ExamsService', () => {
  let service: ExamsService;
  const mockExamModel = {
    create: jest.fn().mockResolvedValue({ type: 'Hemograma' }),
    find: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([{ type: 'Hemograma' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: getModelToken('Exam'), useValue: mockExamModel },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('deve criar exame', async () => {
    const res = await service.create({ type: 'Hemograma' });
    expect(res.type).toBe('Hemograma');
  });

  it('deve listar exames', async () => {
    const exams = await service.findAll();
    expect(exams.length).toBeGreaterThan(0);
  });
});
