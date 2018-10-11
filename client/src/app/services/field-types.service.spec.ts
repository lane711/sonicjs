import { TestBed } from '@angular/core/testing';

import { FieldTypesService } from './field-types.service';

describe('FieldTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FieldTypesService = TestBed.get(FieldTypesService);
    expect(service).toBeTruthy();
  });
});
