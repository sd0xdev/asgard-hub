import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const mockLoggerHelperService: any = {
    create: jest.fn(),
  };
  const mockConfigService: any = jest.fn();

  it('should be defined', () => {
    expect(
      new AuthGuard(mockLoggerHelperService, mockConfigService)
    ).toBeDefined();
  });
});
