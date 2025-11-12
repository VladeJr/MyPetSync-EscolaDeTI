import { app } from './setup-e2e';
import request from 'supertest';

describe('Users E2E', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'vlade@test.com', password: '123456' });
    token = res.body.access_token;
  });

  it('GET /users/me deve retornar perfil do tutor logado', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', 'vlade@test.com');
  });
});
