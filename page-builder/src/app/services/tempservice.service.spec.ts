import { TestBed, inject } from '@angular/core/testing';

import { TempserviceService } from './tempservice.service';

describe('TempserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TempserviceService]
    });
  });

  it('should be created', inject([TempserviceService], (service: TempserviceService) => {
    expect(service).toBeTruthy();
  }));
});
