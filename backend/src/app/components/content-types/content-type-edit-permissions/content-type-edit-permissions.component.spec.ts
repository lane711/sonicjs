import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeEditPermissionsComponent } from './content-type-edit-permissions.component';

describe('ContentTypeEditPermissionsComponent', () => {
  let component: ContentTypeEditPermissionsComponent;
  let fixture: ComponentFixture<ContentTypeEditPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeEditPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTypeEditPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
