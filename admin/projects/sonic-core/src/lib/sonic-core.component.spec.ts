import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SonicCoreComponent } from './sonic-core.component';

describe('SonicCoreComponent', () => {
  let component: SonicCoreComponent;
  let fixture: ComponentFixture<SonicCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SonicCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SonicCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
