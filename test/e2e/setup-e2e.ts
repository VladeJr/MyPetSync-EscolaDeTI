import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

export let app: INestApplication;
export let server: any;

export async function initE2E() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
  server = app.getHttpServer();

  return { app, server };
}

export async function closeE2E() {
  if (app) await app.close();
}
