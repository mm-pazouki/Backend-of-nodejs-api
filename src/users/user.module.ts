import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { HttpModule } from '@nestjs/axios';
import { RabbitService } from '../rabbit/rabbitmq.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RabbitService],
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    HttpModule,
  ],
})
export class UserModule {}
