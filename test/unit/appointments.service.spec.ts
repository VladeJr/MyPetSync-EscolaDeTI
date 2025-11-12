import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { getModelToken } from '@nestjs/mongoose';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  const mockAppointmentModel = {
    create: jest.fn().mockResolvedValue({ service: 'Banho e Tosa' }),
    find: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([{ service: 'Banho e Tosa' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getModelToken('Appointment'), useValue: mockAppointmentModel },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('deve criar um agendamento', async () => {
    const createAppointmentDto = { service: 'Banho e Tosa' } as any;
    const res = await service.create(createAppointmentDto);
    expect((res as any).service).toBe('Banho e Tosa');
  });

  it('deve listar agendamentos', async () => {
    const list = await service.findAll({} as any);
    expect(Array.isArray(list)).toBe(true);
  });
});
