import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

let app: INestApplication;
let mongod: MongoMemoryServer;

export const setupIntegration = async (): Promise<INestApplication> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const moduleRef = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(uri),
      AppModule,
    ],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
  return app;
};

export const closeIntegration = async () => {
  if (app) await app.close();
  if (mongod) await mongod.stop();
};
