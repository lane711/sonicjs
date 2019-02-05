import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeAddComponent } from './content-type-add.component';

describe('ContentTypeAddComponent', () => {
  let component: ContentTypeAddComponent;
  let fixture: ComponentFixture<ContentTypeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentTypeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
