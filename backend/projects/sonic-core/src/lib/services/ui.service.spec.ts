import { TestBed } from '@angular/core/testing';

import { UiService } from './ui.service';

describe('UiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UiService = TestBed.get(UiService);
    expect(service).toBeTruthy();
  });
});
