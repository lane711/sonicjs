import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldTypesComponent } from './field-types.component';

describe('FieldTypesComponent', () => {
  let component: FieldTypesComponent;
  let fixture: ComponentFixture<FieldTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
