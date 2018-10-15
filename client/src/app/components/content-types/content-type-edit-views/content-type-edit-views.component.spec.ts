import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeEditViewsComponent } from './content-type-edit-views.component';

describe('ContentTypeEditViewsComponent', () => {
  let component: ContentTypeEditViewsComponent;
  let fixture: ComponentFixture<ContentTypeEditViewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeEditViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTypeEditViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
