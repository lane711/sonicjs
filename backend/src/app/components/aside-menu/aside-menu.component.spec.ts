import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideMenuComponent } from './aside-menu.component';

describe('AsideMenuComponent', () => {
  let component: AsideMenuComponent;
  let fixture: ComponentFixture<AsideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
