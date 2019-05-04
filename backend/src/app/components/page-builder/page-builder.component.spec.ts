import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBuilderComponent } from './page-builder.component';

describe('PageBuilderComponent', () => {
  let component: PageBuilderComponent;
  let fixture: ComponentFixture<PageBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
