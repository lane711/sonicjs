import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeEditFieldsComponent } from './content-type-edit-fields.component';

describe('ContentTypeEditFieldsComponent', () => {
  let component: ContentTypeEditFieldsComponent;
  let fixture: ComponentFixture<ContentTypeEditFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeEditFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTypeEditFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
