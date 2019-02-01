import { FrontEndModule } from './front-end.module';

describe('FrontEndModule', () => {
  let frontEndModule: FrontEndModule;

  beforeEach(() => {
    frontEndModule = new FrontEndModule();
  });

  it('should create an instance', () => {
    expect(frontEndModule).toBeTruthy();
  });
});
