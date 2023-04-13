import { Test, TestingModule } from '@nestjs/testing';
import { RabbitService } from './rabbitmq.service';
import * as amqp from 'amqplib';

describe('RabbitService', () => {
  let rabbitService: RabbitService;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(async () => {
    mockConnection = { createChannel: jest.fn() };
    mockChannel = { assertExchange: jest.fn(), publish: jest.fn() };

    jest.spyOn(amqp, 'connect').mockResolvedValue(mockConnection);
    mockConnection.createChannel.mockResolvedValue(mockChannel);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitService],
    }).compile();

    rabbitService = module.get<RabbitService>(RabbitService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize connection and channel', async () => {
      await rabbitService.init();

      expect(amqp.connect).toHaveBeenCalledWith(process.env.RABBITMQ_URL);
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'user_created',
        'fanout',
      );
    });
  });

  describe('sendMessage', () => {
    it('should publish a message to the channel', async () => {
      const message = { username: 'john' };
      await rabbitService.init();
      await rabbitService.sendMessage(message);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'user_created',
        '',
        Buffer.from(JSON.stringify(message)),
      );
    });
  });
});
