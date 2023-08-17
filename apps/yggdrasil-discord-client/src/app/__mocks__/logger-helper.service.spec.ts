import { LoggerService } from '@nestjs/common';
// Reset all
export function mockClearAll() {
  // Reset mockedLogger
  Object.values(innerMockedLogger).forEach((m) => m.mockClear());
}

// Default mocked Logger
const innerMockedLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

export class mockedLogger implements LoggerService {
  log = innerMockedLogger.log;
  error = innerMockedLogger.error;
  warn = innerMockedLogger.warn;
  debug = innerMockedLogger.debug;
  verbose = innerMockedLogger.verbose;
}

it('should be defined', () => {
  expect(mockedLogger).toBeDefined();
});
