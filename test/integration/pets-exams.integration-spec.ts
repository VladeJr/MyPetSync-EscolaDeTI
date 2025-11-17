import { setupIntegration, closeIntegration } from './setup-integration';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Pets ↔ Exams (integração)', () => {
  let app: INestApplication;
  let token: string;
  let petId: string;

  beforeAll(async () => {
    app = await setupIntegration();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Dono',
        email: 'dono@pet.com',
        password: '123456',
      });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'dono@pet.com', password: '123456' });

    token = login.body.access_token;

    // Cria pet
    const pet = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bolt', species: 'Dog' });

    petId = pet.body._id;
  });

  afterAll(async () => {
    await closeIntegration();
  });

  it('deve registrar exame vinculado ao pet', async () => {
    const exam = await request(app.getHttpServer())
      .post('/exams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        petId,
        type: 'Hemograma',
        result: 'Normal',
      })
      .expect(201);

    expect(exam.body).toHaveProperty('type', 'Hemograma');
    expect(exam.body).toHaveProperty('petId', petId);
  });

  it('deve listar exames do pet', async () => {
    const res = await request(app.getHttpServer())
      .get('/exams')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });
});
