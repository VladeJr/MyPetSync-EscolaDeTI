import request from 'supertest';
import { initE2E, closeE2E, server } from './setup-e2e';

let token: string;
let petId: string;

describe('Exams E2E', () => {
  beforeAll(async () => {
    await initE2E();

    const login = await request(server)
      .post('/auth/login')
      .send({
        email: 'tester@example.com',
        password: '123456',
      });

    token = login.body.access_token;

    const pet = await request(server)
      .post('/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bolt',
        species: 'Dog',
        breed: 'Labrador',
        weight: 25,
        birthDate: '2021-08-10',
      });

    petId = pet.body.id;
  });

  afterAll(async () => {
    await closeE2E();
  });

  it('POST /exams deve criar um novo exame', async () => {
    const res = await request(server)
      .post('/exams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        petId,
        type: 'Exame de sangue',
        description: 'Hemograma completo',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
  });

  it('GET /exams/:petId deve listar exames do pet', async () => {
    const res = await request(server)
      .get(`/exams/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
