import { TestBed } from '@angular/core/testing';
import { HttpClient } from "@angular/common/http";

import { HttpClientModule } from '@angular/common/http'; 

import { ContentTypesService } from './content-types.service';

describe('ContentTypesService', () => {
  beforeEach(() => 
  TestBed.configureTestingModule({
    imports: [
      HttpClientModule
      // , HttpClient
    ],
    // declarations: [
    //   ContentTypesService
    // ]
}));


  it('should be created', () => {
    const service: ContentTypesService = TestBed.get(ContentTypesService);
    expect(service).toBeTruthy();
  });

  it('should create a new content type', () => {
    const service: ContentTypesService = TestBed.get(ContentTypesService);
    let contentType = { name: 'deleteMe'};
    service.createContentTypeAsync(contentType);
    expect(service).toBeTruthy();
  });
});
