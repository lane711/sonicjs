import { TestBed, inject } from '@angular/core/testing';

import { PageBuilderService } from './page-builder.service';

describe('PageBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PageBuilderService]
    });
  });

  it('should be created', inject([PageBuilderService], (service: PageBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
