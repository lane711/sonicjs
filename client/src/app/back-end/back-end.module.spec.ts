import { BackEndModule } from './back-end.module';

describe('BackEndModule', () => {
  let backEndModule: BackEndModule;

  beforeEach(() => {
    backEndModule = new BackEndModule();
  });

  it('should create an instance', () => {
    expect(backEndModule).toBeTruthy();
  });
});
