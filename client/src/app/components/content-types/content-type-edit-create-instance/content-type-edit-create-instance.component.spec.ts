import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeEditCreateInstanceComponent } from './content-type-edit-create-instance.component';

describe('ContentTypeEditCreateInstanceComponent', () => {
  let component: ContentTypeEditCreateInstanceComponent;
  let fixture: ComponentFixture<ContentTypeEditCreateInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeEditCreateInstanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTypeEditCreateInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
