import request from 'supertest';
import { initE2E, closeE2E, server } from './setup-e2e';

let token: string;

describe('Pets E2E', () => {
  beforeAll(async () => {
    await initE2E();

    const login = await request(server)
      .post('/auth/login')
      .send({
        email: 'tester@example.com',
        password: '123456',
      });

    token = login.body.access_token;
  });

  afterAll(async () => {
    await closeE2E();
  });

  it('POST /pets deve criar um novo pet', async () => {
    const res = await request(server)
      .post('/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bolt',
        species: 'Dog',
        breed: 'Labrador',
        weight: 20,
        birthDate: '2022-05-01',
      })
      .expect(201);

    expect(res.body).toHaveProperty('name', 'Bolt');
  });

  it('GET /pets deve listar pets do tutor', async () => {
    const res = await request(server)
      .get('/pets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
