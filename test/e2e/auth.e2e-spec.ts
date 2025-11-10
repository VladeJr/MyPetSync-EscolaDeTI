import request from 'supertest';
import { initE2E, closeE2E, server } from './setup-e2e';

describe('Auth E2E', () => {
  beforeAll(async () => {
    await initE2E();
  });

  afterAll(async () => {
    await closeE2E();
  });

  it('POST /auth/register deve criar um novo usuário', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({
        name: 'Tester',
        email: 'tester@example.com',
        password: '123456',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('tester@example.com');
  });

  it('POST /auth/login deve autenticar e retornar token JWT', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: 'tester@example.com',
        password: '123456',
      })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
  });

  it('GET /users/me deve retornar dados do usuário autenticado', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({
        email: 'tester@example.com',
        password: '123456',
      });

    const token = login.body.access_token;

    const res = await request(server)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', 'tester@example.com');
  });
});
