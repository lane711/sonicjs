import { TestBed } from '@angular/core/testing';

import { PageBuilderService } from './page-builder.service';

describe('PageBuilderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PageBuilderService = TestBed.get(PageBuilderService);
    expect(service).toBeTruthy();
  });
});
