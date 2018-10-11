import { TestBed } from '@angular/core/testing';

import { ContentTypesService } from './content-types.service';

describe('ContentTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentTypesService = TestBed.get(ContentTypesService);
    expect(service).toBeTruthy();
  });
});
