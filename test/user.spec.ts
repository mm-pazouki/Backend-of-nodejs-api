import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { User, UserSchema } from '../src/users/user.schema';
import axios from 'axios';
import 'dotenv/config';

describe('UserController (Integration tests with all endpoints)', () => {
  process.env.TEST_ENV = 'true';
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot('mongodb://mongo:27017/test_db', {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. POST /api/users', () => {
    it('should throw a validation error if a required parameter is missing', async () => {
      const requestBody = {
        first_name: 'John',
        last_name: 'Doe',
      };

      const axiosInstance = axios.create({
        validateStatus: () => true,
      });
      try {
        const response = await axiosInstance.post(
          'http://localhost:3000/api/users',
          requestBody,
        );
        expect(response.status).toEqual(400);
      } catch (error) {
        console.log(error.response.data);
        throw error;
      }
    });

    it('should throw a validation error if provided an invalid email value', async () => {
      const requestBody = {
        email: 'email.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'http://',
      };
      const axiosInstance = axios.create({
        validateStatus: () => true,
      });
      try {
        const response = await axiosInstance.post(
          'http://localhost:3000/api/users',
          requestBody,
        );
        expect(response.status).toEqual(400);
      } catch (error) {
        console.log(error.response.data);
        throw error;
      }
    });

    it('should store user in collection, send a welcome email message and a RabbitMQ event', async () => {
      const requestBody = {
        email: 'johndoe@email.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'http://',
      };
      const axiosInstance = axios.create();
      try {
        const response = await axiosInstance.post(
          'http://localhost:3000/api/users',
          requestBody,
        );
        expect(response.status).toEqual(201);
      } catch (error) {
        console.log(error.response.data);
        throw error;
      }
    });
  });

  describe('2. GET /api/user/{userId}', () => {
    it('should retrieve data from external API and return a user as JSON', async () => {
      const axiosInstance = axios.create();
      try {
        const response = await axiosInstance.get(
          'http://localhost:3000/api/user/5',
        );
        expect(response.status).toEqual(200);
        expect(response.data).toHaveProperty('first_name');
      } catch (error) {
        console.log(error);
        throw error;
      }
    });

    it('should return a server error if userId is greater than 12', async () => {
      const axiosInstance = axios.create({
        validateStatus: () => true,
      });
      try {
        const response = await axiosInstance.get(
          'http://localhost:3000/api/user/13',
        );
        expect(response.status).toEqual(500);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  });
});
