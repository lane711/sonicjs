import { TestBed } from '@angular/core/testing';

import { ShortcodesService } from './shortcodes.service';

describe('ShortcodesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShortcodesService = TestBed.get(ShortcodesService);
    expect(service).toBeTruthy();
  });
});
