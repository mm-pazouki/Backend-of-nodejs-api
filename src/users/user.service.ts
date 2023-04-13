import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './user.schema';
import { lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { saveAvatar } from '../help/saveAvatar';
import * as path from 'path';
import { RabbitService } from '../rabbit/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import { validate } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private httpService: HttpService,
    private readonly rabbitService: RabbitService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const userExists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (userExists) {
      throw new BadRequestException('User already exists.');
    }

    const numOfCollections = (await this.userModel.find()).length;
    const createdUser = new this.userModel({
      id: numOfCollections + 1,
      email: createUserDto.email,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      avatar: createUserDto.avatar,
    });
    await createdUser.save();

    // Send RabbitMQ message
    await this.rabbitService.sendMessage({ userId: createdUser.id });

    // Send email
    await this.mailerService.sendMail({
      to: createdUser.email,
      subject: 'Welcome to our app!',
      //template: './welcome',
      context: { name: createdUser.first_name },
    });

    return createdUser;
  }

  async getUserById(userId: number): Promise<User> {
    const req = this.httpService.get(`https://reqres.in/api/users/${userId}`);
    const res = await lastValueFrom(req);
    const userFound = res.data.data;

    return userFound;
  }

  async getAvatar(userId: number) {
    const userFound = await this.userModel.findOne({ id: userId });
    let avatar = userFound.avatar;

    if (avatar.startsWith('http')) {
      const avatarHash = await saveAvatar(avatar);
      avatar = avatarHash;

      await this.userModel.findByIdAndUpdate(userFound._id, {
        $set: { avatar },
      });
    }

    const avatarPath = `${process.cwd()}/src/avatars/${avatar}`;
    const avatarBuffer = fs.readFileSync(avatarPath);
    const b64Avatar = Buffer.from(avatarBuffer).toString('base64');
    return b64Avatar;
  }

  async deleteAvatar(userId: number): Promise<User> {
    const user = await this.userModel.findOne({ id: userId });
    if (!user || !user.avatar) {
      throw new NotFoundException(
        `User with id ${userId} not found or has no avatar`,
      );
    }
    const avatarPath = path.resolve(process.cwd(), 'src/avatars', user.avatar);
    await fs.promises.unlink(avatarPath);

    user.avatar = '';
    const updatedUser = await user.save();
    return updatedUser;
  }
}
