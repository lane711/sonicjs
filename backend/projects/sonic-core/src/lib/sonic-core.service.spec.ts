import { TestBed } from '@angular/core/testing';

import { SonicCoreService } from './sonic-core.service';

describe('SonicCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SonicCoreService = TestBed.get(SonicCoreService);
    expect(service).toBeTruthy();
  });
});
