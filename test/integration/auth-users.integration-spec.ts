import { setupIntegration, closeIntegration } from './setup-integration';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Auth ↔ Users (integração)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupIntegration();
  });

  afterAll(async () => {
    await closeIntegration();
  });

  it('deve registrar e buscar usuário', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Teste',
        email: 'teste@int.com',
        password: '123456',
      })
      .expect(201);

    expect(register.body).toHaveProperty('email', 'teste@int.com');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'teste@int.com',
        password: '123456',
      })
      .expect(201);

    expect(login.body).toHaveProperty('access_token');
  });
});
