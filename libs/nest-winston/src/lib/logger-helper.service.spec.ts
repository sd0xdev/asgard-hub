import { Test } from '@nestjs/testing';

import { LoggerHelperService } from './logger-helper.service';
import winston = require('winston');
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NEST_WINSTON_MODULE_OPTIONS } from '../constants/hahow-nest-winston.constants';

describe('LoggerHelperService', () => {
  let service: LoggerHelperService;

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
        LoggerHelperService,
      ],
    }).compile();

    service = app.get<LoggerHelperService>(LoggerHelperService);
  });

  describe('create', () => {
    it('should return TrackerLoggerCreator', () => {
      expect(service.create()).toBeInstanceOf(Object);
    });

    it('should return TrackerLoggerCreator with name', () => {
      expect(service.create('test')).toBeInstanceOf(Object);
    });
  });

  describe('TrackerLoggerCreator', () => {
    it('should return TrackerLogger', () => {
      expect(service.create().create('test')).toBeInstanceOf(Object);
    });
  });

  describe('TrackerLogger', () => {
    it('should return trackingId', () => {
      expect(service.create().create('test').trackingId).toBe('test');
    });
  });

  describe('log', () => {
    it('should return void', () => {
      expect(service.create().create('test').log('test')).toBeUndefined();
    });
  });

  describe('error', () => {
    it('should return void', () => {
      expect(service.create().create('test').error('test')).toBeUndefined();
    });
  });

  describe('warn', () => {
    it('should return void', () => {
      expect(service.create().create('test').warn('test')).toBeUndefined();
    });
  });

  describe('debug', () => {
    it('should return void', () => {
      expect(service.create().create('test').debug?.('test')).toBeUndefined();
    });
  });

  describe('verbose', () => {
    it('should return void', () => {
      expect(service.create().create('test').verbose?.('test')).toBeUndefined();
    });
  });
});
