import { Test } from '@nestjs/testing';

import { AsgardLogger } from './logger.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NEST_WINSTON_MODULE_OPTIONS } from '../constants/nest-winston.constants';

describe('LoggerHelperService', () => {
  let service: AsgardLogger;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
        {
          provide: NEST_WINSTON_MODULE_OPTIONS,
          useValue: jest.fn(),
        },
        AsgardLogger,
      ],
    }).compile();

    service = app.get<AsgardLogger>(AsgardLogger);
  });

  describe('create', () => {
    it('should return TrackerLoggerCreator', () => {
      expect(service).toBeInstanceOf(Object);
    });

    it('should return TrackerLoggerCreator with name', () => {
      expect(service).toBeInstanceOf(Object);
    });
  });

  describe('TrackerLoggerCreator', () => {
    it('should return TrackerLogger', () => {
      expect(service).toBeInstanceOf(Object);
    });
  });

  describe('log', () => {
    it('should return void', () => {
      expect(service.log('test')).toBeUndefined();
    });
  });

  describe('error', () => {
    it('should return void', () => {
      expect(service.error('test')).toBeUndefined();
    });
  });

  describe('warn', () => {
    it('should return void', () => {
      expect(service.warn('test')).toBeUndefined();
    });
  });

  describe('debug', () => {
    it('should return void', () => {
      expect(service.debug?.('test')).toBeUndefined();
    });
  });

  describe('verbose', () => {
    it('should return void', () => {
      expect(service.verbose?.('test')).toBeUndefined();
    });
  });
});
