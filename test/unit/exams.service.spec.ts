import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from 'src/exams/exams.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ExamsService', () => {
  let service: ExamsService;
  const mockExamModel = {
    create: jest.fn().mockResolvedValue({ _id: '1', type: 'Hemograma', __v: 0 }),
    find: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([{ _id: '1', type: 'Hemograma', __v: 0 }]),
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
    const createExamDto = { type: 'Hemograma' } as any;
    const res = await service.create(createExamDto);
    expect((res as any).type).toBe('Hemograma');
  });

  it('deve listar exames', async () => {
    const exams = await service.findAll({} as any);
    expect(exams.items.length).toBeGreaterThan(0);
  });
});
