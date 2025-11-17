import { setupIntegration, closeIntegration } from './setup-integration';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Appointments (integração)', () => {
  let app: INestApplication;
  let token: string;
  let petId: string;

  beforeAll(async () => {
    app = await setupIntegration();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Agendamento',
        email: 'ag@pet.com',
        password: '123456',
      });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ag@pet.com', password: '123456' });

    token = login.body.access_token;

    const pet = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Fido', species: 'Dog' });

    petId = pet.body._id;
  });

  afterAll(async () => {
    await closeIntegration();
  });

  it('deve criar agendamento vinculado ao pet', async () => {
    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        petId,
        service: 'Vacinação',
        date: '2025-11-20T10:00:00Z',
      })
      .expect(201);

    expect(res.body).toHaveProperty('service', 'Vacinação');
  });

  it('deve listar agendamentos', async () => {
    const list = await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
  });
});
